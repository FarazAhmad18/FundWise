import { createClient } from "@/lib/supabase/server";

export async function listGoals() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("goals")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("listGoals error:", error);
    return [];
  }

  return (data ?? []).map((goal) => ({
    ...goal,
    ...calculateProjection(goal),
  }));
}

function monthsBetween(from, to) {
  const fromYear = from.getFullYear();
  const fromMonth = from.getMonth();
  const toYear = to.getFullYear();
  const toMonth = to.getMonth();
  return (toYear - fromYear) * 12 + (toMonth - fromMonth);
}

function calculateProjection(goal) {
  const target = Number(goal.target_amount) || 0;
  const saved = Number(goal.current_saved) || 0;
  const monthly = Number(goal.monthly_contribution) || 0;
  const remaining = Math.max(0, target - saved);
  const progress = target > 0 ? Math.min(100, (saved / target) * 100) : 0;

  // Completed
  if (remaining <= 0 && target > 0) {
    return {
      progress: 100,
      projectionStatus: "completed",
      monthsRemaining: 0,
      projectedDate: null,
      requiredMonthlyForTargetDate: 0,
      catchupMonthly: 0,
      targetMonths: null,
    };
  }

  // No monthly contribution set
  if (monthly <= 0) {
    if (goal.target_date) {
      const months = monthsBetween(new Date(), new Date(goal.target_date));
      const required = months > 0 ? remaining / months : null;
      return {
        progress,
        projectionStatus: "no_contribution",
        monthsRemaining: null,
        projectedDate: null,
        requiredMonthlyForTargetDate: required,
        catchupMonthly: 0,
        targetMonths: months,
      };
    }
    return {
      progress,
      projectionStatus: "no_contribution",
      monthsRemaining: null,
      projectedDate: null,
      requiredMonthlyForTargetDate: null,
      catchupMonthly: 0,
      targetMonths: null,
    };
  }

  // Has monthly contribution
  const monthsToTarget = Math.ceil(remaining / monthly);
  const projectedDate = new Date();
  projectedDate.setMonth(projectedDate.getMonth() + monthsToTarget);

  if (goal.target_date) {
    const targetDate = new Date(goal.target_date);
    const monthsUntilTarget = monthsBetween(new Date(), targetDate);
    const required = monthsUntilTarget > 0 ? remaining / monthsUntilTarget : null;
    const onTrack = projectedDate <= targetDate;
    const catchup =
      !onTrack && monthsUntilTarget > 0
        ? Math.max(0, required - monthly)
        : 0;
    return {
      progress,
      projectionStatus: onTrack ? "on_track" : "behind",
      monthsRemaining: monthsToTarget,
      projectedDate: projectedDate.toISOString(),
      requiredMonthlyForTargetDate: required,
      catchupMonthly: catchup,
      targetMonths: monthsUntilTarget,
    };
  }

  return {
    progress,
    projectionStatus: "tracking",
    monthsRemaining: monthsToTarget,
    projectedDate: projectedDate.toISOString(),
    requiredMonthlyForTargetDate: null,
    catchupMonthly: 0,
    targetMonths: null,
  };
}
