# p1Finance — Deep Understanding & Gap Analysis

> Created: 2026-04-13
> Purpose: Capture full understanding of the project so future sessions don't start from scratch.

---

## 1. What Exists Today (Current System)

### Identity
- **Name**: Financial Research Copilot
- **Tagline**: "Research stocks like a pro without Bloomberg"
- **Target (as built)**: Students and working professionals who want to research stocks like professional analysts

### Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router), React 19, Tailwind CSS v4 |
| Database + Auth | Supabase (PostgreSQL + Auth + RLS) |
| AI / LLM | Groq (llama-3.3-70b-versatile) |
| Web Search | Tavily (search + extract) |
| Stock Data | Yahoo Finance (via /api/quote/[ticker]) |
| Charts | Recharts |
| Deployment | Vercel (planned) |

### What's Built (Chunks 0-5 complete)
1. **Foundation**: Next.js 16 App Router, Tailwind v4, design system, route groups
2. **UI Shell**: 12 reusable components, all screens with layouts
3. **Auth + DB**: Supabase auth (email + Google OAuth), 14 database tables with RLS
4. **Workspace CRUD**: Create/delete workspaces, list with stats, dashboard
5. **Watchlist**: Add/remove tickers, live price display
6. **Source Ingestion**: URL fetch via Tavily, pasted text, sentence-aware chunking, auto-chunk on ingest
7. **AI Chat**: Groq-powered RAG chat, 3 modes (live/hybrid/KB), citation system, chat history

### What's Half-Built (Chunk 6+ in progress, unstaged)
- Analytics page with workspace selector + 6 chart types
- Report generator (4 types: summary, risk memo, bull/bear, digest)
- Reports listing and viewer
- Compare engine (side-by-side AI comparison)
- Insights panel, Metrics panel in workspace
- Stock search on dashboard, market overview

### What's NOT Built
- Vector embeddings for proper semantic search (pgvector extension enabled but empty)
- Streaming chat responses
- SEC EDGAR filing ingestion
- Mobile responsiveness
- Error boundaries
- Proper loading states everywhere
- Landing page rewrite

### Database Schema (14 tables)
**User data (RLS)**: workspaces, sources, source_chunks, queries, answers, reports, analytics_snapshots
**Reference (shared)**: companies, price_history, fundamentals, filings
**User prefs**: watchlists
**Cache**: api_cache

---

## 2. The Actual Goal (What the User Wants)

> "Design this system for a layman — a common/normal human who wants to invest money for future securing or whatever purpose. End to end."

### Who is the REAL target user?
- A person who has some income and wants to start investing
- They may have ZERO financial knowledge
- They don't know what P/E ratio, EPS, market cap, or "bullish" means
- They don't have "research sources" to ingest
- They don't want to "research stocks like a pro" — they want to be TOLD what to do
- They want security, guidance, and simplicity
- Examples: a fresh graduate, a salaried employee, a small business owner, a parent saving for their kid's education

### What they actually need
1. **Someone to guide them**: "I have X money. What should I do?"
2. **Understanding their situation**: Income, expenses, debts, goals, risk appetite
3. **Plain language**: No jargon. Explain everything like they're 15.
4. **Investment recommendations**: Not "here are tools to research TSLA" but "based on your profile, here's what you should consider"
5. **Goal tracking**: "I want 50 lakh in 10 years" → system shows if they're on track
6. **Education**: Teach them investing basics as they go
7. **Portfolio monitoring**: See how their investments are doing in simple terms
8. **Ongoing advisor**: Ask questions anytime like a financial advisor chat

---

## 3. The Misalignment (Why Current System Doesn't Work)

### Current System Assumes | Real User Actually...
|---|---|
| User wants to research individual stocks | User doesn't know WHAT to invest in |
| User has sources/articles to ingest | User has no sources; needs guidance |
| User understands financial terminology | User doesn't know what "bullish" means |
| User can interpret analytics charts | User needs simple "you're on track" / "you're behind" |
| User wants to generate research reports | User wants to be told what to do |
| User can pick two companies to compare | User doesn't know any companies to compare |
| "Workspace" concept makes sense | User needs "Goals" not "Workspaces" |
| Chat is for asking research questions | Chat should be a financial advisor |
| Watchlist of individual stocks | Portfolio tracker of actual investments |
| Sentiment analysis, topic extraction | Progress toward financial goals |

### Feature-by-Feature Reality Check

| Current Feature | Useful for Layman? | What They Need Instead |
|---|---|---|
| **Workspace (stock research)** | No | **Goal-based planning** ("Save for house", "Retire at 55") |
| **Source ingestion (URLs/text)** | No | **Curated educational content** served BY the system |
| **RAG chat over sources** | No | **AI financial advisor** that understands their full picture |
| **3 research modes** | No | **One simple chat** that's always smart |
| **Analytics (sentiment, topics, signals)** | No | **Portfolio health dashboard** ("You're 65% to your goal") |
| **Reports (risk memo, bull/bear)** | No | **Monthly financial summary** ("You saved X, invested Y, grew Z") |
| **Compare companies** | No | **Compare investment options** ("FD vs Mutual Fund vs Stocks") |
| **Watchlist** | Partially | **Portfolio tracker** (what they actually own) |
| **Market overview** | Partially | **Simplified market pulse** ("Markets went up 2% this week, your portfolio is fine") |
| **Stock search** | No | **Investment discovery** ("Show me safe investments for beginners") |

