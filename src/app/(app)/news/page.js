import { getProfile } from "@/features/profile/queries";
import { getMarketConfig } from "@/constants/markets";
import { fetchMarketNews, fetchStockNews } from "@/features/news/queries";
import { enrichArticles } from "@/features/news/intelligence";
import { generateBriefing } from "@/features/news/briefing";
import { getHoldings } from "@/features/transactions/queries";
import { createClient } from "@/lib/supabase/server";
import NewsClient from "./NewsClient";

export const metadata = {
  title: "News | Fundwise",
};

export default async function NewsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const profile = await getProfile();
  const marketConfig = getMarketConfig(profile?.country_code);
  const userName =
    user?.user_metadata?.full_name?.split(" ")[0] ||
    user?.email?.split("@")[0] ||
    "there";

  const [marketNews, holdings] = await Promise.all([
    fetchMarketNews(marketConfig.newsQuery, 12),
    getHoldings(),
  ]);

  const heldTickers = holdings.map((h) => h.ticker);
  const stockNews = heldTickers.length > 0
    ? await fetchStockNews(heldTickers, 8)
    : [];

  // Enrich with sentiment + tickers + category
  const enrichedMarket = enrichArticles(marketNews, marketConfig.popularTickers);
  const enrichedStocks = enrichArticles(stockNews, marketConfig.popularTickers);

  // Generate AI briefing in parallel (best effort — don't block if it fails)
  const briefing = await generateBriefing({
    articles: enrichedMarket,
    holdings,
    marketName: marketConfig.name,
    userName,
  });

  return (
    <NewsClient
      marketNews={enrichedMarket}
      stockNews={enrichedStocks}
      hasHoldings={heldTickers.length > 0}
      marketName={marketConfig.name}
      popularTickers={marketConfig.popularTickers}
      userName={userName}
      briefing={briefing}
    />
  );
}
