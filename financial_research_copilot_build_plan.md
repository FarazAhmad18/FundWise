# Financial Research Copilot — AI Agent Build Blueprint

## Project Identity

**Project Name:** Financial Research Copilot  
**Goal:** Build a premium, chat-first financial intelligence platform that combines live web research, source-grounded answers, a persistent research base, and analytics dashboards for company and market research.  
**Primary Stack:** Next.js, JavaScript, Supabase Postgres, Vercel, Groq  
**Priority:** Portfolio-quality product with premium UI and strong interview storytelling  

---

## 1. Product Vision

This is **not** a basic RAG app and **not** just a “paste links and ask questions” tool.

This product should feel like a modern **AI-powered equity research terminal** for individual users.

It must combine four layers:

1. **Chat Layer**  
   Natural language conversation with an analyst-style assistant.

2. **Live Research Layer**  
   Browse live finance/news websites at query time.

3. **Knowledge Base Layer**  
   Store and reuse previously ingested research sources, articles, notes, and generated reports.

4. **Analytics Layer**  
   Visualize trends, sentiment, themes, source coverage, event timeline, and research patterns.

---

## 2. Product Positioning

### One-line Description
A chat-based financial research copilot that browses live sources, searches a private research base, and turns unstructured financial information into source-backed insights and analytics.

### CV Positioning
Built a premium full-stack financial research copilot using Next.js, Supabase, and Groq that combines live web research, retrieval-augmented generation, grounded citations, and analytics dashboards for company and market intelligence.

### Interview Positioning
This project solves a real workflow problem: analysts and serious investors often need to gather information from multiple websites, cross-check sources, preserve research history, and turn raw text into usable intelligence. The platform reduces manual reading and improves research traceability.

---

## 3. Non-Negotiable Product Principles

### 3.1 Chat-First
The main user experience must be chat-based. The user should feel they are speaking with an intelligent research assistant, not filling out forms.

### 3.2 Live Web + Research Base
Answers should be able to use:
- live websites
- previously ingested sources
- or both combined

### 3.3 Source Transparency
Every answer must show the resources used:
- source title
- URL
- optional snippet/excerpt
- clear visual attribution

### 3.4 Strong Analytics
This cannot be a plain chatbot. It must include a visible analytics layer.

### 3.5 Premium UI
**No compromise on UI.**
The app should look like a modern premium SaaS product, not a tutorial dashboard.

### 3.6 Modular Build
The project must be built in well-defined chunks. The AI agent must never attempt the whole app in one giant step.

### 3.7 Documentation for Interview Prep
For each chunk, the AI agent must create a separate markdown note that explains:
- what was built
- why it exists
- how it works
- core concepts involved
- interview questions you might get

---

## 4. Tech Stack

### Frontend
- Next.js (App Router)
- JavaScript
- Tailwind CSS
- shadcn/ui if helpful
- Framer Motion for premium motion and transitions
- Recharts for analytics

### Backend
- Next.js route handlers / server actions
- JavaScript only

### Database & Auth
- Supabase Postgres
- Supabase Auth
- Supabase Storage if needed

### AI
- Groq for chat/completions
- Free or low-cost embedding path as the agent sees fit
- Embedding and LLM layers must be abstracted for future replacement

### Financial Data APIs
- Alpha Vantage (free tier — real-time and historical stock prices, company fundamentals, technical indicators)
- SEC EDGAR (free government API — 10-K, 10-Q, 8-K filings for RAG ingestion)
- Caching layer in Supabase to respect rate limits and avoid redundant fetches

### Hosting
- Vercel

---

## 5. Primary User Experience

A user should be able to:

1. create a research workspace
2. ask a natural language financial question
3. let the system browse live websites and/or search stored research
4. receive a grounded answer
5. see exact sources used
6. inspect supporting evidence
7. open analytics for trends and patterns
8. generate structured research reports
9. revisit query history later

