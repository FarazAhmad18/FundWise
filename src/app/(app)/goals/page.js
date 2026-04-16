import { getProfile } from "@/features/profile/queries";
import { getMarketConfig } from "@/constants/markets";
import { listGoals } from "@/features/goals/queries";
import GoalsClient from "./GoalsClient";

export const metadata = {
  title: "Goals | Fundwise",
};

export default async function GoalsPage() {
  const profile = await getProfile();
  const marketConfig = getMarketConfig(profile?.country_code);
  const goals = await listGoals();

  return (
    <GoalsClient
      goals={goals}
      currency={profile?.currency || marketConfig.currency}
      monthlyExpenses={Number(profile?.monthly_expenses) || 0}
      monthlyIncome={Number(profile?.monthly_income) || 0}
    />
  );
}
