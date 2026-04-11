# p1Finance — Project Status & Architecture Map

> **Purpose**: Living document for session continuity. Updated as the system evolves.  
> **Last updated**: 2026-04-11  
> **Integration branch**: `develop` (all feature branches merge here; `main` = last stable release)  
> **Current branch**: `feat/chunk-5-chat-engine`

---

## Build Progress

### Chunk 0 — Foundation [COMPLETE, merged to main]
| Item | Status | Key Files |
|------|--------|-----------|
| Next.js 16 App Router + `src/` structure | Done | `next.config.mjs`, `jsconfig.json` |
| Tailwind v4 design system (white + emerald) | Done | `src/app/globals.css` |
| CSS utility classes (card, btn, badge, input, stat, page) | Done | `src/app/globals.css` |
| Route groups: `(marketing)`, `(auth)`, `(app)` | Done | `src/app/` |
| Sidebar + AppShell layout | Done | `src/components/layout/Sidebar.js`, `AppShell.js` |
| Nav constants + design tokens | Done | `src/constants/navigation.js`, `design.js` |
| Supabase client skeleton | Done | `src/lib/supabase/` |
| Env config | Done | `.env.example` |
| Directory scaffolding (features, lib, components) | Done | all `src/` subdirs |

### Chunk 1 — Premium UI Shell [COMPLETE, merged to main]
| Item | Status | Key Files |
|------|--------|-----------|
| Button, Badge, Input, PageHeader | Done | `src/components/ui/` |
| StatCard, WorkspaceCard, SourceCard | Done | `src/components/ui/` |
| ChatMessage (User + Assistant), ModeToggle | Done | `src/components/ui/` |
| Tabs, EmptyState, Skeleton | Done | `src/components/ui/` |
| Landing page (hero, features, CTA) | Done | `src/app/(marketing)/page.js` |
| Login / Signup forms | Done | `src/app/(auth)/login/page.js`, `signup/page.js` |
| Dashboard (stats, workspaces, watchlist, queries) | Done | `src/app/(app)/dashboard/page.js` |
| Workspace chat interface + evidence panel | Done | `src/app/(app)/workspace/[id]/page.js` |
| Analytics (6 Recharts: sentiment, topics, coverage, timeline, signals) | Done | `src/app/(app)/analytics/page.js` |
| Reports (Tesla risk memo template) | Done | `src/app/(app)/reports/[id]/page.js` |
| Compare (TSLA vs NVDA metrics, sentiment, risks) | Done | `src/app/(app)/compare/page.js` |
| Settings page (profile, AI config, account) | Done | `src/app/(app)/settings/page.js` |

### Chunk 2 — Auth + Database [COMPLETE, merged to main]
| Item | Status | Key Files |
|------|--------|-----------|
| `@supabase/ssr` added to deps | Done | `package.json` |
| Browser client (`createBrowserClient`) | Done | `src/lib/supabase/client.js` |
| Server client (`createServerClient` with cookies) | Done | `src/lib/supabase/server.js` |
| Middleware client (`updateSession`) | Done | `src/lib/supabase/middleware.js` |
| Re-exports for convenience | Done | `src/lib/supabase/index.js` |
| Route protection middleware | Done | `src/middleware.js` |
| Login server action (email/password) | Done | `src/features/auth/actions.js` |
| Signup server action (with name metadata) | Done | `src/features/auth/actions.js` |
| Google OAuth server action + callback route | Done | `src/features/auth/actions.js`, `src/app/auth/callback/route.js` |
| Logout server action | Done | `src/features/auth/actions.js` |
| AuthProvider + useAuth hook | Done | `src/features/auth/AuthProvider.js` |
| AppLayout injects user into AuthProvider | Done | `src/app/(app)/layout.js` |
| Sidebar shows user profile + logout | Done | `src/components/layout/Sidebar.js` |
| DB schema — 14 tables with relations | Done | `supabase/migrations/001_initial_schema.sql` |
| Row Level Security on all user-owned tables | Done | same migration file |
| `updated_at` trigger on workspaces | Done | same migration file |
| Docs: chunk writeup, supabase-auth, postgres-relations | Done | `docs/` |

