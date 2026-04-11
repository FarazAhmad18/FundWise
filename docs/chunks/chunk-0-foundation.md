# Chunk 0 — Project Foundation

## What Was Built

- Next.js application with App Router and `src/` directory structure
- Tailwind CSS v4 design system with light-mode premium tokens (clean white + emerald accent)
- Core layout shell: sidebar navigation + main content area
- Route structure for all screens using route groups for layout separation
- Supabase integration skeleton (browser + server clients)
- Environment configuration (`.env.example` + `.env.local`)
- Full directory scaffolding for components, features, lib, and documentation

## Why It Exists

Every well-built product starts with a strong foundation. Building the design system and layout shell **before** business logic ensures:

1. **Visual consistency** — every future component inherits the same tokens, spacing, and typography
2. **Fast iteration** — new screens slot into existing layouts immediately
3. **Architecture clarity** — route groups, component directories, and lib modules are established patterns, not afterthoughts
4. **Interview-ready narrative** — you can explain _why_ you structured the app this way, not just what you built

## How It Works

### File-Based Routing (App Router)

Next.js App Router uses the filesystem to define routes:

```
src/app/
  (marketing)/page.js  → /           (landing page, no sidebar)
  (auth)/login/page.js → /login      (auth page, centered)
  (app)/dashboard/page.js → /dashboard  (app page, with sidebar)
```

Parenthesized folders like `(marketing)`, `(auth)`, `(app)` are **route groups** — they organize layouts without affecting the URL. This lets us have three different layout shells:

- **Marketing**: Full-width, no sidebar (landing page)
- **Auth**: Centered card (login/signup)
- **App**: Sidebar + main content (all authenticated views)

### Layout Nesting

```
RootLayout (fonts, global CSS, <html>)
  └── (marketing)/layout.js → full width
  └── (auth)/layout.js → centered
  └── (app)/layout.js → AppShell (Sidebar + main)
      └── dashboard/page.js
      └── workspace/[id]/page.js
      └── analytics/page.js
      └── ...
```

Each layout wraps its children. The root layout handles fonts and metadata. Route group layouts handle their specific chrome.

### Design System Architecture

The design system lives entirely in `globals.css` using Tailwind v4's `@theme` and `@utility` directives:

- **`@theme inline`** — registers CSS custom properties as Tailwind utility classes (e.g., `bg-accent`, `text-text-sec`)
- **`@utility card`** — defines reusable component-level utility classes
- **CSS variables** — all colors, shadows, and transitions use CSS custom properties for easy theming

### Supabase Skeleton

Two client modules prepared for future use:

- `lib/supabase/client.js` — browser-side client (uses anon key, for client components)
- `lib/supabase/server.js` — server-side client (uses service role key, for API routes and server components)

Both include null-safety guards so the app runs without crashing when credentials aren't configured yet.

## Core Concepts

### Next.js App Router

The App Router (introduced in Next.js 13) replaces the older Pages Router. Key differences:

- **Server Components by default** — components render on the server unless marked `"use client"`
- **File-based layouts** — `layout.js` files persist across navigations (sidebar doesn't re-mount)
- **Route groups** — parenthesized folders organize code without affecting URLs
- **Dynamic routes** — `[id]` in folder names creates parameterized routes
- **Colocation** — components, tests, and utilities can live alongside route files

### Modular Monolith

This project uses a modular monolith architecture — one repository, one deployment, but organized into clear modules:

```
src/
  components/  → UI building blocks
  features/    → business logic by domain
  lib/         → shared infrastructure (Supabase, AI, etc.)
  constants/   → configuration values
  hooks/       → React hooks
```

**Why not microservices?** For a portfolio project with one developer, microservices add operational complexity (separate deployments, service discovery, network calls) without benefits. A modular monolith gives you clean separation _within_ a single codebase.

### Supabase's Role

Supabase provides three things this project needs:

1. **PostgreSQL database** — relational data (workspaces, sources, queries, reports)
2. **Authentication** — user signup/login with JWT tokens
3. **Storage** — file uploads if needed (report PDFs, etc.)

It's essentially a Firebase alternative built on open-source tools, with the advantage of a real SQL database instead of NoSQL.

### Why Design System First

Building the design system before features prevents **UI debt** — the accumulation of inconsistent styles, colors, and spacing that make a project look unpolished. By defining tokens (colors, typography, shadows, component utilities) upfront:

- Every component starts with the correct visual language
- Spacing and color decisions are made once, not per-component
- The result looks cohesive rather than assembled from tutorials

## Interview Questions You Might Get

**Q: Why did you choose Next.js App Router over Pages Router?**
A: App Router provides server components by default (better performance), nested layouts (sidebar persists across navigations), and route groups (clean layout separation). It's the recommended approach for new Next.js projects.

**Q: What is a route group and why use them?**
A: A route group is a folder wrapped in parentheses (e.g., `(app)`) that organizes route files without adding a URL segment. I used three route groups — `(marketing)`, `(auth)`, `(app)` — to give each section its own layout shell without affecting URLs.

**Q: How does your design system work with Tailwind CSS v4?**
A: Tailwind v4 uses CSS-based configuration with `@theme` to register design tokens as utility classes and `@utility` to create reusable component-level styles. All values are CSS custom properties, making them easy to override or extend.

**Q: Why a modular monolith instead of microservices?**
A: For a single-developer project, microservices would add deployment complexity without benefits. A modular monolith gives clean separation (features, lib, components) within one codebase. If a module needed to scale independently later, it's straightforward to extract.

**Q: What is Supabase and how does it compare to Firebase?**
A: Supabase is an open-source Firebase alternative built on PostgreSQL. The key advantage for this project is a real SQL database with proper relations, joins, and constraints — critical for the interconnected data model (workspaces, sources, queries, reports, analytics).

**Q: Why set up the design system before building features?**
A: Building features without a design system leads to inconsistent UI that's expensive to fix later. By defining colors, typography, spacing, shadows, and component utilities upfront, every feature starts with the correct visual language and the result is cohesive.
