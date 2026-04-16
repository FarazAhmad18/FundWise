-- ============================================
-- p1Finance Pivot — New Tables
-- ============================================
-- Adds: user_profiles, transactions, conversations, messages, goals
-- Keeps all existing tables intact (no drops)

-- ============================================
-- USER PROFILES
-- ============================================
create table user_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  country_code text not null default 'US',
  currency text not null default 'USD',
  exchange_suffix text not null default '',
  risk_level text default 'moderate' check (risk_level in ('conservative', 'moderate', 'aggressive')),
  monthly_income numeric,
  monthly_expenses numeric,
  investment_experience text default 'beginner' check (investment_experience in ('beginner', 'intermediate', 'advanced')),
  onboarding_completed boolean not null default false,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index idx_user_profiles_user on user_profiles(user_id);

alter table user_profiles enable row level security;

create policy "Users can view own profile"
  on user_profiles for select
  using (auth.uid() = user_id);

create policy "Users can create own profile"
  on user_profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update own profile"
  on user_profiles for update
  using (auth.uid() = user_id);

create trigger set_user_profiles_updated_at
  before update on user_profiles
  for each row execute function update_updated_at();

-- ============================================
-- TRANSACTIONS (buy/sell records)
-- ============================================
create table transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company_id uuid not null references companies(id) on delete restrict,
  type text not null check (type in ('buy', 'sell')),
  quantity numeric not null check (quantity > 0),
  price_per_unit numeric not null check (price_per_unit >= 0),
  total_amount numeric not null,
  fees numeric default 0,
  currency text not null default 'USD',
  transaction_date date not null,
  notes text,
  created_at timestamptz default now() not null
);

create index idx_transactions_user on transactions(user_id);
create index idx_transactions_user_company on transactions(user_id, company_id);
create index idx_transactions_date on transactions(user_id, transaction_date desc);

alter table transactions enable row level security;

create policy "Users can view own transactions"
  on transactions for select
  using (auth.uid() = user_id);

create policy "Users can create own transactions"
  on transactions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own transactions"
  on transactions for update
  using (auth.uid() = user_id);

create policy "Users can delete own transactions"
  on transactions for delete
  using (auth.uid() = user_id);

-- ============================================
-- CONVERSATIONS (AI advisor chat sessions)
-- ============================================
create table conversations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'New Conversation',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index idx_conversations_user on conversations(user_id);

alter table conversations enable row level security;

create policy "Users can view own conversations"
  on conversations for select
  using (auth.uid() = user_id);

create policy "Users can create own conversations"
  on conversations for insert
  with check (auth.uid() = user_id);

create policy "Users can update own conversations"
  on conversations for update
  using (auth.uid() = user_id);

create policy "Users can delete own conversations"
  on conversations for delete
  using (auth.uid() = user_id);

create trigger set_conversations_updated_at
  before update on conversations
  for each row execute function update_updated_at();

-- ============================================
-- MESSAGES (within conversations)
-- ============================================
create table messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  metadata_json jsonb default '{}',
  created_at timestamptz default now() not null
);

create index idx_messages_conversation on messages(conversation_id);

alter table messages enable row level security;

create policy "Users can view messages in own conversations"
  on messages for select
  using (conversation_id in (select id from conversations where user_id = auth.uid()));

create policy "Users can create messages in own conversations"
  on messages for insert
  with check (conversation_id in (select id from conversations where user_id = auth.uid()));

-- ============================================
-- GOALS (financial goals)
-- ============================================
create table goals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text not null check (category in ('retirement', 'house', 'education', 'emergency_fund', 'wealth', 'custom')),
  target_amount numeric not null check (target_amount > 0),
  current_saved numeric not null default 0,
  monthly_contribution numeric default 0,
  target_date date,
  notes text,
  status text not null default 'active' check (status in ('active', 'completed', 'paused')),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index idx_goals_user on goals(user_id);

alter table goals enable row level security;

create policy "Users can view own goals"
  on goals for select
  using (auth.uid() = user_id);

create policy "Users can create own goals"
  on goals for insert
  with check (auth.uid() = user_id);

create policy "Users can update own goals"
  on goals for update
  using (auth.uid() = user_id);

create policy "Users can delete own goals"
  on goals for delete
  using (auth.uid() = user_id);

create trigger set_goals_updated_at
  before update on goals
  for each row execute function update_updated_at();

-- ============================================
-- EXPAND API CACHE PROVIDERS
-- ============================================
alter table api_cache drop constraint api_cache_provider_check;
alter table api_cache add constraint api_cache_provider_check
  check (provider in ('alpha_vantage', 'sec_edgar', 'yahoo_finance', 'tavily'));
