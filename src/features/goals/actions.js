"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// Reject absurd inputs — anyone with goals above 1 trillion doesn't need
// a budgeting app. Also catches pasted scientific-notation garbage like
// 1e37 that Postgres will store but can't be displayed sanely.
const MAX_AMOUNT = 1e12;

function validateAmount(value, label, { allowZero = false } = {}) {
  const n = Number(value);
  if (!Number.isFinite(n)) return `${label} must be a number`;
  if (n < 0) return `${label} cannot be negative`;
  if (!allowZero && n === 0) return `${label} must be greater than zero`;
  if (n > MAX_AMOUNT) return `${label} is too large (max 1 trillion)`;
  return null;
}

export async function createGoal(formData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const name = formData.get("name")?.toString().trim();
  const category = formData.get("category")?.toString();
  const targetAmount = parseFloat(formData.get("targetAmount"));
  const monthlyContribution = parseFloat(formData.get("monthlyContribution") || "0");
  const targetDate = formData.get("targetDate")?.toString() || null;

  if (!name) return { error: "Goal name is required" };
  if (!category) return { error: "Category is required" };

  const targetError = validateAmount(targetAmount, "Target amount");
  if (targetError) return { error: targetError };

  const monthlyError = validateAmount(monthlyContribution, "Monthly contribution", {
    allowZero: true,
  });
  if (monthlyError) return { error: monthlyError };

  const { error } = await supabase.from("goals").insert({
    user_id: user.id,
    name,
    category,
    target_amount: targetAmount,
    current_saved: 0,
    monthly_contribution: monthlyContribution,
    target_date: targetDate || null,
  });

  if (error) return { error: error.message };

  revalidatePath("/goals");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateGoal(goalId, data) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const updates = {};

  if (data.name !== undefined) {
    const name = data.name?.toString().trim();
    if (!name) return { error: "Goal name cannot be empty" };
    updates.name = name;
  }

  if (data.targetAmount !== undefined) {
    const err = validateAmount(data.targetAmount, "Target amount");
    if (err) return { error: err };
    updates.target_amount = Number(data.targetAmount);
  }

  if (data.currentSaved !== undefined) {
    const err = validateAmount(data.currentSaved, "Saved amount", { allowZero: true });
    if (err) return { error: err };
    updates.current_saved = Number(data.currentSaved);
  }

  if (data.monthlyContribution !== undefined) {
    const err = validateAmount(data.monthlyContribution, "Monthly contribution", {
      allowZero: true,
    });
    if (err) return { error: err };
    updates.monthly_contribution = Number(data.monthlyContribution);
  }

  if (data.targetDate !== undefined) {
    updates.target_date = data.targetDate || null;
  }

  if (data.category !== undefined) updates.category = data.category;
  if (data.status !== undefined) updates.status = data.status;

  if (Object.keys(updates).length === 0) {
    return { error: "Nothing to update" };
  }

  const { error } = await supabase
    .from("goals")
    .update(updates)
    .eq("id", goalId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/goals");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function addToGoalSavings(goalId, amount) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const delta = Number(amount);
  const err = validateAmount(delta, "Amount");
  if (err) return { error: err };

  const { data: goal, error: fetchErr } = await supabase
    .from("goals")
    .select("current_saved, target_amount")
    .eq("id", goalId)
    .eq("user_id", user.id)
    .single();

  if (fetchErr || !goal) return { error: "Goal not found" };

  const newSaved = Math.max(0, Number(goal.current_saved) + delta);

  const capErr = validateAmount(newSaved, "Saved amount", { allowZero: true });
  if (capErr) return { error: capErr };

  const status = newSaved >= Number(goal.target_amount) ? "completed" : "active";

  const { error: updateErr } = await supabase
    .from("goals")
    .update({ current_saved: newSaved, status })
    .eq("id", goalId)
    .eq("user_id", user.id);

  if (updateErr) return { error: updateErr.message };

  revalidatePath("/goals");
  revalidatePath("/dashboard");
  return { success: true, newSaved };
}

export async function togglePauseGoal(goalId) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { data: goal, error: fetchErr } = await supabase
    .from("goals")
    .select("status")
    .eq("id", goalId)
    .eq("user_id", user.id)
    .single();

  if (fetchErr || !goal) return { error: "Goal not found" };

  const nextStatus = goal.status === "paused" ? "active" : "paused";

  const { error } = await supabase
    .from("goals")
    .update({ status: nextStatus })
    .eq("id", goalId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/goals");
  revalidatePath("/dashboard");
  return { success: true, status: nextStatus };
}

export async function deleteGoal(goalId) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("goals")
    .delete()
    .eq("id", goalId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/goals");
  revalidatePath("/dashboard");
  return { success: true };
}
