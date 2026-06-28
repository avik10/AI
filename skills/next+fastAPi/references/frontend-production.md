# Frontend Production Reference

## 1. SEO

### Next.js Metadata API

```tsx
// src/app/layout.tsx — Global metadata
import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://myapp.com'),
  title: { default: 'MyApp', template: '%s | MyApp' },
  description: 'Your app description for search engines.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'MyApp',
    images: [{ url: '/og-default.png', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', creator: '@yourhandle' },
  robots: { index: true, follow: true },
};

// src/app/dashboard/page.tsx — Page-level metadata
export const metadata: Metadata = {
  title: 'Dashboard',  // Renders as "Dashboard | MyApp"
  description: 'View your analytics and manage your projects.',
};

// Dynamic metadata
export async function generateMetadata({ params }): Promise<Metadata> {
  const product = await getProduct(params.id);
  return {
    title: product.name,
    description: product.description,
    openGraph: { images: [product.image] },
  };
}
```

### Sitemap

```typescript
// src/app/sitemap.ts
import type { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts();
  const productUrls = products.map((p) => ({
    url: `https://myapp.com/products/${p.slug}`,
    lastModified: p.updated_at,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    { url: 'https://myapp.com', lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: 'https://myapp.com/about', changeFrequency: 'monthly', priority: 0.5 },
    ...productUrls,
  ];
}
```

### robots.txt

```typescript
// src/app/robots.ts
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/api/', '/dashboard/', '/admin/'] },
    ],
    sitemap: 'https://myapp.com/sitemap.xml',
  };
}
```

### Structured Data (JSON-LD)

```tsx
export default function ProductPage({ product }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    offers: { '@type': 'Offer', price: product.price, priceCurrency: 'USD' },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {/* page content */}
    </>
  );
}
```

---

## 2. Accessibility (a11y)

### WCAG 2.1 AA Checklist

| Requirement | Implementation |
|-------------|----------------|
| Semantic HTML | `<button>`, `<nav>`, `<main>`, `<article>` — not `<div onClick>` |
| Alt text | Every `<img>` has descriptive alt (or `alt=""` for decorative) |
| Color contrast | 4.5:1 for text, 3:1 for large text |
| Keyboard navigation | All interactive elements reachable via Tab |
| Focus indicators | Visible `:focus-visible` styles |
| ARIA labels | `aria-label` on icon-only buttons |
| Form labels | Every input has an associated `<label>` |
| Error messages | `aria-describedby` linking input to error |
| Skip links | "Skip to main content" link |
| Motion preferences | Respect `prefers-reduced-motion` |

```tsx
// ✅ Accessible button
<button aria-label="Close dialog" onClick={onClose}>
  <XIcon aria-hidden="true" />
</button>

// ✅ Accessible form
<label htmlFor="email">Email</label>
<input id="email" type="email" aria-describedby="email-error" aria-invalid={!!error} />
{error && <p id="email-error" role="alert">{error}</p>}

// ✅ Skip link
<a href="#main-content" className="sr-only focus:not-sr-only">Skip to main content</a>
<main id="main-content">...</main>
```

```css
/* Screen-reader only utility */
.sr-only {
  position: absolute; width: 1px; height: 1px;
  padding: 0; margin: -1px; overflow: hidden;
  clip: rect(0, 0, 0, 0); border: 0;
}
.sr-only:focus { position: static; width: auto; height: auto; overflow: visible; clip: auto; }
```

---

## 3. Error Boundaries

```tsx
// src/app/error.tsx — Route-level error boundary
'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div role="alert">
      <h2>Something went wrong</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

```tsx
// src/app/global-error.tsx — Root layout error boundary
'use client';

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <html><body>
      <h1>Something went wrong</h1>
      <button onClick={reset}>Reload</button>
    </body></html>
  );
}
```

```tsx
// src/app/not-found.tsx
export default function NotFound() {
  return (
    <main>
      <h1>404 — Page not found</h1>
      <p>The page you're looking for doesn't exist.</p>
      <a href="/">Go home</a>
    </main>
  );
}
```

---

## 4. State Management

### Decision Guide

| Type | Tool | When |
|------|------|------|
| **Server state** | React Query / SWR | API data — caching, refetching, pagination |
| **Client state** | Zustand | Auth, UI toggles, form drafts |
| **Local state** | `useState` | Component-scoped, simple state |
| **URL state** | `useSearchParams` | Filters, pagination, search |
| **Form state** | React Hook Form | Complex forms with validation |

### Zustand Pattern

```typescript
// src/stores/uiStore.ts
import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  theme: 'dark',
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setTheme: (theme) => set({ theme }),
}));
```

### SWR for Server State

```typescript
import useSWR from 'swr';
import { api } from '@/lib/api-client';

function useUsers(page: number) {
  const { data, error, isLoading, mutate } = useSWR(
    `/v1/users?skip=${page * 20}&limit=20`,
    (url) => api.get(url),
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
    }
  );
  return { users: data?.items, total: data?.total, error, isLoading, mutate };
}

// Optimistic update
async function deleteUser(id: number) {
  await mutate(
    (current) => ({ ...current, items: current.items.filter((u) => u.id !== id) }),
    { revalidate: false }
  );
  await api.delete(`/v1/users/${id}`);
  await mutate(); // Revalidate from server
}
```
