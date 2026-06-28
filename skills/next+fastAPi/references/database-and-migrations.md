# Database & Migrations Reference

## 1. SQLAlchemy Async Setup

### Database Module

```python
# app/core/database.py
from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from app.config import settings

engine = create_async_engine(
    settings.DATABASE_URL,
    pool_size=settings.DB_POOL_SIZE,         # Max persistent connections
    max_overflow=settings.DB_MAX_OVERFLOW,    # Extra connections under load
    pool_timeout=30,                          # Seconds to wait for a connection
    pool_recycle=1800,                        # Recycle connections after 30 min
    pool_pre_ping=True,                       # Verify connection before use
    echo=settings.DEBUG,                      # Log SQL in debug mode
)

async_session = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    """Declarative base for all models."""
    pass


async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency that provides a DB session per request."""
    async with async_session() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
```

### Common Mixins

```python
# app/models/base.py
from datetime import datetime
from sqlalchemy import DateTime, Integer, Boolean, func, text
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class TimestampMixin:
    """Adds created_at and updated_at columns."""
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(),
        onupdate=func.now(), nullable=False,
    )


class SoftDeleteMixin:
    """Adds soft-delete support via is_deleted flag."""
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class IDMixin:
    """Auto-incrementing integer primary key."""
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)


# Example model using all mixins
class User(IDMixin, TimestampMixin, SoftDeleteMixin, Base):
    __tablename__ = "users"
    email: Mapped[str] = mapped_column(unique=True, index=True, nullable=False)
    full_name: Mapped[str] = mapped_column(nullable=False)
    hashed_password: Mapped[str] = mapped_column(nullable=False)
    is_active: Mapped[bool] = mapped_column(default=True, nullable=False)
    role: Mapped[str] = mapped_column(default="viewer", nullable=False)
```

---

## 2. Alembic Setup (Async)

### Initialize

```bash
cd backend
alembic init -t async alembic
```

### env.py Configuration

```python
# alembic/env.py
import asyncio
from logging.config import fileConfig
from sqlalchemy import pool
from sqlalchemy.ext.asyncio import async_engine_from_config
from alembic import context

from app.config import settings
from app.core.database import Base

# Import ALL models so Alembic detects them
from app.models import user  # noqa: F401

config = context.config
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(url=url, target_metadata=target_metadata, literal_binds=True)
    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection) -> None:
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.", poolclass=pool.NullPool,
    )
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await connectable.dispose()


def run_migrations_online() -> None:
    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
```

### Migration Commands

```bash
alembic revision --autogenerate -m "add_users_table"   # Generate
alembic upgrade head                                    # Apply all
alembic downgrade -1                                    # Rollback one
alembic current                                         # Current revision
alembic history --verbose                               # Full history
```

### Migration Rules

| Rule | Why |
|------|-----|
| **Never edit applied migrations** | Other environments have already run them |
| **One logical change per migration** | Easier to review and rollback |
| **Name descriptively** | `add_email_index_to_users` not `update` |
| **Always review autogenerated code** | Alembic guesses — it can be wrong |
| **Test rollback** | Run `downgrade -1` then `upgrade head` |

---

## 3. Indexing Strategy

| Scenario | Index Type | Example |
|----------|-----------|---------|
| Frequently queried columns | Single | `email` in users |
| WHERE + ORDER BY together | Composite | `(status, created_at)` |
| Filter on subset of rows | Partial | `WHERE is_active = true` |
| Full-text search | GIN | `name` with `tsvector` |
| Unique constraints | Unique | `email` must be unique |
| Foreign keys | Single | `user_id` in orders |

```python
from sqlalchemy import Index, text

class Order(IDMixin, TimestampMixin, Base):
    __tablename__ = "orders"
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    status: Mapped[str] = mapped_column(index=True)

    __table_args__ = (
        Index("ix_orders_status_created", "status", "created_at"),
        Index("ix_orders_active", "user_id",
              postgresql_where=text("status != 'cancelled'")),
    )
```

---

## 4. Query Optimization

### Avoiding N+1

```python
# ❌ BAD — N+1
users = await session.execute(select(User))
for user in users.scalars():
    orders = await session.execute(select(Order).where(Order.user_id == user.id))

# ✅ GOOD — joinedload
from sqlalchemy.orm import joinedload
stmt = select(User).options(joinedload(User.orders))
result = await session.execute(stmt)
users = result.unique().scalars().all()

# ✅ GOOD — selectinload (better for large collections)
from sqlalchemy.orm import selectinload
stmt = select(User).options(selectinload(User.orders))
```

### Pagination

```python
# Offset-based (simple, slow at large offsets)
stmt = select(User).offset(skip).limit(limit).order_by(User.id)

# Cursor-based (fast, consistent — preferred for large datasets)
async def list_cursor(session, after_id: int | None, limit: int):
    stmt = select(User).order_by(User.id).limit(limit)
    if after_id:
        stmt = stmt.where(User.id > after_id)
    result = await session.execute(stmt)
    items = result.scalars().all()
    return {"items": items, "next_cursor": items[-1].id if items else None}
```

---

## 5. Base Repository Pattern

```python
# app/repositories/base.py
from typing import Generic, TypeVar, Type
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import Base

ModelType = TypeVar("ModelType", bound=Base)


class BaseRepository(Generic[ModelType]):
    def __init__(self, model: Type[ModelType], session: AsyncSession):
        self.model = model
        self.session = session

    async def get_by_id(self, id: int) -> ModelType | None:
        return await self.session.get(self.model, id)

    async def list(self, skip: int = 0, limit: int = 20) -> list[ModelType]:
        stmt = select(self.model).offset(skip).limit(limit)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def count(self) -> int:
        result = await self.session.execute(select(func.count()).select_from(self.model))
        return result.scalar_one()

    async def create(self, **kwargs) -> ModelType:
        instance = self.model(**kwargs)
        self.session.add(instance)
        await self.session.flush()
        await self.session.refresh(instance)
        return instance

    async def update(self, id: int, **kwargs) -> ModelType:
        instance = await self.get_by_id(id)
        for key, value in kwargs.items():
            setattr(instance, key, value)
        await self.session.flush()
        await self.session.refresh(instance)
        return instance

    async def delete(self, id: int) -> None:
        instance = await self.get_by_id(id)
        await self.session.delete(instance)
        await self.session.flush()
```

---

## 6. Backup & Recovery

```bash
#!/bin/bash
# scripts/backup_db.sh
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/postgres"
DB_NAME="myapp"
pg_dump -Fc $DB_NAME > "$BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.dump"
find $BACKUP_DIR -name "*.dump" -mtime +30 -delete

# Restore: pg_restore -d myapp_restored /backups/myapp_20250115.dump
```

| Strategy | Frequency | Retention |
|----------|-----------|-----------|
| Full backup | Daily | 30 days |
| WAL archiving | Continuous | 7 days |
| Test restore | Weekly | Verify integrity |
