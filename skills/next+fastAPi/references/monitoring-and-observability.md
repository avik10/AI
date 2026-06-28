# Monitoring & Observability Reference

## 1. Health Check Endpoints

```python
# app/api/health.py
from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from redis.asyncio import Redis
from app.core.database import get_db_session
from app.core.redis import get_redis

router = APIRouter(tags=["Health"])

@router.get("/health/live")
async def liveness():
    return {"status": "ok"}

@router.get("/health/ready")
async def readiness(db: AsyncSession = Depends(get_db_session), redis: Redis = Depends(get_redis)):
    checks = {}
    try:
        await db.execute(text("SELECT 1"))
        checks["database"] = "ok"
    except Exception as e:
        checks["database"] = f"error: {e}"
    try:
        await redis.ping()
        checks["redis"] = "ok"
    except Exception as e:
        checks["redis"] = f"error: {e}"

    all_ok = all(v == "ok" for v in checks.values())
    return {"status": "ok" if all_ok else "degraded", "checks": checks}
```

---

## 2. Structured JSON Logging

```python
# app/core/logging.py
import logging, sys, json
from datetime import datetime, timezone

class JSONFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        data = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
        }
        if record.exc_info and record.exc_info[1]:
            data["exception"] = {"type": type(record.exc_info[1]).__name__, "message": str(record.exc_info[1])}
        for key in ("request_id", "user_id", "method", "path", "status_code", "duration_ms"):
            if hasattr(record, key):
                data[key] = getattr(record, key)
        return json.dumps(data)

def setup_logging(level: str = "INFO") -> None:
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JSONFormatter())
    root = logging.getLogger()
    root.setLevel(level)
    root.handlers = [handler]
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
```

---

## 3. Request ID Middleware

```python
# app/core/middleware.py
import time, uuid, logging
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request, Response

logger = logging.getLogger(__name__)

class RequestIdMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
        request.state.request_id = request_id
        start = time.perf_counter()
        response: Response = await call_next(request)
        duration_ms = round((time.perf_counter() - start) * 1000, 2)
        response.headers["X-Request-ID"] = request_id
        logger.info("%s %s → %d (%.1fms)", request.method, request.url.path,
            response.status_code, duration_ms,
            extra={"request_id": request_id, "method": request.method,
                   "path": request.url.path, "status_code": response.status_code,
                   "duration_ms": duration_ms})
        return response
```

---

## 4. Prometheus Metrics

```bash
pip install prometheus-fastapi-instrumentator
```

```python
from prometheus_fastapi_instrumentator import Instrumentator

def create_app() -> FastAPI:
    app = FastAPI(...)
    Instrumentator(
        should_group_status_codes=True,
        excluded_handlers=["/health/live", "/health/ready", "/metrics"],
    ).instrument(app).expose(app, endpoint="/metrics")
    return app
```

### Key Metrics

| Metric | Type | Alert When |
|--------|------|------------|
| `http_request_duration_seconds` | Histogram | p99 > 2s |
| `http_requests_total` | Counter | Error rate > 5% |
| `db_pool_size` | Gauge | > 80% utilized |
| `celery_tasks_failed_total` | Counter | > 10/hour |
| `process_resident_memory_bytes` | Gauge | > 80% of limit |

---

## 5. Sentry Error Tracking

### Backend
```bash
pip install sentry-sdk[fastapi]
```
```python
import sentry_sdk
if settings.SENTRY_DSN:
    sentry_sdk.init(
        dsn=settings.SENTRY_DSN, environment=settings.APP_ENV,
        traces_sample_rate=0.1 if settings.APP_ENV == "production" else 1.0,
        send_default_pii=False,
    )
```

### Frontend
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```
```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  replaysOnErrorSampleRate: 1.0,
  integrations: [Sentry.replayIntegration(), Sentry.browserTracingIntegration()],
});
```

---

## 6. OpenTelemetry Tracing

```bash
pip install opentelemetry-api opentelemetry-sdk opentelemetry-instrumentation-fastapi opentelemetry-exporter-otlp
```

```python
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanExporter
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.sdk.resources import Resource

def setup_telemetry(app):
    resource = Resource.create({"service.name": "myapp-backend"})
    provider = TracerProvider(resource=resource)
    provider.add_span_processor(BatchSpanExporter(OTLPSpanExporter(endpoint="http://otel-collector:4317")))
    trace.set_tracer_provider(provider)
    FastAPIInstrumentor.instrument_app(app)
```

---

## 7. Alerting Rules

| Condition | Severity | Action |
|-----------|----------|--------|
| Error rate > 5% for 5 min | Critical | Page on-call |
| p99 latency > 3s for 10 min | Warning | Slack alert |
| DB pool > 90% for 5 min | Warning | Investigate |
| Disk usage > 85% | Warning | Slack alert |
| Health check failing | Critical | Auto-restart + page |
| Celery queue > 1000 | Warning | Scale workers |

---

## 8. Frontend — Core Web Vitals

```typescript
// src/app/layout.tsx — add Vercel analytics
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/react';
// Add <SpeedInsights /> and <Analytics /> in the body
```

| Metric | Good | Needs Work | Poor |
|--------|------|------------|------|
| LCP | ≤ 2.5s | ≤ 4.0s | > 4.0s |
| FID | ≤ 100ms | ≤ 300ms | > 300ms |
| CLS | ≤ 0.1 | ≤ 0.25 | > 0.25 |
| TTFB | ≤ 800ms | ≤ 1.8s | > 1.8s |