---

## 4. What the System SHOULD Be (Reimagined)

### New Identity
- **Name**: p1Finance (keep it)
- **Tagline**: Something like "Your personal money guide" or "Smart investing, made simple"
- **Target**: Common people who want to grow their money but don't know how

### Core Philosophy
1. **Guide, don't assume knowledge** — The system teaches and leads
2. **Goal-first, not stock-first** — Everything starts from "what do you want to achieve?"
3. **Plain language always** — No jargon without explanation
4. **AI as advisor, not tool** — The chat IS the product, not a feature
5. **Show progress, not complexity** — Simple dashboards, clear metrics

### Reimagined Feature Set

#### A. Onboarding Flow (NEW — critical)
- "What's your monthly income?"
- "How much do you spend?"
- "Do you have an emergency fund?"
- "What are you saving for?" (retirement, house, education, wealth building, etc.)
- "How much risk can you handle?" (simple quiz, not jargon)
- Result: A financial profile that powers everything

#### B. Dashboard (Reimagined)
- **Your Goals**: Progress bars toward each goal
- **This Month**: Savings, investments, returns — simple numbers
- **Your Portfolio**: What you own and how it's performing
- **Market Pulse**: One-liner about how markets are doing
- **Quick Actions**: "Invest more", "Ask advisor", "Learn something new"

#### C. AI Financial Advisor (Reimagined Chat)
- Not research-mode chat, but a financial advisor
- Understands user's full financial picture
- Can answer: "Should I invest in mutual funds or FDs?", "Is it safe to invest now?", "How do I start a SIP?"
- Gives personalized advice based on their profile
- Explains concepts in simple language
- Can suggest specific actions: "You should increase your SIP by 2000 this month"

#### D. Goals & Planning (Replaces Workspaces)
- Create financial goals with target amount and timeline
- System calculates required monthly investment
- Track progress over time
- Get alerts: "You're behind on your house goal, consider increasing investment by X"

#### E. Investment Discovery (Replaces Stock Research)
- "Show me options for safe investing" → explains FDs, debt mutual funds, gold
- "I want high growth" → explains equity mutual funds, index funds, stock baskets
- Compare investment types side by side in plain language
- System recommends based on user's risk profile

#### F. Portfolio Tracker (Replaces Watchlist)
- Track actual investments (not just watched stocks)
- See total portfolio value, returns, allocation
- Simple pie chart: "60% mutual funds, 20% stocks, 20% FD"
- Alerts when rebalancing needed

#### G. Learn Hub (Replaces Reports)
- Bite-sized financial education
- "What are mutual funds?", "How does compound interest work?", "What is an emergency fund?"
- Progress tracking: "You've learned 12/30 topics"
- AI can reference these when explaining things in chat

#### H. Monthly Review (Replaces Analytics)
- "This month you saved X, invested Y, your portfolio grew Z%"
- Simple trend lines (portfolio value over time)
- Goal progress updates
- Suggestions for next month

---

## 5. What Can Be Reused from Current System

### Keep As-Is
- **Tech stack**: Next.js 16, Supabase, Groq, Tailwind — all perfect
- **Auth system**: Login, signup, Google OAuth — all working
- **Database infra**: Supabase with RLS — excellent foundation
- **UI component library**: Button, Badge, Input, Card, Tabs, etc. — all reusable
- **Layout system**: AppShell + Sidebar pattern works
- **Design system**: Emerald + white theme, CSS utilities — clean
- **Groq integration**: AI chat backbone — repurpose as financial advisor
- **Yahoo Finance API**: Stock quotes — useful for portfolio tracking
- **Middleware + route protection**: All working

### Repurpose / Modify
- **Workspaces** → Goals (same DB pattern: user owns goals, goal has sub-items)
- **Source ingestion** → Educational content delivery (system provides content, not user)
- **Chat engine** → Financial advisor (change system prompt, add user profile context)
- **Watchlist** → Portfolio tracker (add quantity, purchase price, investment type)
- **Dashboard** → Goal-centric home with portfolio overview
- **Analytics** → Simple portfolio/goal progress charts
- **Reports** → Monthly financial summaries
- **Compare** → Compare investment options (not individual stocks)

### Remove / Deprioritize
- Source ingestion by user (URLs, pasted text) — layman won't do this
- Research modes (live/hybrid/KB) — just one smart mode
- Sentiment analysis, topic extraction, signal detection — too complex
- Bull/bear reports, risk memos — wrong audience
- "Research stocks like a pro" positioning — wrong message

---

## 6. Database Changes Needed

