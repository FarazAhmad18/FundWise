const YAHOO_QUOTE_URL = "https://query1.finance.yahoo.com/v8/finance/chart";
const PSX_INTRADAY_URL = "https://dps.psx.com.pk/timeseries/int";
const PSX_EOD_URL = "https://dps.psx.com.pk/timeseries/eod";

/**
 * Check if a ticker belongs to Pakistan Stock Exchange.
 * PSX tickers in our config use the .KA suffix.
 */
function isPSXTicker(ticker) {
  return ticker.endsWith(".KA");
}

/** Strip the .KA suffix to get the raw PSX symbol. */
function psxSymbol(ticker) {
  return ticker.replace(/\.KA$/, "");
}

/**
 * Fetch quote from PSX's own data API (dps.psx.com.pk).
 * Yahoo Finance returns wrong data for PSX tickers.
 */
async function getPSXQuote(ticker) {
  const symbol = psxSymbol(ticker);
  try {
    const [intRes, eodRes] = await Promise.all([
      fetch(`${PSX_INTRADAY_URL}/${encodeURIComponent(symbol)}`, {
        headers: { "User-Agent": "Mozilla/5.0" },
        signal: AbortSignal.timeout(10000),
        next: { revalidate: 300 },
      }),
      fetch(`${PSX_EOD_URL}/${encodeURIComponent(symbol)}`, {
        headers: { "User-Agent": "Mozilla/5.0" },
        signal: AbortSignal.timeout(10000),
        next: { revalidate: 300 },
      }),
    ]);

    if (!intRes.ok) return null;
    const intJson = await intRes.json();
    const trades = intJson.data;
    if (!trades || trades.length === 0) return null;

    // Intraday: [timestamp, price, volume]
    const price = trades[0][1];

    // EOD: [timestamp, close, volume, open] — second entry is previous day
    let prevClose = price;
    if (eodRes.ok) {
      const eodJson = await eodRes.json();
      const days = eodJson.data;
      if (days && days.length >= 2) {
        prevClose = days[1][1]; // yesterday's close
      }
    }

    const change = price - prevClose;
    const changePct = prevClose ? (change / prevClose) * 100 : 0;

    return {
      ticker,
      price,
      change: +change.toFixed(2),
      changePct: +changePct.toFixed(2),
      currency: "PKR",
      exchange: "PSX",
      marketState: "CLOSED",
    };
  } catch (err) {
    console.error(`getPSXQuote(${ticker}) error:`, err.message);
    return null;
  }
}

/**
 * Fetch live quote data for a single ticker from Yahoo Finance.
 * No API key required.
 */
async function getYahooQuote(ticker) {
  try {
    const res = await fetch(
      `${YAHOO_QUOTE_URL}/${encodeURIComponent(ticker)}?range=1d&interval=1m&includePrePost=false`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        },
        signal: AbortSignal.timeout(10000),
        next: { revalidate: 300 },
      }
    );

    if (!res.ok) return null;

    const json = await res.json();
    const meta = json.chart?.result?.[0]?.meta;
    if (!meta) return null;

    const price = meta.regularMarketPrice ?? 0;
    const prevClose = meta.chartPreviousClose ?? meta.previousClose ?? price;
    const change = price - prevClose;
    const changePct = prevClose ? (change / prevClose) * 100 : 0;

    return {
      ticker: meta.symbol,
      price,
      change: +change.toFixed(2),
      changePct: +changePct.toFixed(2),
      currency: meta.currency ?? "USD",
      exchange: meta.exchangeName ?? "",
      marketState: meta.marketState ?? "CLOSED",
    };
  } catch (err) {
    console.error(`getYahooQuote(${ticker}) error:`, err.message);
    return null;
  }
}

/**
 * Fetch quote for any ticker. Routes PSX tickers to the PSX API,
 * everything else to Yahoo Finance.
 */
export async function getQuote(ticker) {
  if (isPSXTicker(ticker)) {
    return getPSXQuote(ticker);
  }
  return getYahooQuote(ticker);
}

