import { NextResponse } from "next/server";

const YAHOO_QUOTE_URL = "https://query1.finance.yahoo.com/v8/finance/chart";
const YAHOO_SUMMARY_URL = "https://query2.finance.yahoo.com/v10/finance/quoteSummary";
const PSX_INTRADAY_URL = "https://dps.psx.com.pk/timeseries/int";
const PSX_EOD_URL = "https://dps.psx.com.pk/timeseries/eod";

const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
};

function isPSXTicker(ticker) {
  return ticker.endsWith(".KA");
}

async function getPSXQuote(ticker) {
  const symbol = ticker.replace(/\.KA$/, "");

  const [intRes, eodRes] = await Promise.all([
    fetch(`${PSX_INTRADAY_URL}/${encodeURIComponent(symbol)}`, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(10000),
    }),
    fetch(`${PSX_EOD_URL}/${encodeURIComponent(symbol)}`, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(10000),
    }),
  ]);

  if (!intRes.ok) return null;
  const intJson = await intRes.json();
  const trades = intJson.data;
  if (!trades || trades.length === 0) return null;

  const price = trades[0][1];
  const todayOpen = trades[trades.length - 1][1];

  // Calculate volume from trade data
  let volume = 0;
  for (const t of trades) volume += t[2];

  // Day high/low from intraday trades
  let dayHigh = price;
  let dayLow = price;
  for (const t of trades) {
    if (t[1] > dayHigh) dayHigh = t[1];
    if (t[1] < dayLow) dayLow = t[1];
  }

  // Previous close from EOD data
  let prevClose = price;
  let fiftyTwoWeekHigh = null;
  let fiftyTwoWeekLow = null;
  if (eodRes.ok) {
    const eodJson = await eodRes.json();
    const days = eodJson.data;
    if (days && days.length >= 2) {
      prevClose = days[1][1];
    }
    // 52-week high/low from historical data (approx 250 trading days)
    const yearDays = days?.slice(0, 250) || [];
    if (yearDays.length > 0) {
      fiftyTwoWeekHigh = Math.max(...yearDays.map((d) => d[1]));
      fiftyTwoWeekLow = Math.min(...yearDays.map((d) => d[1]));
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
    dayHigh,
    dayLow,
    fiftyTwoWeekHigh,
    fiftyTwoWeekLow,
    volume,
    marketCap: null,
    pe: null,
    eps: null,
    dividendYield: null,
  };
}

async function getYahooQuote(ticker) {
  const [chartRes, summaryRes] = await Promise.allSettled([
    fetch(
      `${YAHOO_QUOTE_URL}/${encodeURIComponent(ticker)}?range=1d&interval=1m`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        },
        signal: AbortSignal.timeout(10000),
      }
    ),
    fetch(
      `${YAHOO_SUMMARY_URL}/${encodeURIComponent(ticker)}?modules=summaryDetail,defaultKeyStatistics,price`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        },
        signal: AbortSignal.timeout(10000),
      }
    ),
  ]);

  let meta = null;
  if (chartRes.status === "fulfilled" && chartRes.value.ok) {
    const chartJson = await chartRes.value.json();
    meta = chartJson.chart?.result?.[0]?.meta;
  }

  let summary = null;
  if (summaryRes.status === "fulfilled" && summaryRes.value.ok) {
    const summaryJson = await summaryRes.value.json();
    const sd = summaryJson.quoteSummary?.result?.[0]?.summaryDetail;
    const ks = summaryJson.quoteSummary?.result?.[0]?.defaultKeyStatistics;
    const pr = summaryJson.quoteSummary?.result?.[0]?.price;
    summary = { summaryDetail: sd, keyStats: ks, price: pr };
  }

  if (!meta) return null;

  const price = meta.regularMarketPrice ?? 0;
  const prevClose = meta.chartPreviousClose ?? meta.previousClose ?? price;
  const change = price - prevClose;
  const changePct = prevClose ? (change / prevClose) * 100 : 0;

  const sd = summary?.summaryDetail;
  const pr = summary?.price;

  return {
    ticker: meta.symbol,
    price,
    change: +change.toFixed(2),
    changePct: +changePct.toFixed(2),
    currency: meta.currency ?? "USD",
    exchange: meta.exchangeName ?? "",
    marketState: meta.marketState ?? "CLOSED",
    dayHigh: sd?.dayHigh?.raw ?? meta.regularMarketDayHigh ?? null,
    dayLow: sd?.dayLow?.raw ?? meta.regularMarketDayLow ?? null,
    fiftyTwoWeekHigh: sd?.fiftyTwoWeekHigh?.raw ?? null,
    fiftyTwoWeekLow: sd?.fiftyTwoWeekLow?.raw ?? null,
    volume: meta.regularMarketVolume ?? sd?.volume?.raw ?? null,
    marketCap: pr?.marketCap?.raw ?? sd?.marketCap?.raw ?? null,
    pe: sd?.trailingPE?.raw ?? null,
    eps: pr?.epsTrailingTwelveMonths?.raw ?? null,
    dividendYield: sd?.dividendYield?.raw ?? null,
  };
}

export async function GET(request, { params }) {
  const { ticker } = await params;

  if (!ticker) {
    return NextResponse.json({ error: "Ticker required" }, { status: 400 });
  }

  try {
    const decodedTicker = decodeURIComponent(ticker);
    const result = isPSXTicker(decodedTicker)
      ? await getPSXQuote(decodedTicker)
      : await getYahooQuote(decodedTicker);

    if (!result) {
      return NextResponse.json({ error: "Ticker not found" }, { status: 404 });
    }

    return NextResponse.json(result, { headers: CACHE_HEADERS });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
