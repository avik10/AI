# Authentication & Authorization Reference

## 1. JWT Flow

```
Frontend                              Backend
───────                              ───────
POST /auth/login (email+pass)  ───►  Verify credentials
                               ◄───  { access_token, refresh_token }

GET /api/v1/users              ───►  Validate access_token
  Authorization: Bearer <jwt>  ◄───  200 + data

POST /auth/refresh             ───►  Validate refresh_token
  { refresh_token }            ◄───  { new access_token, new refresh_token }
```

---

## 2. Backend Security Module

```python
# app/core/security.py
from datetime import datetime, timedelta, timezone
import jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from app.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


class TokenData(BaseModel):
    user_id: int
    role: str
    token_type: str = "access"


def create_access_token(user_id: int, role: str) -> str:
    payload = {
        "sub": str(user_id), "role": role, "type": "access",
        "exp": datetime.now(timezone.utc) + timedelta(minutes=settings.JWT_EXPIRATION_MINUTES),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def create_refresh_token(user_id: int, role: str) -> str:
    payload = {
        "sub": str(user_id), "role": role, "type": "refresh",
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_token(token: str) -> TokenData:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        return TokenData(user_id=int(payload["sub"]), role=payload["role"], token_type=payload.get("type", "access"))
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")


async def get_current_user_from_token(token: str = Depends(oauth2_scheme)) -> TokenData:
    token_data = decode_token(token)
    if token_data.token_type != "access":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type")
    return token_data
```

---

## 3. Auth Routes

```python
# app/api/v1/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from app.core.security import verify_password, create_access_token, create_refresh_token, decode_token
from app.services.user_service import UserService
from app.dependencies import get_user_service

router = APIRouter(prefix="/auth", tags=["Authentication"])


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str


@router.post("/login", response_model=TokenResponse)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    service: UserService = Depends(get_user_service),
):
    user = await service.get_user_by_email(form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account deactivated")
    return TokenResponse(
        access_token=create_access_token(user.id, user.role),
        refresh_token=create_refresh_token(user.id, user.role),
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(body: RefreshRequest, service: UserService = Depends(get_user_service)):
    token_data = decode_token(body.refresh_token)
    if token_data.token_type != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Expected refresh token")
    user = await service.get_user(token_data.user_id)
    return TokenResponse(
        access_token=create_access_token(user.id, user.role),
        refresh_token=create_refresh_token(user.id, user.role),
    )
```

---

## 4. Role-Based Access Control (RBAC)

```python
# app/core/permissions.py
from enum import Enum
from fastapi import Depends, HTTPException, status
from app.core.security import get_current_user_from_token, TokenData


class Role(str, Enum):
    ADMIN = "admin"
    EDITOR = "editor"
    VIEWER = "viewer"


ROLE_PERMISSIONS: dict[Role, set[str]] = {
    Role.ADMIN: {"read", "write", "delete", "manage_users", "view_analytics"},
    Role.EDITOR: {"read", "write"},
    Role.VIEWER: {"read"},
}


def require_role(*allowed_roles: Role):
    async def _check(token_data: TokenData = Depends(get_current_user_from_token)) -> TokenData:
        if token_data.role not in [r.value for r in allowed_roles]:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role '{token_data.role}' not allowed. Required: {[r.value for r in allowed_roles]}")
        return token_data
    return _check


def require_permission(permission: str):
    async def _check(token_data: TokenData = Depends(get_current_user_from_token)) -> TokenData:
        role = Role(token_data.role)
        if permission not in ROLE_PERMISSIONS.get(role, set()):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission '{permission}' not granted for role '{role.value}'")
        return token_data
    return _check

# Usage: @router.delete("/{id}", dependencies=[Depends(require_role(Role.ADMIN))])
```

---

## 5. Frontend Auth — Zustand Store

```typescript
// src/stores/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User { id: number; email: string; full_name: string; role: string; }

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<string | null>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null, accessToken: null, refreshToken: null, isAuthenticated: false,

      login: async (email, password) => {
        const form = new URLSearchParams();
        form.append('username', email);
        form.append('password', password);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/auth/login`, {
          method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: form,
        });
        if (!res.ok) { const err = await res.json(); throw new Error(err.detail); }
        const tokens = await res.json();
        // Fetch profile with new token
        const profileRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/users/me`, {
          headers: { Authorization: `Bearer ${tokens.access_token}` },
        });
        const user = await profileRes.json();
        set({ accessToken: tokens.access_token, refreshToken: tokens.refresh_token, user, isAuthenticated: true });
      },

      logout: () => set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false }),

      refreshAccessToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) return null;
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/auth/refresh`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: refreshToken }),
          });
          if (!res.ok) { get().logout(); return null; }
          const tokens = await res.json();
          set({ accessToken: tokens.access_token, refreshToken: tokens.refresh_token });
          return tokens.access_token;
        } catch { get().logout(); return null; }
      },
    }),
    { name: 'auth-storage', partialize: (s) => ({ accessToken: s.accessToken, refreshToken: s.refreshToken, user: s.user, isAuthenticated: s.isAuthenticated }) }
  )
);
```

---

## 6. Next.js Middleware (Route Protection)

```typescript
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/login', '/register', '/forgot-password', '/'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('access_token')?.value;

  if (token && ['/login', '/register'].some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  if (!token && !PUBLIC_PATHS.some((p) => pathname === p)) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'] };
```
