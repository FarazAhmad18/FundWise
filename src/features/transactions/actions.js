"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addTransaction(formData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const ticker = formData.get("ticker")?.toString().trim().toUpperCase();
  const type = formData.get("type")?.toString();
  const quantity = parseFloat(formData.get("quantity"));
  const pricePerUnit = parseFloat(formData.get("pricePerUnit"));
  const fees = parseFloat(formData.get("fees") || "0");
  const transactionDate = formData.get("transactionDate")?.toString();
  const notes = formData.get("notes")?.toString().trim() || null;
  const currency = formData.get("currency")?.toString() || "USD";
  const companyName = formData.get("companyName")?.toString().trim() || ticker;

  // Validation
  if (!ticker) return { error: "Ticker is required" };
  if (!type || !["buy", "sell"].includes(type)) return { error: "Type must be buy or sell" };
  if (!quantity || quantity <= 0) return { error: "Quantity must be greater than 0" };
  if (pricePerUnit == null || pricePerUnit < 0) return { error: "Price is required" };
  if (!transactionDate) return { error: "Date is required" };

  // Look up or create company
  let companyId;
  const { data: existing } = await supabase
    .from("companies")
    .select("id")
    .eq("ticker", ticker)
    .single();

  if (existing) {
    companyId = existing.id;
  } else {
    const { data: newCompany, error: companyError } = await supabase
      .from("companies")
      .insert({ ticker, name: companyName })
      .select("id")
      .single();

    if (companyError) return { error: "Failed to register company: " + companyError.message };
    companyId = newCompany.id;
  }

  // If selling, check that user has enough shares
  if (type === "sell") {
    const { data: txns } = await supabase
      .from("transactions")
      .select("type, quantity")
      .eq("user_id", user.id)
      .eq("company_id", companyId);

    const currentShares = (txns || []).reduce((acc, t) => {
      return t.type === "buy" ? acc + Number(t.quantity) : acc - Number(t.quantity);
    }, 0);

    if (quantity > currentShares) {
      return { error: `Cannot sell ${quantity} shares. You only hold ${currentShares}.` };
    }
  }

  const totalAmount = quantity * pricePerUnit + fees;

  const { error } = await supabase.from("transactions").insert({
    user_id: user.id,
    company_id: companyId,
    type,
    quantity,
    price_per_unit: pricePerUnit,
    total_amount: totalAmount,
    fees,
    currency,
    transaction_date: transactionDate,
    notes,
  });

  if (error) return { error: error.message };

  revalidatePath("/portfolio");
  revalidatePath("/portfolio/transactions");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteTransaction(transactionId) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", transactionId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/portfolio");
  revalidatePath("/portfolio/transactions");
  revalidatePath("/dashboard");
  return { success: true };
}

/**
 * Delete all transactions for a company — removes the holding entirely.
 */
export async function deleteHolding(companyId) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("company_id", companyId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/portfolio");
  revalidatePath("/portfolio/transactions");
  revalidatePath("/dashboard");
  return { success: true };
}

/**
 * Replace all transactions for a company with a single corrected entry.
 * Effectively lets the user "edit" a holding's shares and average cost.
 */
export async function updateHolding(companyId, { shares, avgCost, currency }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  if (!shares || shares <= 0) return { error: "Shares must be greater than 0" };
  if (avgCost == null || avgCost < 0) return { error: "Average cost is required" };

  // Delete existing transactions for this company
  const { error: delErr } = await supabase
    .from("transactions")
    .delete()
    .eq("company_id", companyId)
    .eq("user_id", user.id);

  if (delErr) return { error: delErr.message };

  // Insert a single corrected buy transaction
  const totalAmount = shares * avgCost;
  const { error: insErr } = await supabase.from("transactions").insert({
    user_id: user.id,
    company_id: companyId,
    type: "buy",
    quantity: shares,
    price_per_unit: avgCost,
    total_amount: totalAmount,
    fees: 0,
    currency: currency || "USD",
    transaction_date: new Date().toISOString().split("T")[0],
    notes: "Holding corrected",
  });

  if (insErr) return { error: insErr.message };

  revalidatePath("/portfolio");
  revalidatePath("/portfolio/transactions");
  revalidatePath("/dashboard");
  return { success: true };
}