---

## 6. Core Screens

### 6.1 Landing Page
Purpose:
- explain product clearly
- make product feel premium
- showcase demo visuals

Must include:
- strong hero
- product value proposition
- screenshot previews
- feature blocks
- CTA to start

### 6.2 Auth Screen
- login/signup
- clean and minimal
- consistent with premium design system

### 6.3 Dashboard / Home
Purpose:
- overview of workspaces and recent activity

Must include:
- workspace cards
- recent queries
- recent reports
- quick actions
- watchlist/company summary cards

### 6.4 Workspace Screen (Main Product Screen)
This is the most important screen.

Must include:
- main chat area
- source panel
- analytics panel or tab
- workspace source list
- research controls
- report generation actions
- price chart and key financial metrics panel
- sentiment vs price divergence indicators

Possible layout:
- left sidebar: navigation + workspaces
- center: chat conversation
- right: sources/evidence/analytics tabs

### 6.5 Report Screen
Must render structured reports such as:
- executive summary
- risks
- bullish signals
- bearish signals
- key events
- open questions
- source list

### 6.6 Compare Screen
Compare two companies or research workspaces.

Must include:
- side-by-side structured comparison
- sentiment contrast
- risk contrast
- catalyst contrast
- overall evidence-backed summary

### 6.7 Analytics Screen
Must include meaningful visual analysis.

Possible cards/charts:
- sentiment distribution
- sentiment over time
- topic frequency
- source distribution
- event timeline
- company mention frequency
- bullish vs bearish signal balance

### 6.8 Settings Screen
- profile
- AI settings (read-only or configurable)
- provider status
- model info
- workspace preferences

---

## 7. Core Features

### 7.1 Chat-Based Research Assistant
The assistant should answer finance-related user questions in natural language.

Examples:
- What are the major risks currently being discussed about Tesla?
- Compare Apple and Microsoft based on recent news.
- Summarize the latest earnings narrative around Nvidia.

The response must:
- be grounded in retrieved/live sources
- avoid unsupported claims
- cite sources clearly

### 7.2 Live Web Browsing
The system should be able to fetch and use live web sources at query time.

Modes:
- Live Web only
- Research Base only
- Hybrid

### 7.3 Research Base / RAG Memory
The system should store and reuse:
- ingested URLs
- extracted article text
- pasted notes
- generated reports
- prior research material

### 7.4 Source Transparency
Every answer should show:
- title
- URL
- optional excerpt/snippet
- source chip/card

### 7.5 Structured Reports
One-click generation for:
- company summary
- risk memo
- bullish vs bearish memo
- comparison report
- event timeline
- research digest

### 7.6 Analytics Layer
This is a major differentiator.

Must include:
- sentiment analytics
- theme/topic clustering or counts
- event extraction/timeline
- source coverage metrics
- company/entity mention counts
- bullish vs bearish signal split

### 7.7 Comparison Engine
User can compare two companies or two workspaces.

### 7.8 Query History
Store conversations and prior outputs for later review.

### 7.9 Workspace Management
Create and manage separate research spaces.

### 7.10 Watchlist Experience
Allow user to track selected companies or themes.

### 7.11 Real Financial Data Integration
The system should pull real financial data from external APIs to ground research in actual market data, not just news sentiment.

Data types:
- stock price (current, historical, intraday)
- key fundamentals (market cap, P/E, EPS, revenue, margins)
- technical indicators (moving averages, RSI, volume trends)
- SEC filings (10-K, 10-Q annual/quarterly reports)

Capabilities:
- price chart alongside sentiment analysis in workspace view
- divergence detection: highlight when sentiment and price move in opposite directions
- auto-ingest SEC filings into the research base for RAG queries
- company cards display real financial metrics, not just text summaries
- cache all API responses in Supabase to respect free-tier rate limits

---

## 8. Suggested Data Model