### Chunk 3 — Workspace CRUD [COMPLETE, merged to develop]
| Item | Status | Key Files |
|------|--------|-----------|
| `createWorkspace` server action | Done | `src/features/workspaces/actions.js` |
| `deleteWorkspace` server action | Done | `src/features/workspaces/actions.js` |
| `listWorkspaces` query (with sources/queries counts) | Done | `src/features/workspaces/queries.js` |
| `getWorkspace(id)` query | Done | `src/features/workspaces/queries.js` |
| `getDashboardStats()` aggregate counts | Done | `src/features/workspaces/queries.js` |
| `formatRelativeTime()` utility | Done | `src/features/workspaces/queries.js` |
| Dashboard Server Component with real data | Done | `src/app/(app)/dashboard/page.js` |
| Dashboard empty state when no workspaces | Done | same |
| New Workspace page | Done | `src/app/(app)/workspace/new/page.js` |
| Workspace detail: server fetch + client UI split | Done | `src/app/(app)/workspace/[id]/page.js`, `WorkspaceClient.js` |

### Chunk 3.5 — Watchlist [COMPLETE, merged to develop]
| Item | Status | Key Files |
|------|--------|-----------|
| `addToWatchlist` (upserts company by ticker) | Done | `src/features/watchlist/actions.js` |
| `removeFromWatchlist` | Done | `src/features/watchlist/actions.js` |
| `listWatchlist` (joined with companies) | Done | `src/features/watchlist/queries.js` |
| Watchlist UI with inline add form + hover-remove | Done | `src/components/dashboard/WatchlistPanel.js` |
| Dashboard grid reworked (workspaces 2/3, watchlist 1/3) | Done | `src/app/(app)/dashboard/page.js` |
| Real stock prices (Alpha Vantage) | Blocked on `ALPHA_VANTAGE_API_KEY` | — |

### Chunk 4 — Source Ingestion [COMPLETE, merged to develop]
| Item | Status | Key Files |
|------|--------|-----------|
| `chunkText()` — sentence-aware chunking | Done | `src/lib/parsing/chunk.js` |
| `htmlToText()` — strip tags, decode entities | Done | `src/lib/parsing/chunk.js` |
| `addSource()` — handles URL fetch OR pasted text | Done | `src/features/sources/actions.js` |
| URL fetching with timeout + User-Agent + fallback | Done | same |
| `deleteSource()` | Done | same |
| `listSources(workspaceId)` | Done | `src/features/sources/queries.js` |
| Auto-chunk on ingest, persists to `source_chunks` | Done | `src/features/sources/actions.js` |
| Touches workspace `updated_at` on source add | Done | same |
| SourcesPanel client component (add form + list + delete) | Done | `src/components/workspace/SourcesPanel.js` |
| Workspace detail page wired to real sources | Done | `src/app/(app)/workspace/[id]/page.js` |
| Source status badges (pending/ingested/failed) | Done | `SourcesPanel.js` |
| Embeddings generation | Blocked on embedding API / model | — |
| SEC EDGAR filing ingestion | Deferred to later chunk | — |

### Chunk 4 — Ingestion + RAG Pipeline [NOT STARTED]
| Item | Status | Key Files |
|------|--------|-----------|
| Source upload (URL, pasted text) | Pending | `src/features/ingestion/` |
| Text extraction / cleaning | Pending | `src/lib/parsing/` |
| Chunking strategy | Pending | `src/lib/parsing/` |
| Embedding generation (384-dim for pgvector) | Pending | — |
| Store chunks + embeddings in `source_chunks` | Pending | — |
| Vector similarity search | Pending | `src/lib/retrieval/` |
| Source status lifecycle (pending → processing → ingested/failed) | Pending | — |

### Chunk 5 — AI Chat Engine [COMPLETE, merged to develop]
| Item | Status | Key Files |
|------|--------|-----------|
| Groq API client (fetch-based, OpenAI-compatible) | Done | `src/lib/ai/groq.js` |
| Automatic key fallback on 401/429 | Done | same |
| Model configurable via `GROQ_MODEL` env var | Done | same |
| `askQuestion(workspaceId, text, mode)` server action | Done | `src/features/chat/actions.js` |
| Context retrieval (all chunks, char-budget capped) | Done | same |
| System prompt with inline [Source N] citation instructions | Done | same |
| Persists query + answer to DB | Done | same |
| `listMessages(workspaceId)` pairs queries with answers | Done | `src/features/chat/queries.js` |
| Workspace detail loads chat history on render | Done | `src/app/(app)/workspace/[id]/page.js` |
| WorkspaceClient real chat UI: submit, thinking state, scroll-to-bottom | Done | `WorkspaceClient.js` |
| Disabled input when workspace has no sources | Done | same |
| Empty-state prompt switches based on whether sources exist | Done | same |
| Source citation badges render as clickable links | Done | `src/components/ui/ChatMessage.js` |
| Proper RAG with embeddings (vector search) | Deferred | needs embedding model |
| Streaming responses | Deferred | will add after basic flow proves out |
| Live web search mode | Deferred | needs web search API |

