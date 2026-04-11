# PostgreSQL Relations & Schema Design

## Core Relationship Types

### One-to-Many
A user has many workspaces. A workspace has many sources.

```sql
create table workspaces (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  -- one user → many workspaces
);
```

### Many-to-Many (via Join Table)
Users can watch many companies. Companies can be watched by many users.

```sql
create table watchlists (
  id uuid primary key,
  user_id uuid references auth.users(id),
  company_id uuid references companies(id),
  unique(user_id, company_id)  -- prevent duplicates
);
```

### Optional Association
A workspace may or may not be linked to a company.

```sql
create table workspaces (
  company_id uuid references companies(id) on delete set null,
  -- nullable = optional relationship
);
```

## Cascade Behavior

`on delete cascade` means: when the parent is deleted, children are automatically removed.

```
Delete user → all their workspaces deleted
  → all sources in those workspaces deleted
    → all chunks for those sources deleted
```

`on delete set null` means: when the parent is deleted, the foreign key becomes null (preserving the child).

```
Delete company → workspace.company_id becomes null
  → workspace still exists, just unlinked
```

## Row Level Security (RLS)

RLS policies run at the database level, enforcing access control regardless of application code:

```sql
-- Only the workspace owner can read their workspaces
create policy "Users can view own workspaces"
  on workspaces for select
  using (auth.uid() = user_id);
```

`auth.uid()` returns the currently authenticated user's ID from the JWT token. This means:
- Direct database queries are filtered automatically
- Even if application code has a bug, unauthorized data is never returned
- No need to add `WHERE user_id = ?` to every query

## Schema Design Decisions

### UUIDs vs Auto-Increment
UUIDs prevent enumeration attacks (user can't guess workspace IDs by incrementing), are safe for distributed systems, and work well with Supabase's default patterns.

### JSONB Columns
`sources_json`, `evidence_json`, `content_json`, `payload_json` use JSONB for flexible nested data that varies by type. For example, a risk report's content structure is different from an earnings summary — JSONB accommodates both without schema changes.

### Timestamps
Every table has `created_at` with a default of `now()`. Tables that track modifications also have `updated_at` with a trigger that auto-updates it.

### Check Constraints
Enumerated values use check constraints instead of separate lookup tables:

```sql
source_type text not null check (source_type in ('live_url', 'pasted_note', 'generated_report', 'filing'))
```

This is simpler than a foreign key to an enum table and enforces data integrity at the database level.

## The Data Flow

```
User creates Workspace
  → Adds Sources (URLs, notes, filings)
    → Sources are chunked into Source Chunks
      → Chunks get embeddings (vector column)
  → User asks a Query
    → System retrieves relevant chunks
    → LLM generates an Answer with source citations
  → User generates a Report from accumulated research
  → Analytics Snapshots capture sentiment/topic trends
```

## Interview Questions

**Q: Why UUIDs instead of auto-increment IDs?**
A: UUIDs prevent sequential enumeration (security), work in distributed systems, and are Supabase's default pattern. The slight size overhead is worth the security benefit.

**Q: When would you use JSONB vs separate tables?**
A: JSONB for semi-structured data that varies by type (report content, analytics payloads). Separate tables for structured data you need to query, filter, or join on (sources, queries, workspaces).

**Q: How does RLS compare to application-level auth checks?**
A: RLS is defense-in-depth — it runs at the database level, so even buggy application code can't leak data. Application-level checks are still useful for UX (showing appropriate UI), but RLS is the security boundary.