Main entities:
- users
- workspaces
- companies
- articles
- sources
- source_chunks
- queries
- answers
- reports
- analytics_snapshots
- watchlists

Suggested tables:

### users
- id
- email
- created_at

### companies
- id
- name
- ticker
- sector
- created_at

### workspaces
- id
- user_id
- company_id nullable
- name
- description
- created_at
- updated_at

### sources
- id
- workspace_id
- source_type (live_url, pasted_note, generated_report)
- title
- url nullable
- publisher nullable
- published_at nullable
- raw_text
- clean_text
- status
- created_at

### source_chunks
- id
- source_id
- workspace_id
- chunk_index
- content
- metadata_json
- created_at

### queries
- id
- workspace_id
- user_id
- query_text
- mode (live, knowledge_base, hybrid)
- created_at

### answers
- id
- query_id
- answer_text
- sources_json
- evidence_json
- created_at

### reports
- id
- workspace_id
- user_id
- report_type
- title
- content_json
- created_at

### analytics_snapshots
- id
- workspace_id
- snapshot_type
- payload_json
- created_at

### watchlists
- id
- user_id
- company_id
- created_at

### price_history
- id
- company_id
- date
- open
- high
- low
- close
- volume
- source (alpha_vantage, etc.)
- created_at

### fundamentals
- id
- company_id
- metric_name (market_cap, pe_ratio, eps, revenue, gross_margin, etc.)
- metric_value
- period (Q1_2025, FY_2024, etc.)
- fetched_at
- created_at

### filings
- id
- company_id
- workspace_id nullable
- filing_type (10-K, 10-Q, 8-K)
- filing_date
- title
- url
- raw_text
- clean_text
- status (pending, ingested, failed)
- created_at

### api_cache
- id
- provider (alpha_vantage, sec_edgar)
- endpoint
- params_hash
- response_json
- expires_at
- created_at

---

## 9. System Architecture

### High Level

```text
User Interface (Next.js)
   |
   +--> Chat Interface
   +--> Sources Panel
   +--> Analytics Views
   |
Server Layer (Next.js Route Handlers / Server Actions)
   |
   +--> Supabase Auth
   +--> Supabase Postgres
   +--> Live Web Fetch/Parse Layer
   +--> Research Base Retrieval Layer
   +--> Embedding / Vector Layer
   +--> Groq LLM Layer
   +--> Financial Data API Layer (Alpha Vantage + SEC EDGAR)
   +--> API Response Cache (Supabase)
   |
Rendered grounded answers + reports + analytics + real financial data
```

### Architectural Style
Use a **modular monolith**.
Do not split into multiple repos or services at the start.

---

## 10. Product Modes

### Mode A — Live Web
System browses current web sources to answer a question.

### Mode B — Research Base
System searches stored workspace sources and answers from them.

### Mode C — Hybrid
System combines live sources and stored sources.

This mode system must be visible to the user in the UI.

---

## 11. Analytics Requirements

This app needs real analytics, not filler charts.

### Minimum meaningful analytics:

#### 11.1 Sentiment Analysis
At source/chunk/report level:
- positive
- negative
- neutral

Show:
- distribution chart
- trend over time
- company sentiment card

#### 11.2 Topic / Theme Analysis
Extract recurring topics such as:
- margins
- supply chain
- regulation
- earnings
- growth
- layoffs
- demand

Show:
- top topics
- topic frequency
- topic trend if possible

#### 11.3 Event Timeline
Extract notable events from sources.

Show:
- chronological cards or timeline
- why event matters

#### 11.4 Source Coverage Analytics
Show:
- number of sources by publisher
- source freshness
- article count by workspace

#### 11.5 Bullish vs Bearish Signal Analysis
System identifies signals from source content and visualizes balance.

#### 11.6 Query Analytics
Show:
- recent query history
- common query themes
- most referenced sources

#### 11.7 Price vs Sentiment Correlation
Overlay sentiment trends with actual stock price movement.