/**
 * Fetch quotes for multiple tickers in parallel.
 * Returns a map of ticker → quote data.
 */
export async function getQuotes(tickers) {
  const results = await Promise.allSettled(tickers.map(getQuote));
  const map = {};
  for (let i = 0; i < tickers.length; i++) {
    const r = results[i];
    if (r.status === "fulfilled" && r.value) {
      map[tickers[i]] = r.value;
    }
  }
  return map;
}

/* ────────────────────────────────────────────
   Historical price data
   Used for reconstructing portfolio value over time.
   Returns an array of { date: 'YYYY-MM-DD', close: number }
   sorted ascending by date.
   ──────────────────────────────────────────── */

async function getPSXHistory(ticker) {
  const symbol = psxSymbol(ticker);
  try {
    const res = await fetch(`${PSX_EOD_URL}/${encodeURIComponent(symbol)}`, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(10000),
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    const rows = json.data || []; // [timestamp, close, volume, open]
    return rows
      .map((r) => ({
        date: new Date(r[0] * 1000).toISOString().slice(0, 10),
        close: +r[1],
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  } catch (err) {
    console.error(`getPSXHistory(${ticker}) error:`, err.message);
    return [];
  }
}

async function getYahooHistory(ticker, range = "1y") {
  try {
    const res = await fetch(
      `${YAHOO_QUOTE_URL}/${encodeURIComponent(ticker)}?range=${range}&interval=1d`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        signal: AbortSignal.timeout(10000),
        next: { revalidate: 3600 },
      }
    );
    if (!res.ok) return [];
    const json = await res.json();
    const result = json.chart?.result?.[0];
    if (!result) return [];
    const timestamps = result.timestamp || [];
    const closes = result.indicators?.quote?.[0]?.close || [];
    const series = [];
    for (let i = 0; i < timestamps.length; i++) {
      if (closes[i] != null) {
        series.push({
          date: new Date(timestamps[i] * 1000).toISOString().slice(0, 10),
          close: +closes[i],
        });
      }
    }
    return series;
  } catch (err) {
    console.error(`getYahooHistory(${ticker}) error:`, err.message);
    return [];
  }
}

/**
 * Get historical daily prices for a ticker.
 * Returns: Array<{ date: 'YYYY-MM-DD', close: number }>, sorted ascending.
 */
export async function getHistory(ticker, range = "1y") {
  if (isPSXTicker(ticker)) {
    return getPSXHistory(ticker);
  }
  return getYahooHistory(ticker, range);
}

/**
 * Get historical prices for multiple tickers in parallel.
 * Returns: { [ticker]: Array<{ date, close }> }
 */
export async function getHistories(tickers, range = "1y") {
  const results = await Promise.allSettled(tickers.map((t) => getHistory(t, range)));
  const map = {};
  for (let i = 0; i < tickers.length; i++) {
    if (results[i].status === "fulfilled") {
      map[tickers[i]] = results[i].value || [];
    } else {
      map[tickers[i]] = [];
    }
  }
  return map;
}

/* ────────────────────────────────────────────
   Market indexes
   Fetches real-time index values + historical data,
   then computes 1D / 7D / 30D changes.
   ──────────────────────────────────────────── */

async function getPSXIndexQuote(symbol) {
  try {
    const [intRes, eodRes] = await Promise.all([
      fetch(`${PSX_INTRADAY_URL}/${encodeURIComponent(symbol)}`, {
        headers: { "User-Agent": "Mozilla/5.0" },
        signal: AbortSignal.timeout(10000),
        next: { revalidate: 300 },
      }),
      fetch(`${PSX_EOD_URL}/${encodeURIComponent(symbol)}`, {
        headers: { "User-Agent": "Mozilla/5.0" },
        signal: AbortSignal.timeout(10000),
        next: { revalidate: 300 },
      }),
    ]);

    if (!intRes.ok) return null;
    const intJson = await intRes.json();
    const trades = intJson.data;
    if (!trades || trades.length === 0) return null;

    const value = trades[0][1];

    // Load EOD for historical returns
    let history = [];
    if (eodRes.ok) {
      const eodJson = await eodRes.json();
      const rows = eodJson.data || [];
      // rows are newest-first: [[ts, close, vol, open], ...]
      history = rows
        .map((r) => ({
          date: new Date(r[0] * 1000).toISOString().slice(0, 10),
          close: +r[1],
        }))
        .sort((a, b) => a.date.localeCompare(b.date));
    }

    return { value, history };
  } catch (err) {
    console.error(`getPSXIndexQuote(${symbol}) error:`, err.message);
    return null;
  }
}

async function getYahooIndexQuote(symbol) {
  try {
    const [intRes, histRes] = await Promise.all([
      fetch(
        `${YAHOO_QUOTE_URL}/${encodeURIComponent(symbol)}?range=1d&interval=1m`,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
          signal: AbortSignal.timeout(10000),
          next: { revalidate: 300 },
        }
      ),
      fetch(
        `${YAHOO_QUOTE_URL}/${encodeURIComponent(symbol)}?range=3mo&interval=1d`,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
          signal: AbortSignal.timeout(10000),
          next: { revalidate: 3600 },
        }
      ),
    ]);

    if (!intRes.ok) return null;
    const intJson = await intRes.json();
    const meta = intJson.chart?.result?.[0]?.meta;
    if (!meta) return null;
    const value = meta.regularMarketPrice;
    if (value == null) return null;

    let history = [];
    if (histRes.ok) {
      const histJson = await histRes.json();
      const result = histJson.chart?.result?.[0];
      if (result) {
        const timestamps = result.timestamp || [];
        const closes = result.indicators?.quote?.[0]?.close || [];
        for (let i = 0; i < timestamps.length; i++) {
          if (closes[i] != null) {
            history.push({
              date: new Date(timestamps[i] * 1000).toISOString().slice(0, 10),
              close: +closes[i],
            });
          }
        }
      }
    }

    return { value, history };
  } catch (err) {
    console.error(`getYahooIndexQuote(${symbol}) error:`, err.message);
    return null;
  }
}

/**
 * Compute the change between the current value and a point N days ago.
 * Returns null if insufficient history.
 */
function changeFrom(history, currentValue, days) {
  if (!history || history.length < 2 || currentValue == null) return null;
  const today = new Date();
  const target = new Date();
  target.setDate(today.getDate() - days);
  const targetStr = target.toISOString().slice(0, 10);

  // Find latest history point <= target
  let past = null;
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].date <= targetStr) { past = history[i]; break; }
  }
  if (!past) past = history[0];

  const abs = currentValue - past.close;
  const pct = past.close ? (abs / past.close) * 100 : 0;
  return { abs: +abs.toFixed(2), pct: +pct.toFixed(2) };
}

/**
 * Fetch a market index with 1D/3D/7D/30D performance.
 * Returns: { symbol, value, changes: { d1, d3, d7, d30 }, sparkline }
 */
export async function getIndex(indexConfig) {
  const fetchFn = indexConfig.source === "psx" ? getPSXIndexQuote : getYahooIndexQuote;
  const result = await fetchFn(indexConfig.symbol);
  if (!result) return null;

  const { value, history } = result;

  // Build sparkline from last 30 trading days
  const sparkline = history.slice(-30).map((p) => p.close);

  return {
    symbol: indexConfig.symbol,
    name: indexConfig.name,
    short: indexConfig.short,
    value,
    changes: {
      d1: changeFrom(history, value, 1),
      d3: changeFrom(history, value, 3),
      d7: changeFrom(history, value, 7),
      d30: changeFrom(history, value, 30),
    },
    sparkline,
  };
}

/**
 * Fetch multiple market indexes in parallel.
 */
export async function getIndexes(indexConfigs) {
  if (!indexConfigs?.length) return [];
  const results = await Promise.allSettled(indexConfigs.map(getIndex));
  return results
    .filter((r) => r.status === "fulfilled" && r.value)
    .map((r) => r.value);
}
