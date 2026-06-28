---
name: dev-workflow
description: >
  Core development workflow and coding standards for the AI workspace. Instructs the
  AI assistant on how all development should be done — including project structure,
  coding conventions, code quality, testing, documentation, git workflow, deployment,
  and production-readiness standards. Activate on any coding, building, or development task.
  Tech stack: Python FastAPI (backend) + Next.js (frontend).
---

# Development Workflow & Standards

**Stack: Python FastAPI (Backend) + Next.js TypeScript (Frontend)**

This skill defines how **all development** in this workspace must be conducted.
Every piece of code written, reviewed, or modified must follow these standards.
These are non-negotiable production-quality requirements.

---

## Table of Contents

1. [Core Philosophy](#1-core-philosophy)
2. [Monorepo Structure](#2-monorepo-structure)
3. [Backend — FastAPI Standards](#3-backend--fastapi-standards)
4. [Frontend — Next.js Standards](#4-frontend--nextjs-standards)
5. [API Contract & Communication](#5-api-contract--communication)
6. [Error Handling & Logging](#6-error-handling--logging)
7. [Testing Strategy](#7-testing-strategy)
8. [Documentation Requirements](#8-documentation-requirements)
9. [Git Workflow](#9-git-workflow)
10. [Security Practices](#10-security-practices)
11. [DevOps & Deployment](#11-devops--deployment)
12. [Review Checklist](#12-review-checklist)

---

## 1. Core Philosophy

### Principles (in priority order)

1. **Production-ready from the start** — No shortcuts, no "fix later" comments.
   Every commit should be deployable.
2. **Correctness over speed** — Working correctly is more important than working fast.
   Think before coding.
3. **Readability is king** — Code is read 10× more than it's written. Optimize for
   the reader, not the writer.
4. **Fail loudly, recover gracefully** — Errors should be visible and actionable,
   but the system should degrade gracefully.
5. **Automate everything repeatable** — If you do it twice, automate it the third time.

### Before Writing Any Code

Always follow this sequence:

```
1. UNDERSTAND  → What exactly is being asked? Clarify ambiguity.
2. PLAN        → Design the solution. Identify edge cases. Choose patterns.
3. IMPLEMENT   → Write clean, typed, tested code.
4. VERIFY      → Run tests. Check edge cases. Review your own code.
5. DOCUMENT    → Update docs, docstrings, and README if needed.
```

> **Rule**: Never start coding without a clear understanding of the requirements
> and a mental (or written) plan of the approach.

---

## 2. Monorepo Structure

```
project-root/
│
├── backend/                          # ── FastAPI Backend ──
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                   # FastAPI app factory, lifespan, CORS
│   │   ├── config.py                 # Pydantic Settings (env-based config)
│   │   ├── dependencies.py           # Shared FastAPI dependencies (DI)
│   │   │
│   │   ├── api/                      # Route layer (thin controllers)
│   │   │   ├── __init__.py
│   │   │   ├── router.py             # Root APIRouter aggregator
│   │   │   └── v1/
│   │   │       ├── __init__.py
│   │   │       ├── users.py          # /api/v1/users
│   │   │       ├── auth.py           # /api/v1/auth
│   │   │       └── models.py         # /api/v1/models (AI models)
│   │   │
│   │   ├── schemas/                  # Pydantic request/response models
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── auth.py
│   │   │   └── common.py            # Shared schemas (pagination, errors)
│   │   │
│   │   ├── models/                   # SQLAlchemy / DB models
│   │   │   ├── __init__.py
│   │   │   ├── base.py              # Declarative base, mixins
│   │   │   └── user.py
│   │   │
│   │   ├── services/                 # Business logic layer
│   │   │   ├── __init__.py
│   │   │   ├── user_service.py
│   │   │   └── auth_service.py
│   │   │
│   │   ├── repositories/            # Data access layer (DB queries)
│   │   │   ├── __init__.py
│   │   │   └── user_repository.py
│   │   │
│   │   ├── core/                     # Cross-cutting concerns
│   │   │   ├── __init__.py
│   │   │   ├── security.py          # JWT, hashing, auth utils
│   │   │   ├── exceptions.py        # Custom exception classes
│   │   │   ├── middleware.py        # Custom middleware
│   │   │   └── logging.py          # Logging configuration
│   │   │
│   │   └── utils/                    # Pure utility functions
│   │       ├── __init__.py
│   │       └── helpers.py
│   │
│   ├── alembic/                      # Database migrations
│   │   ├── versions/
│   │   ├── env.py
│   │   └── alembic.ini
│   │
│   ├── tests/
│   │   ├── conftest.py               # Fixtures: test client, DB, mocks
│   │   ├── unit/
│   │   ├── integration/
│   │   └── e2e/
│   │
│   ├── pyproject.toml
│   ├── Dockerfile
│   ├── .env.example
│   └── Makefile
│
├── frontend/                         # ── Next.js Frontend ──
│   ├── src/
│   │   ├── app/                      # App Router (Next.js 14+)
│   │   │   ├── layout.tsx            # Root layout
│   │   │   ├── page.tsx              # Home page
│   │   │   ├── loading.tsx           # Global loading UI
│   │   │   ├── error.tsx             # Global error boundary
│   │   │   ├── not-found.tsx         # 404 page
│   │   │   ├── globals.css           # Global styles
│   │   │   │
│   │   │   ├── (auth)/               # Auth route group
│   │   │   │   ├── login/page.tsx
│   │   │   │   └── register/page.tsx
│   │   │   │
│   │   │   ├── dashboard/
│   │   │   │   ├── layout.tsx
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   └── api/                  # Next.js API routes (BFF proxy)
│   │   │       └── [...proxy]/route.ts
│   │   │
│   │   ├── components/               # Reusable UI components
│   │   │   ├── ui/                   # Primitives (Button, Input, Modal)
│   │   │   ├── forms/                # Form components
│   │   │   ├── layout/               # Header, Sidebar, Footer
│   │   │   └── features/             # Feature-specific components
│   │   │
│   │   ├── hooks/                    # Custom React hooks
│   │   │   ├── useAuth.ts
│   │   │   └── useApi.ts
│   │   │
│   │   ├── lib/                      # Utilities & shared logic
│   │   │   ├── api-client.ts         # Typed API client (fetch wrapper)
│   │   │   ├── auth.ts               # Auth helpers
│   │   │   ├── constants.ts          # App-wide constants
│   │   │   └── utils.ts              # Generic utilities
│   │   │
│   │   ├── types/                    # TypeScript type definitions
│   │   │   ├── api.ts                # API response/request types
│   │   │   └── models.ts             # Domain model types
│   │   │
│   │   ├── stores/                   # State management (Zustand)
│   │   │   └── authStore.ts
│   │   │
│   │   └── styles/                   # CSS modules / design tokens
│   │       └── variables.css
│   │
│   ├── public/                       # Static assets
│   ├── tests/
│   │   ├── components/
│   │   └── e2e/
│   │
│   ├── next.config.ts
│   ├── tsconfig.json
│   ├── package.json
│   ├── Dockerfile
│   └── .env.example
│
├── docker-compose.yml                # Full-stack local dev
├── .gitignore
├── Makefile                          # Top-level orchestration
└── README.md
```

### Layer Responsibilities

```
┌─────────────────────────────────────────────────────────┐
│  FRONTEND (Next.js)                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │  Pages    │→ │Components│→ │  Hooks   │              │
│  └──────────┘  └──────────┘  └──────────┘              │
│        ↓                           ↓                    │
│  ┌──────────────────────────────────────┐               │
│  │        API Client (lib/api-client)   │               │
│  └──────────────────────────────────────┘               │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP (JSON)
┌────────────────────────┴────────────────────────────────┐
│  BACKEND (FastAPI)                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐          │
│  │  Routes  │→ │ Services │→ │ Repositories  │          │
│  │  (api/)  │  │(services)│  │(repositories/)│          │
│  └──────────┘  └──────────┘  └──────────────┘          │
│        ↑                           ↓                    │
│  ┌──────────┐              ┌──────────────┐             │
│  │ Schemas  │              │  DB Models   │             │
│  │(schemas/)│              │  (models/)   │             │
│  └──────────┘              └──────────────┘             │
└─────────────────────────────────────────────────────────┘
```

**Rules:**
- **Routes** are thin — validate input, call service, return response. No business logic.
- **Services** contain all business logic. They are framework-agnostic (no FastAPI imports).
- **Repositories** handle all database access. Services never touch the DB directly.
- **Schemas** (Pydantic) define API contracts. DB models are separate from schemas.

---

## 3. Backend — FastAPI Standards

### App Factory Pattern

```python
# app/main.py
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.config import settings
from app.core.logging import setup_logging
from app.core.middleware import RequestIdMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    setup_logging()
    # Startup: initialize DB pool, load ML models, etc.
    yield
    # Shutdown: close connections, cleanup resources


def create_app() -> FastAPI:
    """Application factory."""
    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        docs_url="/api/docs" if settings.APP_ENV != "production" else None,
        redoc_url="/api/redoc" if settings.APP_ENV != "production" else None,
        lifespan=lifespan,
    )

    # Middleware (order matters — outermost first)
    app.add_middleware(RequestIdMiddleware)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Routes
    app.include_router(api_router, prefix="/api")

    return app


app = create_app()
```

### Configuration with Pydantic Settings

```python
# app/config.py
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )

    # Application
    APP_NAME: str = "MyApp API"
    APP_VERSION: str = "1.0.0"
    APP_ENV: str = "development"  # development | staging | production
    DEBUG: bool = False

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # Database
    DATABASE_URL: str
    DB_POOL_SIZE: int = 20
    DB_MAX_OVERFLOW: int = 10

    # Auth
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_MINUTES: int = 30

    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    # Redis (optional)
    REDIS_URL: str = "redis://localhost:6379/0"


settings = Settings()
```

### Route Pattern

```python
# app/api/v1/users.py
from fastapi import APIRouter, Depends, status
from app.schemas.user import (
    UserCreate,
    UserResponse,
    UserListResponse,
    UserUpdate,
)
from app.schemas.common import PaginationParams
from app.services.user_service import UserService
from app.dependencies import get_user_service, get_current_user

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("", response_model=UserListResponse)
async def list_users(
    pagination: PaginationParams = Depends(),
    service: UserService = Depends(get_user_service),
):
    """List all users with pagination."""
    return await service.list_users(
        skip=pagination.skip,
        limit=pagination.limit,
    )


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    service: UserService = Depends(get_user_service),
):
    """Get a single user by ID."""
    return await service.get_user(user_id)


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    payload: UserCreate,
    service: UserService = Depends(get_user_service),
):
    """Create a new user."""
    return await service.create_user(payload)


@router.patch("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    payload: UserUpdate,
    current_user=Depends(get_current_user),
    service: UserService = Depends(get_user_service),
):
    """Update user details. Requires authentication."""
    return await service.update_user(user_id, payload, current_user)
```

### Schema Pattern

```python
# app/schemas/user.py
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    """Shared user fields."""
    email: EmailStr
    full_name: str = Field(..., min_length=1, max_length=100)


class UserCreate(UserBase):
    """Request body for creating a user."""
    password: str = Field(..., min_length=8, max_length=128)


class UserUpdate(BaseModel):
    """Request body for updating a user (all fields optional)."""
    full_name: str | None = Field(None, min_length=1, max_length=100)
    email: EmailStr | None = None


class UserResponse(UserBase):
    """User returned in API responses."""
    id: int
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class UserListResponse(BaseModel):
    """Paginated list of users."""
    items: list[UserResponse]
    total: int
    skip: int
    limit: int
```

```python
# app/schemas/common.py
from fastapi import Query
from pydantic import BaseModel


class PaginationParams:
    """Reusable pagination dependency."""

    def __init__(
        self,
        skip: int = Query(0, ge=0, description="Number of records to skip"),
        limit: int = Query(20, ge=1, le=100, description="Max records to return"),
    ):
        self.skip = skip
        self.limit = limit


class ErrorResponse(BaseModel):
    """Standard error response body."""
    detail: str
    error_code: str | None = None
    request_id: str | None = None
```

### Service Pattern

```python
# app/services/user_service.py
import logging
from app.core.exceptions import NotFoundError, ConflictError
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import hash_password

logger = logging.getLogger(__name__)


class UserService:
    """Business logic for user operations."""

    def __init__(self, repository: UserRepository):
        self.repo = repository

    async def get_user(self, user_id: int):
        """Retrieve a user by ID."""
        user = await self.repo.get_by_id(user_id)
        if not user:
            raise NotFoundError(f"User with ID {user_id} not found")
        return user

    async def create_user(self, data: UserCreate):
        """Create a new user with hashed password."""
        existing = await self.repo.get_by_email(data.email)
        if existing:
            raise ConflictError(f"Email {data.email} is already registered")

        hashed = hash_password(data.password)
        user = await self.repo.create(
            email=data.email,
            full_name=data.full_name,
            hashed_password=hashed,
        )
        logger.info("User created: id=%d email=%s", user.id, user.email)
        return user

    async def update_user(self, user_id: int, data: UserUpdate, current_user):
        """Update user fields."""
        user = await self.get_user(user_id)

        update_data = data.model_dump(exclude_unset=True)
        if not update_data:
            return user

        updated = await self.repo.update(user_id, **update_data)
        logger.info("User updated: id=%d fields=%s", user_id, list(update_data.keys()))
        return updated

    async def list_users(self, skip: int = 0, limit: int = 20):
        """List users with pagination."""
        items = await self.repo.list(skip=skip, limit=limit)
        total = await self.repo.count()
        return {"items": items, "total": total, "skip": skip, "limit": limit}
```

### Dependency Injection

```python
# app/dependencies.py
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db_session
from app.repositories.user_repository import UserRepository
from app.services.user_service import UserService
from app.core.security import get_current_user_from_token


async def get_user_repository(
    session: AsyncSession = Depends(get_db_session),
) -> UserRepository:
    return UserRepository(session)


async def get_user_service(
    repo: UserRepository = Depends(get_user_repository),
) -> UserService:
    return UserService(repo)


async def get_current_user(
    token_data=Depends(get_current_user_from_token),
    service: UserService = Depends(get_user_service),
):
    return await service.get_user(token_data.user_id)
```

### Naming Conventions (Backend)

| Element              | Convention           | Example                      |
|----------------------|----------------------|------------------------------|
| Files                | `snake_case.py`      | `user_service.py`            |
| Classes              | `PascalCase`         | `UserService`                |
| Functions / methods  | `snake_case`         | `get_user_by_id()`           |
| Constants            | `UPPER_SNAKE`        | `MAX_RETRIES`                |
| Schemas              | `PascalCase`         | `UserCreate`, `UserResponse` |
| DB models            | `PascalCase`         | `User`, `Session`            |
| DB tables            | `snake_case` plural  | `users`, `auth_tokens`       |
| Route prefixes       | `kebab-case`         | `/api/v1/auth-tokens`        |
| Environment vars     | `UPPER_SNAKE`        | `DATABASE_URL`               |

---

## 4. Frontend — Next.js Standards

### Use App Router (Next.js 14+)

- All pages go in `src/app/` directory
- Use **Server Components** by default — add `'use client'` only when needed
- Use **Server Actions** for mutations when appropriate
- Use `loading.tsx`, `error.tsx`, and `not-found.tsx` for UX

### Page Pattern

```tsx
// src/app/dashboard/page.tsx
import { Suspense } from 'react';
import { DashboardContent } from '@/components/features/DashboardContent';
import { DashboardSkeleton } from '@/components/ui/Skeletons';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard | MyApp',
  description: 'View your project dashboard and analytics.',
};

export default function DashboardPage() {
  return (
    <main>
      <h1>Dashboard</h1>
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </main>
  );
}
```

### Component Pattern

```tsx
// src/components/ui/Button.tsx
'use client';

import { type ButtonHTMLAttributes, forwardRef } from 'react';
import styles from './Button.module.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual variant of the button */
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  /** Size preset */
  size?: 'sm' | 'md' | 'lg';
  /** Show loading spinner and disable interaction */
  isLoading?: boolean;
}

/**
 * Primary UI button component.
 *
 * @example
 * <Button variant="primary" onClick={handleSubmit}>Save</Button>
 * <Button variant="danger" isLoading={isPending}>Delete</Button>
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading, children, className, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`${styles.button} ${styles[variant]} ${styles[size]} ${className ?? ''}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? <span className={styles.spinner} /> : children}
      </button>
    );
  }
);

Button.displayName = 'Button';
```

### Typed API Client

```typescript
// src/lib/api-client.ts

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api';

class ApiError extends Error {
  constructor(
    public status: number,
    public errorCode: string | null,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  params?: Record<string, string | number>;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { body, params, headers: customHeaders, ...restOptions } = options;

  // Build URL with query params
  const url = new URL(`${API_BASE}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) =>
      url.searchParams.set(key, String(value))
    );
  }

  // Build headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...customHeaders as Record<string, string>,
  };

  // Attach auth token if available
  const token = typeof window !== 'undefined'
    ? localStorage.getItem('access_token')
    : null;
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url.toString(), {
    ...restOptions,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new ApiError(response.status, error.error_code ?? null, error.detail);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

/** Typed API client for the FastAPI backend. */
export const api = {
  get: <T>(endpoint: string, params?: Record<string, string | number>) =>
    request<T>(endpoint, { method: 'GET', params }),

  post: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, { method: 'POST', body }),

  patch: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, { method: 'PATCH', body }),

  put: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, { method: 'PUT', body }),

  delete: <T>(endpoint: string) =>
    request<T>(endpoint, { method: 'DELETE' }),
};
```

### Custom Hook Pattern

```typescript
// src/hooks/useApi.ts
'use client';

import { useState, useCallback } from 'react';
import { api } from '@/lib/api-client';

interface UseApiState<T> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
}

/**
 * Generic hook for API calls with loading and error state.
 *
 * @example
 * const { data, isLoading, execute } = useApi<User[]>();
 * useEffect(() => { execute(() => api.get('/v1/users')); }, []);
 */
export function useApi<T>() {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    error: null,
    isLoading: false,
  });

  const execute = useCallback(async (apiCall: () => Promise<T>) => {
    setState({ data: null, error: null, isLoading: true });
    try {
      const data = await apiCall();
      setState({ data, error: null, isLoading: false });
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setState({ data: null, error: message, isLoading: false });
      throw err;
    }
  }, []);

  return { ...state, execute };
}
```

### Naming Conventions (Frontend)

| Element              | Convention            | Example                      |
|----------------------|-----------------------|------------------------------|
| Component files      | `PascalCase.tsx`      | `UserProfile.tsx`            |
| Component names      | `PascalCase`          | `UserProfile`                |
| Hook files           | `camelCase.ts`        | `useAuth.ts`                 |
| Hook names           | `useCamelCase`        | `useAuth()`                  |
| Utility files        | `camelCase.ts`        | `apiClient.ts`               |
| Type files           | `camelCase.ts`        | `models.ts`                  |
| CSS Modules          | `PascalCase.module.css`| `Button.module.css`         |
| CSS classes          | `camelCase`           | `.primaryButton`             |
| Constants            | `UPPER_SNAKE`         | `MAX_FILE_SIZE`              |
| Env vars (public)    | `NEXT_PUBLIC_*`       | `NEXT_PUBLIC_API_URL`        |
| Route groups         | `(groupName)`         | `(auth)/login/page.tsx`      |

### Frontend Rules

- **Server Components by default** — Only add `'use client'` when you need hooks, event handlers, or browser APIs
- **No `any` types** — Use `unknown` if the type is truly unknown, then narrow it
- **No inline styles** — Use CSS Modules or a design system
- **Memoize expensive renders** — Use `React.memo`, `useMemo`, `useCallback` appropriately
- **Always handle loading + error + empty states** — Every data-fetching component needs all three
- **Use semantic HTML** — `<button>` not `<div onClick>`, `<nav>` not `<div className="nav">`
- **Accessible by default** — `aria-labels`, keyboard navigation, focus management

---

## 5. API Contract & Communication

### Standard Response Envelopes

**Success (single item):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "full_name": "John Doe",
  "created_at": "2025-01-15T10:30:00Z"
}
```

**Success (list with pagination):**
```json
{
  "items": [...],
  "total": 150,
  "skip": 0,
  "limit": 20
}
```

**Error:**
```json
{
  "detail": "User with ID 42 not found",
  "error_code": "USER_NOT_FOUND",
  "request_id": "req_abc123"
}
```

### API Versioning

- Always prefix routes with `/api/v1/`
- When making breaking changes, create `/api/v2/` while maintaining v1
- Deprecate old versions with a `Sunset` response header

### Status Code Usage

| Code  | Meaning                   | When to Use                              |
|-------|---------------------------|------------------------------------------|
| `200` | OK                        | Successful GET, PATCH, PUT               |
| `201` | Created                   | Successful POST that creates a resource  |
| `204` | No Content                | Successful DELETE                        |
| `400` | Bad Request               | Validation errors, malformed input       |
| `401` | Unauthorized              | Missing or invalid auth token            |
| `403` | Forbidden                 | Valid auth but insufficient permissions   |
| `404` | Not Found                 | Resource does not exist                  |
| `409` | Conflict                  | Duplicate resource (e.g., email taken)   |
| `422` | Unprocessable Entity      | Pydantic validation failure              |
| `429` | Too Many Requests         | Rate limit exceeded                      |
| `500` | Internal Server Error     | Unhandled exception (log and investigate)|

---

## 6. Error Handling & Logging

### Backend Custom Exceptions

```python
# app/core/exceptions.py
from fastapi import Request, status
from fastapi.responses import JSONResponse


class AppError(Exception):
    """Base application error."""

    def __init__(
        self,
        message: str,
        error_code: str = "INTERNAL_ERROR",
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
    ):
        self.message = message
        self.error_code = error_code
        self.status_code = status_code
        super().__init__(message)


class NotFoundError(AppError):
    def __init__(self, message: str = "Resource not found"):
        super().__init__(message, "NOT_FOUND", status.HTTP_404_NOT_FOUND)


class ConflictError(AppError):
    def __init__(self, message: str = "Resource already exists"):
        super().__init__(message, "CONFLICT", status.HTTP_409_CONFLICT)


class ForbiddenError(AppError):
    def __init__(self, message: str = "Insufficient permissions"):
        super().__init__(message, "FORBIDDEN", status.HTTP_403_FORBIDDEN)


class ValidationError(AppError):
    def __init__(self, message: str = "Invalid input"):
        super().__init__(message, "VALIDATION_ERROR", status.HTTP_400_BAD_REQUEST)


# Global exception handler — register in main.py
async def app_error_handler(request: Request, exc: AppError) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "detail": exc.message,
            "error_code": exc.error_code,
            "request_id": getattr(request.state, "request_id", None),
        },
    )
```

### Logging Standards

```python
import logging

# Module-level logger — NEVER use print()
logger = logging.getLogger(__name__)


# ✅ GOOD — structured, contextual
logger.info("User created: id=%d email=%s", user.id, user.email)
logger.error("Payment failed: order_id=%s reason=%s", order_id, str(e), exc_info=True)

# ❌ BAD
print(f"User created: {user}")
logger.info(f"Something happened")  # No context
```

### Log Levels

| Level      | Backend Use                                      | Frontend Use                    |
|------------|--------------------------------------------------|---------------------------------|
| `DEBUG`    | Detailed diagnostics (disabled in prod)          | `console.debug()` (dev only)    |
| `INFO`     | Key events (startup, request completed)          | Analytics events                |
| `WARNING`  | Unexpected but handled (retry, fallback)         | Deprecation warnings            |
| `ERROR`    | Failures needing investigation                   | API errors, caught exceptions   |
| `CRITICAL` | System-level failures                            | App crash, unrecoverable        |

---

## 7. Testing Strategy

### Backend Testing (pytest)

```python
# tests/conftest.py
import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from app.main import create_app
from app.config import settings


@pytest.fixture
async def app():
    """Create test application instance."""
    return create_app()


@pytest.fixture
async def client(app):
    """Async test client for API tests."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client


@pytest.fixture
async def auth_client(client):
    """Authenticated test client."""
    response = await client.post("/api/v1/auth/login", json={
        "email": "test@example.com",
        "password": "testpassword123",
    })
    token = response.json()["access_token"]
    client.headers["Authorization"] = f"Bearer {token}"
    yield client
```

```python
# tests/integration/test_users_api.py
import pytest


class TestUsersAPI:
    """Integration tests for /api/v1/users endpoints."""

    @pytest.mark.asyncio
    async def test_create_user_returns_201(self, client):
        response = await client.post("/api/v1/users", json={
            "email": "new@example.com",
            "full_name": "New User",
            "password": "securepass123",
        })

        assert response.status_code == 201
        data = response.json()
        assert data["email"] == "new@example.com"
        assert "id" in data
        assert "password" not in data  # Never expose passwords

    @pytest.mark.asyncio
    async def test_create_duplicate_email_returns_409(self, client):
        payload = {
            "email": "dup@example.com",
            "full_name": "User",
            "password": "securepass123",
        }
        await client.post("/api/v1/users", json=payload)

        response = await client.post("/api/v1/users", json=payload)

        assert response.status_code == 409
        assert "already registered" in response.json()["detail"]

    @pytest.mark.asyncio
    async def test_get_nonexistent_user_returns_404(self, client):
        response = await client.get("/api/v1/users/99999")

        assert response.status_code == 404
```

### Frontend Testing (Vitest + Testing Library)

```typescript
// tests/components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button } from '@/components/ui/Button';

describe('Button', () => {
  it('renders children text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);

    fireEvent.click(screen.getByText('Click'));

    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('shows spinner and disables when loading', () => {
    render(<Button isLoading>Submit</Button>);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(screen.queryByText('Submit')).not.toBeInTheDocument();
  });

  it('applies variant class', () => {
    render(<Button variant="danger">Delete</Button>);

    const button = screen.getByRole('button');
    expect(button.className).toContain('danger');
  });
});
```

### Test Requirements

| Requirement                          | Backend            | Frontend           |
|--------------------------------------|--------------------|--------------------|
| Every public function has tests      | ✅ Required        | ✅ Required        |
| Minimum coverage (critical paths)    | 80%                | 80%                |
| Test naming convention               | `test_<what>_<scenario>` | `it('does X when Y')` |
| Mocking                              | `pytest-mock`, `unittest.mock` | `vi.fn()`, `vi.mock()` |
| API integration tests                | `httpx.AsyncClient`| `msw` (Mock Service Worker) |
| E2E tests                            | Optional (Playwright) | Playwright      |

---

## 8. Documentation Requirements

### Every Project Must Have

1. **README.md** with:
   - One-line description
   - Quick start (install + run in ≤ 5 commands)
   - Architecture overview
   - API docs link (`/api/docs`)
   - Environment variable reference

2. **Inline documentation**:
   - Module-level docstring for every Python file
   - JSDoc for every exported TypeScript function/component
   - Function docstrings with args, returns, raises

### README Template

```markdown
# Project Name

One-line description of what this project does.

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 20+
- PostgreSQL 15+
- Docker (optional)

### With Docker (recommended)
\```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
docker compose up -d
\```

### Without Docker
\```bash
# Backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"
alembic upgrade head
uvicorn app.main:app --reload

# Frontend (in another terminal)
cd frontend
npm install
npm run dev
\```

- **Backend API docs**: http://localhost:8000/api/docs
- **Frontend**: http://localhost:3000

## Architecture

\```
Frontend (Next.js :3000) → Backend API (FastAPI :8000) → PostgreSQL (:5432)
\```

## Environment Variables

### Backend (`backend/.env`)
| Variable          | Description               | Default     | Required |
|-------------------|---------------------------|-------------|----------|
| `DATABASE_URL`    | PostgreSQL connection URL | —           | Yes      |
| `JWT_SECRET_KEY`  | JWT signing secret        | —           | Yes      |
| `APP_ENV`         | Environment mode          | development | No       |

### Frontend (`frontend/.env`)
| Variable                | Description      | Default                   | Required |
|-------------------------|------------------|---------------------------|----------|
| `NEXT_PUBLIC_API_URL`   | Backend API URL  | http://localhost:8000/api | No       |
```

---

## 9. Git Workflow

### Branching Strategy

```
main              ← Production-ready, always deployable
├── develop       ← Integration branch
├── feature/*     ← New features       (feature/user-auth)
├── fix/*         ← Bug fixes          (fix/token-expiry)
├── refactor/*    ← Code improvements  (refactor/api-client)
└── release/*     ← Release prep       (release/v1.2.0)
```

### Commit Message Format

```
<type>(<scope>): <short summary>

<optional body — explain WHY, not WHAT>
```

**Scopes:** `api`, `ui`, `db`, `auth`, `config`, `ci`, `docs`

**Types:**

| Type       | Use For                                 |
|------------|-----------------------------------------|
| `feat`     | New feature                             |
| `fix`      | Bug fix                                 |
| `refactor` | Code restructuring (no behavior change) |
| `docs`     | Documentation only                      |
| `test`     | Adding or updating tests                |
| `chore`    | Build, CI, tooling changes              |
| `perf`     | Performance improvement                 |

**Examples:**
```bash
feat(api): add user registration endpoint with email verification
fix(ui): resolve hydration mismatch on dashboard page
refactor(db): migrate from raw SQL to repository pattern
test(api): add integration tests for auth flow
```

### Commit Rules

- **Atomic commits** — Each commit does exactly one thing
- **No WIP commits** on `main` or `develop`
- **Squash feature branches** before merging to `develop`

---

## 10. Security Practices

### Non-Negotiable Rules

| Rule                            | Backend                                | Frontend                          |
|---------------------------------|----------------------------------------|-----------------------------------|
| No secrets in code              | Pydantic Settings + `.env`             | `NEXT_PUBLIC_*` for public only   |
| No secrets in git               | `.env` in `.gitignore`                 | `.env.local` in `.gitignore`      |
| Validate all input              | Pydantic schemas on every endpoint     | Zod / form validation             |
| Sanitize output                 | Pydantic `response_model`              | React auto-escapes JSX            |
| Auth on protected routes        | `Depends(get_current_user)`            | Middleware + server-side checks   |
| CORS configured                 | Explicit origins, no `*` in prod       | N/A (same-origin or proxy)        |
| Rate limiting                   | `slowapi` or middleware                | N/A (handled by backend)          |
| Parameterized DB queries        | SQLAlchemy ORM (never raw f-strings)   | N/A                               |
| HTTPS in production             | Reverse proxy (nginx/caddy)            | Next.js behind reverse proxy      |

### Backend .env.example

```bash
# Application
APP_ENV=development
APP_NAME="MyApp API"
APP_VERSION=1.0.0
DEBUG=true

# Server
HOST=0.0.0.0
PORT=8000

# Database
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/myapp

# Authentication
JWT_SECRET_KEY=change-me-in-production-use-openssl-rand-hex-32
JWT_ALGORITHM=HS256
JWT_EXPIRATION_MINUTES=30

# CORS
CORS_ORIGINS=["http://localhost:3000"]

# Redis
REDIS_URL=redis://localhost:6379/0
```

### Frontend .env.example

```bash
# API
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# App
NEXT_PUBLIC_APP_NAME=MyApp
```

---

## 11. DevOps & Deployment

### Docker Compose (Local Development)

```yaml
# docker-compose.yml
services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    env_file: ./backend/.env
    depends_on:
      db:
        condition: service_healthy
    volumes:
      - ./backend/app:/app/app  # Hot reload
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    env_file: ./frontend/.env
    depends_on:
      - backend
    volumes:
      - ./frontend/src:/app/src  # Hot reload
    command: npm run dev

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: myapp
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user -d myapp"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  pgdata:
```

### Backend Dockerfile

```dockerfile
# backend/Dockerfile
FROM python:3.12-slim AS base

WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Install system deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential libpq-dev && \
    rm -rf /var/lib/apt/lists/*

# Install Python deps
COPY pyproject.toml ./
RUN pip install --no-cache-dir -e .

# Copy source
COPY . .

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Top-Level Makefile

```makefile
# Makefile — Top-level orchestration

.PHONY: dev up down test lint format

# Start everything with Docker
up:
	docker compose up -d

down:
	docker compose down

# Start without Docker
dev:
	@echo "Starting backend..."
	cd backend && uvicorn app.main:app --reload &
	@echo "Starting frontend..."
	cd frontend && npm run dev

# Run all tests
test:
	cd backend && pytest -v
	cd frontend && npm test

# Lint everything
lint:
	cd backend && ruff check .
	cd frontend && npx eslint .

# Format everything
format:
	cd backend && ruff format .
	cd frontend && npx prettier --write "src/**/*.{ts,tsx,css}"
```

---

## 12. Review Checklist

Before considering any code complete, verify **every** item:

### Functionality
- [ ] Code does what was requested — no more, no less
- [ ] Edge cases handled (empty inputs, None, boundaries, 0, negative values)
- [ ] Error messages are clear and actionable
- [ ] API responses match the defined schemas

### Backend Quality
- [ ] All functions have type hints and docstrings
- [ ] Routes are thin — logic lives in services
- [ ] DB access goes through repositories only
- [ ] Pydantic schemas validate all input/output
- [ ] Custom exceptions used (not generic `HTTPException` everywhere)
- [ ] Logging used instead of `print()`
- [ ] No N+1 queries

### Frontend Quality
- [ ] Server Components used where possible
- [ ] No `any` types — all types are explicit
- [ ] Loading, error, and empty states handled
- [ ] Semantic HTML and accessible elements
- [ ] No inline styles — CSS Modules used
- [ ] API errors displayed to user gracefully

### Testing
- [ ] Unit tests for services and utilities
- [ ] Integration tests for API endpoints
- [ ] Component tests for key UI components
- [ ] All tests pass

### Security
- [ ] No hardcoded secrets
- [ ] All external input validated (Pydantic + Zod)
- [ ] Protected routes require authentication
- [ ] SQL injection not possible (ORM used)

### Git
- [ ] Commit messages follow `<type>(<scope>): <summary>` format
- [ ] Each commit is atomic and focused
- [ ] No `.env`, `node_modules`, `__pycache__` committed

---

> **Remember**: This is a **FastAPI + Next.js** project. Backend handles data, auth,
> and business logic. Frontend handles presentation and user interaction. Keep them
> cleanly separated — the API contract is the bridge between them.
