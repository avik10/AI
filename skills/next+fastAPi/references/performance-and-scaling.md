# Performance & Scaling Reference

## 1. Backend Performance

### Async Everywhere

```python
# ✅ Async DB queries (SQLAlchemy async)
async def get_user(self, user_id: int):
    result = await self.session.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()

# ✅ Async HTTP calls
import httpx

async def fetch_external_data(url: str) -> dict:
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(url)
        response.raise_for_status()
        return response.json()

# ✅ Async Redis
cached = await redis.get(f"user:{user_id}")
```

### Connection Pooling

```python
# app/core/database.py — tune for production
engine = create_async_engine(
    DATABASE_URL,
    pool_size=20,          # Persistent connections
    max_overflow=10,       # Burst connections
    pool_timeout=30,       # Wait for connection
    pool_recycle=1800,     # Recycle stale connections
    pool_pre_ping=True,    # Verify before use
)

# Rule of thumb: pool_size = (2 × CPU cores) + disk spindles
# For SSD: pool_size ≈ 20 per worker process
```

### Response Compression

```python
from fastapi.middleware.gzip import GZipMiddleware

app.add_middleware(GZipMiddleware, minimum_size=500)  # Compress responses > 500 bytes
```

### Streaming Responses

```python
from fastapi.responses import StreamingResponse
import csv, io

@router.get("/export/users")
async def export_users(service: UserService = Depends(get_user_service)):
    async def generate():
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["id", "email", "name"])
        yield output.getvalue()
        output.truncate(0); output.seek(0)

        async for batch in service.stream_users(batch_size=1000):
            for user in batch:
                writer.writerow([user.id, user.email, user.full_name])
            yield output.getvalue()
            output.truncate(0); output.seek(0)

    return StreamingResponse(generate(), media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=users.csv"})
```

### Uvicorn Production Config

```bash
# Production — use Gunicorn with Uvicorn workers
gunicorn app.main:app \
    --worker-class uvicorn.workers.UvicornWorker \
    --workers 4 \
    --bind 0.0.0.0:8000 \
    --timeout 120 \
    --keep-alive 5 \
    --access-logfile - \
    --error-logfile -

# Workers = (2 × CPU) + 1
# For 2-core machine: 5 workers
```

### Pagination Comparison

| Type | Pros | Cons | Use When |
|------|------|------|----------|
| **Offset** | Simple, supports page jumping | Slow at large offsets, inconsistent with inserts | Small datasets, admin panels |
| **Cursor** | Fast, consistent, scalable | Can't jump to page N, harder to implement | Public APIs, infinite scroll, large datasets |

```python
# Cursor-based pagination
@router.get("/users")
async def list_users(
    after: int | None = Query(None, description="Cursor: user ID to start after"),
    limit: int = Query(20, ge=1, le=100),
):
    stmt = select(User).order_by(User.id).limit(limit + 1)  # +1 to detect next page
    if after:
        stmt = stmt.where(User.id > after)
    users = (await session.execute(stmt)).scalars().all()
    has_next = len(users) > limit
    items = users[:limit]
    return {
        "items": items,
        "next_cursor": items[-1].id if has_next else None,
        "has_next": has_next,
    }
```

---

## 2. Frontend Performance

### Next.js Image Optimization

```tsx
import Image from 'next/image';

// ✅ Always use Next.js Image component
<Image
  src="/hero.jpg"
  alt="Hero banner"
  width={1200}
  height={600}
  priority              // LCP image — preload
  placeholder="blur"    // Show blur while loading
  blurDataURL="data:image/jpeg;base64,..."
/>

// For dynamic images
<Image
  src={user.avatar}
  alt={user.name}
  width={48}
  height={48}
  sizes="48px"         // Tell browser the rendered size
  loading="lazy"       // Below-the-fold images
/>
```

### Code Splitting & Lazy Loading

```tsx
import dynamic from 'next/dynamic';

// Lazy load heavy components
const HeavyChart = dynamic(() => import('@/components/HeavyChart'), {
  loading: () => <ChartSkeleton />,
  ssr: false,  // Client-only component
});

// Lazy load below-the-fold sections
const Comments = dynamic(() => import('@/components/Comments'));
```

### SSG vs SSR Decision

