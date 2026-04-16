const EMERGENCY_TARGET_MONTHS = 6;
const SAVINGS_RATE_TARGET = 0.2;
const SAFE_CONCENTRATION = 15;

function clamp(n, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

function scoreEmergencyFund({ goals, profile }) {
  const monthlyExpenses = Number(profile?.monthly_expenses) || 0;
  const target = monthlyExpenses * EMERGENCY_TARGET_MONTHS;
  const fund = goals.find((g) => g.category === "emergency_fund");
  const saved = Number(fund?.current_saved) || 0;

  if (monthlyExpenses <= 0) {
    return {
      score: null,
      label: "Not enough info",
      detail: "Add your monthly expenses in settings to see this.",
      months: 0,
      targetMonths: EMERGENCY_TARGET_MONTHS,
    };
  }

  const months = saved / monthlyExpenses;
  const score = clamp((months / EMERGENCY_TARGET_MONTHS) * 100);

  let label;
  if (months >= EMERGENCY_TARGET_MONTHS) label = "Well protected";
  else if (months >= 3) label = "Halfway there";
  else if (months >= 1) label = "Getting started";
  else label = "Exposed";

  return {
    score: Math.round(score),
    label,
    months: +months.toFixed(1),
    targetMonths: EMERGENCY_TARGET_MONTHS,
    saved,
    target,
  };
}

function scoreDiversification({ portfolio }) {
  const holdings = portfolio?.holdings || [];
  const totalValue = portfolio?.totalValue || 0;

  if (holdings.length === 0 || totalValue <= 0) {
    return {
      score: null,
      label: "No investments yet",
      detail: "Start investing to see diversification insights.",
      topWeight: 0,
      holdingsCount: 0,
    };
  }

  const weights = holdings
    .map((h) => ({
      ticker: h.ticker,
      name: h.name,
      weight: (h.currentValue / totalValue) * 100,
    }))
    .sort((a, b) => b.weight - a.weight);

  const topWeight = weights[0].weight;
  const holdingsCount = holdings.length;

  let concentrationScore;
  if (topWeight <= SAFE_CONCENTRATION) concentrationScore = 100;
  else if (topWeight <= 30) concentrationScore = 100 - (topWeight - SAFE_CONCENTRATION) * (40 / 15);
  else if (topWeight <= 50) concentrationScore = 60 - (topWeight - 30) * (30 / 20);
  else concentrationScore = Math.max(0, 30 - (topWeight - 50) * 0.6);

  const countBonus = holdingsCount >= 10 ? 0 : holdingsCount >= 5 ? -5 : holdingsCount >= 3 ? -15 : -30;
  const score = clamp(concentrationScore + countBonus);

  let label;
  if (score >= 80) label = "Well diversified";
  else if (score >= 60) label = "Decent spread";
  else if (score >= 40) label = "Concentrated";
  else label = "Very concentrated";

  return {
    score: Math.round(score),
    label,
    topWeight: +topWeight.toFixed(1),
    topHolding: weights[0],
    holdingsCount,
    weights,
  };
}

function scoreSavingsRate({ profile }) {
  const income = Number(profile?.monthly_income) || 0;
  const expenses = Number(profile?.monthly_expenses) || 0;

  if (income <= 0) {
    return {
      score: null,
      label: "Not enough info",
      detail: "Share your monthly income to see this.",
      rate: 0,
    };
  }

  const surplus = Math.max(0, income - expenses);
  const rate = surplus / income;
  const score = clamp((rate / SAVINGS_RATE_TARGET) * 100);

  let label;
  if (rate >= 0.3) label = "Excellent";
  else if (rate >= SAVINGS_RATE_TARGET) label = "On target";
  else if (rate >= 0.1) label = "Could improve";
  else if (rate > 0) label = "Tight";
  else label = "Break-even or worse";

  return {
    score: Math.round(score),
    label,
    rate: +(rate * 100).toFixed(1),
    surplus: +surplus.toFixed(0),
    income,
    expenses,
  };
}

function scoreGoalTrajectory({ goals }) {
  const active = goals.filter((g) => g.status !== "completed" && g.status !== "paused");

  if (active.length === 0) {
    return {
      score: null,
      label: "No goals set",
      detail: "Add a goal to start tracking progress.",
      onTrack: 0,
      total: 0,
    };
  }

  let total = 0;
  let onTrackCount = 0;
  let behindCount = 0;
  let noContribCount = 0;

  for (const g of active) {
    switch (g.projectionStatus) {
      case "completed":
        total += 100;
        onTrackCount++;
        break;
      case "on_track":
        total += 100;
        onTrackCount++;
        break;
      case "tracking":
        total += 70;
        break;
      case "behind":
        total += 35;
        behindCount++;
        break;
      case "no_contribution":
        total += 15;
        noContribCount++;
        break;
      default:
        total += 50;
    }
  }

  const score = total / active.length;
  let label;
  if (score >= 85) label = "On track";
  else if (score >= 60) label = "Mostly on track";
  else if (score >= 40) label = "Slipping";
  else label = "Behind";

  return {
    score: Math.round(score),
    label,
    onTrack: onTrackCount,
    behind: behindCount,
    noContribution: noContribCount,
    total: active.length,
  };
}

export function computeHealthScore({ profile, portfolio, goals }) {
  const emergency = scoreEmergencyFund({ goals, profile });
  const diversification = scoreDiversification({ portfolio });
  const savings = scoreSavingsRate({ profile });
  const trajectory = scoreGoalTrajectory({ goals });

  const subs = [
    { key: "emergency", weight: 0.3, ...emergency },
    { key: "savings", weight: 0.25, ...savings },
    { key: "trajectory", weight: 0.25, ...trajectory },
    { key: "diversification", weight: 0.2, ...diversification },
  ];

  const available = subs.filter((s) => s.score != null);
  const totalWeight = available.reduce((sum, s) => sum + s.weight, 0);
  const overall = totalWeight > 0
    ? Math.round(available.reduce((sum, s) => sum + s.score * s.weight, 0) / totalWeight)
    : null;

  let overallLabel = "Getting started";
  if (overall == null) overallLabel = "Not enough info";
  else if (overall >= 80) overallLabel = "Strong";
  else if (overall >= 65) overallLabel = "Healthy";
  else if (overall >= 45) overallLabel = "Needs work";
  else overallLabel = "At risk";

  return {
    overall,
    overallLabel,
    coverage: Math.round((available.length / subs.length) * 100),
    subs: { emergency, diversification, savings, trajectory },
  };
}
