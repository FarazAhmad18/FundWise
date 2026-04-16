import { getProfile } from "@/features/profile/queries";
import { getMarketConfig } from "@/constants/markets";
import { listTransactions } from "@/features/transactions/queries";
import TransactionsClient from "./TransactionsClient";

export const metadata = {
  title: "Transactions | Fundwise",
};

export default async function TransactionsPage({ searchParams }) {
  const sp = await searchParams;
  const profile = await getProfile();
  const marketConfig = getMarketConfig(profile?.country_code);
  const transactions = await listTransactions();

  return (
    <TransactionsClient
      transactions={transactions}
      currency={profile?.currency || marketConfig.currency}
      locale={marketConfig.locale}
      exchangeSuffix={marketConfig.exchangeSuffix}
      popularTickers={marketConfig.popularTickers || []}
      prefillTicker={sp?.ticker || ""}
      prefillPrice={sp?.price || ""}
    />
  );
}
