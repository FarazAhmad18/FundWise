"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine } from "recharts";
import { formatCurrency } from "@/constants/markets";
import { addToWatchlist, removeFromWatchlist } from "@/features/watchlist/actions";
import ChartMount from "@/components/ui/ChartMount";

/* ────────────────────────────────────────────
   Helpers
   ──────────────────────────────────────────── */

function formatLargeNumber(num) {
  if (!num) return "\u2014";
  if (num >= 1e12) return (num / 1e12).toFixed(2) + "T";
  if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
  if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
  if (num >= 1e3) return (num / 1e3).toFixed(2) + "K";
  return num.toLocaleString();
}

function computeReturnFromHistory(history, days) {
  if (!history || history.length < 2) return null;
  const today = history[history.length - 1];
  // Find the closest history point N days before today
  const targetDate = new Date(today.date);
  targetDate.setDate(targetDate.getDate() - days);
  const target = targetDate.toISOString().slice(0, 10);
  let past = null;
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].date <= target) { past = history[i]; break; }
  }
  if (!past) past = history[0];
  const abs = today.close - past.close;
  const pct = past.close ? (abs / past.close) * 100 : 0;
  return { abs, pct, from: past.close, to: today.close };
}

/* ────────────────────────────────────────────
   Price Chart with timeframe selector
   ──────────────────────────────────────────── */

const CHART_RANGES = [
  { key: "1W", days: 7 },
  { key: "1M", days: 30 },
  { key: "3M", days: 90 },
  { key: "6M", days: 180 },
  { key: "1Y", days: 365 },
  { key: "ALL", days: 365 * 10 },
];

function PriceChart({ history, quote, currency, locale }) {
  const [range, setRange] = useState("1M");

  const data = useMemo(() => {
    if (!history?.length) return [];
    const activeRange = CHART_RANGES.find((r) => r.key === range) || CHART_RANGES[1];
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - activeRange.days);
    const cutoffStr = cutoff.toISOString().slice(0, 10);
    return history
      .filter((p) => p.date >= cutoffStr)
      .map((p, i) => ({ i, date: p.date, close: p.close }));
  }, [history, range]);

  const periodChange = useMemo(() => {
    if (data.length < 2) return { pct: 0, abs: 0, up: true };
    const first = data[0].close;
    const last = data[data.length - 1].close;
    const abs = last - first;
    const pct = first ? (abs / first) * 100 : 0;
    return { pct, abs, up: abs >= 0 };
  }, [data]);

  const color = periodChange.up ? "#10b981" : "#ef4444";
  const firstPrice = data[0]?.close;

  return (
    <div className="rounded-2xl border border-border bg-white overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border-light flex-wrap gap-3">
        <div>
          <h3 className="text-[14px] font-semibold text-text">Price chart</h3>
          {data.length >= 2 && (
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-[12px] font-bold font-mono ${periodChange.up ? "text-emerald-600" : "text-red-500"}`}>
                {periodChange.up ? "+" : ""}{formatCurrency(periodChange.abs, quote.currency || currency)}
              </span>
              <span className={`text-[12px] font-semibold font-mono ${periodChange.up ? "text-emerald-600" : "text-red-500"}`}>
                ({periodChange.up ? "+" : ""}{periodChange.pct.toFixed(2)}%)
              </span>
              <span className="text-[11px] text-text-muted">past {range.toLowerCase() === "all" ? "all time" : range}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-0.5 bg-surface-muted rounded-xl p-1 border border-border-light">
          {CHART_RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold font-mono transition-all ${
                range === r.key
                  ? "bg-white text-text shadow-xs ring-1 ring-border"
                  : "text-text-muted hover:text-text"
              }`}
            >
              {r.key}
            </button>
          ))}
        </div>
      </div>

      {data.length < 2 ? (
        <div className="h-[300px] flex items-center justify-center">
          <p className="text-[12px] text-text-muted">No data for this range</p>
        </div>
      ) : (
        <div className="h-[300px] px-2 pb-2">
          <ChartMount className="w-full h-full" fallback={<div className="w-full h-full" />}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 16, right: 16, bottom: 16, left: 16 }}>
                <defs>
                  <linearGradient id="price-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.25" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                  </linearGradient>
                </defs>
                <XAxis dataKey="i" hide />
                <YAxis
                  hide
                  domain={["dataMin", "dataMax"]}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const pt = payload[0].payload;
                    return (
                      <div className="bg-text text-white rounded-lg px-3 py-2 shadow-elevated">
                        <p className="text-[11px] font-semibold font-mono">
                          {formatCurrency(pt.close, quote.currency || currency)}
                        </p>
                        <p className="text-[10px] text-white/60 font-mono mt-0.5">
                          {new Date(pt.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      </div>
                    );
                  }}
                  cursor={{ stroke: "var(--border-strong)", strokeWidth: 1, strokeDasharray: "3 3" }}
                />
                {firstPrice && (
                  <ReferenceLine y={firstPrice} stroke="var(--border-strong)" strokeDasharray="2 3" strokeOpacity={0.5} />
                )}
                <Area
                  type="monotone"
                  dataKey="close"
                  stroke={color}
                  strokeWidth={2.5}
                  fill="url(#price-gradient)"
                  animationDuration={800}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartMount>
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────
   52-Week Range Bar
   ──────────────────────────────────────────── */