### Chunk 6 — Analytics + Reports [NOT STARTED]
| Item | Status | Key Files |
|------|--------|-----------|
| Sentiment analysis on sources | Pending | `src/features/analytics/` |
| Topic extraction | Pending | `src/features/analytics/` |
| Event timeline generation | Pending | — |
| Signal detection (bullish/bearish) | Pending | — |
| Analytics snapshot storage | Pending | — |
| Report generation engine | Pending | `src/features/reports/` |
| Report type templates (risk memo, comparison, etc.) | Pending | — |
| Wire analytics page to real data | Pending | — |
| Wire reports page to real data | Pending | — |

### Chunk 7 — Compare + Polish [NOT STARTED]
| Item | Status | Key Files |
|------|--------|-----------|
| Multi-company comparison logic | Pending | `src/features/compare/` |
| Side-by-side metrics from real data | Pending | — |
| Comparison report generation | Pending | — |
| Wire compare page to real data | Pending | — |
| Error boundaries + loading states | Pending | — |
| Mobile responsiveness pass | Pending | — |

---

## Architecture & Patterns

### How Auth Works (event flow)

```
1. User hits any route
   └─> src/middleware.js intercepts
       └─> calls updateSession(request)  [src/lib/supabase/middleware.js]
           └─> refreshes Supabase session cookie
           └─> if protected route + no session → redirect /login
           └─> if auth route + has session → redirect /dashboard

2. User submits login form
   └─> form calls login(formData)  [src/features/auth/actions.js]  "use server"
       └─> createClient() from server.js (reads cookies via next/headers)
       └─> supabase.auth.signInWithPassword({ email, password })
       └─> on success: redirect('/dashboard')
       └─> on error: return { error: message }

3. User clicks "Sign in with Google"
   └─> signInWithGoogle()  [src/features/auth/actions.js]
       └─> supabase.auth.signInWithOAuth({ provider: 'google', redirectTo: .../auth/callback })
       └─> browser redirects to Google → back to /auth/callback
       └─> src/app/auth/callback/route.js exchanges code for session
       └─> redirect('/dashboard')

4. Protected page renders
   └─> src/app/(app)/layout.js (Server Component)
       └─> createClient() → supabase.auth.getUser()
       └─> passes user to <AuthProvider initialUser={user}>
           └─> any child calls useAuth() → gets { user, loading }
   └─> Sidebar reads useAuth() → shows name, email, avatar, logout button
```

### How Route Groups Work

```
src/app/
├── (marketing)/     → public pages, no sidebar, own layout
├── (auth)/          → login/signup, centered card layout, no sidebar
├── (app)/           → protected pages, AppShell + Sidebar wraps all children
├── api/             → API routes (health check, future endpoints)
└── auth/            → OAuth callback handler (not a page, just a route)
```

Parenthesized folders like `(app)` are route groups — they share a layout but don't appear in the URL. `/dashboard` lives at `(app)/dashboard/page.js` but the URL is just `/dashboard`.

### How the Design System Works

```
globals.css defines CSS variables:
  --accent: #10b981 (emerald)
  --bg, --surface, --card, --text, --border, etc.

Utility classes reference these variables:
  .btn-primary  → background: var(--accent)
  .card         → border: var(--border), bg: var(--card)
  .badge        → inline-flex, rounded-full

Components use utility classes + Tailwind:
  <button className="btn-primary">  → gets emerald button
  <div className="card p-6">       → gets bordered card with padding

Color tokens in constants/design.js:
  CHART_COLORS, SENTIMENT_COLORS → used by Recharts components
```

### How the Database is Structured

```
Core chain:
  auth.users → workspaces → sources → source_chunks (embeddings)
                          → queries → answers
                          → reports
                          → analytics_snapshots

Reference data (shared, no RLS):
  companies → price_history
            → fundamentals
            → filings

User tracking:
  auth.users → watchlists ←→ companies  (many-to-many)

Caching:
  api_cache (provider + endpoint + params_hash → response_json + TTL)

RLS pattern:
  - Direct ownership:  WHERE user_id = auth.uid()
    Used by: workspaces, queries, reports, watchlists
  - Through workspace:  WHERE workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid())
    Used by: sources, source_chunks, analytics_snapshots
  - Through query:      WHERE query_id IN (SELECT id FROM queries WHERE user_id = auth.uid())
    Used by: answers
```

