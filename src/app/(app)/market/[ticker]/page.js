import { getProfile } from "@/features/profile/queries";
import { getMarketConfig, findSimilarStocks } from "@/constants/markets";
import { getHistory } from "@/lib/external/stockPrice";
import { fetchStockNews } from "@/features/news/queries";
import { getHoldings } from "@/features/transactions/queries";
import { listWatchlist } from "@/features/watchlist/queries";
import StockDetailClient from "./StockDetailClient";
import StockNotFound from "./StockNotFound";

export async function generateMetadata({ params }) {
  const { ticker } = await params;
  return { title: `${decodeURIComponent(ticker)} | Fundwise` };
}

export default async function StockDetailPage({ params }) {
  const { ticker } = await params;
  const decodedTicker = decodeURIComponent(ticker);

  // Fetch profile first so we know which market to suggest from if the ticker fails
  const profile = await getProfile();
  const marketConfig = getMarketConfig(profile?.country_code);

  // Fetch quote first — cheap and tells us if the stock exists
  const quoteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/quote/${encodeURIComponent(decodedTicker)}`;
  const quoteRes = await fetch(quoteUrl, { next: { revalidate: 300 } });

  if (!quoteRes.ok) {
    // Stock doesn't exist — show "Did you mean?" page
    const suggestions = findSimilarStocks(marketConfig, decodedTicker, 4);
    return (
      <StockNotFound
        attemptedTicker={decodedTicker}
        suggestions={suggestions}
        marketName={marketConfig.name}
        exchangeName={marketConfig.exchangeName}
      />
    );
  }

  const quote = await quoteRes.json();

  // Now fetch everything else in parallel (we only do this for valid tickers)
  const [history, news, holdings, watchlist] = await Promise.all([
    getHistory(decodedTicker, "1y"),
    fetchStockNews([decodedTicker], 5),
    getHoldings().catch(() => []),
    listWatchlist().catch(() => []),
  ]);
  const tickerSymbol = decodedTicker.split(".")[0];

  // Find company info in the popular tickers for sector + name
  const companyInfo = marketConfig.popularTickers.find(
    (t) => t.ticker === decodedTicker
  );

  // Find related stocks (same sector, excluding this one)
  const relatedStocks = companyInfo?.sector
    ? marketConfig.popularTickers
        .filter((t) => t.sector === companyInfo.sector && t.ticker !== decodedTicker)
        .slice(0, 5)
    : [];

  // User's current position in this stock
  const position = holdings.find((h) => h.ticker === decodedTicker) || null;

  // Is this stock already in the watchlist?
  const inWatchlist = watchlist.some((w) => w.ticker === decodedTicker);

  return (
    <StockDetailClient
      quote={quote}
      ticker={decodedTicker}
      companyInfo={companyInfo}
      currency={profile?.currency || marketConfig.currency}
      locale={marketConfig.locale}
      history={history || []}
      news={news || []}
      position={position}
      inWatchlist={inWatchlist}
      relatedStocks={relatedStocks}
      exchangeSuffix={marketConfig.exchangeSuffix}
    />
  );
}
