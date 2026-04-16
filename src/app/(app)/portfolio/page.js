import { getProfile } from "@/features/profile/queries";
import {
  getPortfolioSummary,
  getPortfolioHistory,
} from "@/features/transactions/queries";
import { getMarketConfig } from "@/constants/markets";
import { getIndex } from "@/lib/external/stockPrice";
import { createClient } from "@/lib/supabase/server";
import PortfolioClient from "./PortfolioClient";

export const metadata = {
  title: "Portfolio | Fundwise",
};

export default async function PortfolioPage() {
  const supabase = await createClient();
  const profile = await getProfile();
  const marketConfig = getMarketConfig(profile?.country_code);

  // Primary benchmark index for this market
  const primaryIndex = marketConfig.indexes?.[0] || null;

  // Recent transactions for timeline
  const { data: txns } = await supabase
    .from("transactions")
    .select(
      "id, type, quantity, price_per_unit, total_amount, transaction_date, company:companies(ticker, name)"
    )
    .order("transaction_date", { ascending: false })
    .limit(15);

  const [portfolio, initialHistory, benchmark] = await Promise.all([
    getPortfolioSummary(),
    getPortfolioHistory("3M"),
    primaryIndex ? getIndex(primaryIndex) : null,
  ]);

  return (
    <PortfolioClient
      portfolio={portfolio}
      initialHistory={initialHistory}
      benchmark={benchmark}
      transactions={txns || []}
      currency={profile?.currency || marketConfig.currency}
      locale={marketConfig.locale}
      marketConfig={marketConfig}
    />
  );
}