### Server vs Client Component Split

```
Server Components ("use server" or default):
  - Page components that fetch data (dashboard, analytics, etc.)
  - Layout components that read session
  - Server actions (auth/actions.js)

Client Components ("use client"):
  - Interactive UI (ModeToggle, Tabs, ChatMessage input)
  - Auth state consumers (useAuth, Sidebar user section)
  - Charts (Recharts requires client)
  - Forms with state (login, signup)

Pattern: Server fetches data → passes as props → Client renders interactively
```

### State Management Approach

```
No external state library. Uses:
  - React Context: AuthProvider (user session)
  - useState: Local UI state (tabs, toggles, form inputs)
  - Server Components: Data fetched at render time, no client state needed
  - URL params: Dynamic routes ([id]) carry workspace/report identity

Future state will likely follow same pattern:
  - Server Components fetch from Supabase
  - Props drill data to client components
  - Context only for cross-cutting concerns (auth, maybe theme)
```

---

## Tech Stack Quick Reference

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.2.3 |
| Runtime | React | 19.2.4 |
| Styling | Tailwind CSS | 4 |
| Database | Supabase (PostgreSQL) | — |
| Auth | Supabase Auth + @supabase/ssr | 0.10.2 |
| AI (planned) | Groq API | — |
| Financial data (planned) | Alpha Vantage | — |
| Filings (planned) | SEC EDGAR | — |
| Charts | Recharts | 3.8.1 |
| Animation | Framer Motion (minimal use) | 12.38.0 |
| Vectors (planned) | pgvector (384-dim) | — |

---

## Env Variables Required

| Variable | Used By | Wired? |
|----------|---------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | All Supabase clients | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | All Supabase clients | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin operations (future) | No |
| `GROQ_API_KEY` | AI chat engine | No |
| `ALPHA_VANTAGE_API_KEY` | Price/fundamentals fetching | No |
| `NEXT_PUBLIC_APP_URL` | OAuth redirect URL | Yes |

---

## Key Directories

```
src/
├── app/                    # Pages & routes (all screens built, sample data)
├── components/
│   ├── layout/             # AppShell, Sidebar (wired to auth)
│   ├── ui/                 # 12 reusable components (all built)
│   ├── analytics/          # [empty — future chart components]
│   ├── chat/               # [empty — future chat widgets]
│   ├── compare/            # [empty — future comparison widgets]
│   ├── reports/            # [empty — future report components]
│   └── sources/            # [empty — future source library]
├── constants/              # navigation.js, design.js
├── features/
│   ├── auth/               # AuthProvider + actions (WIRED)
│   ├── analytics/          # [empty]
│   ├── chat/               # [empty]
│   ├── compare/            # [empty]
│   ├── financial/          # [empty]
│   ├── ingestion/          # [empty]
│   ├── reports/            # [empty]
│   └── workspaces/         # [empty]
├── lib/
│   ├── supabase/           # client, server, middleware, index (WIRED)
│   ├── ai/                 # [empty — Groq integration]
│   ├── analytics/          # [empty — sentiment/topic engines]
│   ├── financial/          # [empty — Alpha Vantage/EDGAR]
│   ├── parsing/            # [empty — text extraction/chunking]
│   ├── retrieval/          # [empty — vector search/RAG]
│   └── utils/              # [empty — shared helpers]
supabase/
└── migrations/
    └── 001_initial_schema.sql   # 14 tables, RLS, indexes, triggers
docs/
├── chunks/                 # Per-chunk build documentation
└── concepts/               # Learning guides (auth, postgres)
```

---

## Session Pickup Checklist

When starting a new session on this project:

1. Read this file first for current state
2. Check `git status` and `git log --oneline -5` to see if anything changed since last update
3. Check which branch you're on — `main` has stable code, feature branches have in-progress work
4. The chunk docs in `docs/chunks/` explain the **why** behind each piece
5. All screens currently use **hardcoded sample data** — nothing reads from the database yet
6. Auth is wired but the branch hasn't been committed yet (as of 2026-04-11)
7. Empty `src/features/` and `src/lib/` directories are intentional scaffolding for future chunks
