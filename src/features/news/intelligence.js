/**
 * News intelligence utilities — run at request time on raw news articles.
 * - Sentiment classification (keyword-based, no API cost)
 * - Ticker mention extraction (regex against popular tickers)
 * - Category detection
 * - Time bucketing
 */

const BULLISH_WORDS = [
  "surge", "surges", "soar", "soars", "soared", "rally", "rallied", "rallies",
  "jump", "jumps", "jumped", "climb", "climbs", "climbed", "gain", "gains",
  "gained", "rise", "rises", "rose", "up", "record", "beat", "beats", "boost",
  "boosts", "boosted", "strong", "strength", "upgrade", "upgrades", "upgraded",
  "outperform", "outperforms", "bullish", "growth", "growing", "positive",
  "profit", "profits", "dividend", "expansion", "expand", "breakthrough",
  "exceeded", "exceed", "exceeds", "surpass", "surpasses", "rebound", "rebounds",
];

const BEARISH_WORDS = [
  "plunge", "plunges", "plunged", "crash", "crashes", "crashed", "tumble",
  "tumbles", "tumbled", "slide", "slides", "slid", "fall", "falls", "fell",
  "drop", "drops", "dropped", "decline", "declines", "declined", "loss",
  "losses", "lost", "weak", "weakness", "weaker", "downgrade", "downgrades",
  "downgraded", "underperform", "bearish", "slump", "slumps", "slumped",
  "negative", "missed", "miss", "misses", "warning", "warns", "concerns",
  "concern", "risk", "risks", "fear", "fears", "recession", "crisis",
  "cut", "cuts", "layoff", "layoffs", "fraud", "lawsuit", "bankruptcy",
];

const CATEGORIES = {
  Earnings: ["earnings", "quarterly", "revenue", "profit", "eps", "q1", "q2", "q3", "q4", "results"],
  Economy: ["gdp", "inflation", "interest rate", "fed", "central bank", "cpi", "unemployment", "economy", "policy rate"],
  Markets: ["market", "stocks", "index", "kse", "s&p", "nasdaq", "dow", "rally", "sell-off"],
  "M&A": ["acquisition", "acquires", "merger", "buyout", "takeover", "deal"],
  Regulation: ["regulator", "sec", "lawsuit", "banned", "approval", "compliance", "fine"],
  Crypto: ["bitcoin", "ethereum", "crypto", "blockchain", "nft"],
  IPO: ["ipo", "listing", "public offering", "debut"],
};

/**
 * Classify sentiment via weighted keyword matching.
 * Returns { label: 'bullish' | 'bearish' | 'neutral', score: -1..1 }.
 */
export function classifySentiment(text) {
  if (!text) return { label: "neutral", score: 0 };
  const t = text.toLowerCase();

  let bullishHits = 0;
  let bearishHits = 0;

  for (const w of BULLISH_WORDS) {
    const matches = t.match(new RegExp(`\\b${w}\\b`, "g"));
    if (matches) bullishHits += matches.length;
  }
  for (const w of BEARISH_WORDS) {
    const matches = t.match(new RegExp(`\\b${w}\\b`, "g"));
    if (matches) bearishHits += matches.length;
  }

  const total = bullishHits + bearishHits;
  if (total === 0) return { label: "neutral", score: 0, bullishHits: 0, bearishHits: 0 };

  const score = (bullishHits - bearishHits) / total;
  let label = "neutral";
  if (score > 0.2) label = "bullish";
  else if (score < -0.2) label = "bearish";

  return { label, score, bullishHits, bearishHits };
}

/**
 * Extract ticker mentions from article text by checking popular tickers.
 * Matches either bare ticker (e.g. "AAPL") or with common punctuation.
 */
export function extractTickers(text, popularTickers = []) {
  if (!text || !popularTickers.length) return [];
  const found = new Map(); // ticker → stock info

  for (const stock of popularTickers) {
    const shortTicker = stock.ticker.split(".")[0];
    // Must be a standalone word (not inside another word)
    const regex = new RegExp(`\\b${shortTicker}\\b`, "i");
    if (regex.test(text)) {
      found.set(stock.ticker, stock);
      continue;
    }
    // Also match against company name (first word if distinctive, or full name)
    const name = stock.name;
    if (name && name.length >= 5) {
      // Use first significant word of the name
      const firstWord = name.split(/\s+/)[0];
      if (firstWord.length >= 4 && new RegExp(`\\b${firstWord}\\b`, "i").test(text)) {
        found.set(stock.ticker, stock);
      }
    }
  }

  return Array.from(found.values());
}

/**
 * Detect the primary category for an article.
 */
export function categorize(text) {
  if (!text) return null;
  const t = text.toLowerCase();

  let bestCategory = null;
  let bestScore = 0;

  for (const [category, keywords] of Object.entries(CATEGORIES)) {
    let score = 0;
    for (const kw of keywords) {
      if (t.includes(kw)) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  }

  return bestScore > 0 ? bestCategory : null;
}

/**
 * Return a rough time bucket for an article.
 */
export function timeBucket(publishedAt) {
  if (!publishedAt) return "Earlier";
  const pubDate = new Date(publishedAt);
  if (isNaN(pubDate.getTime())) return "Earlier";

  const now = new Date();
  const diffHours = (now.getTime() - pubDate.getTime()) / (1000 * 60 * 60);

  if (diffHours < 2) return "Just now";
  if (diffHours < 24) return "Today";
  if (diffHours < 48) return "Yesterday";
  if (diffHours < 24 * 7) return "This week";
  if (diffHours < 24 * 30) return "This month";
  return "Earlier";
}

/**
 * Enrich a raw article with intelligence.
 */
export function enrichArticle(article, popularTickers = []) {
  const combinedText = `${article.title || ""} ${article.content || ""}`;
  return {
    ...article,
    sentiment: classifySentiment(combinedText),
    tickers: extractTickers(combinedText, popularTickers),
    category: categorize(combinedText),
    bucket: timeBucket(article.publishedAt),
  };
}

/**
 * Enrich a batch of articles in one pass.
 */
export function enrichArticles(articles, popularTickers = []) {
  return (articles || []).map((a) => enrichArticle(a, popularTickers));
}

/**
 * Compute aggregate mood across a set of enriched articles.
 */
export function aggregateMood(enrichedArticles) {
  if (!enrichedArticles?.length) {
    return { label: "neutral", bullishPct: 0, bearishPct: 0, neutralPct: 100, total: 0 };
  }
  let bullish = 0, bearish = 0, neutral = 0;
  for (const a of enrichedArticles) {
    if (a.sentiment?.label === "bullish") bullish++;
    else if (a.sentiment?.label === "bearish") bearish++;
    else neutral++;
  }
  const total = enrichedArticles.length;
  const bullishPct = (bullish / total) * 100;
  const bearishPct = (bearish / total) * 100;
  const neutralPct = (neutral / total) * 100;

  let label = "neutral";
  if (bullishPct - bearishPct > 20) label = "bullish";
  else if (bearishPct - bullishPct > 20) label = "bearish";

  return { label, bullishPct, bearishPct, neutralPct, total, bullish, bearish, neutral };
}