Show:
- price chart with sentiment overlay
- divergence alerts (sentiment bullish but price dropping, or vice versa)
- volume spikes correlated with news events
- fundamentals snapshot alongside qualitative research

#### 11.8 Fundamentals Dashboard
Show:
- key financial metrics (P/E, EPS, revenue, margins)
- period-over-period comparison
- sector-relative positioning if data available

---

## 12. UI / UX Standards

## This section is non-negotiable.

The AI agent must not produce a generic dashboard.

### Visual Direction
The product should feel like:
- premium SaaS
- modern AI terminal
- clean financial intelligence workspace
- high-end product, not student project

### UI Requirements
- excellent spacing
- strong typography hierarchy
- clean card design
- dark/light polish, but dark-first is acceptable
- motion and micro-interactions
- elegant loading states / skeletons
- polished empty states
- no cramped layout
- no ugly default tables unless styled beautifully
- no random colors
- no “basic admin panel” feel

### Components That Must Feel Premium
- chat messages
- source cards
- workspace cards
- analytics charts
- report sections
- compare layout
- search and command inputs

### Nice-to-Have Premium Patterns
- command palette
- sticky source drawer
- animated transitions between states
- collapsible evidence panels
- beautiful onboarding flow

---

## 13. AI Response Design

### 13.1 Grounded Answer Format
Each answer should try to return:
- concise answer
- key evidence points
- resources used
- confidence / evidence sufficiency note

### 13.2 Structured Report Format
Reports should use structured sections.

### 13.3 Insufficient Evidence Behavior
If sources are weak, say so clearly.
Do not hallucinate.

---

## 14. Chunked Build Plan (Critical)

The AI agent **must build this project chunk by chunk**.
Do not attempt everything in one pass.

Each chunk should:
1. have a clear goal
2. produce working output
3. be commit-worthy
4. include its own markdown explanation file

---

## 15. Required Chunk Sequence

## Chunk 0 — Project Foundation
### Goal
Create project structure and design system foundation.

### Deliverables
- Next.js app initialized
- Tailwind configured
- design system tokens
- core layout shell
- route structure
- Supabase integration skeleton
- environment setup

### Required markdown file
`docs/chunks/chunk-0-foundation.md`

### Concepts to explain in doc
- Next.js App Router
- modular monolith approach
- Supabase role in architecture
- why design system first matters

---

## Chunk 1 — Premium UI Shell
### Goal
Build the full premium UI shell before business logic.

### Deliverables
- landing page
- auth page
- dashboard layout
- workspace layout shell
- analytics screen shell
- report screen shell
- compare screen shell
- premium reusable components

### Required markdown file
`docs/chunks/chunk-1-ui-shell.md`

### Concepts to explain
- layout hierarchy
- reusable UI components
- why UI shell first helps faster iteration
- UX choices for chat + analytics products

---

## Chunk 2 — Auth + Database Foundation
### Goal
Implement authentication and database schema.

### Deliverables
- Supabase auth
- protected routes
- base schema
- workspace CRUD
- company/watchlist schema

### Required markdown file
`docs/chunks/chunk-2-auth-db.md`

### Concepts to explain
- auth flow
- Postgres tables
- row ownership / security thinking
- relationship modeling

---

## Chunk 3 — Workspace Management
### Goal
Let users create and manage research workspaces.

### Deliverables
- create workspace
- rename/delete/archive workspace
- company association
- workspace list UI

### Required markdown file
`docs/chunks/chunk-3-workspaces.md`

### Concepts to explain
- workspace concept
- why workspace separation matters in AI products
- state management choices

---

## Chunk 4 — Source Ingestion Layer
### Goal
Support adding sources into a workspace.

### Deliverables
- URL input flow
- pasted text/manual note flow
- source list UI
- basic source parsing/cleaning pipeline
- source statuses

