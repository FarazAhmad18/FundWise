import { createClient } from "@/lib/supabase/server";

export async function listSources(workspaceId) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("sources")
    .select("id, source_type, title, url, publisher, published_at, status, created_at")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("listSources error:", error);
    return [];
  }

  return data ?? [];
}
