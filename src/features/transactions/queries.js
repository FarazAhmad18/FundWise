import { createClient } from "@/lib/supabase/server";
import { getQuotes, getHistories } from "@/lib/external/stockPrice";

export async function listTransactions(limit = 50) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("transactions")
    .select("id, type, quantity, price_per_unit, total_amount, fees, currency, transaction_date, notes, created_at, company:companies(id, ticker, name)")
    .order("transaction_date", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("listTransactions error:", error);
    return [];
  }

  return data ?? [];
}

/**
 * Compute current holdings from transaction history.
 * Uses weighted average cost method.
 * Returns array of holdings with live prices and P&L.
 */
export async function getHoldings() {
  const supabase = await createClient();

  const { data: txns, error } = await supabase
    .from("transactions")
    .select("company_id, type, quantity, price_per_unit, total_amount, company:companies(id, ticker, name)")
    .order("transaction_date", { ascending: true });

  if (error || !txns?.length) return [];

  // Compute holdings using weighted average cost
  const holdingsMap = {};

  for (const tx of txns) {
    const key = tx.company_id;
    if (!holdingsMap[key]) {
      holdingsMap[key] = {
        companyId: key,
        ticker: tx.company.ticker,
        name: tx.company.name,
        totalShares: 0,
        totalCost: 0,
      };
    }

    const h = holdingsMap[key];
    const qty = Number(tx.quantity);
    const price = Number(tx.price_per_unit);

    if (tx.type === "buy") {
      h.totalCost += qty * price;
      h.totalShares += qty;
    } else {
      // Sell: reduce shares and cost basis proportionally
      const avgCost = h.totalShares > 0 ? h.totalCost / h.totalShares : 0;
      h.totalShares -= qty;
      h.totalCost = h.totalShares > 0 ? h.totalShares * avgCost : 0;
    }
  }

  // Filter only active holdings (shares > 0)
  const activeHoldings = Object.values(holdingsMap).filter(
    (h) => h.totalShares > 0.0001
  );

  if (activeHoldings.length === 0) return [];

  // Fetch live prices for all held tickers
  const tickers = activeHoldings.map((h) => h.ticker);
  const quotes = await getQuotes(tickers);

  // Compute P&L for each holding
  return activeHoldings.map((h) => {
    const quote = quotes[h.ticker];
    const avgCost = h.totalShares > 0 ? h.totalCost / h.totalShares : 0;
    // If API returns 0 or no price, fall back to avgCost so the UI doesn't show total loss
    const rawPrice = quote?.price ?? 0;
    const currentPrice = rawPrice > 0 ? rawPrice : avgCost;
    const priceUnavailable = rawPrice <= 0;
    const currentValue = h.totalShares * currentPrice;
    const pnl = priceUnavailable ? 0 : currentValue - h.totalCost;
    const pnlPct = !priceUnavailable && h.totalCost > 0 ? (pnl / h.totalCost) * 100 : 0;
    const dayChange = quote && !priceUnavailable ? h.totalShares * quote.change : 0;

    return {
      companyId: h.companyId,
      ticker: h.ticker,
      name: h.name,
      shares: h.totalShares,
      avgCost: +avgCost.toFixed(2),
      currentPrice,
      currentValue: +currentValue.toFixed(2),
      totalCost: +h.totalCost.toFixed(2),
      pnl: +pnl.toFixed(2),
      pnlPct: +pnlPct.toFixed(2),
      dayChange: +dayChange.toFixed(2),
      dayChangePct: quote?.changePct ?? 0,
      currency: quote?.currency ?? "USD",
    };
  });
}

/**
 * Aggregate portfolio summary from holdings.
 */
export async function getPortfolioSummary() {
  const holdings = await getHoldings();

  if (holdings.length === 0) {
    return {
      totalValue: 0,
      totalCost: 0,
      totalPnl: 0,
      totalPnlPct: 0,
      dayChange: 0,
      holdingsCount: 0,
      holdings: [],
    };
  }

  const totalValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
  const totalCost = holdings.reduce((sum, h) => sum + h.totalCost, 0);
  const totalPnl = totalValue - totalCost;
  const totalPnlPct = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;
  const dayChange = holdings.reduce((sum, h) => sum + h.dayChange, 0);

  return {
    totalValue: +totalValue.toFixed(2),
    totalCost: +totalCost.toFixed(2),
    totalPnl: +totalPnl.toFixed(2),
    totalPnlPct: +totalPnlPct.toFixed(2),
    dayChange: +dayChange.toFixed(2),
    holdingsCount: holdings.length,
    holdings,
  };
}