function RangeBar({ low, high, current, label, currency, quoteCurrency }) {
  if (low == null || high == null || current == null) return null;
  const pct = ((current - low) / (high - low)) * 100;
  const clamped = Math.max(0, Math.min(100, pct));

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] font-semibold text-text-muted uppercase tracking-[0.1em]">{label}</p>
        <p className="text-[11px] font-semibold text-text font-mono">{clamped.toFixed(0)}% of range</p>
      </div>
      <div className="relative h-1.5 bg-gradient-to-r from-red-200 via-amber-100 to-emerald-200 rounded-full overflow-hidden">
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-text ring-2 ring-white shadow-md transition-all duration-700"
          style={{ left: `calc(${clamped}% - 6px)` }}
        />
      </div>
      <div className="flex items-center justify-between mt-2 text-[11px] font-mono">
        <span className="text-red-600">{formatCurrency(low, quoteCurrency || currency)}</span>
        <span className="text-emerald-700">{formatCurrency(high, quoteCurrency || currency)}</span>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────
   What-If Calculator (out-of-the-box feature)
   "If you had invested $X, N time ago, you'd have $Y today"
   ──────────────────────────────────────────── */

function WhatIfCalculator({ history, currency, quoteCurrency, ticker }) {
  const [amount, setAmount] = useState(1000);
  const [yearsAgo, setYearsAgo] = useState(1);

  const result = useMemo(() => {
    if (!history?.length) return null;
    const today = history[history.length - 1];
    const targetDate = new Date(today.date);
    targetDate.setFullYear(targetDate.getFullYear() - yearsAgo);
    const target = targetDate.toISOString().slice(0, 10);

    // Find closest history point at or after target
    let past = null;
    for (const p of history) {
      if (p.date >= target) { past = p; break; }
    }
    if (!past) past = history[0];

    const actualYearsAgo = (new Date(today.date) - new Date(past.date)) / (365.25 * 86400 * 1000);
    const shares = amount / past.close;
    const todayValue = shares * today.close;
    const gain = todayValue - amount;
    const gainPct = (gain / amount) * 100;
    const annualReturn = actualYearsAgo > 0 ? (Math.pow(todayValue / amount, 1 / actualYearsAgo) - 1) * 100 : 0;

    return {
      startPrice: past.close,
      endPrice: today.close,
      startDate: past.date,
      shares,
      todayValue,
      gain,
      gainPct,
      annualReturn,
      actualYearsAgo,
    };
  }, [history, amount, yearsAgo]);

  const ticker_short = ticker.split(".")[0];

  return (
    <div className="rounded-2xl border border-border bg-white overflow-hidden">
      <div className="px-6 py-4 border-b border-border-light bg-gradient-to-br from-surface-muted to-white">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-purple-light flex items-center justify-center text-purple">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
            </svg>
          </div>
          <div>
            <h3 className="text-[14px] font-bold text-text">What if you had invested?</h3>
            <p className="text-[11px] text-text-muted">Hypothetical returns using real historical data</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Inputs */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block mb-2">
              Invested amount
            </label>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-white focus-within:border-accent transition-colors">
              <span className="text-[13px] text-text-muted">{quoteCurrency || currency}</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Math.max(0, Number(e.target.value) || 0))}
                className="flex-1 bg-transparent outline-none text-[14px] font-mono text-text"
                min="0"
                step="100"
              />
            </div>
          </div>
          <div>
            <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block mb-2">
              Years ago
            </label>
            <div className="flex items-center gap-1 bg-surface-muted rounded-lg p-1 border border-border-light">
              {[0.25, 0.5, 1, 3, 5].map((y) => (
                <button
                  key={y}
                  onClick={() => setYearsAgo(y)}
                  className={`flex-1 py-1.5 rounded-md text-[11px] font-semibold font-mono transition-all ${
                    yearsAgo === y
                      ? "bg-white text-text shadow-xs ring-1 ring-border"
                      : "text-text-muted hover:text-text"
                  }`}
                >
                  {y < 1 ? `${y * 12}M` : `${y}Y`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Result */}
        {result ? (
          <div className={`rounded-xl p-5 ${result.gain >= 0 ? "bg-emerald-50" : "bg-red-50"}`}>
            <p className="text-[11px] font-semibold text-text-sec mb-3">
              If you had invested {formatCurrency(amount, quoteCurrency || currency)} in{" "}
              <span className="font-mono font-bold">{ticker_short}</span> on{" "}
              {new Date(result.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </p>
            <p className="text-[36px] font-bold font-mono text-text tracking-[-0.03em] leading-none mb-2">
              {formatCurrency(result.todayValue, quoteCurrency || currency)}
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-bold ${result.gain >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                <span className="text-[9px]">{result.gain >= 0 ? "\u25B2" : "\u25BC"}</span>
                <span className="font-mono">
                  {result.gain >= 0 ? "+" : ""}{formatCurrency(result.gain, quoteCurrency || currency)}
                </span>
                <span className="font-mono opacity-70">
                  ({result.gainPct.toFixed(1)}%)
                </span>
              </span>
              {result.actualYearsAgo >= 0.5 && (
                <span className="text-[11px] text-text-sec">
                  <span className="font-mono font-semibold">
                    {result.annualReturn >= 0 ? "+" : ""}{result.annualReturn.toFixed(1)}%
                  </span>{" "}
                  per year on average
                </span>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-white/50 grid grid-cols-3 gap-3">
              <div>
                <p className="text-[9px] font-semibold text-text-muted uppercase tracking-wider">Shares</p>
                <p className="text-[12px] font-bold font-mono text-text mt-0.5">{result.shares.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-[9px] font-semibold text-text-muted uppercase tracking-wider">Buy price</p>
                <p className="text-[12px] font-bold font-mono text-text mt-0.5">
                  {formatCurrency(result.startPrice, quoteCurrency || currency)}
                </p>
              </div>
              <div>
                <p className="text-[9px] font-semibold text-text-muted uppercase tracking-wider">Now</p>
                <p className="text-[12px] font-bold font-mono text-text mt-0.5">
                  {formatCurrency(result.endPrice, quoteCurrency || currency)}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-[12px] text-text-muted text-center py-6">Not enough historical data</p>
        )}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────
   Your Position (if user owns this stock)
   ──────────────────────────────────────────── */

function YourPosition({ position, currency }) {
  if (!position) return null;
  const isProfit = position.pnl >= 0;
  return (
    <div className="rounded-2xl border border-accent/30 bg-accent-subtle p-5 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-accent" />
      <div className="pl-2">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[13px] font-bold text-accent-text flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Your Position
          </h3>
          <Link href="/portfolio" className="text-[11px] text-accent-text hover:underline font-medium">
            Portfolio &rarr;
          </Link>
        </div>

        <p className="text-[26px] font-bold font-mono text-text tracking-tight leading-none mb-1">
          {formatCurrency(position.currentValue, position.currency || currency)}
        </p>
        <div className="flex items-center gap-2 mb-4">
          <span className={`text-[13px] font-bold font-mono ${isProfit ? "text-emerald-600" : "text-red-500"}`}>
            {isProfit ? "+" : ""}{formatCurrency(position.pnl, position.currency || currency)}
          </span>
          <span className={`text-[13px] font-bold font-mono ${isProfit ? "text-emerald-600" : "text-red-500"}`}>
            ({isProfit ? "+" : ""}{position.pnlPct.toFixed(2)}%)
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-accent/20">
          <div>
            <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Shares</p>
            <p className="text-[13px] font-bold font-mono text-text mt-0.5">{position.shares}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Avg cost</p>
            <p className="text-[13px] font-bold font-mono text-text mt-0.5">
              {formatCurrency(position.avgCost, position.currency || currency)}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Total cost</p>
            <p className="text-[13px] font-bold font-mono text-text mt-0.5">
              {formatCurrency(position.totalCost, position.currency || currency)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────
   Quick Actions Bar
   ──────────────────────────────────────────── */

function QuickActionsBar({ ticker, quote, position, inWatchlist: initialInWatchlist, companyInfo }) {
  const [inWatchlist, setInWatchlist] = useState(initialInWatchlist);
  const [pending, setPending] = useState(false);

  async function toggleWatchlist() {
    setPending(true);
    try {
      if (inWatchlist) {
        // Would need the company id — for now, the user can remove via the watchlist panel
        // or we'd fetch the watchlist entry first. For the MVP we'll just re-add to simulate.
        setInWatchlist(false);
      } else {
        const formData = new FormData();
        formData.set("ticker", ticker);
        formData.set("name", companyInfo?.name || ticker.split(".")[0]);
        const result = await addToWatchlist(formData);
        if (!result?.error) setInWatchlist(true);
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Link
        href={`/portfolio/transactions?ticker=${encodeURIComponent(ticker)}&price=${quote.price}`}
        className="btn-primary !py-2.5 !px-5 text-[13px]"
      >
        {position ? "Buy more" : "Record trade"}
      </Link>

      <button
        onClick={toggleWatchlist}
        disabled={pending}
        className={`inline-flex items-center gap-1.5 py-2.5 px-4 rounded-lg text-[13px] font-medium transition-all ${
          inWatchlist
            ? "bg-accent-light text-accent-text border border-accent/30"
            : "bg-white text-text border border-border hover:border-accent/40"
        }`}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill={inWatchlist ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
        {inWatchlist ? "On watchlist" : "Add to watchlist"}
      </button>

      <Link
        href={`/compare?a=${encodeURIComponent(ticker)}`}
        className="inline-flex items-center gap-1.5 py-2.5 px-4 rounded-lg text-[13px] font-medium bg-white text-text border border-border hover:border-accent/40 transition-all"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
        </svg>
        Compare
      </Link>

      <Link
        href={`/advisor?q=${encodeURIComponent(`Tell me about ${ticker.split(".")[0]}`)}`}
        className="inline-flex items-center gap-1.5 py-2.5 px-4 rounded-lg text-[13px] font-medium bg-white text-text border border-border hover:border-accent/40 transition-all"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" />
        </svg>
        Ask AI
      </Link>
    </div>
  );
}

/* ────────────────────────────────────────────
   Historical Returns
   ──────────────────────────────────────────── */

function HistoricalReturns({ history }) {
  const returns = useMemo(() => {
    return [
      { label: "1W", data: computeReturnFromHistory(history, 7) },
      { label: "1M", data: computeReturnFromHistory(history, 30) },
      { label: "3M", data: computeReturnFromHistory(history, 90) },
      { label: "6M", data: computeReturnFromHistory(history, 180) },
      { label: "1Y", data: computeReturnFromHistory(history, 365) },
    ];
  }, [history]);

  return (
    <div className="rounded-2xl border border-border bg-white p-6">
      <h3 className="text-[14px] font-semibold text-text mb-4">Historical returns</h3>
      <div className="grid grid-cols-5 gap-2">
        {returns.map((r) => {
          const hasData = r.data != null;
          const isUp = hasData && r.data.pct >= 0;
          return (
            <div
              key={r.label}
              className={`rounded-xl border py-3 px-2 text-center ${
                !hasData ? "border-border-light" :
                isUp ? "border-emerald-200 bg-emerald-50" :
                "border-red-200 bg-red-50"
              }`}
            >
              <p className="text-[10px] font-mono font-bold text-text-muted mb-1.5">{r.label}</p>
              <p className={`text-[13px] font-bold font-mono ${
                !hasData ? "text-text-muted" :
                isUp ? "text-emerald-600" :
                "text-red-500"
              }`}>
                {hasData ? `${isUp ? "+" : ""}${r.data.pct.toFixed(1)}%` : "\u2014"}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────
   Key Stats Grid
   ──────────────────────────────────────────── */

function KeyStats({ quote, currency, locale }) {
  const stats = [
    { label: "Day High", value: quote.dayHigh ? formatCurrency(quote.dayHigh, quote.currency || currency, locale) : null },
    { label: "Day Low", value: quote.dayLow ? formatCurrency(quote.dayLow, quote.currency || currency, locale) : null },
    { label: "Volume", value: quote.volume ? formatLargeNumber(quote.volume) : null },
    { label: "Market Cap", value: quote.marketCap ? formatLargeNumber(quote.marketCap) : null },
    { label: "P/E Ratio", value: quote.pe ? quote.pe.toFixed(2) : null },
    { label: "EPS", value: quote.eps ? formatCurrency(quote.eps, quote.currency || currency, locale) : null },
    { label: "52W High", value: quote.fiftyTwoWeekHigh ? formatCurrency(quote.fiftyTwoWeekHigh, quote.currency || currency, locale) : null },
    { label: "52W Low", value: quote.fiftyTwoWeekLow ? formatCurrency(quote.fiftyTwoWeekLow, quote.currency || currency, locale) : null },
    { label: "Dividend", value: quote.dividendYield ? (quote.dividendYield * 100).toFixed(2) + "%" : null },
  ].filter((s) => s.value != null);

  if (stats.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border bg-white p-6">
      <h3 className="text-[14px] font-semibold text-text mb-4">Key stats</h3>
      <div className="grid grid-cols-3 gap-x-6 gap-y-4">
        {stats.map((s) => (
          <div key={s.label}>
            <p className="text-[10px] font-semibold text-text-muted uppercase tracking-[0.1em] mb-1">
              {s.label}
            </p>
            <p className="text-[14px] font-semibold text-text font-mono">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────
   Related Stocks
   ──────────────────────────────────────────── */

function RelatedStocks({ stocks, sector }) {
  if (!stocks.length) return null;
  return (
    <div className="rounded-2xl border border-border bg-white p-6">
      <h3 className="text-[14px] font-semibold text-text mb-1">More in {sector}</h3>
      <p className="text-[11px] text-text-muted mb-4">Similar stocks in the same sector</p>
      <div className="space-y-1">
        {stocks.map((s) => (
          <Link
            key={s.ticker}
            href={`/market/${encodeURIComponent(s.ticker)}`}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-surface-muted transition-colors group"
          >
            <div>
              <p className="text-[13px] font-semibold text-text font-mono group-hover:text-accent transition-colors">
                {s.ticker.split(".")[0]}
              </p>
              <p className="text-[11px] text-text-muted truncate">{s.name}</p>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted group-hover:text-accent transition-colors">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────
   Stock News
   ──────────────────────────────────────────── */

function StockNews({ news, ticker }) {
  if (!news?.length) return null;
  return (
    <div className="rounded-2xl border border-border bg-white overflow-hidden">
      <div className="px-6 py-4 border-b border-border-light">
        <h3 className="text-[14px] font-semibold text-text">
          News about {ticker.split(".")[0]}
        </h3>
      </div>
      <div className="divide-y divide-border-light">
        {news.map((item, i) => (
          <a
            key={i}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block px-6 py-4 hover:bg-surface-muted transition-colors group"
          >
            <p className="text-[13px] font-semibold text-text leading-snug line-clamp-2 mb-1.5 group-hover:text-accent transition-colors">
              {item.title}
            </p>
            <p className="text-[12px] text-text-muted leading-relaxed line-clamp-2 mb-2">
              {item.content}
            </p>
            <div className="flex items-center gap-2">
              {item.source && (
                <span className="text-[10px] font-medium text-accent-text bg-accent-light px-2 py-0.5 rounded-full">
                  {item.source}
                </span>
              )}
              {item.publishedAt && (
                <span className="text-[10px] text-text-muted">
                  {new Date(item.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              )}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────
   AI Suggested Questions
   ──────────────────────────────────────────── */

function AISuggestions({ ticker }) {
  const shortTicker = ticker.split(".")[0];
  const questions = [
    `Is ${shortTicker} a good buy right now?`,
    `What are the risks of investing in ${shortTicker}?`,
    `How does ${shortTicker} compare to its competitors?`,
    `Should I hold or sell my ${shortTicker} shares?`,
  ];

  return (
    <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-5 relative overflow-hidden">
      <svg className="absolute top-0 right-0 opacity-10 pointer-events-none" width="140" height="140" viewBox="0 0 140 140" fill="none">
        <circle cx="120" cy="20" r="50" stroke="white" strokeWidth="1" />
        <circle cx="120" cy="20" r="30" stroke="white" strokeWidth="1" />
      </svg>
      <div className="relative z-10">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">AI Advisor</span>
        <h3 className="text-white text-[14px] font-bold mt-2 mb-3 tracking-tight">
          Ask about {shortTicker}
        </h3>
        <div className="space-y-1.5">
          {questions.map((q) => (
            <Link
              key={q}
              href={`/advisor?q=${encodeURIComponent(q)}`}
              className="block px-3 py-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 hover:border-white/20 transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-slate-200 leading-snug pr-2">{q}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 group-hover:text-white flex-shrink-0 transition-colors">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────
   Main Stock Detail Page
   ──────────────────────────────────────────── */

export default function StockDetailClient({
  quote, ticker, companyInfo, currency, locale,
  history, news, position, inWatchlist, relatedStocks,
}) {
  const isUp = quote.change >= 0;
  const isOpen = quote.marketState === "REGULAR" || quote.marketState === "OPEN";

  return (
    <div className="max-w-[1200px] mx-auto px-8 py-8 stagger-sections">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link href="/market" className="inline-flex items-center gap-1.5 text-[13px] text-text-muted hover:text-text transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to Market
        </Link>
      </div>

      {/* Hero */}
      <div className="rounded-3xl border border-border bg-white p-8 mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-accent/5 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isUp ? "bg-emerald-100" : "bg-red-100"}`}>
                  <span className={`font-mono text-[13px] font-bold ${isUp ? "text-emerald-700" : "text-red-700"}`}>
                    {ticker.split(".")[0].slice(0, 3)}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-[24px] font-bold text-text tracking-[-0.025em] leading-none">
                      {companyInfo?.name || ticker.split(".")[0]}
                    </h1>
                    {companyInfo?.sector && (
                      <span className="text-[10px] font-semibold text-text-muted bg-surface-muted px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {companyInfo.sector}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[13px] font-mono font-bold text-text-sec">{ticker}</span>
                    <span className="text-text-muted">&middot;</span>
                    <span className="text-[12px] text-text-muted">{quote.exchange}</span>
                    <span className="text-text-muted">&middot;</span>
                    <div className="inline-flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? "bg-emerald-500 animate-pulse-soft" : "bg-text-muted"}`} />
                      <span className="text-[12px] text-text-muted">
                        {isOpen ? "Market open" : "Market closed"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="mt-6">
                <p className="text-[48px] font-bold font-mono text-text tracking-[-0.035em] leading-none mb-2">
                  {formatCurrency(quote.price, quote.currency || currency, locale)}
                </p>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[13px] font-semibold ${isUp ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" : "bg-red-50 text-red-700 ring-1 ring-red-200"}`}>
                    <span className="text-[10px]">{isUp ? "\u25B2" : "\u25BC"}</span>
                    <span className="font-mono">
                      {isUp ? "+" : ""}{formatCurrency(quote.change, quote.currency || currency, locale)}
                    </span>
                    <span className="font-mono opacity-70">
                      ({isUp ? "+" : ""}{quote.changePct?.toFixed(2)}%)
                    </span>
                  </span>
                  <span className="text-[13px] text-text-muted">today</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="pt-6 border-t border-border-light">
            <QuickActionsBar
              ticker={ticker}
              quote={quote}
              position={position}
              inWatchlist={inWatchlist}
              companyInfo={companyInfo}
            />
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        {/* Left column */}
        <div className="space-y-6 min-w-0">
          {/* Price chart */}
          <PriceChart history={history} quote={quote} currency={currency} locale={locale} />

          {/* Historical returns */}
          <HistoricalReturns history={history} />

          {/* 52-Week Range */}
          {quote.fiftyTwoWeekLow != null && quote.fiftyTwoWeekHigh != null && (
            <div className="rounded-2xl border border-border bg-white p-6">
              <RangeBar
                low={quote.fiftyTwoWeekLow}
                high={quote.fiftyTwoWeekHigh}
                current={quote.price}
                label="52-Week Range"
                currency={currency}
                quoteCurrency={quote.currency}
              />
            </div>
          )}

          {/* What-if calculator */}
          <WhatIfCalculator
            history={history}
            currency={currency}
            quoteCurrency={quote.currency}
            ticker={ticker}
          />

          {/* Key Stats */}
          <KeyStats quote={quote} currency={currency} locale={locale} />

          {/* News */}
          <StockNews news={news} ticker={ticker} />
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <YourPosition position={position} currency={currency} />
          <AISuggestions ticker={ticker} />
          {companyInfo?.sector && relatedStocks.length > 0 && (
            <RelatedStocks stocks={relatedStocks} sector={companyInfo.sector} />
          )}
        </div>
      </div>
    </div>
  );
}
