import { createClient } from "@/lib/supabase/server";

export async function listWorkspaces() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("workspaces")
    .select(
      `
      id,
      name,
      description,
      created_at,
      updated_at,
      company:companies(name, ticker),
      sources(count),
      queries(count)
      `
    )
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("listWorkspaces error:", error);
    return [];
  }

  return (data ?? []).map((ws) => ({
    ...ws,
    sourceCount: ws.sources?.[0]?.count ?? 0,
    queryCount: ws.queries?.[0]?.count ?? 0,
  }));
}

export async function getWorkspace(id) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("workspaces")
    .select("id, name, description, created_at, updated_at, company:companies(name, ticker)")
    .eq("id", id)
    .single();

  if (error) {
    return null;
  }

  return data;
}

export async function getDashboardStats() {
  const supabase = await createClient();

  const [workspaces, sources, queries, reports] = await Promise.all([
    supabase.from("workspaces").select("id", { count: "exact", head: true }),
    supabase.from("sources").select("id", { count: "exact", head: true }),
    supabase.from("queries").select("id", { count: "exact", head: true }),
    supabase.from("reports").select("id", { count: "exact", head: true }),
  ]);

  return {
    workspaces: workspaces.count ?? 0,
    sources: sources.count ?? 0,
    queries: queries.count ?? 0,
    reports: reports.count ?? 0,
  };
}

export function formatRelativeTime(timestamp) {
  if (!timestamp) return "";

  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const seconds = Math.floor((now - then) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}
