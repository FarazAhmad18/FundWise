# Chunk 2 — Auth + Database Foundation

## What Was Built

- Supabase SSR authentication with cookie-based session management
- Login/signup forms wired to Supabase Auth with error handling and loading states
- Google OAuth integration with callback route
- Middleware-based route protection (unauthenticated users redirected to login)
- Auth context provider (useAuth hook for client components)
- Sidebar user profile display with logout action
- Full database schema (14 tables) with Row Level Security policies
- Database migration file ready for Supabase deployment

## Why It Exists

Authentication and database schema are the backbone of every multi-user application. Without auth, there's no concept of "my workspaces" vs "your workspaces." Without a schema, there's no structure for storing research data. This chunk transforms the app from a static UI into a real multi-user platform.

## How It Works

### Auth Flow

```
User visits /dashboard (protected route)
  → middleware.js intercepts the request
  → Supabase checks for valid session cookie
  → No session? Redirect to /login
  → User fills login form → server action calls supabase.auth.signInWithPassword()
  → Supabase sets session cookie
  → Redirect to /dashboard
  → middleware passes, page renders
  → AppLayout reads user from server, passes to AuthProvider
  → All child components access user via useAuth()
```

### Cookie-Based Auth (why @supabase/ssr)

The `@supabase/ssr` package handles auth cookies automatically:

- **Browser client** (`createBrowserClient`) — reads/writes cookies for client-side auth state
- **Server client** (`createServerClient`) — reads cookies from `next/headers` in Server Components
- **Middleware client** — refreshes expired tokens before they reach routes

This is the official Supabase approach for Next.js App Router. Without it, server-rendered pages couldn't access user sessions.

### Server Actions for Auth

Login and signup use Next.js server actions (`"use server"`):

```
Form submit → server action runs on server
  → calls Supabase Auth API
  → returns error or redirects on success
```

Server actions are better than API routes for forms because:
1. No separate API endpoint to create and maintain
2. Type-safe form data handling
3. Works with progressive enhancement

### Route Protection

The middleware at `src/middleware.js` runs before every route:

- **Public routes**: `/`, `/login`, `/signup`, `/api/health` — no auth required
- **Protected routes**: everything else — redirects to `/login` if no session
- **Auth routes when logged in**: `/login`, `/signup` — redirects to `/dashboard`

### Database Schema

14 tables covering the full data model:

| Table | Purpose |
|-------|---------|
| `companies` | Company reference data (name, ticker, sector) |
| `workspaces` | User research spaces, linked to companies |
| `sources` | Ingested articles, notes, reports |
| `source_chunks` | Chunked content for RAG retrieval |
| `queries` | User research questions with mode |
| `answers` | AI-generated responses with source citations |
| `reports` | Structured research outputs |
| `analytics_snapshots` | Sentiment, topics, signals data |
| `watchlists` | User company tracking |
| `price_history` | Stock prices from Alpha Vantage |
| `fundamentals` | Financial metrics (P/E, revenue, etc.) |
| `filings` | SEC EDGAR documents |
| `api_cache` | Cached API responses to respect rate limits |

### Row Level Security (RLS)

Every user-owned table has RLS policies ensuring users can only access their own data:

- `workspaces` — filter by `user_id = auth.uid()`
- `sources`, `source_chunks`, `analytics_snapshots` — filter through workspace ownership
- `queries`, `reports` — filter by `user_id = auth.uid()`
- `answers` — filter through query ownership
- `watchlists` — filter by `user_id = auth.uid()`

Reference tables (`companies`, `price_history`, `fundamentals`) are shared read-only data — no RLS needed.

## Core Concepts

### Auth Flow in Next.js App Router
Auth in App Router is more complex than Pages Router because Server Components can't use `useState` or `useEffect`. The solution is a three-layer approach:
1. Middleware refreshes tokens on every request
2. Server Components read the session directly from cookies
3. Client Components access user state via Context (AuthProvider)

### PostgreSQL Tables and Relations
The schema uses foreign keys to enforce data integrity. For example, `sources.workspace_id` references `workspaces.id` with `on delete cascade` — if a workspace is deleted, all its sources are automatically removed. This prevents orphaned data.

### Row Ownership and Security
RLS policies run at the database level — even if application code has a bug that exposes another user's workspace ID, the database will reject unauthorized access. This is defense-in-depth security.

### Relationship Modeling
The schema models three relationship types:
- **One-to-many**: User → Workspaces → Sources → Chunks
- **Many-to-many** (via join table): Users ↔ Companies (through watchlists)
- **Optional association**: Workspaces → Companies (nullable foreign key)

## Interview Questions You Might Get

**Q: How does authentication work in your app?**
A: Cookie-based sessions via Supabase SSR. Middleware refreshes tokens on every request, server components read the session from cookies, and client components access user state through a React context provider.

**Q: Why middleware instead of checking auth in each page?**
A: Middleware runs before the page renders, so unauthenticated users never see protected content — not even a flash of it. It also centralizes auth logic in one place instead of repeating it in every route.

**Q: How do you prevent users from accessing each other's data?**
A: Row Level Security at the database level. Every table with user data has policies that filter by `auth.uid()`. Even if the application layer has a bug, the database enforces access control.

**Q: Why server actions instead of API routes for auth?**
A: Server actions are simpler for form submissions — no separate endpoint to manage, they run on the server with full access to cookies, and they support progressive enhancement. API routes are better for programmatic access from external clients.

**Q: Walk me through your database schema design.**
A: The core chain is Users → Workspaces → Sources → Chunks. Workspaces are the primary organizational unit. Sources represent ingested research material. Chunks are the embeddings-ready pieces used for RAG retrieval. Queries and answers track conversation history. Reports store structured outputs. Financial data tables (price_history, fundamentals, filings) store real market data cached from Alpha Vantage and SEC EDGAR.
