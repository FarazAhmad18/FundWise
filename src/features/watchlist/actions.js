"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addToWatchlist(formData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const ticker = formData.get("ticker")?.toString().trim().toUpperCase();
  const name = formData.get("name")?.toString().trim() || ticker;

  if (!ticker) return { error: "Ticker is required" };
  if (ticker.length > 10) return { error: "Ticker too long" };

  // Upsert company by ticker
  const { data: existing } = await supabase
    .from("companies")
    .select("id")
    .eq("ticker", ticker)
    .maybeSingle();

  let companyId = existing?.id;

  if (!companyId) {
    const { data: created, error: createErr } = await supabase
      .from("companies")
      .insert({ ticker, name })
      .select("id")
      .single();

    if (createErr) return { error: createErr.message };
    companyId = created.id;
  }

  const { error: watchErr } = await supabase
    .from("watchlists")
    .insert({ user_id: user.id, company_id: companyId });

  if (watchErr) {
    if (watchErr.code === "23505") {
      return { error: "Already in watchlist" };
    }
    return { error: watchErr.message };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

export async function removeFromWatchlist(companyId) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("watchlists")
    .delete()
    .eq("company_id", companyId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  return { success: true };
}
