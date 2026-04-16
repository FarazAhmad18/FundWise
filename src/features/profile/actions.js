"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getMarketConfig } from "@/constants/markets";

export async function createProfile(data) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const marketConfig = getMarketConfig(data.countryCode);

  const { error } = await supabase.from("user_profiles").insert({
    user_id: user.id,
    country_code: data.countryCode,
    currency: marketConfig.currency,
    exchange_suffix: marketConfig.exchangeSuffix,
    risk_level: data.riskLevel || "moderate",
    monthly_income: data.monthlyIncome || null,
    monthly_expenses: data.monthlyExpenses || null,
    investment_experience: data.investmentExperience || "beginner",
    onboarding_completed: false,
  });

  if (error) {
    // Profile might already exist (e.g., re-visiting onboarding)
    if (error.code === "23505") {
      const { error: updateError } = await supabase
        .from("user_profiles")
        .update({
          country_code: data.countryCode,
          currency: marketConfig.currency,
          exchange_suffix: marketConfig.exchangeSuffix,
          risk_level: data.riskLevel || "moderate",
          monthly_income: data.monthlyIncome || null,
          monthly_expenses: data.monthlyExpenses || null,
          investment_experience: data.investmentExperience || "beginner",
        })
        .eq("user_id", user.id);

      if (updateError) return { error: updateError.message };
      return { success: true };
    }
    return { error: error.message };
  }

  return { success: true };
}

export async function completeOnboarding() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("user_profiles")
    .update({ onboarding_completed: true })
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function updateProfile(data) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const updates = {};

  if (data.countryCode) {
    const marketConfig = getMarketConfig(data.countryCode);
    updates.country_code = data.countryCode;
    updates.currency = marketConfig.currency;
    updates.exchange_suffix = marketConfig.exchangeSuffix;
  }
  if (data.riskLevel) updates.risk_level = data.riskLevel;
  if (data.monthlyIncome !== undefined) updates.monthly_income = data.monthlyIncome || null;
  if (data.monthlyExpenses !== undefined) updates.monthly_expenses = data.monthlyExpenses || null;
  if (data.investmentExperience) updates.investment_experience = data.investmentExperience;

  const { error } = await supabase
    .from("user_profiles")
    .update(updates)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/settings");
  return { success: true };
}