### Required markdown file
`docs/chunks/chunk-4-ingestion.md`

### Concepts to explain
- data ingestion
- parsing challenges
- normalization and cleaning
- why source metadata matters

---

## Chunk 5 — Chunking + Retrieval Base
### Goal
Build the storage and retrieval basis for research data.

### Deliverables
- chunking logic
- chunk persistence
- embedding abstraction
- retrieval pipeline skeleton
- source evidence mapping

### Required markdown file
`docs/chunks/chunk-5-retrieval.md`

### Concepts to explain
- chunking
- embeddings
- semantic search
- RAG basics
- why chunk overlap matters

---

## Chunk 6 — Chat Engine (Research Base Mode)
### Goal
Enable chat over stored workspace data.

### Deliverables
- workspace chat input
- retrieval-backed answer generation
- source cards shown in UI
- answer persistence
- query history

### Required markdown file
`docs/chunks/chunk-6-chat-rag.md`

### Concepts to explain
- retrieval-augmented generation
- grounding
- hallucination control
- source attribution design

---

## Chunk 7 — Live Web Research Mode
### Goal
Support live web research at query time.

### Deliverables
- mode toggle (live / stored / hybrid)
- live source fetching pipeline
- live sources panel in answer
- answer generation using live sources

### Required markdown file
`docs/chunks/chunk-7-live-research.md`

### Concepts to explain
- live retrieval vs stored retrieval
- freshness tradeoffs
- web source trust and transparency

---

## Chunk 8 — Hybrid Research Mode
### Goal
Combine live web and research base answers.

### Deliverables
- hybrid retrieval orchestration
- de-duplication or source merging logic
- UI indicators showing origin of evidence

### Required markdown file
`docs/chunks/chunk-8-hybrid-mode.md`

### Concepts to explain
- multi-source orchestration
- source merging
- tradeoffs in combined evidence systems

---

## Chunk 9 — Reports Engine
### Goal
Generate structured research outputs.

### Deliverables
- report generation actions
- report view screen
- company summary report
- bullish/bearish report
- risk memo
- event timeline report

### Required markdown file
`docs/chunks/chunk-9-reports.md`

### Concepts to explain
- structured outputs
- schema-driven UI rendering
- report pipelines

---

## Chunk 10 — Analytics Engine
### Goal
Implement meaningful analytics.

### Deliverables
- sentiment analysis pipeline
- topic/theme extraction
- event timeline analytics
- source analytics
- dashboard charts

### Required markdown file
`docs/chunks/chunk-10-analytics.md`

### Concepts to explain
- sentiment analysis
- theme extraction
- event extraction
- why analytics strengthens the product

---

## Chunk 11 — Compare Engine
### Goal
Allow company/workspace comparison.

### Deliverables
- compare screen
- structured compare output
- compare analytics cards

### Required markdown file
`docs/chunks/chunk-11-compare.md`

### Concepts to explain
- comparative analysis systems
- evidence-backed comparisons
- UI patterns for side-by-side reasoning

---

## Chunk 12 — Real Financial Data Integration
### Goal
Connect the platform to real financial APIs so workspaces display actual market data alongside qualitative research.

### Deliverables
- Alpha Vantage integration (stock prices, historical data, key fundamentals)
- SEC EDGAR integration (fetch and ingest 10-K/10-Q filings into research base)
- API response caching layer in Supabase (respect rate limits, avoid redundant calls)
- price chart component in workspace view
- key metrics cards (market cap, P/E, EPS, revenue, margins)
- sentiment vs price overlay in analytics
- divergence detection (flag when sentiment and price trend in opposite directions)
- auto-ingest SEC filings as workspace sources for RAG
- fundamentals dashboard panel

### Required markdown file
`docs/chunks/chunk-12-financial-data.md`

### Concepts to explain in doc
- third-party API integration patterns
- API rate limiting and caching strategies
- financial data normalization
- price-sentiment correlation analysis
- SEC EDGAR data structure and parsing
- why real data grounds a research product

