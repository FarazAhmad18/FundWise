import { formatCurrency } from "@/constants/markets";

function fmt(amount, currency) {
  return formatCurrency(amount, currency);
}

function pushIf(list, cond, insight) {
  if (cond) list.push(insight);
}

export function generateInsights({ profile, portfolio, goals, health }) {
  const currency = profile?.currency || "USD";
  const insights = [];

  const { emergency, diversification, savings, trajectory } = health.subs;

  if (emergency.score != null && emergency.months < 1) {
    insights.push({
      id: "emergency-critical",
      severity: "critical",
      icon: "shield",
      title: "You have less than 1 month of expenses saved",
      body: `If you lost your income tomorrow, you couldn't cover rent, groceries, or bills. Build to ${emergency.targetMonths} months of expenses (${fmt(emergency.target, currency)}) before anything else.`,
      action: { label: "Create emergency fund goal", href: "/goals/new?category=emergency_fund" },
      prompt: "How do I start an emergency fund from scratch?",
    });
  } else if (emergency.score != null && emergency.months < 3) {
    insights.push({
      id: "emergency-warning",
      severity: "warning",
      icon: "shield",
      title: `${emergency.months} months of expenses saved — aim for ${emergency.targetMonths}`,
      body: `You're ${fmt(emergency.target - emergency.saved, currency)} away from a full emergency fund. Prioritize this over new investments until you're covered.`,
      action: { label: "Boost emergency fund", href: "/goals" },
      prompt: "How fast should I fill up my emergency fund?",
    });
  } else if (emergency.score != null && emergency.months > 9) {
    const excess = (emergency.months - emergency.targetMonths) * emergency.saved / emergency.months;
    insights.push({
      id: "emergency-excess",
      severity: "info",
      icon: "piggy",
      title: `You have ${emergency.months} months of cash — ${(emergency.months - 6).toFixed(0)} more than needed`,
      body: `Cash sitting beyond ${emergency.targetMonths} months loses value to inflation. Consider deploying ~${fmt(excess, currency)} toward long-term goals.`,
      prompt: `I have extra cash beyond my emergency fund. Where should I put it?`,
    });
  }

  if (diversification.score != null && diversification.topWeight > 40) {
    const top = diversification.topHolding;
    insights.push({
      id: "concentration-risk",
      severity: diversification.topWeight > 60 ? "critical" : "warning",
      icon: "pie",
      title: `${top.name} is ${top.weight.toFixed(0)}% of your portfolio`,
      body: `A single bad quarter for ${top.name} could wipe out months of gains. Most advisors suggest keeping any single stock under 15–20% of holdings.`,
      action: { label: `See ${top.ticker.split(".")[0]}`, href: `/market/${encodeURIComponent(top.ticker)}` },
      prompt: `Should I reduce my position in ${top.name}? It's ${top.weight.toFixed(0)}% of my portfolio.`,
    });
  }

  if (diversification.score != null && diversification.holdingsCount === 1) {
    insights.push({
      id: "single-holding",
      severity: "warning",
      icon: "pie",
      title: "All your money is in one stock",
      body: "You're exposed to the fortunes of a single company. Even solid businesses can drop 30–50% in a bad year. Spreading across 5–10 holdings reduces that risk sharply.",
      prompt: "How do I diversify starting from one stock?",
    });
  }

  if (savings.score != null && savings.rate < 10 && savings.income > 0) {
    insights.push({
      id: "low-savings",
      severity: "warning",
      icon: "trend",
      title: `You're saving ${savings.rate.toFixed(0)}% of your income`,
      body: `A 20% savings rate is what most financial guides suggest for long-term security. Even finding ${fmt(savings.income * 0.05, currency)}/month more would compound meaningfully over time.`,
      prompt: "How do I increase my savings rate without feeling squeezed?",
    });
  } else if (savings.score != null && savings.rate >= 25) {
    insights.push({
      id: "strong-savings",
      severity: "positive",
      icon: "trend",
      title: `Saving ${savings.rate.toFixed(0)}% — you're ahead of most people`,
      body: `At this rate you have ${fmt(savings.surplus * 12, currency)}/year to put toward investments and goals. Let's make sure it's working as hard as you are.`,
      prompt: "I save aggressively. How should I deploy my monthly surplus?",
    });
  } else if (savings.score == null) {
    insights.push({
      id: "missing-income",
      severity: "info",
      icon: "info",
      title: "Add your income and expenses to unlock personalized advice",
      body: "Without knowing what you earn and spend, I can only give generic advice. Two numbers in settings let me tell you exactly how much to save, invest, and keep liquid.",
      action: { label: "Complete profile", href: "/settings" },
    });
  }

  const behindGoals = goals.filter(
    (g) => g.projectionStatus === "behind" && g.status !== "completed"
  );
  for (const g of behindGoals.slice(0, 2)) {
    const remaining = g.target_amount - g.current_saved;
    const monthsToTarget = g.target_date
      ? Math.max(1, Math.ceil((new Date(g.target_date) - new Date()) / (30.4 * 86400 * 1000)))
      : null;
    const neededMonthly = monthsToTarget ? remaining / monthsToTarget : null;
    const gap = neededMonthly ? neededMonthly - (g.monthly_contribution || 0) : null;

    insights.push({
      id: `goal-behind-${g.id}`,
      severity: "warning",
      icon: "goal",
      title: `Your "${g.name}" goal is behind`,
      body: gap && gap > 0
        ? `At ${fmt(g.monthly_contribution || 0, currency)}/month you'll miss your target date. Bumping to ${fmt(neededMonthly, currency)}/month (+${fmt(gap, currency)}) gets you there on time.`
        : `You'll finish later than your target date. Consider increasing contributions or moving the deadline.`,
      action: { label: "Adjust goal", href: `/goals` },
      prompt: `My "${g.name}" goal is behind schedule. What are my options?`,
      metrics: { remaining, neededMonthly, currentMonthly: g.monthly_contribution },
    });
  }

  const onTrackGoals = goals.filter((g) => g.projectionStatus === "on_track");
  pushIf(insights, onTrackGoals.length >= 2, {
    id: "goals-on-track",
    severity: "positive",
    icon: "check",
    title: `${onTrackGoals.length} of your goals are on track`,
    body: "Keep your contributions consistent and you'll hit these targets. Consistency beats intensity in personal finance.",
  });

  if (portfolio.holdingsCount === 0 && savings.score != null && savings.surplus > 0) {
    insights.push({
      id: "start-investing",
      severity: "info",
      icon: "spark",
      title: `You have ${fmt(savings.surplus, currency)}/month uninvested`,
      body: `After an emergency fund, putting your surplus into diversified investments is the main lever for long-term wealth. I can walk you through the first steps.`,
      prompt: "I'm ready to start investing. Where do I begin?",
    });
  }

  if (portfolio.holdingsCount > 0 && portfolio.totalPnlPct < -15) {
    insights.push({
      id: "drawdown",
      severity: "info",
      icon: "down",
      title: `Your portfolio is down ${portfolio.totalPnlPct.toFixed(1)}%`,
      body: "Drawdowns feel terrible but they're normal. Selling during a dip locks in the loss. Let's talk through whether your thesis has actually changed.",
      prompt: "My portfolio is down. Should I sell, hold, or buy more?",
    });
  }

  const sevOrder = { critical: 0, warning: 1, info: 2, positive: 3 };
  insights.sort((a, b) => sevOrder[a.severity] - sevOrder[b.severity]);

  return insights;
}

export function personalizedPrompts({ profile, portfolio, goals, health, insights }) {
  const prompts = [];
  const seen = new Set();
  const push = (text) => {
    if (!seen.has(text)) {
      prompts.push(text);
      seen.add(text);
    }
  };

  for (const ins of insights) {
    if (ins.prompt) push(ins.prompt);
    if (prompts.length >= 4) break;
  }

  if (prompts.length < 4 && portfolio.holdingsCount > 0) {
    push("How risky is my current portfolio?");
  }
  if (prompts.length < 4 && goals.length > 0) {
    push("Which of my goals should I prioritize?");
  }
  if (prompts.length < 4) {
    push("What's the single most important thing I should do next?");
  }

  return prompts.slice(0, 4);
}
