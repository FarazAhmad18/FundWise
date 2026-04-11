# Next.js App Router

## What It Is

The App Router is Next.js's file-system based router (introduced in v13, stable from v14+). It replaces the older Pages Router and provides a more powerful model for layouts, data fetching, and server rendering.

## Key Concepts

### File-Based Routing

Every `page.js` file inside `src/app/` becomes a route:

```
src/app/page.js              → /
src/app/dashboard/page.js    → /dashboard
src/app/workspace/[id]/page.js → /workspace/:id
```

### Layouts

`layout.js` files wrap child routes and **persist across navigations**:

```jsx
// src/app/(app)/layout.js
export default function AppLayout({ children }) {
  return (
    <div className="flex">
      <Sidebar />
      <main>{children}</main>
    </div>
  );
}
```

When you navigate from `/dashboard` to `/analytics`, the sidebar doesn't re-render. Only the `{children}` portion changes.

### Route Groups

Parenthesized folders organize routes without adding URL segments:

```
(marketing)/page.js  → /          (not /marketing)
(auth)/login/page.js → /login     (not /auth/login)
(app)/dashboard/page.js → /dashboard  (not /app/dashboard)
```

Use them to:
- Apply different layouts to different sections
- Organize related routes together
- Separate public vs authenticated routes

### Dynamic Routes

Square bracket folders create parameterized routes:

```
workspace/[id]/page.js → /workspace/abc123
reports/[id]/page.js   → /reports/report-1
```

The `id` parameter is available via `params`:

```jsx
export default function WorkspacePage({ params }) {
  const { id } = params;
  // ...
}
```

### Server vs Client Components

- **Server Components** (default): Render on the server, can access databases directly, don't ship JavaScript to the browser
- **Client Components** (`"use client"` directive): Run in the browser, can use React hooks (`useState`, `useEffect`), handle interactivity

```jsx
// Server Component (default) — no directive needed
export default function Page() {
  return <h1>Rendered on the server</h1>;
}

// Client Component — add "use client" at top
"use client";
export default function Sidebar() {
  const pathname = usePathname();
  // can use hooks, event handlers, browser APIs
}
```

**Rule of thumb**: Start with Server Components. Only add `"use client"` when you need interactivity (click handlers, hooks, browser APIs).

### Special Files

| File | Purpose |
|------|---------|
| `page.js` | Route content (makes the route accessible) |
| `layout.js` | Shared wrapper that persists across navigations |
| `loading.js` | Loading UI (React Suspense fallback) |
| `error.js` | Error boundary for the route |
| `not-found.js` | Custom 404 page |
| `route.js` | API endpoint (inside `api/` directory) |

## How We Use It in This Project

```
src/app/
  layout.js              ← Root: fonts, metadata, global CSS
  not-found.js           ← Custom 404
  (marketing)/
    layout.js            ← No sidebar, full-width
    page.js              ← Landing page at /
  (auth)/
    layout.js            ← Centered card layout
    login/page.js        ← /login
    signup/page.js       ← /signup
  (app)/
    layout.js            ← AppShell with sidebar
    dashboard/page.js    ← /dashboard
    workspace/[id]/page.js ← /workspace/:id
    compare/page.js      ← /compare
    analytics/page.js    ← /analytics
    reports/[id]/page.js ← /reports/:id
    settings/page.js     ← /settings
  api/
    health/route.js      ← /api/health
```

Three route groups, three layout contexts, all sharing the same root layout for fonts and CSS.

## Common Interview Questions

**Q: What's the difference between App Router and Pages Router?**
A: App Router defaults to server components, supports nested persistent layouts, and has built-in loading/error states. Pages Router renders everything client-side by default and uses a flat routing model with `_app.js` as the only shared wrapper.

**Q: When would you use a Client Component vs Server Component?**
A: Server Components for static content, data fetching, and anything that doesn't need browser APIs. Client Components for interactivity — event handlers, `useState`, `useEffect`, `usePathname`, etc.

**Q: How do layouts differ from templates?**
A: Layouts persist across navigations (component state is preserved). Templates re-mount on every navigation (fresh state each time). Use layouts for persistent UI like sidebars; use templates for things like page transition animations.
