# Security Hardening Reference

## 1. OWASP Top 10 for FastAPI

| Risk | Prevention |
|------|-----------|
| **Injection** | SQLAlchemy ORM (parameterized), Pydantic validation |
| **Broken Auth** | JWT with expiry, bcrypt hashing, rate-limit login |
| **Sensitive Data Exposure** | HTTPS only, never log passwords/tokens, `response_model` to filter fields |
| **XXE** | Not applicable (JSON APIs) |
| **Broken Access Control** | RBAC middleware, row-level checks in services |
| **Misconfiguration** | Disable docs in prod, security headers, env-based config |
| **XSS** | React auto-escapes, CSP headers, no `dangerouslySetInnerHTML` with user data |
| **Insecure Deserialization** | Pydantic strict schemas, no pickle |
| **Known Vulnerabilities** | `pip-audit`, `npm audit`, Dependabot |
| **Insufficient Logging** | Structured JSON logs, Sentry, request tracing |

---

## 2. Security Headers Middleware

```python
# app/core/middleware.py
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request, Response

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        response: Response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: https:; "
            "font-src 'self' https://fonts.gstatic.com; "
            "connect-src 'self' https://api.example.com; "
            "frame-ancestors 'none'"
        )
        return response
```

---

## 3. Input Validation & Sanitization

```python
# ✅ Pydantic strict validation
from pydantic import BaseModel, Field, EmailStr, field_validator
import re

class UserCreate(BaseModel):
    email: EmailStr
    full_name: str = Field(..., min_length=1, max_length=100)
    password: str = Field(..., min_length=8, max_length=128)

    @field_validator("full_name")
    @classmethod
    def no_html_in_name(cls, v: str) -> str:
        if re.search(r"<[^>]+>", v):
            raise ValueError("HTML tags not allowed")
        return v.strip()

    @field_validator("password")
    @classmethod
    def strong_password(cls, v: str) -> str:
        if not re.search(r"[A-Z]", v):
            raise ValueError("Must contain uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("Must contain lowercase letter")
        if not re.search(r"\d", v):
            raise ValueError("Must contain digit")
        return v
```

---

## 4. File Upload Security

```python
import magic  # python-magic
from fastapi import UploadFile, HTTPException

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "application/pdf"}
MAX_SIZE = 10 * 1024 * 1024  # 10 MB

async def validate_upload(file: UploadFile) -> None:
    # Check declared content type
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(400, f"File type '{file.content_type}' not allowed")

    # Check actual content type (magic bytes)
    content = await file.read(2048)
    await file.seek(0)
    detected = magic.from_buffer(content, mime=True)
    if detected not in ALLOWED_TYPES:
        raise HTTPException(400, f"Detected type '{detected}' not allowed")

    # Check size
    if file.size and file.size > MAX_SIZE:
        raise HTTPException(400, "File exceeds 10 MB limit")

    # Sanitize filename
    import re
    safe_name = re.sub(r"[^\w\-.]", "_", file.filename or "upload")
    file.filename = safe_name
```

---

## 5. Rate Limiting Login

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@router.post("/auth/login")
@limiter.limit("5/minute")  # Max 5 login attempts per minute per IP
async def login(request: Request, form_data=Depends()):
    ...
```

---

## 6. Next.js Security Headers

```typescript
// next.config.ts
const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://api.example.com",
    ].join('; '),
  },
];

const nextConfig = {
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }];
  },
};

export default nextConfig;
```

---

## 7. Environment Variable Security

### Rules

| Rule | Example |
|------|---------|
| Only `NEXT_PUBLIC_*` is exposed to browser | `NEXT_PUBLIC_API_URL` — safe |
| Server secrets NEVER get `NEXT_PUBLIC_` | `DATABASE_URL` — server only |
| Validate at startup | Crash early if required vars missing |
| Rotate secrets regularly | JWT keys, API keys every 90 days |

```python
# Backend — fail fast if secrets missing
class Settings(BaseSettings):
    JWT_SECRET_KEY: str  # Required — app won't start without it
    DATABASE_URL: str    # Required

    @field_validator("JWT_SECRET_KEY")
    @classmethod
    def no_default_secret(cls, v):
        if v in ("changeme", "secret", "test"):
            raise ValueError("JWT_SECRET_KEY must be a real secret in production")
        return v
```

---

## 8. Dependency Vulnerability Scanning

```bash
# Backend
pip install pip-audit
pip-audit                          # Scan installed packages

# Frontend
npm audit                          # Scan node_modules
npm audit fix                      # Auto-fix where possible

# CI integration — see ci-cd-pipeline.md
```

---

## 9. Incident Response Plan

| Step | Action | Who |
|------|--------|-----|
| 1. **Detect** | Sentry alert / monitoring alert fires | Automated |
| 2. **Triage** | Assess severity (P0–P3) | On-call engineer |
| 3. **Communicate** | Notify team, update status page | On-call |
| 4. **Mitigate** | Rollback, feature flag, hotfix | Engineering |
| 5. **Resolve** | Deploy fix, verify resolution | Engineering |
| 6. **Post-mortem** | Document root cause, timeline, action items | Team |

### Severity Levels

| Level | Impact | Response Time | Example |
|-------|--------|---------------|---------|
| **P0** | Service down, data loss | 15 min | DB corruption, auth broken |
| **P1** | Major feature broken | 1 hour | Payments failing, API 500s |
| **P2** | Minor feature broken | 4 hours | Search degraded, UI glitch |
| **P3** | Cosmetic / low impact | Next sprint | Typo, minor styling issue |

---

## 10. GDPR / Data Privacy Checklist

- [ ] **Privacy policy** published and accessible
- [ ] **Cookie consent** banner implemented
- [ ] **Data export** endpoint — users can download their data
- [ ] **Data deletion** endpoint — users can request account deletion
- [ ] **Minimal data collection** — only collect what's needed
- [ ] **Encryption at rest** — database encryption enabled
- [ ] **Encryption in transit** — HTTPS everywhere
- [ ] **Access logging** — log who accesses PII
- [ ] **Data retention policy** — auto-delete old data
- [ ] **Third-party audit** — review all data shared with vendors
