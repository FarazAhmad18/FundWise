-- ============================================
-- Financial Research Copilot — Initial Schema
-- ============================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- Enable pgvector for embeddings (RAG semantic search)
create extension if not exists vector;

-- ============================================
-- COMPANIES
-- ============================================
create table companies (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  ticker text not null unique,
  sector text,
  created_at timestamptz default now() not null
);

create index idx_companies_ticker on companies(ticker);

-- ============================================
-- WORKSPACES
-- ============================================
create table workspaces (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company_id uuid references companies(id) on delete set null,
  name text not null,
  description text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index idx_workspaces_user on workspaces(user_id);

-- ============================================
-- SOURCES
-- ============================================
create table sources (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  source_type text not null check (source_type in ('live_url', 'pasted_note', 'generated_report', 'filing')),
  title text not null,
  url text,
  publisher text,
  published_at timestamptz,
  raw_text text,
  clean_text text,
  status text not null default 'pending' check (status in ('pending', 'processing', 'ingested', 'failed')),
  created_at timestamptz default now() not null
);

create index idx_sources_workspace on sources(workspace_id);

-- ============================================
-- SOURCE CHUNKS (for RAG)
-- ============================================
create table source_chunks (
  id uuid primary key default uuid_generate_v4(),
  source_id uuid not null references sources(id) on delete cascade,
  workspace_id uuid not null references workspaces(id) on delete cascade,
  chunk_index integer not null,
  content text not null,
  metadata_json jsonb default '{}',
  embedding vector(384),
  created_at timestamptz default now() not null
);

create index idx_chunks_source on source_chunks(source_id);
create index idx_chunks_workspace on source_chunks(workspace_id);

-- ============================================
-- QUERIES
-- ============================================
create table queries (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  query_text text not null,
  mode text not null default 'hybrid' check (mode in ('live', 'knowledge_base', 'hybrid')),
  created_at timestamptz default now() not null
);

create index idx_queries_workspace on queries(workspace_id);
create index idx_queries_user on queries(user_id);

-- ============================================
-- ANSWERS
-- ============================================
create table answers (
  id uuid primary key default uuid_generate_v4(),
  query_id uuid not null references queries(id) on delete cascade,
  answer_text text not null,
  sources_json jsonb default '[]',
  evidence_json jsonb default '[]',
  created_at timestamptz default now() not null
);

create index idx_answers_query on answers(query_id);

-- ============================================
-- REPORTS
-- ============================================
create table reports (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  report_type text not null check (report_type in ('company_summary', 'risk_memo', 'bullish_bearish', 'comparison', 'event_timeline', 'research_digest')),
  title text not null,
  content_json jsonb not null default '{}',
  created_at timestamptz default now() not null
);

create index idx_reports_workspace on reports(workspace_id);

-- ============================================
-- ANALYTICS SNAPSHOTS
-- ============================================
create table analytics_snapshots (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  snapshot_type text not null check (snapshot_type in ('sentiment', 'topics', 'events', 'source_coverage', 'signals')),
  payload_json jsonb not null default '{}',
  created_at timestamptz default now() not null
);

create index idx_analytics_workspace on analytics_snapshots(workspace_id);

-- ============================================
-- WATCHLISTS
-- ============================================
create table watchlists (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company_id uuid not null references companies(id) on delete cascade,
  created_at timestamptz default now() not null,
  unique(user_id, company_id)
);

create index idx_watchlists_user on watchlists(user_id);

-- ============================================
-- PRICE HISTORY (Alpha Vantage data)
-- ============================================
create table price_history (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid not null references companies(id) on delete cascade,
  date date not null,
  open numeric,
  high numeric,
  low numeric,
  close numeric not null,
  volume bigint,
  source text default 'alpha_vantage',
  created_at timestamptz default now() not null,
  unique(company_id, date)
);

create index idx_price_company_date on price_history(company_id, date desc);

-- ============================================
-- FUNDAMENTALS
-- ============================================
create table fundamentals (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid not null references companies(id) on delete cascade,
  metric_name text not null,
  metric_value numeric,
  period text,
  fetched_at timestamptz default now() not null,
  created_at timestamptz default now() not null
);

create index idx_fundamentals_company on fundamentals(company_id);

-- ============================================
-- FILINGS (SEC EDGAR)
-- ============================================
create table filings (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid not null references companies(id) on delete cascade,
  workspace_id uuid references workspaces(id) on delete set null,
  filing_type text not null check (filing_type in ('10-K', '10-Q', '8-K')),
  filing_date date not null,
  title text not null,
  url text,
  raw_text text,
  clean_text text,
  status text not null default 'pending' check (status in ('pending', 'ingested', 'failed')),
  created_at timestamptz default now() not null
);

create index idx_filings_company on filings(company_id);

-- ============================================
-- API CACHE
-- ============================================
create table api_cache (
  id uuid primary key default uuid_generate_v4(),
  provider text not null check (provider in ('alpha_vantage', 'sec_edgar')),
  endpoint text not null,
  params_hash text not null,
  response_json jsonb not null,
  expires_at timestamptz not null,
  created_at timestamptz default now() not null,
  unique(provider, endpoint, params_hash)
);

create index idx_cache_lookup on api_cache(provider, endpoint, params_hash);
create index idx_cache_expiry on api_cache(expires_at);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

alter table workspaces enable row level security;
alter table sources enable row level security;
alter table source_chunks enable row level security;
alter table queries enable row level security;
alter table answers enable row level security;
alter table reports enable row level security;
alter table analytics_snapshots enable row level security;
alter table watchlists enable row level security;

-- Workspaces: users can only access their own
create policy "Users can view own workspaces"
  on workspaces for select
  using (auth.uid() = user_id);

create policy "Users can create own workspaces"
  on workspaces for insert
  with check (auth.uid() = user_id);

create policy "Users can update own workspaces"
  on workspaces for update
  using (auth.uid() = user_id);

create policy "Users can delete own workspaces"
  on workspaces for delete
  using (auth.uid() = user_id);

-- Sources: through workspace ownership
create policy "Users can view sources in own workspaces"
  on sources for select
  using (workspace_id in (select id from workspaces where user_id = auth.uid()));

create policy "Users can create sources in own workspaces"
  on sources for insert
  with check (workspace_id in (select id from workspaces where user_id = auth.uid()));

create policy "Users can delete sources in own workspaces"
  on sources for delete
  using (workspace_id in (select id from workspaces where user_id = auth.uid()));

-- Source chunks: through workspace ownership
create policy "Users can view chunks in own workspaces"
  on source_chunks for select
  using (workspace_id in (select id from workspaces where user_id = auth.uid()));

create policy "Users can create chunks in own workspaces"
  on source_chunks for insert
  with check (workspace_id in (select id from workspaces where user_id = auth.uid()));

-- Queries: users can only access their own
create policy "Users can view own queries"
  on queries for select
  using (auth.uid() = user_id);

create policy "Users can create own queries"
  on queries for insert
  with check (auth.uid() = user_id);

-- Answers: through query ownership
create policy "Users can view answers to own queries"
  on answers for select
  using (query_id in (select id from queries where user_id = auth.uid()));

create policy "Users can create answers to own queries"
  on answers for insert
  with check (query_id in (select id from queries where user_id = auth.uid()));

-- Reports: through workspace ownership
create policy "Users can view own reports"
  on reports for select
  using (auth.uid() = user_id);

create policy "Users can create own reports"
  on reports for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own reports"
  on reports for delete
  using (auth.uid() = user_id);

-- Analytics: through workspace ownership
create policy "Users can view analytics in own workspaces"
  on analytics_snapshots for select
  using (workspace_id in (select id from workspaces where user_id = auth.uid()));

-- Watchlists: users can only manage their own
create policy "Users can view own watchlist"
  on watchlists for select
  using (auth.uid() = user_id);

create policy "Users can manage own watchlist"
  on watchlists for insert
  with check (auth.uid() = user_id);

create policy "Users can remove from own watchlist"
  on watchlists for delete
  using (auth.uid() = user_id);

-- Companies, price_history, fundamentals, filings, api_cache:
-- Public read access (shared reference data)
-- No RLS needed for read-only reference tables

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at
  before update on workspaces
  for each row
  execute function update_updated_at();
