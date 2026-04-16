import { listConversations } from "@/features/advisor/queries";
import { getProfile } from "@/features/profile/queries";
import { getPortfolioSummary } from "@/features/transactions/queries";
import { listGoals } from "@/features/goals/queries";
import { computeHealthScore } from "@/features/advisor/healthScore";
import { generateInsights, personalizedPrompts } from "@/features/advisor/insights";
import AdvisorClient from "./AdvisorClient";

export const metadata = {
  title: "AI Advisor | Fundwise",
};

export default async function AdvisorPage() {
  const [profile, portfolio, goals, conversations] = await Promise.all([
    getProfile(),
    getPortfolioSummary(),
    listGoals(),
    listConversations(),
  ]);

  const health = computeHealthScore({ profile, portfolio, goals });
  const insights = generateInsights({ profile, portfolio, goals, health });
  const prompts = personalizedPrompts({ profile, portfolio, goals, health, insights });

  const userName =
    profile?.display_name ||
    profile?.full_name ||
    null;

  return (
    <AdvisorClient
      conversations={conversations}
      health={health}
      insights={insights}
      suggestedPrompts={prompts}
      userName={userName}
      currency={profile?.currency || "USD"}
      profile={{
        income: profile?.monthly_income ?? null,
        expenses: profile?.monthly_expenses ?? null,
        risk: profile?.risk_level ?? "moderate",
      }}
    />
  );
}