---

## Chunk 13 — Polish, Reliability, and Performance
### Goal
Make the app feel production-quality.

### Deliverables
- loading states
- skeletons
- empty states
- toasts/errors
- caching improvements
- mobile responsiveness
- performance cleanup
- final UI polish

### Required markdown file
`docs/chunks/chunk-13-polish.md`

### Concepts to explain
- UX polish
- performance mindset
- cost control
- reliability considerations

---

## 16. Required Documentation Track

The AI agent must create **two documentation directions** for interview prep.

### Direction A — Project Flow and Working
These docs explain:
- what the chunk implements
- how it fits into the bigger system
- data flow
- user flow
- request/response flow

### Direction B — Concepts Used
These docs explain:
- architecture concepts
- AI concepts
- database concepts
- frontend concepts
- tradeoffs and reasoning

### Required structure

```text
docs/
  chunks/
    chunk-0-foundation.md
    chunk-1-ui-shell.md
    ...
    chunk-12-financial-data.md
    chunk-13-polish.md
  concepts/
    nextjs-app-router.md
    supabase-auth.md
    postgres-relations.md
    rag-basics.md
    embeddings.md
    semantic-search.md
    source-grounding.md
    sentiment-analysis.md
    event-extraction.md
    analytics-design.md
    prompt-design.md
    live-web-retrieval.md
    hybrid-research-systems.md
    financial-api-integration.md
    api-caching-strategies.md
    price-sentiment-correlation.md
    sec-edgar-data.md
```

### Documentation rule
Whenever a chunk is completed, the AI agent must also generate:
1. the chunk implementation
2. the chunk markdown explanation
3. any new concept markdown files required for that chunk

---

## 17. Agent Execution Rules

These are strict instructions for the AI coding agent.

### Rule 1
Do not attempt the entire project in one go.
Always work chunk by chunk.

### Rule 2
Before coding a chunk, restate:
- chunk goal
- files likely to be touched
- expected deliverable

### Rule 3
After coding a chunk, generate its chunk markdown documentation.

### Rule 4
Whenever a new important concept appears, generate or update a concept markdown file.

### Rule 5
Do not accept weak UI.
If UI looks generic, redesign it before moving on.

### Rule 6
Prefer clean architecture over fast hacks.

### Rule 7
Keep code modular and explainable.
This project must be easy for the user to discuss in interviews.

### Rule 8
Do not bury business logic inside large UI files.

### Rule 9
Keep provider abstractions clean so Groq or embeddings provider can be swapped later.

### Rule 10
Make each chunk shippable and understandable.

---

## 18. Suggested File Structure

```text
src/
  app/
    (marketing)/
    dashboard/
    workspace/[id]/
    compare/
    reports/[id]/
    settings/
    api/
  components/
    ui/
    layout/
    chat/
    sources/
    analytics/
    reports/
    compare/
  lib/
    supabase/
    ai/
    retrieval/
    analytics/
    financial/
    parsing/
    utils/
  features/
    auth/
    workspaces/
    ingestion/
    chat/
    reports/
    compare/
    analytics/
    financial/
  styles/
  hooks/
  constants/

docs/
  chunks/
  concepts/
```

---

## 19. Success Criteria

The project is successful if:
- it looks premium enough to impress recruiters
- it feels like a real product, not a tutorial clone
- chat is usable and grounded
- live browsing works
- sources are visible and trustworthy
- analytics add real value
- reports are structured and useful
- you can explain architecture and concepts confidently in interviews

---

## 20. Final Instruction to Agent

Build this as a **premium financial research copilot**, not as a generic RAG demo.

Focus on:
- excellent UI
- chunked development
- clean architecture
- evidence-backed outputs
- strong analytics
- clear documentation for interview preparation

Every chunk must leave the project in a better, demonstrable, and explainable state.

