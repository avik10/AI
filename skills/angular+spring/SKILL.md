---
name: angular-springboot-production-agent
description: >
  Production-level full-stack development agent for Angular + Java Spring Boot enterprise
  applications. Covers the complete stack — Angular 17+ frontend (standalone components,
  signals, NgRx, SSR) and Java Spring Boot 3+ backend (Spring Security, Spring Data JPA,
  REST APIs, validation, testing, observability). Instructs the AI assistant on project
  architecture, coding conventions, state management, API design, database layer, caching,
  messaging, testing, security, performance, CI/CD, and production-readiness standards.
  Activate on any Angular, Spring Boot, Java, or full-stack development task.
---

# Angular + Spring Boot Production-Level Development Agent

**Stack: Angular 17+ (Frontend) + Java Spring Boot 3+ (Backend)**

This skill defines how **all full-stack development** in this workspace must be conducted.
Every piece of code written, reviewed, or modified must follow these standards.
These are non-negotiable production-quality requirements.

> **Part I** covers Angular frontend standards. **Part II** covers Java Spring Boot backend standards.

---

## Table of Contents

### Part I — Angular Frontend

1. [Core Philosophy](#1-core-philosophy)
2. [Project Architecture](#2-project-architecture)
3. [Component Standards](#3-component-standards)
4. [State Management — NgRx / Signals](#4-state-management--ngrx--signals)
5. [RxJS Best Practices](#5-rxjs-best-practices)
6. [Routing & Navigation](#6-routing--navigation)
7. [Forms — Reactive Forms](#7-forms--reactive-forms)
8. [HTTP Communication](#8-http-communication)
9. [Error Handling & Logging](#9-error-handling--logging)
10. [Testing Strategy](#10-testing-strategy)
11. [Performance Optimization](#11-performance-optimization)
12. [Security Practices](#12-security-practices)
13. [Accessibility (a11y)](#13-accessibility-a11y)
14. [Styling Standards](#14-styling-standards)
15. [Documentation Requirements](#15-documentation-requirements)
16. [Git Workflow](#16-git-workflow)
17. [DevOps & Deployment](#17-devops--deployment)
18. [Review Checklist](#18-review-checklist)

### Part II — Java Spring Boot Backend

19. [Spring Boot Core Philosophy](#19-spring-boot-core-philosophy)
20. [Backend Project Architecture](#20-backend-project-architecture)
21. [REST API Standards](#21-rest-api-standards)
22. [Service Layer Patterns](#22-service-layer-patterns)
23. [Data Access — Spring Data JPA](#23-data-access--spring-data-jpa)
24. [Validation & DTOs](#24-validation--dtos)
25. [Exception Handling](#25-exception-handling)
26. [Spring Security & Authentication](#26-spring-security--authentication)
27. [Configuration & Profiles](#27-configuration--profiles)
28. [Caching & Performance](#28-caching--performance)
29. [Messaging & Async Processing](#29-messaging--async-processing)
30. [Logging & Observability](#30-logging--observability)
31. [Backend Testing Strategy](#31-backend-testing-strategy)
32. [Backend DevOps & Deployment](#32-backend-devops--deployment)
33. [Backend Review Checklist](#33-backend-review-checklist)

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
6. **Angular-idiomatic always** — Use Angular's built-in solutions before reaching for
   third-party libraries. Leverage signals, standalone components, and the inject() function.

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

## 2. Project Architecture

### Monorepo Structure (Nx-ready)

```
project-root/
│
├── src/
│   ├── app/
│   │   ├── app.component.ts              # Root component (standalone)
│   │   ├── app.component.html
│   │   ├── app.component.scss
│   │   ├── app.component.spec.ts
│   │   ├── app.config.ts                 # Application configuration
│   │   ├── app.routes.ts                 # Top-level route definitions
│   │   │
│   │   ├── core/                          # Singleton services, guards, interceptors
│   │   │   ├── auth/
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── auth.guard.ts
│   │   │   │   ├── auth.interceptor.ts
│   │   │   │   └── auth.model.ts
│   │   │   ├── http/
│   │   │   │   ├── api.service.ts         # Base HTTP client wrapper
│   │   │   │   ├── error.interceptor.ts   # Global error handling
│   │   │   │   └── loading.interceptor.ts
│   │   │   ├── logging/
│   │   │   │   └── logger.service.ts
│   │   │   ├── guards/
│   │   │   │   ├── auth.guard.ts
│   │   │   │   └── role.guard.ts
│   │   │   └── models/
│   │   │       ├── api-response.model.ts
│   │   │       └── error.model.ts
│   │   │
│   │   ├── shared/                        # Reusable components, directives, pipes
│   │   │   ├── components/
│   │   │   │   ├── button/
│   │   │   │   │   ├── button.component.ts
│   │   │   │   │   ├── button.component.html
│   │   │   │   │   ├── button.component.scss
│   │   │   │   │   └── button.component.spec.ts
│   │   │   │   ├── modal/
│   │   │   │   ├── toast/
│   │   │   │   └── loading-spinner/
│   │   │   ├── directives/
│   │   │   │   ├── click-outside.directive.ts
│   │   │   │   └── debounce-click.directive.ts
│   │   │   ├── pipes/
│   │   │   │   ├── truncate.pipe.ts
│   │   │   │   ├── time-ago.pipe.ts
│   │   │   │   └── safe-html.pipe.ts
│   │   │   ├── validators/
│   │   │   │   └── custom-validators.ts
│   │   │   └── utils/
│   │   │       ├── type-guards.ts
│   │   │       └── helpers.ts
│   │   │
│   │   ├── features/                      # Feature modules (lazy-loaded)
│   │   │   ├── dashboard/
│   │   │   │   ├── dashboard.component.ts
│   │   │   │   ├── dashboard.component.html
│   │   │   │   ├── dashboard.component.scss
│   │   │   │   ├── dashboard.component.spec.ts
│   │   │   │   ├── dashboard.routes.ts
│   │   │   │   ├── components/            # Feature-scoped components
│   │   │   │   │   ├── stats-card/
│   │   │   │   │   └── activity-feed/
│   │   │   │   ├── services/
│   │   │   │   │   └── dashboard.service.ts
│   │   │   │   └── models/
│   │   │   │       └── dashboard.model.ts
│   │   │   │
│   │   │   ├── users/
│   │   │   │   ├── users.component.ts
│   │   │   │   ├── users.routes.ts
│   │   │   │   ├── components/
│   │   │   │   │   ├── user-list/
│   │   │   │   │   ├── user-detail/
│   │   │   │   │   └── user-form/
│   │   │   │   ├── services/
│   │   │   │   │   └── users.service.ts
│   │   │   │   ├── store/                 # Feature-level NgRx store
│   │   │   │   │   ├── users.actions.ts
│   │   │   │   │   ├── users.reducer.ts
│   │   │   │   │   ├── users.selectors.ts
│   │   │   │   │   └── users.effects.ts
│   │   │   │   └── models/
│   │   │   │       └── user.model.ts
│   │   │   │
│   │   │   └── auth/
│   │   │       ├── login/
│   │   │       ├── register/
│   │   │       └── auth.routes.ts
│   │   │
│   │   ├── layout/                        # Layout components
│   │   │   ├── header/
│   │   │   ├── sidebar/
│   │   │   ├── footer/
│   │   │   └── main-layout/
│   │   │
│   │   └── store/                         # Global NgRx store
│   │       ├── app.state.ts
│   │       ├── app.reducer.ts
│   │       └── app.effects.ts
│   │
│   ├── assets/
│   │   ├── images/
│   │   ├── icons/
│   │   ├── fonts/
│   │   └── i18n/
│   │
│   ├── environments/
│   │   ├── environment.ts
│   │   ├── environment.development.ts
│   │   ├── environment.staging.ts
│   │   └── environment.production.ts
│   │
│   ├── styles/
│   │   ├── _variables.scss               # Design tokens
│   │   ├── _mixins.scss                  # Reusable SCSS mixins
│   │   ├── _typography.scss              # Typography system
│   │   ├── _animations.scss              # Global animations
│   │   ├── _reset.scss                   # CSS reset/normalize
│   │   └── styles.scss                   # Global stylesheet (imports all partials)
│   │
│   ├── index.html
│   ├── main.ts                           # Bootstrap with standalone API
│   └── polyfills.ts
│
├── e2e/                                   # End-to-end tests (Playwright)
│   ├── src/
│   └── playwright.config.ts
│
├── angular.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.spec.json
├── package.json
├── Dockerfile
├── docker-compose.yml
├── .env.example
├── .eslintrc.json
├── .prettierrc
├── karma.conf.js (or jest.config.ts)
├── Makefile
└── README.md
```

### Layer Responsibilities

```
┌─────────────────────────────────────────────────────────────┐
│  ANGULAR APPLICATION                                        │
│                                                             │
│  ┌─── FEATURES (Lazy-loaded) ─────────────────────────────┐ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐             │ │
│  │  │  Smart    │→ │  Dumb    │→ │  Store   │             │ │
│  │  │Components │  │Components│  │(NgRx/    │             │ │
│  │  │(Pages)   │  │(UI)      │  │ Signals) │             │ │
│  │  └──────────┘  └──────────┘  └──────────┘             │ │
│  └────────────────────────────────────────────────────────┘ │
│                         ↕                                   │
│  ┌─── CORE (Singleton) ──────────────────────────────────┐  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────┐        │  │
│  │  │ Services │  │ Guards   │  │ Interceptors  │        │  │
│  │  └──────────┘  └──────────┘  └──────────────┘        │  │
│  └────────────────────────────────────────────────────────┘  │
│                         ↕                                   │
│  ┌─── SHARED (Reusable) ─────────────────────────────────┐  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐            │  │
│  │  │Components│  │Directives│  │  Pipes   │            │  │
│  │  └──────────┘  └──────────┘  └──────────┘            │  │
│  └────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                         │ HTTP (JSON)
┌────────────────────────┴────────────────────────────────────┐
│  BACKEND API (REST / GraphQL)                               │
└─────────────────────────────────────────────────────────────┘
```

**Rules:**
- **Core** services are singleton — provided in `root`. Never import Core into Shared.
- **Shared** components are stateless / presentational. They receive data via `@Input()` / `input()` and emit via `@Output()` / `output()`.
- **Features** are lazy-loaded route groups. Each feature owns its own components, services, models, and store slice.
- **Smart components** (containers) connect to the store / services. **Dumb components** (presentational) only use inputs and outputs.

---

## 3. Component Standards

### Standalone Component Pattern (Angular 17+)

```typescript
// features/users/components/user-card/user-card.component.ts
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { User } from '../../models/user.model';
import { TimeAgoPipe } from '../../../../shared/pipes/time-ago.pipe';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

/**
 * Displays a single user's information in a card layout.
 *
 * @example
 * <app-user-card [user]="userData" (edit)="onEdit($event)" />
 */
@Component({
  selector: 'app-user-card',
  standalone: true,
  imports: [CommonModule, RouterLink, TimeAgoPipe, ButtonComponent],
  templateUrl: './user-card.component.html',
  styleUrl: './user-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserCardComponent {
  /** The user to display. */
  readonly user = input.required<User>();

  /** Whether the card is in a loading state. */
  readonly isLoading = input<boolean>(false);

  /** Emitted when the edit button is clicked. */
  readonly edit = output<User>();

  /** Emitted when the delete button is clicked. */
  readonly delete = output<string>();

  onEdit(): void {
    this.edit.emit(this.user());
  }

  onDelete(): void {
    this.delete.emit(this.user().id);
  }
}
```

### Component Template Standards

```html
<!-- user-card.component.html -->
<article class="user-card" [class.loading]="isLoading()">
  @if (isLoading()) {
    <div class="user-card__skeleton" aria-busy="true">
      <span class="sr-only">Loading user information...</span>
    </div>
  } @else {
    <header class="user-card__header">
      <img
        [src]="user().avatarUrl"
        [alt]="user().fullName + '\'s avatar'"
        class="user-card__avatar"
        loading="lazy"
      />
      <div class="user-card__info">
        <h3 class="user-card__name">
          <a [routerLink]="['/users', user().id]">{{ user().fullName }}</a>
        </h3>
        <p class="user-card__email">{{ user().email }}</p>
        <time class="user-card__joined" [attr.datetime]="user().createdAt">
          Joined {{ user().createdAt | timeAgo }}
        </time>
      </div>
    </header>

    <footer class="user-card__actions">
      <app-button variant="secondary" size="sm" (clicked)="onEdit()">
        Edit
      </app-button>
      <app-button variant="danger" size="sm" (clicked)="onDelete()">
        Delete
      </app-button>
    </footer>
  }
</article>
```

### Smart (Container) Component Pattern

```typescript
// features/users/users.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';

import { UserCardComponent } from './components/user-card/user-card.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { UsersActions } from './store/users.actions';
import { selectAllUsers, selectUsersLoading, selectUsersError } from './store/users.selectors';

/**
 * Container component for the Users feature.
 * Connects to the NgRx store and delegates rendering to presentational components.
 */
@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, UserCardComponent, LoadingSpinnerComponent],
  template: `
    <section class="users-page">
      <header class="users-page__header">
        <h1>Users</h1>
      </header>

      @if (isLoading()) {
        <app-loading-spinner />
      } @else if (error()) {
        <div class="error-state" role="alert">
          <p>{{ error() }}</p>
          <button (click)="retry()">Retry</button>
        </div>
      } @else if (users().length === 0) {
        <div class="empty-state">
          <p>No users found.</p>
        </div>
      } @else {
        <div class="users-grid">
          @for (user of users(); track user.id) {
            <app-user-card
              [user]="user"
              (edit)="onEditUser($event)"
              (delete)="onDeleteUser($event)"
            />
          }
        </div>
      }
    </section>
  `,
  styleUrl: './users.component.scss',
})
export class UsersComponent implements OnInit {
  private readonly store = inject(Store);

  readonly users = toSignal(this.store.select(selectAllUsers), { initialValue: [] });
  readonly isLoading = toSignal(this.store.select(selectUsersLoading), { initialValue: false });
  readonly error = toSignal(this.store.select(selectUsersError), { initialValue: null });

  ngOnInit(): void {
    this.store.dispatch(UsersActions.loadUsers());
  }

  onEditUser(user: User): void {
    // Navigate to edit page or open modal
  }

  onDeleteUser(userId: string): void {
    this.store.dispatch(UsersActions.deleteUser({ userId }));
  }

  retry(): void {
    this.store.dispatch(UsersActions.loadUsers());
  }
}
```

### Component Rules

| Rule | Details |
|------|---------|
| **Always standalone** | No NgModules for new components. Use `standalone: true`. |
| **Always OnPush** | Use `ChangeDetectionStrategy.OnPush` on every component. |
| **Use signals for inputs** | Prefer `input()` / `input.required()` over `@Input()`. |
| **Use output() for events** | Prefer `output()` over `@Output() + EventEmitter`. |
| **Smart vs. Dumb** | Smart components connect to store/services. Dumb components only use inputs/outputs. |
| **Prefix selectors** | Always use `app-` prefix: `selector: 'app-user-card'`. |
| **One component per file** | Never define multiple components in a single file. |
| **BEM for CSS classes** | Use Block-Element-Modifier naming: `.user-card__header--active`. |

---

## 4. State Management — NgRx / Signals

### When to Use What

| Complexity | Solution |
|------------|----------|
| Component-local state | Angular Signals (`signal()`, `computed()`, `effect()`) |
| Parent-child communication | `input()` / `output()` |
| Shared UI state (e.g. sidebar open) | Service with Signals |
| Complex async / server state | NgRx Store + Effects |
| Global app state (auth, user session) | NgRx Store |

### Signal-based Service (Simple State)

```typescript
// core/services/ui-state.service.ts
import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class UiStateService {
  /** Whether the sidebar is expanded. */
  readonly sidebarOpen = signal(true);

  /** Current theme. */
  readonly theme = signal<'light' | 'dark'>('light');

  /** Derived: CSS class for the current theme. */
  readonly themeClass = computed(() => `theme-${this.theme()}`);

  toggleSidebar(): void {
    this.sidebarOpen.update(open => !open);
  }

  setTheme(theme: 'light' | 'dark'): void {
    this.theme.set(theme);
    localStorage.setItem('theme', theme);
  }
}
```

### NgRx Store Pattern (Complex State)

#### Actions

```typescript
// features/users/store/users.actions.ts
import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { User, CreateUserPayload, UpdateUserPayload } from '../models/user.model';

export const UsersActions = createActionGroup({
  source: 'Users',
  events: {
    'Load Users': emptyProps(),
    'Load Users Success': props<{ users: User[] }>(),
    'Load Users Failure': props<{ error: string }>(),

    'Create User': props<{ payload: CreateUserPayload }>(),
    'Create User Success': props<{ user: User }>(),
    'Create User Failure': props<{ error: string }>(),

    'Update User': props<{ userId: string; payload: UpdateUserPayload }>(),
    'Update User Success': props<{ user: User }>(),
    'Update User Failure': props<{ error: string }>(),

    'Delete User': props<{ userId: string }>(),
    'Delete User Success': props<{ userId: string }>(),
    'Delete User Failure': props<{ error: string }>(),
  },
});
```

#### Reducer

```typescript
// features/users/store/users.reducer.ts
import { createReducer, on } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { User } from '../models/user.model';
import { UsersActions } from './users.actions';

export interface UsersState extends EntityState<User> {
  loading: boolean;
  error: string | null;
  selectedUserId: string | null;
}

export const usersAdapter: EntityAdapter<User> = createEntityAdapter<User>({
  selectId: (user) => user.id,
  sortComparer: (a, b) => a.fullName.localeCompare(b.fullName),
});

const initialState: UsersState = usersAdapter.getInitialState({
  loading: false,
  error: null,
  selectedUserId: null,
});

export const usersReducer = createReducer(
  initialState,

  // Load Users
  on(UsersActions.loadUsers, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(UsersActions.loadUsersSuccess, (state, { users }) =>
    usersAdapter.setAll(users, { ...state, loading: false }),
  ),
  on(UsersActions.loadUsersFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Create User
  on(UsersActions.createUserSuccess, (state, { user }) =>
    usersAdapter.addOne(user, state),
  ),

  // Update User
  on(UsersActions.updateUserSuccess, (state, { user }) =>
    usersAdapter.upsertOne(user, state),
  ),

  // Delete User
  on(UsersActions.deleteUserSuccess, (state, { userId }) =>
    usersAdapter.removeOne(userId, state),
  ),
);
```

#### Selectors

```typescript
// features/users/store/users.selectors.ts
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UsersState, usersAdapter } from './users.reducer';

const selectUsersState = createFeatureSelector<UsersState>('users');

const { selectAll, selectEntities, selectTotal } = usersAdapter.getSelectors();

export const selectAllUsers = createSelector(selectUsersState, selectAll);
export const selectUserEntities = createSelector(selectUsersState, selectEntities);
export const selectUsersTotal = createSelector(selectUsersState, selectTotal);
export const selectUsersLoading = createSelector(selectUsersState, (state) => state.loading);
export const selectUsersError = createSelector(selectUsersState, (state) => state.error);

export const selectUserById = (id: string) =>
  createSelector(selectUserEntities, (entities) => entities[id] ?? null);
```

#### Effects

```typescript
// features/users/store/users.effects.ts
import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, exhaustMap, catchError, tap } from 'rxjs/operators';

import { UsersService } from '../services/users.service';
import { UsersActions } from './users.actions';
import { ToastService } from '../../../core/services/toast.service';

@Injectable()
export class UsersEffects {
  private readonly actions$ = inject(Actions);
  private readonly usersService = inject(UsersService);
  private readonly toast = inject(ToastService);

  readonly loadUsers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsersActions.loadUsers),
      exhaustMap(() =>
        this.usersService.getAll().pipe(
          map((users) => UsersActions.loadUsersSuccess({ users })),
          catchError((error) =>
            of(UsersActions.loadUsersFailure({ error: error.message })),
          ),
        ),
      ),
    ),
  );

  readonly createUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsersActions.createUser),
      exhaustMap(({ payload }) =>
        this.usersService.create(payload).pipe(
          map((user) => UsersActions.createUserSuccess({ user })),
          catchError((error) =>
            of(UsersActions.createUserFailure({ error: error.message })),
          ),
        ),
      ),
    ),
  );

  readonly createUserSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(UsersActions.createUserSuccess),
        tap(({ user }) => this.toast.success(`User "${user.fullName}" created`)),
      ),
    { dispatch: false },
  );

  readonly deleteUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsersActions.deleteUser),
      exhaustMap(({ userId }) =>
        this.usersService.delete(userId).pipe(
          map(() => UsersActions.deleteUserSuccess({ userId })),
          catchError((error) =>
            of(UsersActions.deleteUserFailure({ error: error.message })),
          ),
        ),
      ),
    ),
  );
}
```

---

## 5. RxJS Best Practices

### Operator Selection Guide

| Scenario | Operator | Why |
|----------|----------|-----|
| HTTP request from user action | `switchMap` | Cancel previous request on new action |
| Form submission / mutation | `exhaustMap` | Ignore new clicks while request in-flight |
| Queue all requests (order matters) | `concatMap` | Process sequentially |
| Parallel independent requests | `mergeMap` | Process concurrently |
| Combine latest values | `combineLatest` | Re-emit when any source changes |
| Wait for all to complete | `forkJoin` | Emit once when all complete |

### Rules

```typescript
// ✅ GOOD — Always unsubscribe. Use takeUntilDestroyed() or async pipe.
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({ ... })
export class MyComponent {
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.someObservable$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(value => this.handleValue(value));
  }
}

// ✅ GOOD — Prefer async pipe in templates (auto-unsubscribes)
// Template: {{ data$ | async }}

// ✅ GOOD — Prefer toSignal() for converting observables to signals
readonly users = toSignal(this.store.select(selectAllUsers), { initialValue: [] });

// ❌ BAD — Manual subscribe without cleanup
ngOnInit(): void {
  this.service.getData().subscribe(data => { ... }); // MEMORY LEAK
}

// ❌ BAD — Nested subscribes
this.service.getUser().subscribe(user => {
  this.service.getPosts(user.id).subscribe(posts => { ... }); // CALLBACK HELL
});

// ✅ GOOD — Use operators instead
this.service.getUser().pipe(
  switchMap(user => this.service.getPosts(user.id)),
).subscribe(posts => { ... });
```

### Error Handling in Streams

```typescript
// ✅ Always handle errors inside the stream to prevent stream death
this.searchControl.valueChanges.pipe(
  debounceTime(300),
  distinctUntilChanged(),
  switchMap(term =>
    this.searchService.search(term).pipe(
      catchError(error => {
        this.logger.error('Search failed', error);
        return of([]); // Return fallback value, keep stream alive
      }),
    ),
  ),
  takeUntilDestroyed(this.destroyRef),
).subscribe(results => this.results.set(results));
```

---

## 6. Routing & Navigation

### Route Configuration (Standalone)

```typescript
// app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard],
    title: 'Dashboard | MyApp',
  },
  {
    path: 'users',
    loadChildren: () =>
      import('./features/users/users.routes').then(m => m.USERS_ROUTES),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] },
  },
  {
    path: '**',
    loadComponent: () =>
      import('./shared/components/not-found/not-found.component').then(
        m => m.NotFoundComponent,
      ),
    title: 'Page Not Found | MyApp',
  },
];
```

### Feature Routes

```typescript
// features/users/users.routes.ts
import { Routes } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { usersReducer } from './store/users.reducer';
import { UsersEffects } from './store/users.effects';

export const USERS_ROUTES: Routes = [
  {
    path: '',
    providers: [
      provideState('users', usersReducer),
      provideEffects(UsersEffects),
    ],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./users.component').then(m => m.UsersComponent),
        title: 'Users | MyApp',
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./components/user-detail/user-detail.component').then(
            m => m.UserDetailComponent,
          ),
        title: 'User Details | MyApp',
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import('./components/user-form/user-form.component').then(
            m => m.UserFormComponent,
          ),
        title: 'Edit User | MyApp',
      },
    ],
  },
];
```

### Functional Guards

```typescript
// core/guards/auth.guard.ts
import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../auth/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/auth/login'], {
    queryParams: { returnUrl: router.url },
  });
};
```

### Routing Rules

- **Always lazy-load features** — Use `loadComponent` / `loadChildren`
- **Set page titles** — Use the `title` property on every route
- **Guard protected routes** — Apply `canActivate` guards
- **Use resolvers for critical data** — Ensure data is available before rendering
- **Provide feature store at route level** — Use `providers` in route config

---

## 7. Forms — Reactive Forms

### Always Use Reactive Forms

```typescript
// features/users/components/user-form/user-form.component.ts
import { Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  type AbstractControl,
} from '@angular/forms';

import { CustomValidators } from '../../../../shared/validators/custom-validators';
import { CreateUserPayload } from '../../models/user.model';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserFormComponent {
  private readonly fb = inject(FormBuilder);

  /** Whether the form is submitting. */
  readonly isSubmitting = input<boolean>(false);

  /** Emitted when the form is valid and submitted. */
  readonly formSubmit = output<CreateUserPayload>();

  readonly form = this.fb.nonNullable.group(
    {
      fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), CustomValidators.strongPassword]],
      confirmPassword: ['', [Validators.required]],
    },
    {
      validators: [CustomValidators.mustMatch('password', 'confirmPassword')],
    },
  );

  /** Helper for template access to form controls. */
  get f(): Record<string, AbstractControl> {
    return this.form.controls;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { confirmPassword, ...payload } = this.form.getRawValue();
    this.formSubmit.emit(payload);
  }
}
```

### Custom Validators

```typescript
// shared/validators/custom-validators.ts
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {
  /**
   * Validates that a password meets strength requirements:
   * - At least one uppercase letter
   * - At least one lowercase letter
   * - At least one digit
   * - At least one special character
   */
  static strongPassword(control: AbstractControl): ValidationErrors | null {
    const value = control.value as string;
    if (!value) return null;

    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    const hasDigit = /\d/.test(value);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);

    const valid = hasUpper && hasLower && hasDigit && hasSpecial;
    return valid ? null : { strongPassword: true };
  }

  /**
   * Cross-field validator: ensures two fields match (e.g., password confirmation).
   */
  static mustMatch(controlName: string, matchingControlName: string): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const control = group.get(controlName);
      const matching = group.get(matchingControlName);

      if (!control || !matching) return null;
      if (matching.errors && !matching.errors['mustMatch']) return null;

      if (control.value !== matching.value) {
        matching.setErrors({ mustMatch: true });
      } else {
        matching.setErrors(null);
      }

      return null;
    };
  }
}
```

### Form Rules

- **Never use template-driven forms** for anything beyond trivial use cases
- **Always use `nonNullable` form builder** — Prevents null values
- **Mark all as touched on invalid submit** — Show all validation errors
- **Create reusable validators** — Put custom validators in `shared/validators/`
- **Type your form values** — Use `getRawValue()` for typed output

---

## 8. HTTP Communication

### Base API Service

```typescript
// core/http/api.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, type HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { LoggerService } from '../logging/logger.service';

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  skip: number;
  limit: number;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly logger = inject(LoggerService);
  private readonly baseUrl = environment.apiUrl;

  get<T>(endpoint: string, params?: Record<string, string | number>): Observable<T> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        httpParams = httpParams.set(key, String(value));
      });
    }

    return this.http.get<T>(`${this.baseUrl}${endpoint}`, { params: httpParams }).pipe(
      retry({ count: 2, delay: 1000 }),
      catchError((error) => this.handleError(error)),
    );
  }

  post<T>(endpoint: string, body: unknown): Observable<T> {
    return this.http
      .post<T>(`${this.baseUrl}${endpoint}`, body)
      .pipe(catchError((error) => this.handleError(error)));
  }

  put<T>(endpoint: string, body: unknown): Observable<T> {
    return this.http
      .put<T>(`${this.baseUrl}${endpoint}`, body)
      .pipe(catchError((error) => this.handleError(error)));
  }

  patch<T>(endpoint: string, body: unknown): Observable<T> {
    return this.http
      .patch<T>(`${this.baseUrl}${endpoint}`, body)
      .pipe(catchError((error) => this.handleError(error)));
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http
      .delete<T>(`${this.baseUrl}${endpoint}`)
      .pipe(catchError((error) => this.handleError(error)));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let message: string;

    if (error.error instanceof ErrorEvent) {
      // Client-side / network error
      message = `Network error: ${error.error.message}`;
    } else {
      // Server-side error
      message = error.error?.detail ?? error.error?.message ?? `Server error: ${error.status}`;
    }

    this.logger.error('API Error', { status: error.status, message, url: error.url });
    return throwError(() => new Error(message));
  }
}
```

### Feature Service Pattern

```typescript
// features/users/services/users.service.ts
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService, PaginatedResponse } from '../../../core/http/api.service';
import { User, CreateUserPayload, UpdateUserPayload } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly api = inject(ApiService);
  private readonly endpoint = '/v1/users';

  getAll(skip = 0, limit = 20): Observable<PaginatedResponse<User>> {
    return this.api.get<PaginatedResponse<User>>(this.endpoint, { skip, limit });
  }

  getById(id: string): Observable<User> {
    return this.api.get<User>(`${this.endpoint}/${id}`);
  }

  create(payload: CreateUserPayload): Observable<User> {
    return this.api.post<User>(this.endpoint, payload);
  }

  update(id: string, payload: UpdateUserPayload): Observable<User> {
    return this.api.patch<User>(`${this.endpoint}/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }
}
```

### HTTP Interceptors

```typescript
// core/http/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getAccessToken();

  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(cloned);
  }

  return next(req);
};
```

```typescript
// core/http/error.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { AuthService } from '../auth/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error) => {
      if (error.status === 401) {
        authService.logout();
        router.navigate(['/auth/login']);
      }
      return throwError(() => error);
    }),
  );
};
```

### App Configuration

```typescript
// app.config.ts
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';

import { routes } from './app.routes';
import { authInterceptor } from './core/http/auth.interceptor';
import { errorInterceptor } from './core/http/error.interceptor';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding(), withViewTransitions()),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    provideAnimationsAsync(),
    provideStore(),
    provideEffects(),
    ...(!environment.production
      ? [provideStoreDevtools({ maxAge: 25, logOnly: environment.production })]
      : []),
  ],
};
```

---

## 9. Error Handling & Logging

### Logger Service

```typescript
// core/logging/logger.service.ts
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

@Injectable({ providedIn: 'root' })
export class LoggerService {
  debug(message: string, context?: unknown): void {
    if (!environment.production) {
      console.debug(`[DEBUG] ${message}`, context ?? '');
    }
  }

  info(message: string, context?: unknown): void {
    console.info(`[INFO] ${message}`, context ?? '');
  }

  warn(message: string, context?: unknown): void {
    console.warn(`[WARN] ${message}`, context ?? '');
  }

  error(message: string, context?: unknown): void {
    console.error(`[ERROR] ${message}`, context ?? '');
    // In production, send to external error tracking (Sentry, LogRocket, etc.)
  }
}
```

### Global Error Handler

```typescript
// core/error-handler/global-error-handler.ts
import { ErrorHandler, Injectable, inject } from '@angular/core';
import { LoggerService } from '../logging/logger.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly logger = inject(LoggerService);

  handleError(error: unknown): void {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const stack = error instanceof Error ? error.stack : undefined;

    this.logger.error('Unhandled error', { message, stack });

    // In production, report to Sentry / error tracking service
  }
}
```

### Error Handling Rules

- **Never swallow errors silently** — Always log at minimum
- **Use `catchError` inside RxJS streams** — Return a fallback value to keep the stream alive
- **Display user-friendly messages** — Never show raw stack traces to users
- **Use a global `ErrorHandler`** — Catch uncaught exceptions
- **Use HTTP interceptors for auth errors** — Handle 401/403 globally
- **Never use `console.log` in production code** — Use `LoggerService`

---

## 10. Testing Strategy

### Unit Testing (Jest / Karma)

```typescript
// features/users/services/users.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { UsersService } from './users.service';
import { ApiService } from '../../../core/http/api.service';

describe('UsersService', () => {
  let service: UsersService;
  let apiSpy: jest.Mocked<ApiService>;

  beforeEach(() => {
    const spy = {
      get: jest.fn(),
      post: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        UsersService,
        { provide: ApiService, useValue: spy },
      ],
    });

    service = TestBed.inject(UsersService);
    apiSpy = TestBed.inject(ApiService) as jest.Mocked<ApiService>;
  });

  describe('getAll', () => {
    it('should fetch paginated users', (done) => {
      const mockResponse = {
        items: [{ id: '1', fullName: 'John', email: 'john@test.com' }],
        total: 1,
        skip: 0,
        limit: 20,
      };
      apiSpy.get.mockReturnValue(of(mockResponse));

      service.getAll().subscribe((result) => {
        expect(result.items).toHaveLength(1);
        expect(result.total).toBe(1);
        expect(apiSpy.get).toHaveBeenCalledWith('/v1/users', { skip: 0, limit: 20 });
        done();
      });
    });
  });

  describe('create', () => {
    it('should create a user and return the created user', (done) => {
      const payload = { fullName: 'Jane', email: 'jane@test.com', password: 'Secure123!' };
      const mockUser = { id: '2', fullName: 'Jane', email: 'jane@test.com' };
      apiSpy.post.mockReturnValue(of(mockUser));

      service.create(payload).subscribe((result) => {
        expect(result.id).toBe('2');
        expect(apiSpy.post).toHaveBeenCalledWith('/v1/users', payload);
        done();
      });
    });
  });
});
```

### Component Testing

```typescript
// shared/components/button/button.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ButtonComponent } from './button.component';

describe('ButtonComponent', () => {
  let component: ButtonComponent;
  let fixture: ComponentFixture<ButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render projected content', () => {
    fixture.componentRef.setInput('label', 'Click me');
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('button'));
    expect(button.nativeElement.textContent).toContain('Click me');
  });

  it('should be disabled when isLoading is true', () => {
    fixture.componentRef.setInput('isLoading', true);
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('button'));
    expect(button.nativeElement.disabled).toBe(true);
  });

  it('should apply variant class', () => {
    fixture.componentRef.setInput('variant', 'danger');
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('button'));
    expect(button.nativeElement.classList).toContain('danger');
  });
});
```

### NgRx Store Testing

```typescript
// features/users/store/users.reducer.spec.ts
import { UsersActions } from './users.actions';
import { usersReducer, UsersState } from './users.reducer';

describe('UsersReducer', () => {
  const initialState: UsersState = {
    ids: [],
    entities: {},
    loading: false,
    error: null,
    selectedUserId: null,
  };

  it('should set loading true on loadUsers', () => {
    const state = usersReducer(initialState, UsersActions.loadUsers());
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('should populate users on loadUsersSuccess', () => {
    const users = [
      { id: '1', fullName: 'Alice', email: 'alice@test.com', isActive: true, createdAt: '' },
    ];
    const state = usersReducer(initialState, UsersActions.loadUsersSuccess({ users }));
    expect(state.ids).toEqual(['1']);
    expect(state.loading).toBe(false);
  });

  it('should set error on loadUsersFailure', () => {
    const state = usersReducer(initialState, UsersActions.loadUsersFailure({ error: 'Failed' }));
    expect(state.error).toBe('Failed');
    expect(state.loading).toBe(false);
  });
});
```

### Test Requirements

| Requirement | Details |
|-------------|---------|
| Every service has unit tests | ✅ Required |
| Every smart component has tests | ✅ Required |
| NgRx reducers and selectors tested | ✅ Required |
| Minimum coverage (critical paths) | 80% |
| Test naming convention | `it('should <expected behavior> when <condition>')` |
| Mocking | `jest.fn()` or Jasmine spies |
| E2E tests (critical user flows) | Playwright or Cypress |

---

## 11. Performance Optimization

### Mandatory Performance Patterns

| Pattern | Implementation |
|---------|---------------|
| **OnPush change detection** | Every component uses `ChangeDetectionStrategy.OnPush` |
| **Lazy-load routes** | All feature routes use `loadComponent` / `loadChildren` |
| **trackBy in @for** | Always use `track` in `@for` loops |
| **Avoid function calls in templates** | Use pipes or computed signals instead |
| **Image optimization** | Use `NgOptimizedImage` directive with `loading="lazy"` |
| **Bundle analysis** | Run `ng build --stats-json` and analyze with `webpack-bundle-analyzer` |
| **Tree-shake providers** | Use `providedIn: 'root'` for tree-shakable services |
| **Virtual scrolling** | Use `@angular/cdk/scrolling` for large lists |
| **Preload strategies** | Configure `PreloadAllModules` or custom preloading |

### Image Optimization

```typescript
// Always use NgOptimizedImage
import { NgOptimizedImage } from '@angular/common';

@Component({
  imports: [NgOptimizedImage],
  template: `
    <!-- LCP image — use priority -->
    <img ngSrc="/assets/hero.webp" width="1200" height="600" priority />

    <!-- Below-the-fold image — lazy by default -->
    <img ngSrc="/assets/feature.webp" width="400" height="300" />
  `,
})
```

### Virtual Scrolling for Large Lists

```typescript
import { ScrollingModule } from '@angular/cdk/scrolling';

@Component({
  imports: [ScrollingModule],
  template: `
    <cdk-virtual-scroll-viewport itemSize="72" class="user-list">
      <app-user-card
        *cdkVirtualFor="let user of users(); trackBy: trackByUserId"
        [user]="user"
      />
    </cdk-virtual-scroll-viewport>
  `,
})
```

---

## 12. Security Practices

### Non-Negotiable Rules

| Rule | Implementation |
|------|---------------|
| No secrets in code | Use `environment.ts` files + `.env` |
| No secrets in git | `environment.production.ts` in `.gitignore` |
| Sanitize user input | Angular auto-sanitizes HTML bindings — never bypass with `bypassSecurityTrust*` unless absolutely necessary |
| XSS prevention | Never use `innerHTML` with user content. Use Angular's built-in sanitization |
| CSRF protection | Use Angular's `HttpClientXsrfModule` or custom CSRF token handling |
| Auth on protected routes | Use route guards (`canActivate`, `canMatch`) |
| JWT handling | Store in `httpOnly` cookies (preferred) or memory. Never in `localStorage` |
| Content Security Policy | Configure strict CSP headers on the server |
| Dependency auditing | Run `npm audit` regularly. Keep dependencies updated |

### Environment Configuration

```typescript
// environments/environment.ts (Development — committed)
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api',
  appName: 'MyApp',
  sentryDsn: '',
};

// environments/environment.production.ts (Production — NOT committed, CI-injected)
export const environment = {
  production: true,
  apiUrl: 'https://api.myapp.com/api',
  appName: 'MyApp',
  sentryDsn: 'https://examplePublicKey@sentry.io/1234',
};
```

---

## 13. Accessibility (a11y)

### Mandatory Standards

- **WCAG 2.1 AA compliance** — Minimum standard for all components
- **Semantic HTML** — Use `<button>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<header>`, `<footer>`
- **ARIA attributes** — Add `aria-label`, `aria-describedby`, `role` where semantic HTML is insufficient
- **Keyboard navigation** — All interactive elements must be keyboard-accessible
- **Focus management** — Manage focus on route changes and modal open/close
- **Color contrast** — Minimum 4.5:1 for normal text, 3:1 for large text
- **Screen reader testing** — Test with VoiceOver (macOS) or NVDA (Windows)

```typescript
// ✅ GOOD — Accessible modal
@Component({
  template: `
    <div
      class="modal-backdrop"
      role="dialog"
      aria-modal="true"
      [attr.aria-label]="title()"
      (keydown.escape)="close()"
    >
      <div class="modal-content" cdkTrapFocus cdkTrapFocusAutoCapture>
        <h2 id="modal-title">{{ title() }}</h2>
        <div aria-describedby="modal-title">
          <ng-content />
        </div>
        <button (click)="close()" aria-label="Close dialog">✕</button>
      </div>
    </div>
  `,
})
```

---

## 14. Styling Standards

### SCSS Architecture

```scss
// styles/_variables.scss — Design Tokens
:root {
  // Colors
  --color-primary: hsl(222, 89%, 55%);
  --color-primary-hover: hsl(222, 89%, 45%);
  --color-secondary: hsl(260, 67%, 55%);
  --color-danger: hsl(0, 84%, 60%);
  --color-success: hsl(142, 71%, 45%);
  --color-warning: hsl(38, 92%, 50%);

  --color-bg-primary: hsl(0, 0%, 100%);
  --color-bg-secondary: hsl(220, 14%, 96%);
  --color-text-primary: hsl(222, 47%, 11%);
  --color-text-secondary: hsl(215, 16%, 47%);
  --color-border: hsl(220, 13%, 91%);

  // Spacing
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;
  --space-2xl: 3rem;

  // Typography
  --font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-md: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 1.875rem;

  // Border Radius
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-full: 9999px;

  // Shadows
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);

  // Transitions
  --transition-fast: 150ms ease;
  --transition-normal: 250ms ease;
  --transition-slow: 350ms ease;

  // Z-index scale
  --z-dropdown: 1000;
  --z-sticky: 1020;
  --z-modal-backdrop: 1040;
  --z-modal: 1050;
  --z-tooltip: 1060;
  --z-toast: 1070;
}
```

### Styling Rules

| Rule | Details |
|------|---------|
| **Component-scoped styles** | Every component has its own `.scss` file. Use Angular's `ViewEncapsulation.Emulated` (default). |
| **BEM naming** | `.block__element--modifier` for all class names |
| **CSS custom properties** | Use `var(--token)` for all colors, spacing, typography — never hardcode values |
| **No `!important`** | If you need `!important`, your specificity architecture is wrong |
| **No inline styles** | Use class bindings: `[class.active]="isActive()"` |
| **Responsive design** | Mobile-first with `@media` breakpoints in `_mixins.scss` |
| **Dark mode support** | Use CSS custom properties with a `.theme-dark` class on `<body>` |

---

## 15. Documentation Requirements

### Every Project Must Have

1. **README.md** with:
   - One-line description
   - Quick start (install + run in ≤ 5 commands)
   - Architecture overview
   - Environment variable reference

2. **Inline documentation**:
   - JSDoc on every exported class, service, and component
   - JSDoc on every public method with `@param`, `@returns`, `@example`
   - JSDoc on every `input()` and `output()` signal

3. **ADR (Architecture Decision Records)** for significant decisions

### Component Documentation

```typescript
/**
 * Displays a paginated data table with sorting and filtering capabilities.
 *
 * Supports server-side pagination by emitting page change events.
 * All columns are sortable by default unless `sortable` is set to `false`.
 *
 * @example
 * ```html
 * <app-data-table
 *   [columns]="tableColumns"
 *   [data]="users()"
 *   [totalItems]="totalUsers()"
 *   [pageSize]="20"
 *   (pageChange)="onPageChange($event)"
 *   (sortChange)="onSortChange($event)"
 * />
 * ```
 */
@Component({ ... })
export class DataTableComponent<T> { ... }
```

---

## 16. Git Workflow

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

**Scopes:** `core`, `shared`, `feature`, `routing`, `store`, `styles`, `ci`, `docs`

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
| `style`    | Code formatting (no logic change)       |

**Examples:**
```bash
feat(feature): add user registration with email verification
fix(core): resolve JWT refresh race condition on concurrent requests
refactor(shared): migrate button component to signal-based inputs
test(store): add reducer and effect tests for users feature
perf(core): implement virtual scrolling for activity feed
```

### Commit Rules

- **Atomic commits** — Each commit does exactly one thing
- **No WIP commits** on `main` or `develop`
- **Squash feature branches** before merging to `develop`

---

## 17. DevOps & Deployment

### Docker Setup

```dockerfile
# Dockerfile — Multi-stage build
FROM node:20-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build -- --configuration=production

# Production image — Nginx
FROM nginx:alpine AS production

COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist/my-app/browser /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose

```yaml
# docker-compose.yml
services:
  angular-app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "4200:80"
    environment:
      - API_URL=http://backend:8000/api
    depends_on:
      - backend
    restart: unless-stopped

  backend:
    image: my-backend:latest
    ports:
      - "8000:8000"
    env_file: ./backend/.env
    restart: unless-stopped
```

### Nginx Configuration

```nginx
# nginx.conf
events {
  worker_connections 1024;
}

http {
  include       /etc/nginx/mime.types;
  default_type  application/octet-stream;
  sendfile      on;
  keepalive_timeout 65;

  gzip on;
  gzip_types text/plain text/css application/json application/javascript text/xml;

  server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Angular routing — serve index.html for all routes
    location / {
      try_files $uri $uri/ /index.html;
    }

    # Cache static assets aggressively
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?)$ {
      expires 1y;
      add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
  }
}
```

### Makefile

```makefile
# Makefile — Local development orchestration

.PHONY: dev build test lint format docker-up docker-down

dev:
	ng serve --open

build:
	ng build --configuration=production

test:
	ng test --watch=false --code-coverage

test-watch:
	ng test

e2e:
	npx playwright test

lint:
	ng lint
	npx stylelint "src/**/*.scss"

format:
	npx prettier --write "src/**/*.{ts,html,scss,json}"

docker-up:
	docker compose up -d --build

docker-down:
	docker compose down

analyze:
	ng build --configuration=production --stats-json
	npx webpack-bundle-analyzer dist/my-app/browser/stats.json
```

---

## 18. Review Checklist

Before considering any code complete, verify **every** item:

### Functionality
- [ ] Code does what was requested — no more, no less
- [ ] Edge cases handled (empty arrays, null/undefined, boundaries)
- [ ] Error messages are clear and actionable
- [ ] Loading, error, and empty states implemented

### Component Quality
- [ ] All components use `ChangeDetectionStrategy.OnPush`
- [ ] All components are `standalone: true`
- [ ] Signal-based `input()` and `output()` used (not decorators)
- [ ] Smart/dumb component separation followed
- [ ] `@for` loops always have `track`
- [ ] No function calls in templates — use pipes or computed signals

### State Management
- [ ] Appropriate state solution chosen (signals vs. NgRx)
- [ ] NgRx actions follow `createActionGroup` pattern
- [ ] Effects handle errors with `catchError`
- [ ] Selectors are memoized and composable

### RxJS
- [ ] No manual subscribes without cleanup (`takeUntilDestroyed`)
- [ ] Correct flattening operator used (`switchMap` vs. `exhaustMap`)
- [ ] Errors handled inside streams (not just in subscribe error callback)
- [ ] No nested subscribes

### TypeScript
- [ ] No `any` types — use `unknown` and narrow
- [ ] All functions have explicit return types
- [ ] Strict mode enabled in `tsconfig.json`
- [ ] Models/interfaces defined for all data shapes

### Testing
- [ ] Unit tests for all services
- [ ] Component tests for shared and smart components
- [ ] NgRx reducer, selector, and effect tests
- [ ] All tests pass with `ng test`

### Security
- [ ] No hardcoded secrets or API keys
- [ ] Route guards on all protected routes
- [ ] No `bypassSecurityTrust*` usage without documented justification
- [ ] `HttpOnly` cookie for JWT (not `localStorage`)

### Accessibility
- [ ] Semantic HTML elements used
- [ ] ARIA attributes present where needed
- [ ] Keyboard navigation works for all interactive elements
- [ ] Color contrast meets WCAG AA standards

### Performance
- [ ] Routes lazy-loaded
- [ ] Images use `NgOptimizedImage`
- [ ] No unnecessary re-renders
- [ ] Bundle size analyzed and optimized

### Git
- [ ] Commit messages follow `<type>(<scope>): <summary>` format
- [ ] Each commit is atomic and focused
- [ ] No `node_modules`, `dist`, or `.env` committed

---

> **Part I Summary**: This is a **production-level Angular** application. Every component is
> standalone and OnPush. State flows through signals and NgRx. RxJS streams are always
> cleaned up. Forms are reactive. Routes are lazy-loaded. Tests cover critical paths.
> Security and accessibility are non-negotiable. Ship quality, not quantity.

---
---

# Part II — Java Spring Boot Backend

---

## 19. Spring Boot Core Philosophy

### Principles (in priority order)

1. **Convention over configuration** — Use Spring Boot's sensible defaults. Override only
   when there's a justified reason.
2. **Layered architecture** — Controller → Service → Repository. Never skip layers.
3. **Dependency Injection everywhere** — Constructor injection only. No field injection.
4. **Immutability by default** — Use `record` types for DTOs. Make entities as immutable as practical.
5. **Fail fast, log always** — Validate early, throw meaningful exceptions, log with context.
6. **12-Factor App** — Externalize config, stateless processes, disposable containers.

### Before Writing Any Code

```
1. UNDERSTAND  → What API contract is needed? What data model?
2. PLAN        → Design the layers. Define DTOs. Plan DB schema.
3. IMPLEMENT   → Write clean, typed, tested code top-down (Controller → Service → Repo).
4. VERIFY      → Run tests. Check edge cases. Test with Postman/curl.
5. DOCUMENT    → Update OpenAPI annotations, README, and changelog.
```

---

## 20. Backend Project Architecture

### Project Structure (Maven / Gradle)

```
backend/
│
├── src/
│   ├── main/
│   │   ├── java/com/myapp/
│   │   │   ├── MyAppApplication.java              # @SpringBootApplication entry point
│   │   │   │
│   │   │   ├── config/                             # Configuration classes
│   │   │   │   ├── SecurityConfig.java             # Spring Security configuration
│   │   │   │   ├── WebConfig.java                  # CORS, interceptors
│   │   │   │   ├── CacheConfig.java                # Cache configuration
│   │   │   │   ├── AsyncConfig.java                # Async executor config
│   │   │   │   ├── OpenApiConfig.java              # Swagger/OpenAPI config
│   │   │   │   └── JacksonConfig.java              # JSON serialization config
│   │   │   │
│   │   │   ├── common/                             # Cross-cutting concerns
│   │   │   │   ├── exception/
│   │   │   │   │   ├── GlobalExceptionHandler.java # @RestControllerAdvice
│   │   │   │   │   ├── ResourceNotFoundException.java
│   │   │   │   │   ├── ConflictException.java
│   │   │   │   │   ├── ForbiddenException.java
│   │   │   │   │   └── ErrorResponse.java          # Standard error body
│   │   │   │   ├── audit/
│   │   │   │   │   ├── AuditableEntity.java        # @MappedSuperclass with audit fields
│   │   │   │   │   └── AuditorAwareImpl.java
│   │   │   │   ├── util/
│   │   │   │   │   └── SlugUtils.java
│   │   │   │   └── constant/
│   │   │   │       └── AppConstants.java
│   │   │   │
│   │   │   ├── security/                           # Authentication & authorization
│   │   │   │   ├── jwt/
│   │   │   │   │   ├── JwtTokenProvider.java
│   │   │   │   │   ├── JwtAuthenticationFilter.java
│   │   │   │   │   └── JwtProperties.java
│   │   │   │   ├── UserPrincipal.java
│   │   │   │   └── CustomUserDetailsService.java
│   │   │   │
│   │   │   ├── user/                               # Feature: Users
│   │   │   │   ├── controller/
│   │   │   │   │   └── UserController.java
│   │   │   │   ├── service/
│   │   │   │   │   ├── UserService.java            # Interface
│   │   │   │   │   └── UserServiceImpl.java        # Implementation
│   │   │   │   ├── repository/
│   │   │   │   │   └── UserRepository.java
│   │   │   │   ├── dto/
│   │   │   │   │   ├── CreateUserRequest.java      # record
│   │   │   │   │   ├── UpdateUserRequest.java      # record
│   │   │   │   │   ├── UserResponse.java           # record
│   │   │   │   │   └── UserMapper.java             # MapStruct mapper
│   │   │   │   └── entity/
│   │   │   │       └── User.java                   # JPA entity
│   │   │   │
│   │   │   ├── auth/                               # Feature: Authentication
│   │   │   │   ├── controller/
│   │   │   │   │   └── AuthController.java
│   │   │   │   ├── service/
│   │   │   │   │   └── AuthService.java
│   │   │   │   └── dto/
│   │   │   │       ├── LoginRequest.java
│   │   │   │       ├── RegisterRequest.java
│   │   │   │       └── AuthResponse.java
│   │   │   │
│   │   │   └── product/                            # Feature: Products (example)
│   │   │       ├── controller/
│   │   │       ├── service/
│   │   │       ├── repository/
│   │   │       ├── dto/
│   │   │       └── entity/
│   │   │
│   │   └── resources/
│   │       ├── application.yml                     # Default config
│   │       ├── application-dev.yml                 # Development profile
│   │       ├── application-staging.yml             # Staging profile
│   │       ├── application-prod.yml                # Production profile
│   │       ├── db/migration/                       # Flyway migrations
│   │       │   ├── V1__create_users_table.sql
│   │       │   └── V2__create_products_table.sql
│   │       ├── logback-spring.xml                  # Logging configuration
│   │       └── messages.properties                 # i18n messages
│   │
│   └── test/
│       ├── java/com/myapp/
│       │   ├── user/
│       │   │   ├── controller/
│       │   │   │   └── UserControllerTest.java     # @WebMvcTest
│       │   │   ├── service/
│       │   │   │   └── UserServiceTest.java        # Unit test with Mockito
│       │   │   └── repository/
│       │   │       └── UserRepositoryTest.java     # @DataJpaTest
│       │   ├── integration/
│       │   │   └── UserIntegrationTest.java        # @SpringBootTest
│       │   └── TestcontainersConfig.java           # Testcontainers setup
│       └── resources/
│           └── application-test.yml
│
├── pom.xml (or build.gradle.kts)
├── Dockerfile
├── docker-compose.yml
├── .env.example
├── Makefile
└── README.md
```

### Layer Responsibilities

```
┌──────────────────────────────────────────────────────────────┐
│  SPRING BOOT APPLICATION                                     │
│                                                              │
│  ┌─── CONTROLLER (API Layer) ──────────────────────────────┐ │
│  │  • Receives HTTP requests                               │ │
│  │  • Validates input (@Valid)                              │ │
│  │  • Delegates to Service                                 │ │
│  │  • Returns ResponseEntity<DTO>                          │ │
│  │  • NO business logic                                    │ │
│  └─────────────────────────────────────────────────────────┘ │
│                          ↓                                   │
│  ┌─── SERVICE (Business Logic) ────────────────────────────┐ │
│  │  • All business rules and orchestration                 │ │
│  │  • Transaction boundaries (@Transactional)              │ │
│  │  • Maps between Entity ↔ DTO                            │ │
│  │  • Calls Repository for data access                     │ │
│  │  • Framework-agnostic (no HttpServletRequest, etc.)     │ │
│  └─────────────────────────────────────────────────────────┘ │
│                          ↓                                   │
│  ┌─── REPOSITORY (Data Access) ────────────────────────────┐ │
│  │  • Extends JpaRepository / CrudRepository               │ │
│  │  • Custom queries with @Query                           │ │
│  │  • Specifications for dynamic queries                   │ │
│  │  • NO business logic                                    │ │
│  └─────────────────────────────────────────────────────────┘ │
│                          ↓                                   │
│  ┌─── ENTITY (Domain Model) ──────────────────────────────┐  │
│  │  • JPA entities with proper mappings                    │  │
│  │  • Auditable base class (created/updated timestamps)    │  │
│  │  • Validation constraints on fields                     │  │
│  └─────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

**Rules:**
- **Controllers** are thin — validate, delegate, respond. Zero business logic.
- **Services** contain all business logic. They are interface-backed for testability.
- **Repositories** handle data access only. Services never write raw SQL.
- **DTOs** (records) define API contracts. Entities are never exposed directly.
- **Mappers** (MapStruct) handle Entity ↔ DTO conversion. No manual mapping in services.

### Naming Conventions (Backend)

| Element              | Convention           | Example                          |
|----------------------|----------------------|----------------------------------|
| Packages             | `lowercase`          | `com.myapp.user.controller`     |
| Classes              | `PascalCase`         | `UserService`, `UserController` |
| Interfaces           | `PascalCase`         | `UserService` (no `I` prefix)   |
| Methods              | `camelCase`          | `findByEmail()`, `createUser()` |
| Constants            | `UPPER_SNAKE`        | `MAX_PAGE_SIZE`, `JWT_HEADER`   |
| DTOs (records)       | `PascalCase`         | `CreateUserRequest`, `UserResponse` |
| Entities             | `PascalCase` singular| `User`, `Product`, `Order`      |
| DB tables            | `snake_case` plural  | `users`, `order_items`          |
| DB columns           | `snake_case`         | `full_name`, `created_at`       |
| REST endpoints       | `kebab-case` plural  | `/api/v1/users`, `/api/v1/order-items` |
| Config properties    | `kebab-case`         | `app.jwt.expiration-ms`         |
| Test classes         | `ClassNameTest`      | `UserServiceTest`               |
| Migration files      | `V{n}__{desc}.sql`   | `V1__create_users_table.sql`    |

---

## 21. REST API Standards

### Controller Pattern

```java
// user/controller/UserController.java
package com.myapp.user.controller;

import com.myapp.user.dto.CreateUserRequest;
import com.myapp.user.dto.UpdateUserRequest;
import com.myapp.user.dto.UserResponse;
import com.myapp.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User management endpoints")
public class UserController {

    private final UserService userService;

    @GetMapping
    @Operation(summary = "List users with pagination")
    public ResponseEntity<Page<UserResponse>> listUsers(
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable
    ) {
        return ResponseEntity.ok(userService.findAll(pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a user by ID")
    public ResponseEntity<UserResponse> getUser(@PathVariable Long id) {
        return ResponseEntity.ok(userService.findById(id));
    }

    @PostMapping
    @Operation(summary = "Create a new user")
    public ResponseEntity<UserResponse> createUser(
            @Valid @RequestBody CreateUserRequest request
    ) {
        UserResponse created = userService.create(request);
        URI location = URI.create("/api/v1/users/" + created.id());
        return ResponseEntity.created(location).body(created);
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Update a user")
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.principal.id")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRequest request
    ) {
        return ResponseEntity.ok(userService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a user")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUser(@PathVariable Long id) {
        userService.delete(id);
    }
}
```

### API Versioning & Status Codes

- Always prefix with `/api/v1/`
- When making breaking changes, create `/api/v2/` while maintaining v1

| Code  | Meaning                   | When to Use                              |
|-------|---------------------------|------------------------------------------|
| `200` | OK                        | Successful GET, PATCH, PUT               |
| `201` | Created                   | Successful POST (return `Location` header) |
| `204` | No Content                | Successful DELETE                        |
| `400` | Bad Request               | Validation errors, malformed input       |
| `401` | Unauthorized              | Missing or invalid auth token            |
| `403` | Forbidden                 | Valid auth but insufficient permissions   |
| `404` | Not Found                 | Resource does not exist                  |
| `409` | Conflict                  | Duplicate resource (e.g., email taken)   |
| `422` | Unprocessable Entity      | Business rule violation                  |
| `429` | Too Many Requests         | Rate limit exceeded                      |
| `500` | Internal Server Error     | Unhandled exception                      |

### Standard Response Shapes

**Success (single):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "fullName": "John Doe",
  "createdAt": "2025-01-15T10:30:00Z"
}
```

**Success (paginated — Spring Page):**
```json
{
  "content": [...],
  "totalElements": 150,
  "totalPages": 8,
  "size": 20,
  "number": 0,
  "first": true,
  "last": false
}
```

**Error:**
```json
{
  "timestamp": "2025-01-15T10:30:00Z",
  "status": 404,
  "error": "Not Found",
  "message": "User with ID 42 not found",
  "errorCode": "USER_NOT_FOUND",
  "path": "/api/v1/users/42"
}
```

---

## 22. Service Layer Patterns

### Service Interface + Implementation

```java
// user/service/UserService.java
package com.myapp.user.service;

import com.myapp.user.dto.CreateUserRequest;
import com.myapp.user.dto.UpdateUserRequest;
import com.myapp.user.dto.UserResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UserService {
    Page<UserResponse> findAll(Pageable pageable);
    UserResponse findById(Long id);
    UserResponse create(CreateUserRequest request);
    UserResponse update(Long id, UpdateUserRequest request);
    void delete(Long id);
}
```

```java
// user/service/UserServiceImpl.java
package com.myapp.user.service;

import com.myapp.common.exception.ConflictException;
import com.myapp.common.exception.ResourceNotFoundException;
import com.myapp.user.dto.CreateUserRequest;
import com.myapp.user.dto.UpdateUserRequest;
import com.myapp.user.dto.UserMapper;
import com.myapp.user.dto.UserResponse;
import com.myapp.user.entity.User;
import com.myapp.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    public Page<UserResponse> findAll(Pageable pageable) {
        return userRepository.findAll(pageable)
                .map(userMapper::toResponse);
    }

    @Override
    public UserResponse findById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        return userMapper.toResponse(user);
    }

    @Override
    @Transactional
    public UserResponse create(CreateUserRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new ConflictException("Email " + request.email() + " is already registered");
        }

        User user = userMapper.toEntity(request);
        user.setPasswordHash(passwordEncoder.encode(request.password()));

        User saved = userRepository.save(user);
        log.info("User created: id={} email={}", saved.getId(), saved.getEmail());
        return userMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public UserResponse update(Long id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        userMapper.updateEntity(user, request);
        User updated = userRepository.save(user);
        log.info("User updated: id={} fields={}", id, request);
        return userMapper.toResponse(updated);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User", "id", id);
        }
        userRepository.deleteById(id);
        log.info("User deleted: id={}", id);
    }
}
```

### Service Rules

- **Always use interfaces** — Enables mocking and future proxy-based AOP
- **`@Transactional(readOnly = true)` at class level** — Override with `@Transactional` on write methods
- **Constructor injection only** — Via `@RequiredArgsConstructor` (Lombok)
- **Never return entities from services** — Always return DTOs
- **Log every state change** — `log.info` for create/update/delete operations
- **Throw custom exceptions** — Never throw generic `RuntimeException`

---

## 23. Data Access — Spring Data JPA

### Entity Pattern

```java
// user/entity/User.java
package com.myapp.user.entity;

import com.myapp.common.audit.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
    name = "users",
    uniqueConstraints = @UniqueConstraint(name = "uk_users_email", columnNames = "email"),
    indexes = {
        @Index(name = "idx_users_email", columnList = "email"),
        @Index(name = "idx_users_active", columnList = "is_active")
    }
)
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class User extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    @Column(nullable = false)
    @Builder.Default
    private boolean isActive = true;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private Role role = Role.USER;

    public enum Role {
        USER, ADMIN, MODERATOR
    }
}
```

### Auditable Base Entity

```java
// common/audit/AuditableEntity.java
package com.myapp.common.audit;

import jakarta.persistence.*;
import lombok.Getter;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;

@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
@Getter
public abstract class AuditableEntity {

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private Instant updatedAt;

    @CreatedBy
    @Column(updatable = false)
    private String createdBy;

    @LastModifiedBy
    private String updatedBy;

    @Version
    private Long version;
}
```

### Repository Pattern

```java
// user/repository/UserRepository.java
package com.myapp.user.repository;

import com.myapp.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long>,
        JpaSpecificationExecutor<User> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    Page<User> findByIsActiveTrue(Pageable pageable);

    @Modifying
    @Query("UPDATE User u SET u.isActive = false WHERE u.id = :id")
    void softDelete(Long id);

    @Query("""
        SELECT u FROM User u
        WHERE (:search IS NULL OR
               LOWER(u.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')))
        AND (:active IS NULL OR u.isActive = :active)
    """)
    Page<User> searchUsers(String search, Boolean active, Pageable pageable);
}
```

### Database Migration (Flyway)

```sql
-- db/migration/V1__create_users_table.sql
CREATE TABLE users (
    id          BIGSERIAL       PRIMARY KEY,
    full_name   VARCHAR(100)    NOT NULL,
    email       VARCHAR(255)    NOT NULL,
    password_hash VARCHAR(255)  NOT NULL,
    is_active   BOOLEAN         NOT NULL DEFAULT true,
    role        VARCHAR(20)     NOT NULL DEFAULT 'USER',
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    created_by  VARCHAR(255),
    updated_by  VARCHAR(255),
    version     BIGINT          NOT NULL DEFAULT 0,

    CONSTRAINT uk_users_email UNIQUE (email)
);

CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_active ON users (is_active);
```

### JPA Rules

- **Always use Flyway/Liquibase** — Never use `spring.jpa.hibernate.ddl-auto=update` in production
- **Use `@Builder` for entity construction** — Never expose no-args constructor publicly
- **Add `@Version` for optimistic locking** — Prevents lost updates
- **Index frequently queried columns** — Email, username, foreign keys
- **Use `IDENTITY` generation strategy** — For PostgreSQL / MySQL auto-increment
- **Define constraints in both entity and migration** — Belt and suspenders
- **Never use `FetchType.EAGER`** — Always `LAZY`, use `@EntityGraph` or JOIN FETCH when needed
- **Name constraints explicitly** — `uk_users_email`, not auto-generated names

---

## 24. Validation & DTOs

### DTO Pattern (Java Records)

```java
// user/dto/CreateUserRequest.java
package com.myapp.user.dto;

import jakarta.validation.constraints.*;

public record CreateUserRequest(
    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
    String fullName,

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    String email,

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 128, message = "Password must be between 8 and 128 characters")
    @Pattern(
        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&]).+$",
        message = "Password must contain uppercase, lowercase, digit, and special character"
    )
    String password
) {}
```

```java
// user/dto/UpdateUserRequest.java
package com.myapp.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public record UpdateUserRequest(
    @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
    String fullName,

    @Email(message = "Invalid email format")
    String email
) {}
```

```java
// user/dto/UserResponse.java
package com.myapp.user.dto;

import java.time.Instant;

public record UserResponse(
    Long id,
    String fullName,
    String email,
    boolean isActive,
    String role,
    Instant createdAt
) {}
```

### MapStruct Mapper

```java
// user/dto/UserMapper.java
package com.myapp.user.dto;

import com.myapp.user.entity.User;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "role", expression = "java(user.getRole().name())")
    UserResponse toResponse(User user);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "passwordHash", ignore = true)
    @Mapping(target = "isActive", constant = "true")
    @Mapping(target = "role", constant = "USER")
    User toEntity(CreateUserRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "passwordHash", ignore = true)
    @Mapping(target = "role", ignore = true)
    void updateEntity(@MappingTarget User user, UpdateUserRequest request);
}
```

### Validation Rules

- **Always use `@Valid` on `@RequestBody`** — Never skip validation
- **Use Java records for DTOs** — Immutable by design
- **Validation messages are user-facing** — Write clear, actionable messages
- **Custom validators for complex rules** — Create `@interface` + `ConstraintValidator`
- **Never expose entities in API responses** — Always use DTOs
- **Use `@BeanMapping(nullValuePropertyMappingStrategy = IGNORE)`** — For PATCH operations

---

## 25. Exception Handling

### Custom Exceptions

```java
// common/exception/ResourceNotFoundException.java
package com.myapp.common.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String resource, String field, Object value) {
        super(String.format("%s not found with %s: '%s'", resource, field, value));
    }
}
```

```java
// common/exception/ConflictException.java
package com.myapp.common.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class ConflictException extends RuntimeException {
    public ConflictException(String message) {
        super(message);
    }
}
```

```java
// common/exception/ForbiddenException.java
package com.myapp.common.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.FORBIDDEN)
public class ForbiddenException extends RuntimeException {
    public ForbiddenException(String message) {
        super(message);
    }
}
```

### Global Exception Handler

```java
// common/exception/GlobalExceptionHandler.java
package com.myapp.common.exception;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(
            ResourceNotFoundException ex, HttpServletRequest request
    ) {
        log.warn("Resource not found: {}", ex.getMessage());
        return buildResponse(HttpStatus.NOT_FOUND, ex.getMessage(),
                "RESOURCE_NOT_FOUND", request.getRequestURI());
    }

    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<ErrorResponse> handleConflict(
            ConflictException ex, HttpServletRequest request
    ) {
        log.warn("Conflict: {}", ex.getMessage());
        return buildResponse(HttpStatus.CONFLICT, ex.getMessage(),
                "CONFLICT", request.getRequestURI());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(
            MethodArgumentNotValidException ex, HttpServletRequest request
    ) {
        Map<String, String> fieldErrors = ex.getBindingResult().getFieldErrors()
                .stream()
                .collect(Collectors.toMap(
                        FieldError::getField,
                        error -> error.getDefaultMessage() != null
                                ? error.getDefaultMessage() : "Invalid value",
                        (first, second) -> first
                ));

        log.warn("Validation failed: {}", fieldErrors);

        ErrorResponse response = new ErrorResponse(
                Instant.now(),
                HttpStatus.BAD_REQUEST.value(),
                "Bad Request",
                "Validation failed",
                "VALIDATION_ERROR",
                request.getRequestURI(),
                fieldErrors
        );
        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(
            AccessDeniedException ex, HttpServletRequest request
    ) {
        log.warn("Access denied: {} for URI: {}", ex.getMessage(), request.getRequestURI());
        return buildResponse(HttpStatus.FORBIDDEN, "Insufficient permissions",
                "FORBIDDEN", request.getRequestURI());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneric(
            Exception ex, HttpServletRequest request
    ) {
        log.error("Unhandled exception at {}: {}", request.getRequestURI(), ex.getMessage(), ex);
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR,
                "An unexpected error occurred", "INTERNAL_ERROR", request.getRequestURI());
    }

    private ResponseEntity<ErrorResponse> buildResponse(
            HttpStatus status, String message, String errorCode, String path
    ) {
        ErrorResponse response = new ErrorResponse(
                Instant.now(), status.value(), status.getReasonPhrase(),
                message, errorCode, path, null
        );
        return ResponseEntity.status(status).body(response);
    }
}
```

### Error Response Record

```java
// common/exception/ErrorResponse.java
package com.myapp.common.exception;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.Instant;
import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ErrorResponse(
    Instant timestamp,
    int status,
    String error,
    String message,
    String errorCode,
    String path,
    Map<String, String> fieldErrors
) {}
```

---

## 26. Spring Security & Authentication

### Security Configuration

```java
// config/SecurityConfig.java
package com.myapp.config;

import com.myapp.security.jwt.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints
                        .requestMatchers("/api/v1/auth/**").permitAll()
                        .requestMatchers("/actuator/health").permitAll()
                        .requestMatchers("/v3/api-docs/**", "/swagger-ui/**").permitAll()
                        // Protected endpoints
                        .requestMatchers(HttpMethod.GET, "/api/v1/users/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/v1/users/**").hasRole("ADMIN")
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config
    ) throws Exception {
        return config.getAuthenticationManager();
    }
}
```

### JWT Token Provider

```java
// security/jwt/JwtTokenProvider.java
package com.myapp.security.jwt;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
@Slf4j
public class JwtTokenProvider {

    private final SecretKey key;
    private final long expirationMs;

    public JwtTokenProvider(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.expiration-ms}") long expirationMs
    ) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
    }

    public String generateToken(Authentication authentication) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationMs);

        return Jwts.builder()
                .subject(authentication.getName())
                .issuedAt(now)
                .expiration(expiry)
                .signWith(key)
                .compact();
    }

    public String getUsernameFromToken(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser().verifyWith(key).build().parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            log.warn("Invalid JWT token: {}", e.getMessage());
            return false;
        }
    }
}
```

### JWT Authentication Filter

```java
// security/jwt/JwtAuthenticationFilter.java
package com.myapp.security.jwt;

import com.myapp.security.CustomUserDetailsService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider tokenProvider;
    private final CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        String token = extractToken(request);

        if (StringUtils.hasText(token) && tokenProvider.validateToken(token)) {
            String username = tokenProvider.getUsernameFromToken(token);
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities()
                    );
            authentication.setDetails(
                    new WebAuthenticationDetailsSource().buildDetails(request)
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        filterChain.doFilter(request, response);
    }

    private String extractToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
```

---

## 27. Configuration & Profiles

### Application Configuration

```yaml
# application.yml
spring:
  application:
    name: myapp-api
  profiles:
    active: ${SPRING_PROFILES_ACTIVE:dev}

  jpa:
    open-in-view: false
    hibernate:
      ddl-auto: validate
    properties:
      hibernate:
        format_sql: true
        default_batch_fetch_size: 20

  flyway:
    enabled: true
    locations: classpath:db/migration
    baseline-on-migrate: true

  jackson:
    serialization:
      write-dates-as-timestamps: false
    deserialization:
      fail-on-unknown-properties: true
    default-property-inclusion: non_null

server:
  port: ${PORT:8080}
  error:
    include-message: always
    include-binding-errors: always

app:
  jwt:
    secret: ${JWT_SECRET}
    expiration-ms: ${JWT_EXPIRATION_MS:1800000}
  cors:
    allowed-origins: ${CORS_ORIGINS:http://localhost:4200}

management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
  endpoint:
    health:
      show-details: when-authorized
```

```yaml
# application-dev.yml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/myapp_dev
    username: postgres
    password: postgres
  jpa:
    show-sql: true

logging:
  level:
    com.myapp: DEBUG
    org.hibernate.SQL: DEBUG
    org.hibernate.type.descriptor.sql: TRACE
```

```yaml
# application-prod.yml
spring:
  datasource:
    url: ${DATABASE_URL}
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      idle-timeout: 300000
      max-lifetime: 1800000

logging:
  level:
    com.myapp: INFO
    org.hibernate.SQL: WARN
```

### Configuration Rules

- **Never hardcode secrets** — Use environment variables or vault
- **Use profiles** — `dev`, `staging`, `prod` with profile-specific configs
- **`spring.jpa.open-in-view: false`** — Always disable OSIV in production
- **`ddl-auto: validate`** — Never `update` or `create` in production; use Flyway
- **Externalize all secrets via env vars** — `${JWT_SECRET}`, `${DATABASE_URL}`

---

## 28. Caching & Performance

### Cache Configuration

```java
// config/CacheConfig.java
package com.myapp.config;

import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;

import java.time.Duration;
import java.util.Map;

@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory factory) {
        RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(10))
                .serializeValuesWith(
                        RedisSerializationContext.SerializationPair
                                .fromSerializer(new GenericJackson2JsonRedisSerializer())
                );

        Map<String, RedisCacheConfiguration> cacheConfigs = Map.of(
                "users", defaultConfig.entryTtl(Duration.ofMinutes(5)),
                "products", defaultConfig.entryTtl(Duration.ofMinutes(30))
        );

        return RedisCacheManager.builder(factory)
                .cacheDefaults(defaultConfig)
                .withInitialCacheConfigurations(cacheConfigs)
                .build();
    }
}
```

### Using Cache in Services

```java
@Service
@Slf4j
public class UserServiceImpl implements UserService {

    @Override
    @Cacheable(value = "users", key = "#id")
    public UserResponse findById(Long id) {
        log.debug("Cache miss for user id={}", id);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        return userMapper.toResponse(user);
    }

    @Override
    @CacheEvict(value = "users", key = "#id")
    @Transactional
    public UserResponse update(Long id, UpdateUserRequest request) {
        // ... update logic
    }

    @Override
    @CacheEvict(value = "users", allEntries = true)
    @Transactional
    public void delete(Long id) {
        // ... delete logic
    }
}
```

### Performance Rules

- **Use connection pooling (HikariCP)** — Spring Boot default, configure pool sizes per profile
- **Avoid N+1 queries** — Use `@EntityGraph`, `JOIN FETCH`, or batch fetching
- **Paginate all list endpoints** — Never return unbounded collections
- **Use `@Cacheable` for expensive reads** — Always `@CacheEvict` on writes
- **Enable GZIP compression** — `server.compression.enabled=true`
- **Use database indexes** — For all columns in WHERE, ORDER BY, JOIN conditions
- **Profile with Actuator** — `/actuator/metrics`, `/actuator/prometheus`

---

## 29. Messaging & Async Processing

### Async Configuration

```java
// config/AsyncConfig.java
package com.myapp.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

@Configuration
@EnableAsync
public class AsyncConfig {

    @Bean(name = "taskExecutor")
    public Executor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(20);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("async-");
        executor.setRejectedExecutionHandler(new java.util.concurrent.ThreadPoolExecutor.CallerRunsPolicy());
        executor.initialize();
        return executor;
    }
}
```

### Using @Async and Application Events

```java
// Async email notification
@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final EmailClient emailClient;

    @Async("taskExecutor")
    public void sendWelcomeEmail(String email, String fullName) {
        log.info("Sending welcome email to {}", email);
        emailClient.send(email, "Welcome!", "Hello " + fullName + "...");
    }
}

// Application event-driven pattern
public record UserCreatedEvent(Long userId, String email, String fullName) {}

@Service
public class UserServiceImpl implements UserService {
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public UserResponse create(CreateUserRequest request) {
        // ... save user
        eventPublisher.publishEvent(new UserCreatedEvent(saved.getId(), saved.getEmail(), saved.getFullName()));
        return userMapper.toResponse(saved);
    }
}

@Component
@RequiredArgsConstructor
@Slf4j
public class UserEventListener {
    private final NotificationService notificationService;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onUserCreated(UserCreatedEvent event) {
        log.info("User created event: userId={}", event.userId());
        notificationService.sendWelcomeEmail(event.email(), event.fullName());
    }
}
```

---

## 30. Logging & Observability

### Structured Logging (Logback)

```xml
<!-- logback-spring.xml -->
<configuration>
    <springProfile name="dev">
        <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
            <encoder>
                <pattern>%d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
            </encoder>
        </appender>
        <root level="INFO">
            <appender-ref ref="CONSOLE" />
        </root>
    </springProfile>

    <springProfile name="prod">
        <appender name="JSON" class="ch.qos.logback.core.ConsoleAppender">
            <encoder class="net.logstash.logback.encoder.LogstashEncoder">
                <includeMdcKeyName>requestId</includeMdcKeyName>
                <includeMdcKeyName>userId</includeMdcKeyName>
            </encoder>
        </appender>
        <root level="INFO">
            <appender-ref ref="JSON" />
        </root>
    </springProfile>
</configuration>
```

### Request ID Tracing

```java
// common/filter/RequestIdFilter.java
package com.myapp.common.filter;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.MDC;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.UUID;

@Component
@Order(1)
public class RequestIdFilter implements Filter {

    private static final String REQUEST_ID_HEADER = "X-Request-ID";

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        String requestId = httpRequest.getHeader(REQUEST_ID_HEADER);
        if (requestId == null || requestId.isBlank()) {
            requestId = UUID.randomUUID().toString();
        }

        MDC.put("requestId", requestId);
        httpResponse.setHeader(REQUEST_ID_HEADER, requestId);

        try {
            chain.doFilter(request, response);
        } finally {
            MDC.remove("requestId");
        }
    }
}
```

### Logging Rules

| Level   | Use For                                          |
|---------|--------------------------------------------------|
| `TRACE` | Very detailed diagnostics (disabled in prod)    |
| `DEBUG` | Diagnostic info for development                 |
| `INFO`  | Key events: startup, user actions, state changes|
| `WARN`  | Unexpected but handled conditions               |
| `ERROR` | Failures that need investigation (with stack trace) |

```java
// ✅ GOOD — structured, contextual
log.info("User created: id={} email={}", user.getId(), user.getEmail());
log.error("Payment failed: orderId={} reason={}", orderId, e.getMessage(), e);

// ❌ BAD
System.out.println("User created: " + user);
log.info("Something happened");  // No context
log.error(e.getMessage());       // No stack trace
```

### Actuator & Health Checks

```yaml
# application.yml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
  endpoint:
    health:
      show-details: when-authorized
      probes:
        enabled: true  # Kubernetes liveness/readiness probes
  metrics:
    tags:
      application: ${spring.application.name}
```

---

## 31. Backend Testing Strategy

### Unit Tests (Mockito)

```java
// user/service/UserServiceTest.java
package com.myapp.user.service;

import com.myapp.common.exception.ConflictException;
import com.myapp.common.exception.ResourceNotFoundException;
import com.myapp.user.dto.*;
import com.myapp.user.entity.User;
import com.myapp.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private UserMapper userMapper;
    @Mock private PasswordEncoder passwordEncoder;

    @InjectMocks private UserServiceImpl userService;

    private User testUser;
    private UserResponse testUserResponse;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .fullName("John Doe")
                .email("john@example.com")
                .passwordHash("hashed")
                .isActive(true)
                .build();

        testUserResponse = new UserResponse(1L, "John Doe", "john@example.com",
                true, "USER", testUser.getCreatedAt());
    }

    @Nested
    @DisplayName("findById")
    class FindById {

        @Test
        @DisplayName("should return user when found")
        void shouldReturnUserWhenFound() {
            given(userRepository.findById(1L)).willReturn(Optional.of(testUser));
            given(userMapper.toResponse(testUser)).willReturn(testUserResponse);

            UserResponse result = userService.findById(1L);

            assertThat(result.id()).isEqualTo(1L);
            assertThat(result.email()).isEqualTo("john@example.com");
        }

        @Test
        @DisplayName("should throw ResourceNotFoundException when not found")
        void shouldThrowWhenNotFound() {
            given(userRepository.findById(999L)).willReturn(Optional.empty());

            assertThatThrownBy(() -> userService.findById(999L))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("User not found with id: '999'");
        }
    }

    @Nested
    @DisplayName("create")
    class Create {

        @Test
        @DisplayName("should create user and return response")
        void shouldCreateUser() {
            CreateUserRequest request = new CreateUserRequest("Jane", "jane@example.com", "Secure123!");

            given(userRepository.existsByEmail("jane@example.com")).willReturn(false);
            given(userMapper.toEntity(request)).willReturn(testUser);
            given(passwordEncoder.encode("Secure123!")).willReturn("encoded");
            given(userRepository.save(any(User.class))).willReturn(testUser);
            given(userMapper.toResponse(testUser)).willReturn(testUserResponse);

            UserResponse result = userService.create(request);

            assertThat(result).isNotNull();
            verify(userRepository).save(any(User.class));
        }

        @Test
        @DisplayName("should throw ConflictException for duplicate email")
        void shouldThrowOnDuplicateEmail() {
            CreateUserRequest request = new CreateUserRequest("Jane", "john@example.com", "Secure123!");
            given(userRepository.existsByEmail("john@example.com")).willReturn(true);

            assertThatThrownBy(() -> userService.create(request))
                    .isInstanceOf(ConflictException.class)
                    .hasMessageContaining("already registered");
        }
    }
}
```

### Integration Tests (@SpringBootTest + Testcontainers)

```java
// integration/UserIntegrationTest.java
package com.myapp.integration;

import com.myapp.user.dto.CreateUserRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import com.fasterxml.jackson.databind.ObjectMapper;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
class UserIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("testdb")
            .withUsername("test")
            .withPassword("test");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    @Test
    void shouldCreateUserAndReturn201() throws Exception {
        CreateUserRequest request = new CreateUserRequest(
                "Alice Smith", "alice@example.com", "Secure123!"
        );

        mockMvc.perform(post("/api/v1/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.fullName").value("Alice Smith"))
                .andExpect(jsonPath("$.email").value("alice@example.com"))
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.passwordHash").doesNotExist());
    }

    @Test
    void shouldReturn400ForInvalidEmail() throws Exception {
        CreateUserRequest request = new CreateUserRequest(
                "Bob", "not-an-email", "Secure123!"
        );

        mockMvc.perform(post("/api/v1/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.email").exists());
    }

    @Test
    void shouldReturn404ForNonexistentUser() throws Exception {
        mockMvc.perform(get("/api/v1/users/99999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.errorCode").value("RESOURCE_NOT_FOUND"));
    }
}
```

### Repository Tests (@DataJpaTest)

```java
// user/repository/UserRepositoryTest.java
package com.myapp.user.repository;

import com.myapp.user.entity.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class UserRepositoryTest {

    @Autowired private UserRepository userRepository;
    @Autowired private TestEntityManager entityManager;

    @Test
    void shouldFindUserByEmail() {
        User user = User.builder()
                .fullName("Test User")
                .email("test@example.com")
                .passwordHash("hashed")
                .build();
        entityManager.persistAndFlush(user);

        Optional<User> found = userRepository.findByEmail("test@example.com");

        assertThat(found).isPresent();
        assertThat(found.get().getFullName()).isEqualTo("Test User");
    }

    @Test
    void shouldReturnTrueForExistingEmail() {
        User user = User.builder()
                .fullName("Test User")
                .email("exists@example.com")
                .passwordHash("hashed")
                .build();
        entityManager.persistAndFlush(user);

        assertThat(userRepository.existsByEmail("exists@example.com")).isTrue();
        assertThat(userRepository.existsByEmail("nope@example.com")).isFalse();
    }
}
```

### Test Requirements

| Requirement                             | Details                              |
|-----------------------------------------|--------------------------------------|
| Every service has unit tests            | ✅ Required (Mockito)               |
| Every controller has slice tests        | ✅ `@WebMvcTest`                     |
| Every repository has data tests         | ✅ `@DataJpaTest`                    |
| Critical flows have integration tests   | ✅ `@SpringBootTest` + Testcontainers|
| Minimum coverage (critical paths)       | 80%                                  |
| Test naming                             | `@DisplayName("should <behavior>")` |
| Assertions                              | AssertJ (`assertThat`)               |
| No `@SpringBootTest` for unit tests     | ✅ Use `@ExtendWith(MockitoExtension)` |
| Use `@Nested` for test grouping         | ✅ Group by method under test       |
| Testcontainers for DB integration tests | ✅ Real database in Docker           |

---

## 32. Backend DevOps & Deployment

### Dockerfile (Multi-stage)

```dockerfile
# Dockerfile
FROM eclipse-temurin:21-jdk-alpine AS build

WORKDIR /app
COPY pom.xml .
COPY mvnw .
COPY .mvn .mvn
RUN chmod +x mvnw && ./mvnw dependency:resolve

COPY src src
RUN ./mvnw package -DskipTests

# Runtime
FROM eclipse-temurin:21-jre-alpine AS runtime

WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s \
  CMD wget -qO- http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
```

### Docker Compose (Full Stack)

```yaml
# docker-compose.yml
services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8080:8080"
    environment:
      SPRING_PROFILES_ACTIVE: dev
      DATABASE_URL: jdbc:postgresql://db:5432/myapp
      SPRING_DATASOURCE_USERNAME: postgres
      SPRING_DATASOURCE_PASSWORD: postgres
      JWT_SECRET: dev-secret-change-in-production-at-least-32-chars
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "4200:80"
    depends_on:
      - backend
    restart: unless-stopped

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: myapp
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d myapp"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redisdata:/data

volumes:
  pgdata:
  redisdata:
```

### Maven Build Configuration (pom.xml — key dependencies)

```xml
<dependencies>
    <!-- Core -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-actuator</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-cache</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-redis</artifactId>
    </dependency>

    <!-- Database -->
    <dependency>
        <groupId>org.postgresql</groupId>
        <artifactId>postgresql</artifactId>
        <scope>runtime</scope>
    </dependency>
    <dependency>
        <groupId>org.flywaydb</groupId>
        <artifactId>flyway-core</artifactId>
    </dependency>

    <!-- JWT -->
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-api</artifactId>
        <version>0.12.6</version>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-impl</artifactId>
        <version>0.12.6</version>
        <scope>runtime</scope>
    </dependency>

    <!-- Mapping -->
    <dependency>
        <groupId>org.mapstruct</groupId>
        <artifactId>mapstruct</artifactId>
        <version>1.6.3</version>
    </dependency>

    <!-- OpenAPI -->
    <dependency>
        <groupId>org.springdoc</groupId>
        <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
        <version>2.7.0</version>
    </dependency>

    <!-- Lombok -->
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <optional>true</optional>
    </dependency>

    <!-- Testing -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>
    <dependency>
        <groupId>org.springframework.security</groupId>
        <artifactId>spring-security-test</artifactId>
        <scope>test</scope>
    </dependency>
    <dependency>
        <groupId>org.testcontainers</groupId>
        <artifactId>postgresql</artifactId>
        <scope>test</scope>
    </dependency>
    <dependency>
        <groupId>org.testcontainers</groupId>
        <artifactId>junit-jupiter</artifactId>
        <scope>test</scope>
    </dependency>
</dependencies>
```

### Makefile

```makefile
# Makefile — Backend orchestration

.PHONY: dev build test lint docker-up docker-down

dev:
	./mvnw spring-boot:run -Dspring-boot.run.profiles=dev

build:
	./mvnw clean package -DskipTests

test:
	./mvnw test

test-integration:
	./mvnw verify -Pfailsafe

lint:
	./mvnw checkstyle:check spotbugs:check

docker-up:
	docker compose up -d --build

docker-down:
	docker compose down -v

flyway-migrate:
	./mvnw flyway:migrate

flyway-info:
	./mvnw flyway:info
```

---

## 33. Backend Review Checklist

Before considering any backend code complete, verify **every** item:

### Functionality
- [ ] Code does what was requested — no more, no less
- [ ] Edge cases handled (null, empty, boundaries, negative values)
- [ ] Error messages are clear and actionable
- [ ] API responses match the defined DTOs

### Architecture
- [ ] Controller → Service → Repository layering respected
- [ ] No business logic in controllers
- [ ] Services are interface-backed
- [ ] Entities are never exposed in API responses
- [ ] DTOs use Java records

### Data Access
- [ ] Flyway migrations are idempotent and versioned
- [ ] No `ddl-auto=update` in production config
- [ ] All N+1 queries eliminated (JOIN FETCH, @EntityGraph, batch)
- [ ] Indexes on frequently queried columns
- [ ] Optimistic locking (`@Version`) on mutable entities

### Validation
- [ ] `@Valid` on all `@RequestBody` parameters
- [ ] Bean Validation annotations on all DTO fields
- [ ] Custom validators for complex business rules

### Security
- [ ] No hardcoded secrets — all externalized via env vars
- [ ] Spring Security configured with least-privilege access
- [ ] JWT tokens validated and expiry enforced
- [ ] `@PreAuthorize` on sensitive endpoints
- [ ] CORS configured with explicit origins (no `*` in prod)
- [ ] SQL injection impossible (JPA / parameterized queries)
- [ ] Passwords hashed with BCrypt (cost ≥ 12)

### Testing
- [ ] Unit tests for all services (Mockito)
- [ ] Slice tests for controllers (`@WebMvcTest`)
- [ ] Repository tests (`@DataJpaTest`)
- [ ] Integration tests with Testcontainers
- [ ] All tests pass with `mvn test`
- [ ] AssertJ used for assertions

### Logging & Observability
- [ ] Structured logging with SLF4J (no `System.out.println`)
- [ ] Request ID tracing via MDC
- [ ] Actuator health/metrics endpoints enabled
- [ ] Log levels appropriate (INFO for events, ERROR with stack traces)

### Performance
- [ ] Connection pool configured (HikariCP)
- [ ] Caching applied to expensive read operations
- [ ] Pagination on all list endpoints
- [ ] GZIP compression enabled
- [ ] No unnecessary eager fetching

### Git
- [ ] Commit messages follow `<type>(<scope>): <summary>` format
- [ ] Each commit is atomic and focused
- [ ] No `.env`, `target/`, or IDE files committed

---

> **Remember**: This is a **full-stack Angular + Spring Boot** application. The Angular frontend
> handles presentation with standalone OnPush components, signals, and NgRx. The Spring Boot
> backend handles data, auth, and business logic with layered architecture, Spring Security,
> and JPA. DTOs bridge the API contract. Tests cover critical paths on both sides. Security,
> performance, and observability are non-negotiable. Ship quality, not quantity.