| Rendering | When to Use | Example |
|-----------|-------------|---------|
| **Static (SSG)** | Content rarely changes | Marketing pages, blog, docs |
| **ISR** | Changes occasionally | Product pages (revalidate: 3600) |
| **SSR** | Changes per request | Dashboard, user-specific data |
| **Client** | Interactive, real-time | Chat, live feeds, forms |

```tsx
// ISR — regenerate every hour
export const revalidate = 3600;

// SSR — fresh every request
export const dynamic = 'force-dynamic';
```

### Bundle Optimization

```bash
# Analyze bundle size
npm install @next/bundle-analyzer
```

```typescript
// next.config.ts
import withBundleAnalyzer from '@next/bundle-analyzer';
const config = withBundleAnalyzer({ enabled: process.env.ANALYZE === 'true' })({
  // your config
});
export default config;
```

```bash
ANALYZE=true npm run build
```

### Font Optimization

```tsx
// src/app/layout.tsx
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',        // Prevent layout shift
  variable: '--font-inter',
});

export default function RootLayout({ children }) {
  return <html className={inter.variable}><body>{children}</body></html>;
}
```

---

## 3. Scaling

### Architecture Overview

```
                    ┌─────────────┐
                    │ Load Balancer│
                    │  (nginx/ALB) │
                    └──────┬──────┘
               ┌───────────┼───────────┐
               ▼           ▼           ▼
          ┌─────────┐ ┌─────────┐ ┌─────────┐
          │ Backend │ │ Backend │ │ Backend │
          │ Worker 1│ │ Worker 2│ │ Worker 3│
          └────┬────┘ └────┬────┘ └────┬────┘
               │           │           │
        ┌──────┴───────────┴───────────┴──────┐
        │         Connection Pool              │
        └──────┬────────────────────┬──────────┘
               ▼                    ▼
        ┌─────────────┐    ┌──────────────┐
        │  PostgreSQL  │    │    Redis     │
        │  Primary     │    │   Cluster    │
        │  + Replicas  │    │              │
        └─────────────┘    └──────────────┘
```

### Rate Limiting

```bash
pip install slowapi
```

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address, default_limits=["100/minute"])
app.state.limiter = limiter

@router.get("/search")
@limiter.limit("30/minute")
async def search(request: Request, q: str):
    ...
```

### File Upload to S3

```python
import boto3
from fastapi import UploadFile

s3 = boto3.client("s3", region_name=settings.AWS_REGION)

@router.post("/upload")
async def upload_file(file: UploadFile):
    # Validate
    if file.size > 10 * 1024 * 1024:  # 10 MB
        raise HTTPException(400, "File too large")
    allowed = {"image/jpeg", "image/png", "application/pdf"}
    if file.content_type not in allowed:
        raise HTTPException(400, "Invalid file type")

    # Upload
    key = f"uploads/{uuid4()}/{file.filename}"
    s3.upload_fileobj(file.file, settings.S3_BUCKET, key,
        ExtraArgs={"ContentType": file.content_type})
    return {"url": f"https://{settings.S3_BUCKET}.s3.amazonaws.com/{key}"}
```

### WebSocket Scaling (Redis Pub/Sub)

```python
from fastapi import WebSocket
import redis.asyncio as redis

@router.websocket("/ws/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str):
    await websocket.accept()
    r = redis.from_url(settings.REDIS_URL)
    pubsub = r.pubsub()
    await pubsub.subscribe(f"room:{room_id}")

    try:
        async for message in pubsub.listen():
            if message["type"] == "message":
                await websocket.send_text(message["data"])
    finally:
        await pubsub.unsubscribe(f"room:{room_id}")
        await r.close()
```

### Horizontal Scaling Checklist

- [ ] **Stateless backend** — No in-memory sessions (use Redis)
- [ ] **Shared file storage** — S3/GCS, not local filesystem
- [ ] **Database connection pooling** — PgBouncer or SQLAlchemy pool
- [ ] **Read replicas** — Route read queries to replicas
- [ ] **CDN** — Static assets + Next.js output via CloudFront/Vercel
- [ ] **Queue-based processing** — Heavy tasks to Celery, not request handlers
- [ ] **Health checks** — Load balancer routes to healthy instances only
