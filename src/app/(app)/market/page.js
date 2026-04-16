import { getProfile } from "@/features/profile/queries";
import { getMarketConfig, MARKETS } from "@/constants/markets";
import { getQuotes, getIndexes } from "@/lib/external/stockPrice";
import MarketClient from "./MarketClient";

export const metadata = {
  title: "Market | Fundwise",
};

export default async function MarketPage({ searchParams }) {
  const { market } = await searchParams;
  const profile = await getProfile();

  // Use query param if provided, otherwise fall back to user's profile market
  const marketKey = (market && MARKETS[market]) ? market : (profile?.country_code || "US");
  const marketConfig = getMarketConfig(marketKey);

  const tickers = marketConfig.popularTickers.map((t) => t.ticker);

  const [quotes, indexes] = await Promise.all([
    getQuotes(tickers),
    getIndexes(marketConfig.indexes || []),
  ]);

  // Build list of available markets for the switcher
  const availableMarkets = Object.entries(MARKETS).map(([code, m]) => ({
    code,
    name: m.name,
    flag: m.flag,
    currency: m.currency,
  }));

  return (
    <MarketClient
      marketConfig={marketConfig}
      popularStocks={marketConfig.popularTickers}
      quotes={quotes}
      indexes={indexes}
      currency={profile?.currency || marketConfig.currency}
      activeMarket={marketKey}
      availableMarkets={availableMarkets}
      userMarket={profile?.country_code || "US"}
    />
  );
}
