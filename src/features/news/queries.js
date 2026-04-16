import { tavilySearch } from "@/lib/external/tavily";

/**
 * Fetch market news filtered by the user's market.
 */
export async function fetchMarketNews(newsQuery, maxResults = 10) {
  try {
    const { results } = await tavilySearch(newsQuery, {
      maxResults,
      topic: "news",
    });
    return results || [];
  } catch (err) {
    console.error("fetchMarketNews error:", err.message);
    return [];
  }
}

/**
 * Fetch news for specific held tickers.
 * Batches tickers into a single search query.
 */
export async function fetchStockNews(tickers, maxResults = 8) {
  if (!tickers?.length) return [];

  // Take first 5 tickers, strip exchange suffix for cleaner search
  const cleanTickers = tickers.slice(0, 5).map((t) => t.split(".")[0]);
  const query = `${cleanTickers.join(" ")} stock market news latest`;

  try {
    const { results } = await tavilySearch(query, {
      maxResults,
      topic: "news",
    });
    return results || [];
  } catch (err) {
    console.error("fetchStockNews error:", err.message);
    return [];
  }
}
