import { createClient } from "@/lib/supabase/server";

export async function listWatchlist() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("watchlists")
    .select("id, company:companies(id, ticker, name, sector)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("listWatchlist error:", error);
    return [];
  }

  return (data ?? []).map((w) => ({
    watchlistId: w.id,
    ...w.company,
  }));
}
