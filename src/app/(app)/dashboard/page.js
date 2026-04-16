import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/features/profile/queries";
import { getMarketConfig, formatCurrency } from "@/constants/markets";
import { getPortfolioSummary, getPortfolioHistory } from "@/features/transactions/queries";
import { listGoals } from "@/features/goals/queries";
import { getQuotes, getIndexes } from "@/lib/external/stockPrice";
import { fetchMarketNews } from "@/features/news/queries";
import { listWatchlist } from "@/features/watchlist/queries";
import DashboardClient from "./DashboardClient";

export const metadata = {
  title: "Dashboard | Fundwise",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const profile = await getProfile();
  const marketConfig = getMarketConfig(profile?.country_code);
  const currency = profile?.currency || marketConfig.currency;
  const userName =
    user?.user_metadata?.full_name?.split(" ")[0] ||
    user?.email?.split("@")[0] ||
    "there";

  const [portfolio, goals, watchlist, news, initialHistory, indexes] = await Promise.all([
    getPortfolioSummary(),
    listGoals(),
    listWatchlist(),
    fetchMarketNews(marketConfig.newsQuery, 4),
    getPortfolioHistory("1M"),
    getIndexes(marketConfig.indexes || []),
  ]);

  const watchlistTickers = watchlist.map((w) => w.company?.ticker).filter(Boolean);
  const popularTickers = marketConfig.popularTickers;
  const allTickerKeys = [...new Set([
    ...popularTickers.map((t) => t.ticker),
    ...watchlistTickers,
  ])];
  const quotes = await getQuotes(allTickerKeys);

  const activeGoals = goals.filter((g) => g.status === "active");

  return (
    <DashboardClient
      userName={userName}
      currency={currency}
      profile={profile}
      portfolio={portfolio}
      initialHistory={initialHistory}
      activeGoals={activeGoals}
      allGoals={goals}
      watchlist={watchlist}
      quotes={quotes}
      news={news}
      indexes={indexes}
      popularTickers={popularTickers}
      marketConfig={marketConfig}
    />
  );
}
