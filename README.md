# Fundwise

Your personal AI financial advisor. Track your portfolio, set savings goals, browse live market data across 8 global exchanges, and get plain-language guidance tailored to your actual financial situation.

## What It Does

**For everyday investors** who want one place to manage their money instead of juggling spreadsheets, apps, and YouTube advice.

- **AI Advisor** — Ask any financial question. The advisor knows your income, expenses, portfolio, goals, and risk level. Gives specific, actionable answers — not generic articles.
- **Portfolio Tracker** — Log buy/sell transactions. See real P&L calculated using weighted-average cost method. View portfolio value over time with historical reconstruction.
- **Goal Tracking** — Set targets (retirement, house, emergency fund). Auto-projects when you'll reach each goal based on monthly contributions. Warns you if you fall behind.
- **Live Market Data** — Real-time stock prices across 8 markets. Pakistan uses PSX's native API for accurate local data. All others via Yahoo Finance.
- **Multi-Market** — Browse US, Pakistan, India, UK, Japan, Germany, Canada, and Australia from one account. Your home market is set during onboarding.
- **News Feed** — Market-relevant news filtered by your region and holdings.
- **Onboarding** — Country, risk profile, income/expenses, first goal — sets up your personalized experience in under 2 minutes.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Server Components, Server Actions) |
| Frontend | React 19, Tailwind CSS v4 |
| Database | Supabase (PostgreSQL + Row Level Security) |
| Auth | Supabase Auth (email/password + Google OAuth) |
| AI | Groq (llama-3.3-70b-versatile) |
| Web Search | Tavily (search + extract) |
| Market Data | Yahoo Finance API + PSX native API (Pakistan) |
| Charts | Recharts |

## Architecture

```
src/
├── app/
│   ├── (marketing)/     # Landing page (public, server-rendered)
│   ├── (auth)/          # Login, signup
│   ├── (onboarding)/    # First-time user setup
│   ├── (app)/           # Protected routes
│   │   ├── dashboard/   # Portfolio overview, goals, watchlist, market pulse
│   │   ├── advisor/     # AI financial advisor chat
│   │   ├── goals/       # Goal tracking with projections
│   │   ├── portfolio/   # Holdings, P&L, transaction history
│   │   ├── market/      # Live prices, 8 exchanges, stock detail
│   │   ├── news/        # Market news feed
│   │   └── settings/    # Profile, market, preferences
│   └── api/             # Quote API, portfolio history, search
├── features/            # Server actions + queries per domain
│   ├── advisor/         # AI chat with full context injection
│   ├── goals/           # CRUD + projection engine
│   ├── transactions/    # Buy/sell + weighted-avg-cost P&L
│   ├── profile/         # User financial profile
│   ├── watchlist/       # Ticker tracking
│   └── news/            # Market news via Tavily
├── lib/
│   ├── ai/              # Groq client with key fallback
│   ├── external/        # Yahoo Finance, PSX API, Tavily
│   └── supabase/        # Browser, server, and proxy clients
├── components/          # Reusable UI (cards, charts, layout)
└── constants/           # Market configs (8 countries), design tokens
```

**Pattern**: Server Components fetch data and pass props to Client Components for interactivity. All mutations go through Server Actions with validation. Row Level Security on every user-owned table.

## Markets Supported

| Market | Exchange | Currency | Data Source |
|--------|----------|----------|-------------|
| United States | NYSE / NASDAQ | USD | Yahoo Finance |
| Pakistan | PSX | PKR | PSX native API |
| India | NSE | INR | Yahoo Finance |
| United Kingdom | LSE | GBP | Yahoo Finance |
| Japan | TSE | JPY | Yahoo Finance |
| Germany | XETRA | EUR | Yahoo Finance |
| Canada | TSX | CAD | Yahoo Finance |
| Australia | ASX | AUD | Yahoo Finance |

## Database

18 tables across two migrations:

**Core**: user_profiles, goals, transactions, conversations, messages, watchlists, companies  
**Market data**: price_history, fundamentals, api_cache  
**Content**: workspaces, sources, source_chunks, queries, answers, reports, analytics_snapshots, filings

All user-owned tables have Row Level Security policies enforcing `auth.uid() = user_id`.

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in: Supabase URL + anon key, Groq API key, Tavily API key

# Run database migrations in Supabase SQL editor:
# 1. supabase/migrations/001_initial_schema.sql
# 2. supabase/migrations/002_pivot_schema.sql

# Start dev server
npx next dev --turbopack
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `GROQ_API_KEY` | Yes | Groq API key for AI advisor |
| `GROQ_API_KEY_FALLBACK` | No | Backup key (auto-failover on rate limit) |
| `TAVILY_API_KEY` | Yes | Tavily key for web search and URL extraction |
| `NEXT_PUBLIC_APP_URL` | Yes | App URL (http://localhost:3000 for dev) |

## License

MIT