/**
 * Reconstruct portfolio value day-by-day by replaying transactions
 * against historical closing prices. Returns an array of points
 * { date, value } covering the requested range, or an empty array if
 * the user has no transactions.
 *
 * This is real data — no synthetic noise. Each point is the actual
 * value of the portfolio at market close on that day, computed as:
 *   value(d) = Σ shares_held(ticker, d) × close_price(ticker, d)
 */
export async function getPortfolioHistory(range = "1M") {
  const supabase = await createClient();

  const { data: txns } = await supabase
    .from("transactions")
    .select("type, quantity, price_per_unit, transaction_date, company:companies(ticker)")
    .order("transaction_date", { ascending: true });

  if (!txns?.length) return [];

  // Collect unique tickers involved
  const tickers = [...new Set(txns.map((t) => t.company?.ticker).filter(Boolean))];

  // Map range → Yahoo range string + number of days
  const RANGE_MAP = {
    "1W": { yahoo: "1mo", days: 7 },
    "1M": { yahoo: "1mo", days: 30 },
    "3M": { yahoo: "3mo", days: 90 },
    "6M": { yahoo: "6mo", days: 180 },
    "1Y": { yahoo: "1y", days: 365 },
    ALL: { yahoo: "5y", days: 365 * 5 },
  };
  const rangeInfo = RANGE_MAP[range] || RANGE_MAP["1M"];

  const histories = await getHistories(tickers, rangeInfo.yahoo);

  // Determine date range for output: from max(first tx date, range start) → today
  const firstTxDate = txns[0].transaction_date;
  const rangeStart = new Date();
  rangeStart.setDate(rangeStart.getDate() - rangeInfo.days);
  const startDate = firstTxDate > rangeStart.toISOString().slice(0, 10)
    ? firstTxDate
    : rangeStart.toISOString().slice(0, 10);
  const endDate = new Date().toISOString().slice(0, 10);

  // Build per-ticker price-by-date lookup with forward-fill
  // (use previous close if no trade that day — stock might be suspended or market closed)
  const priceLookup = {};
  for (const t of tickers) {
    const series = histories[t] || [];
    priceLookup[t] = {};
    let lastClose = null;
    for (const row of series) {
      priceLookup[t][row.date] = row.close;
      lastClose = row.close;
    }
    priceLookup[t]._last = lastClose;
  }

  // Build list of dates (trading days) — use whatever dates the price series have
  const allDates = new Set();
  for (const t of tickers) {
    for (const row of histories[t] || []) {
      if (row.date >= startDate && row.date <= endDate) {
        allDates.add(row.date);
      }
    }
  }
  const dates = Array.from(allDates).sort();
  if (dates.length === 0) return [];

  // For each date, compute portfolio value:
  // 1. Determine shares held per ticker as of that date (from all txns up to & including that date)
  // 2. Multiply by that ticker's close on that date (or last available)
  const shares = {}; // ticker -> current shares
  let txIdx = 0;
  const sortedTxns = [...txns].sort((a, b) =>
    a.transaction_date.localeCompare(b.transaction_date)
  );

  const series = [];
  for (const date of dates) {
    // Apply all txns up to (and including) this date
    while (txIdx < sortedTxns.length && sortedTxns[txIdx].transaction_date <= date) {
      const tx = sortedTxns[txIdx];
      const ticker = tx.company?.ticker;
      const qty = Number(tx.quantity);
      if (ticker) {
        if (!shares[ticker]) shares[ticker] = 0;
        shares[ticker] += tx.type === "buy" ? qty : -qty;
      }
      txIdx++;
    }

    // Compute value on this date
    let value = 0;
    let lastClose = {};
    for (const [ticker, qty] of Object.entries(shares)) {
      if (qty <= 0) continue;
      // Use forward-fill: last known close up to this date
      let price = priceLookup[ticker]?.[date];
      if (price == null) {
        // Find closest earlier date
        const series = histories[ticker] || [];
        for (let i = series.length - 1; i >= 0; i--) {
          if (series[i].date <= date) {
            price = series[i].close;
            break;
          }
        }
      }
      if (price != null) {
        value += qty * price;
      }
    }

    if (value > 0) {
      series.push({ date, value: +value.toFixed(2) });
    }
  }

  return series;
}