### New Tables (or modified)
- **user_profiles**: income, expenses, risk_level, financial_goals_summary, onboarding_completed
- **goals**: user_id, name, target_amount, target_date, category (retirement/house/education/wealth/emergency), monthly_contribution, current_progress
- **investments**: user_id, goal_id (nullable), type (mutual_fund/stock/fd/gold/ppf/sip), name, ticker, quantity, purchase_price, purchase_date, current_value
- **learn_topics**: id, title, content, category, difficulty, order
- **user_learn_progress**: user_id, topic_id, completed_at
- **monthly_summaries**: user_id, month, income, expenses, savings, investment_amount, portfolio_value, summary_text

### Tables to Keep
- companies, price_history — useful for portfolio stock prices
- watchlists → rename to portfolio_items or merge with investments
- queries, answers — keep for chat history
- api_cache — keep for caching

### Tables to Possibly Remove or Defer
- sources, source_chunks — user won't be ingesting sources
- reports (as research reports) → repurpose as monthly summaries
- analytics_snapshots — repurpose for goal snapshots
- fundamentals, filings — defer until advanced features

---

## 7. Technical Architecture (What Changes)

### AI System Prompt Changes
Current: "You are a financial research analyst..."
New: "You are a friendly financial advisor for everyday people. The user you're helping has this profile: [income, goals, risk level, portfolio]. Explain everything in simple language. Never use jargon without explaining it. Your job is to help them make smart money decisions."

### Chat Context Changes
Current: RAG over user-ingested sources
New: User's financial profile + portfolio + goals + market data

### New API Needs
- Investment data: Mutual fund NAVs, FD rates, gold prices (in addition to stocks)
- Could use existing Yahoo Finance for mutual fund NAVs
- May need additional Indian market data if targeting Indian users

### Onboarding Flow
- Multi-step form → saves to user_profiles
- Risk assessment quiz → calculates risk_level
- Goal setting wizard → creates initial goals
- Dashboard only shows after onboarding

---

## 8. Priority / Build Order (Suggested)

### Phase 1: Foundation Reset
1. Redesign the data model (user_profiles, goals, investments)
2. Build onboarding flow (income, goals, risk assessment)
3. Reimagine dashboard (goals, portfolio, simple stats)
4. Repurpose AI chat as financial advisor

### Phase 2: Core Features
5. Goal creation and tracking
6. Investment discovery / recommendations
7. Portfolio tracker (manual entry first)
8. Monthly review / summary

### Phase 3: Intelligence
9. Learn Hub (educational content)
10. Smart alerts and suggestions
11. Investment comparison tool
12. Advanced portfolio analytics

### Phase 4: Polish
13. Landing page for real target audience
14. Mobile responsiveness
15. Notifications
16. Onboarding improvements

---

## 9. Key Files Reference

### Currently Working (keep/modify)
- `src/features/auth/` — Auth actions + provider (KEEP)
- `src/lib/supabase/` — All Supabase clients (KEEP)
- `src/lib/ai/groq.js` — LLM integration (KEEP, change prompts)
- `src/components/ui/` — All 12 UI components (KEEP)
- `src/components/layout/` — AppShell + Sidebar (MODIFY for new nav)
- `src/app/(auth)/` — Login/Signup (KEEP)
- `src/app/(app)/layout.js` — Protected layout (KEEP)
- `src/constants/` — Navigation + design tokens (MODIFY)
- `supabase/migrations/001_initial_schema.sql` — DB schema (MODIFY)

### Currently Built But Needs Major Rework
- `src/app/(app)/dashboard/page.js` — Completely different purpose
- `src/app/(app)/workspace/` — Replace with goals system
- `src/app/(app)/analytics/` — Replace with progress/review
- `src/app/(app)/reports/` — Replace with summaries
- `src/app/(app)/compare/` — Replace with investment comparison
- `src/app/(marketing)/page.js` — Rewrite for new audience
- `src/features/chat/actions.js` — Change system prompt + context
- `src/features/workspaces/` — Replace with goals feature
- `src/features/sources/` — Probably remove
- `src/components/dashboard/` — Redesign for new dashboard

### ENV Variables
```
NEXT_PUBLIC_SUPABASE_URL     — Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY — Supabase anon key
SUPABASE_SERVICE_ROLE_KEY    — Supabase service key
GROQ_API_KEY                 — Primary Groq key
GROQ_API_KEY_FALLBACK        — Fallback Groq key
GROQ_MODEL                   — llama-3.3-70b-versatile
TAVILY_API_KEY               — Web search (may still be useful)
NEXT_PUBLIC_APP_URL           — http://localhost:3000
```

---

## 10. Summary

**The core problem**: The system was built as a stock research tool for people who already know investing. The actual target user is a common person who needs to be guided from zero.

**The fix**: Pivot from "Research Copilot" to "Personal Finance Guide." Keep the excellent tech foundation, auth system, UI components, and AI backbone. Rethink every feature through the lens of "would my non-technical cousin understand this?"

**What's salvageable**: ~60-70% of the code. The infrastructure, auth, UI library, AI integration, and layout system are all solid. The features built on top need to be reimagined for a completely different user journey.
