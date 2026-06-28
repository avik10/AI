# Caching & Background Tasks Reference

## 1. Redis Setup

```python
# app/core/redis.py
from redis.asyncio import Redis
from app.config import settings

redis_client: Redis | None = None

async def init_redis() -> Redis:
    global redis_client
    redis_client = Redis.from_url(settings.REDIS_URL, decode_responses=True, max_connections=20)
    await redis_client.ping()
    return redis_client

async def close_redis() -> None:
    global redis_client
    if redis_client:
        await redis_client.close()

def get_redis() -> Redis:
    if redis_client is None:
        raise RuntimeError("Redis not initialized")
    return redis_client
```

Register in lifespan:
```python
@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_redis()
    yield
    await close_redis()
```

---

## 2. Caching Patterns

### Cache-Aside

```python
CACHE_TTL = 300  # 5 minutes

async def get_user(self, user_id: int):
    cache_key = f"user:{user_id}"
    cached = await self.redis.get(cache_key)
    if cached:
        return json.loads(cached)
    user = await self.repo.get_by_id(user_id)
    if user:
        await self.redis.setex(cache_key, CACHE_TTL, json.dumps(user.to_dict()))
    return user

async def update_user(self, user_id: int, **kwargs):
    user = await self.repo.update(user_id, **kwargs)
    await self.redis.delete(f"user:{user_id}")  # Invalidate
    return user
```

### Key Naming Convention

```
{entity}:{id}:{variant}

user:42                    — single user
user:42:orders             — user's orders
users:list:skip=0:limit=20 — paginated list
rate:user:42               — rate limit counter
```

### Reusable Cache Decorator

```python
import functools, json

def cached(prefix: str, ttl: int = 300):
    def decorator(func):
        @functools.wraps(func)
        async def wrapper(self, *args, **kwargs):
            parts = [prefix] + [str(a) for a in args] + [f"{k}={v}" for k, v in sorted(kwargs.items())]
            key = ":".join(parts)
            cached_val = await self.redis.get(key)
            if cached_val:
                return json.loads(cached_val)
            result = await func(self, *args, **kwargs)
            await self.redis.setex(key, ttl, json.dumps(result))
            return result
        return wrapper
    return decorator
```

---

## 3. HTTP Cache Headers Middleware

```python
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request, Response

class CacheControlMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response: Response = await call_next(request)
        if request.url.path.startswith("/static"):
            response.headers["Cache-Control"] = "public, max-age=31536000, immutable"
        elif request.method == "GET" and request.url.path.startswith("/api"):
            response.headers["Cache-Control"] = "private, max-age=0, must-revalidate"
        elif request.method in ("POST", "PUT", "PATCH", "DELETE"):
            response.headers["Cache-Control"] = "no-store"
        return response
```

---

## 4. FastAPI BackgroundTasks (Simple)

```python
from fastapi import BackgroundTasks

async def send_welcome_email(email: str, name: str):
    # email sending logic
    pass

@router.post("/users", status_code=201)
async def create_user(payload: UserCreate, bg: BackgroundTasks, service=Depends(get_user_service)):
    user = await service.create_user(payload)
    bg.add_task(send_welcome_email, user.email, user.full_name)
    return user
```

---

## 5. Celery Task Queue (Production)

### Setup

```python
# app/worker/celery_app.py
from celery import Celery
from app.config import settings

celery_app = Celery("worker", broker=settings.REDIS_URL, backend=settings.REDIS_URL)
celery_app.conf.update(
    task_serializer="json", accept_content=["json"], result_serializer="json",
    timezone="UTC", enable_utc=True,
    task_acks_late=True, worker_prefetch_multiplier=1,
    task_soft_time_limit=300, task_time_limit=600,
    task_default_retry_delay=60, task_max_retries=3,
)
celery_app.autodiscover_tasks(["app.worker.tasks"])
```

### Tasks

```python
# app/worker/tasks.py
from celery import shared_task
import logging

logger = logging.getLogger(__name__)

@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_email_task(self, to: str, subject: str, body: str):
    try:
        # send email
        logger.info("Email sent to %s", to)
    except Exception as exc:
        self.retry(exc=exc)

@shared_task(bind=True)
def generate_report_task(self, report_id: int):
    self.update_state(state="PROGRESS", meta={"step": "processing"})
    # ... heavy work ...
    return {"report_url": f"/reports/{report_id}.pdf"}
```

### Trigger from FastAPI

```python
from app.worker.tasks import generate_report_task

@router.post("/reports")
async def create_report(payload: ReportRequest):
    task = generate_report_task.delay(payload.report_id)
    return {"task_id": task.id, "status": "queued"}

@router.get("/tasks/{task_id}")
async def get_task_status(task_id: str):
    from app.worker.celery_app import celery_app
    result = celery_app.AsyncResult(task_id)
    return {"task_id": task_id, "status": result.status, "result": result.result if result.ready() else None}
```

### Periodic Tasks (Celery Beat)

```python
from celery.schedules import crontab
celery_app.conf.beat_schedule = {
    "cleanup-expired-tokens": {"task": "app.worker.tasks.cleanup_tokens", "schedule": crontab(hour="*/6")},
    "daily-report": {"task": "app.worker.tasks.daily_report", "schedule": crontab(hour=2, minute=0)},
}
```

### Running

```bash
celery -A app.worker.celery_app worker --loglevel=info --concurrency=4
celery -A app.worker.celery_app beat --loglevel=info
celery -A app.worker.celery_app flower --port=5555   # Web UI monitor
```

### Docker Compose Addition

```yaml
  celery-worker:
    build: ./backend
    command: celery -A app.worker.celery_app worker --loglevel=info
    env_file: ./backend/.env
    depends_on: [backend, redis]

  celery-beat:
    build: ./backend
    command: celery -A app.worker.celery_app beat --loglevel=info
    env_file: ./backend/.env
    depends_on: [redis]
```
