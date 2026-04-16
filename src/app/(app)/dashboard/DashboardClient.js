"use client";

import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCurrency } from "@/constants/markets";
import { addToWatchlist, removeFromWatchlist } from "@/features/watchlist/actions";
import ChartMount from "@/components/ui/ChartMount";
import { IndexStrip } from "@/components/market/IndexCard";

/* ─── Helpers ─── */

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function Sparkline({ positive = true, seed = 1 }) {
  const d = positive
    ? "M0 32 C8 30, 16 28, 24 26 S40 18, 48 20 S64 14, 72 10 S88 6, 96 4 S112 2, 120 3"
    : "M0 4 C8 6, 16 10, 24 14 S40 18, 48 16 S64 22, 72 26 S88 28, 96 30 S112 32, 120 31";
  const color = positive ? "#10b981" : "#ef4444";
  const id = `spark-${positive ? "up" : "down"}-${seed}`;
  return (
    <svg viewBox="0 0 120 36" fill="none" className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={d + " L120 36 L0 36 Z"} fill={`url(#${id})`} />
      <path d={d} stroke={color} strokeWidth="2" strokeLinecap="round" className="sparkline-animate" />
    </svg>
  );
}

/* ─── Portfolio Hero with Chart ─── */

const RANGES = [
  { key: "1W", label: "1W" },
  { key: "1M", label: "1M" },
  { key: "3M", label: "3M" },
  { key: "6M", label: "6M" },
  { key: "1Y", label: "1Y" },
  { key: "ALL", label: "ALL" },
];

function PortfolioHero({ portfolio, currency, initialHistory }) {
  const [range, setRange] = useState("1M");
  const [history, setHistory] = useState(initialHistory || []);
  const [loading, setLoading] = useState(false);

  const isUp = portfolio.dayChange >= 0;
  const pnlUp = portfolio.totalPnl >= 0;
  const hasValue = portfolio.totalValue > 0;

  // Fetch new history when range changes (but not for the initial range)
  useEffect(() => {
    if (range === "1M") {
      setHistory(initialHistory || []);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetch(`/api/portfolio/history?range=${range}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setHistory(data.series || []);
      })
      .catch(() => {
        if (!cancelled) setHistory([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [range, initialHistory]);

  // Chart data: use real history, no synthetic fallback
  const chartData = useMemo(
    () => history.map((p, i) => ({ i, date: p.date, value: p.value })),
    [history]
  );

  // Calculate period change from chart (first point → last point)
  const periodChange = useMemo(() => {
    if (chartData.length < 2) return { pct: 0, abs: 0, up: true };
    const first = chartData[0].value;
    const last = chartData[chartData.length - 1].value;
    const abs = last - first;
    const pct = first > 0 ? (abs / first) * 100 : 0;
    return { pct, abs, up: abs >= 0 };
  }, [chartData]);

  const chartColor = periodChange.up ? "#10b981" : "#ef4444";

  return (
    <div className="hero-gradient hero-mesh rounded-3xl relative overflow-hidden animate-scale-in border border-border shadow-card">
      <div className="relative z-10 p-8 pb-4">
        <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <p className="text-text-muted text-[11px] font-semibold tracking-[0.1em] uppercase">Total Portfolio Value</p>
            </div>
            <h2 className="text-text text-[52px] font-bold tracking-[-0.04em] leading-none mb-4 animate-count-up">
              {formatCurrency(portfolio.totalValue, currency)}
            </h2>

            {hasValue ? (
              <div className="flex items-center gap-3 flex-wrap">
                {/* Period change (from chart first → last point) */}
                {chartData.length >= 2 ? (
                  <>
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[13px] font-semibold ${periodChange.up ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" : "bg-red-50 text-red-700 ring-1 ring-red-200"}`}>
                      <span className="text-[10px]">{periodChange.up ? "\u25B2" : "\u25BC"}</span>
                      <span className="font-mono">
                        {periodChange.up ? "+" : ""}{formatCurrency(periodChange.abs, currency)}
                      </span>
                      <span className="font-mono opacity-70">
                        ({periodChange.up ? "+" : ""}{periodChange.pct.toFixed(2)}%)
                      </span>
                    </div>
                    <span className="text-text-muted text-[13px]">past {range.toLowerCase() === "all" ? "all time" : range}</span>
                  </>
                ) : (
                  <>
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[13px] font-semibold ${isUp ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" : "bg-red-50 text-red-700 ring-1 ring-red-200"}`}>
                      <span className="text-[10px]">{isUp ? "\u25B2" : "\u25BC"}</span>
                      <span className="font-mono">
                        {isUp ? "+" : ""}{formatCurrency(portfolio.dayChange, currency)}
                      </span>
                      <span className="font-mono opacity-70">
                        ({isUp ? "+" : ""}{((portfolio.dayChange / portfolio.totalValue) * 100).toFixed(2)}%)
                      </span>
                    </div>
                    <span className="text-text-muted text-[13px]">today</span>
                  </>
                )}
                <span className="text-border-strong">&middot;</span>
                <span className={`text-[13px] font-semibold font-mono ${pnlUp ? "text-emerald-600" : "text-red-500"}`}>
                  {pnlUp ? "+" : ""}{formatCurrency(portfolio.totalPnl, currency)}
                </span>
                <span className="text-text-muted text-[13px]">all time</span>
              </div>
            ) : (
              <p className="text-text-sec text-[14px]">
                You don&apos;t have any holdings yet. Record your first trade to start tracking.
              </p>
            )}
          </div>

          {/* Range selector — only show when there's real data */}
          {hasValue && (
            <div className="flex items-center gap-0.5 bg-surface-muted rounded-xl p-1 border border-border-light">
              {RANGES.map((r) => (
                <button
                  key={r.key}
                  onClick={() => setRange(r.key)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold font-mono tracking-wide transition-all ${
                    range === r.key
                      ? "bg-white text-text shadow-xs ring-1 ring-border"
                      : "text-text-muted hover:text-text"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chart — only render when user has real history */}
      {!hasValue ? (
        <div className="relative z-10 h-[140px] flex items-center justify-center border-t border-border-light mt-2 mx-8">
          <div className="text-center">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" className="mx-auto mb-2 opacity-50">
              <path d="M21 21H4a1 1 0 01-1-1V3" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M7 14l4-4 4 4 5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="text-[12px] text-text-muted">Your portfolio chart will appear here</p>
          </div>
        </div>
      ) : chartData.length < 2 ? (
        <div className="relative z-10 h-[140px] flex items-center justify-center border-t border-border-light mt-2 mx-8">
          <div className="text-center">
            <p className="text-[13px] font-medium text-text">Not enough history for this range yet</p>
            <p className="text-[11px] text-text-muted mt-0.5">
              Your portfolio chart will fill in as days pass. Try a shorter range.
            </p>
          </div>
        </div>
      ) : (
        <div className="relative z-10 h-[200px] -mt-2">
          {loading && (
            <div className="absolute top-2 right-4 z-20">
              <div className="w-3 h-3 rounded-full border-2 border-border-light border-t-accent animate-spin" />
            </div>
          )}
          <ChartMount className="w-full h-full" fallback={<div className="w-full h-full" />}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 0, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="hero-chart-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={chartColor} stopOpacity="0.25" />
                    <stop offset="100%" stopColor={chartColor} stopOpacity="0" />
                  </linearGradient>
                </defs>
                <XAxis dataKey="i" hide />
                <YAxis hide domain={["dataMin - 5", "dataMax + 5"]} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const pt = payload[0].payload;
                    return (
                      <div className="bg-text text-white rounded-lg px-3 py-2 shadow-elevated">
                        <p className="text-[11px] font-semibold font-mono">
                          {formatCurrency(pt.value, currency)}
                        </p>
                        <p className="text-[10px] text-white/60 font-mono mt-0.5">
                          {new Date(pt.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      </div>
                    );
                  }}
                  cursor={{ stroke: "var(--border-strong)", strokeWidth: 1, strokeDasharray: "3 3" }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={chartColor}
                  strokeWidth={2.5}
                  fill="url(#hero-chart-gradient)"
                  animationDuration={1000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartMount>
        </div>
      )}

      {/* Mini stats bar */}
      <div className="relative z-10 grid grid-cols-3 border-t border-border-light">
        <div className="px-6 py-4 border-r border-border-light">
          <p className="text-text-muted text-[10px] font-semibold uppercase tracking-[0.08em] mb-1.5">Holdings</p>
          <p className="text-text text-[20px] font-bold font-mono tracking-tight">{portfolio.holdingsCount}</p>
        </div>
        <div className="px-6 py-4 border-r border-border-light">
          <p className="text-text-muted text-[10px] font-semibold uppercase tracking-[0.08em] mb-1.5">Day Change</p>
          <p className={`text-[20px] font-bold font-mono tracking-tight ${!hasValue ? "text-text-muted" : isUp ? "text-emerald-600" : "text-red-500"}`}>
            {hasValue ? `${isUp ? "+" : ""}${((portfolio.dayChange / portfolio.totalValue) * 100).toFixed(2)}%` : "\u2014"}
          </p>
        </div>
        <div className="px-6 py-4">
          <p className="text-text-muted text-[10px] font-semibold uppercase tracking-[0.08em] mb-1.5">Total Return</p>
          <p className={`text-[20px] font-bold font-mono tracking-tight ${!hasValue ? "text-text-muted" : pnlUp ? "text-emerald-600" : "text-red-500"}`}>
            {hasValue ? `${pnlUp ? "+" : ""}${formatCurrency(portfolio.totalPnl, currency)}` : "\u2014"}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Market Movers ─── */

function MarketMovers({ tickers, quotes, currency, marketName }) {
  // Enrich tickers with quote data and sort by absolute change
  const enriched = tickers
    .map((t, i) => ({ ...t, quote: quotes[t.ticker], seed: i + 1 }))
    .filter((t) => t.quote);

  const gainers = [...enriched]
    .filter((t) => t.quote.changePct > 0)
    .sort((a, b) => b.quote.changePct - a.quote.changePct)
    .slice(0, 4);

  const losers = [...enriched]
    .filter((t) => t.quote.changePct < 0)
    .sort((a, b) => a.quote.changePct - b.quote.changePct)
    .slice(0, 4);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-[16px] font-semibold text-text">Market Movers</h2>
          <p className="text-[12px] text-text-muted mt-0.5">Top gainers and losers in {marketName}</p>
        </div>
        <Link href="/market" className="text-[13px] text-accent font-medium hover:underline flex items-center gap-1">
          View all
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Gainers */}
        <div className="rounded-2xl border border-border overflow-hidden">
          <div className="px-5 py-3 border-b border-border-light bg-emerald-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" />
                </svg>
              </div>
              <span className="text-[13px] font-semibold text-text">Gainers</span>
            </div>
            <span className="text-[10px] text-emerald-700 font-semibold">{gainers.length} stocks</span>
          </div>
          {gainers.length === 0 ? (
            <div className="p-6 text-center text-[12px] text-text-muted">No gainers right now</div>
          ) : (
            gainers.map((t, i) => (
              <Link
                key={t.ticker}
                href={`/market/${encodeURIComponent(t.ticker)}`}
                className={`flex items-center justify-between px-5 py-3 hover:bg-emerald-50/40 transition-colors group ${
                  i < gainers.length - 1 ? "border-b border-border-light" : ""
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <span className="font-mono text-[10px] font-bold text-emerald-700">
                      {t.ticker.split(".")[0].slice(0, 3)}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-text truncate group-hover:text-accent transition-colors">{t.ticker.split(".")[0]}</p>
                    <p className="text-[11px] text-text-muted truncate">{t.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-8 opacity-60">
                    <Sparkline positive={true} seed={t.seed} />
                  </div>
                  <div className="text-right">
                    <p className="text-[13px] font-semibold text-text font-mono">
                      {t.quote.price?.toLocaleString(undefined, { maximumFractionDigits: t.quote.price > 1000 ? 0 : 2 })}
                    </p>
                    <p className="text-[11px] font-semibold font-mono text-emerald-600">
                      +{t.quote.changePct.toFixed(2)}%
                    </p>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Losers */}
        <div className="rounded-2xl border border-border overflow-hidden">
          <div className="px-5 py-3 border-b border-border-light bg-red-50/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-red-100 flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" /><polyline points="16 17 22 17 22 11" />
                </svg>
              </div>
              <span className="text-[13px] font-semibold text-text">Losers</span>
            </div>
            <span className="text-[10px] text-red-700 font-semibold">{losers.length} stocks</span>
          </div>
          {losers.length === 0 ? (
            <div className="p-6 text-center text-[12px] text-text-muted">No losers right now</div>
          ) : (
            losers.map((t, i) => (
              <Link
                key={t.ticker}
                href={`/market/${encodeURIComponent(t.ticker)}`}
                className={`flex items-center justify-between px-5 py-3 hover:bg-red-50/30 transition-colors group ${
                  i < losers.length - 1 ? "border-b border-border-light" : ""
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                    <span className="font-mono text-[10px] font-bold text-red-700">
                      {t.ticker.split(".")[0].slice(0, 3)}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-text truncate group-hover:text-accent transition-colors">{t.ticker.split(".")[0]}</p>
                    <p className="text-[11px] text-text-muted truncate">{t.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-8 opacity-60">
                    <Sparkline positive={false} seed={t.seed} />
                  </div>
                  <div className="text-right">
                    <p className="text-[13px] font-semibold text-text font-mono">
                      {t.quote.price?.toLocaleString(undefined, { maximumFractionDigits: t.quote.price > 1000 ? 0 : 2 })}
                    </p>
                    <p className="text-[11px] font-semibold font-mono text-red-500">
                      {t.quote.changePct.toFixed(2)}%
                    </p>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Holdings Table ─── */

function HoldingsSection({ holdings, currency }) {
  if (holdings.length === 0) return null;
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[16px] font-semibold text-text">Holdings</h2>
        <Link href="/portfolio" className="text-[13px] text-accent font-medium hover:underline">
          View all
        </Link>
      </div>
      <div className="rounded-2xl border border-border overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-5 py-2.5 bg-surface-muted border-b border-border-light">
          <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Stock</span>
          <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider text-right w-24">Value</span>
          <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider text-right w-20">Return</span>
        </div>
        {holdings.slice(0, 5).map((h, i) => {
          const pnlUp = h.pnl >= 0;
          return (
            <Link
              key={h.companyId}
              href={`/market/${encodeURIComponent(h.ticker)}`}
              className={`grid grid-cols-[1fr_auto_auto] gap-4 items-center px-5 py-3.5 hover:bg-accent-subtle transition-colors ${
                i < Math.min(holdings.length, 5) - 1 ? "border-b border-border-light" : ""
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <span className="font-mono text-[10px] font-bold text-accent">
                    {h.ticker?.split(".")[0]?.slice(0, 3)}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-text truncate">{h.name}</p>
                  <p className="text-[11px] text-text-muted">
                    {h.shares} shares
                  </p>
                </div>
              </div>
              <div className="text-right w-24">
                <p className="text-[13px] font-semibold text-text font-mono">
                  {formatCurrency(h.currentValue, currency)}
                </p>
              </div>
              <div className="text-right w-20">
                <span className={`inline-block text-[12px] font-bold font-mono px-2 py-0.5 rounded-md ${pnlUp ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
                  {pnlUp ? "+" : ""}{h.pnlPct.toFixed(1)}%
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/* ─── News Cards ─── */

function NewsSection({ news }) {
  if (news.length === 0) return null;

  const featured = news[0];
  const rest = news.slice(1);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[16px] font-semibold text-text">Market News</h2>
        <Link href="/news" className="text-[13px] text-accent font-medium hover:underline">View all</Link>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {/* Featured card */}
        <a
          href={featured.url}
          target="_blank"
          rel="noopener noreferrer"
          className="sm:col-span-2 rounded-2xl border border-border p-6 hover:border-accent hover:shadow-card-hover transition-all group relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-1 h-full bg-accent rounded-l-2xl" />
          <div className="pl-4">
            {featured.source && (
              <span className="text-[10px] font-semibold text-accent-text bg-accent-light px-2 py-0.5 rounded-full mb-2 inline-block">
                {featured.source}
              </span>
            )}
            <p className="text-[16px] font-semibold text-text leading-snug line-clamp-2 mb-2 group-hover:text-accent transition-colors">
              {featured.title}
            </p>
            <p className="text-[13px] text-text-sec leading-relaxed line-clamp-2">
              {featured.content}
            </p>
          </div>
        </a>
        {rest.map((item, i) => (
          <a
            key={i}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-2xl border border-border p-5 hover:border-accent hover:shadow-card-hover transition-all group"
          >
            <p className="text-[13px] font-semibold text-text leading-snug line-clamp-2 mb-2 group-hover:text-accent transition-colors">
              {item.title}
            </p>
            <p className="text-[12px] text-text-muted leading-relaxed line-clamp-2 mb-3">
              {item.content}
            </p>
            <div className="flex items-center gap-2">
              {item.source && (
                <span className="text-[10px] font-medium text-accent-text bg-accent-light px-2 py-0.5 rounded-full">{item.source}</span>
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

/* ─── Goals ─── */

function GoalsSection({ goals, currency }) {
  if (goals.length === 0) return null;
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[16px] font-semibold text-text">Goals</h2>
        <Link href="/goals" className="text-[13px] text-accent font-medium hover:underline">Manage</Link>
      </div>
      <div className="space-y-3">
        {goals.slice(0, 3).map((goal) => {
          const pct = Math.min(100, goal.progress);
          return (
            <div key={goal.id} className="rounded-2xl border border-border p-5 group hover:border-accent/40 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[14px] font-semibold text-text">{goal.name}</p>
                <span className="text-[13px] font-bold text-accent font-mono">{pct.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-border-light rounded-full h-2.5 mb-3 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-1000 ease-out"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[12px] font-mono">
                <span className="text-text-muted">{formatCurrency(goal.current_saved, currency)}</span>
                <span className="text-text-sec font-medium">{formatCurrency(goal.target_amount, currency)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Watchlist ─── */

function WatchlistSection({ watchlist, quotes, currency }) {
  const [items, setItems] = useState(watchlist);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState(null);

  async function handleAdd(e) {
    e.preventDefault();
    setError(null);
    const form = e.target;
    const formData = new FormData(form);
    const ticker = formData.get("ticker")?.toString().trim().toUpperCase();
    const name = formData.get("name")?.toString().trim() || ticker;
    const result = await addToWatchlist(formData);
    if (result?.error) { setError(result.error); return; }
    setItems((prev) => [{ watchlistId: `tmp-${ticker}`, ticker, name }, ...prev]);
    form.reset();
    setShowForm(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[16px] font-semibold text-text">Watchlist</h2>
        <button onClick={() => setShowForm((v) => !v)} className="text-[13px] text-accent font-medium hover:underline">
          {showForm ? "Cancel" : "+ Add"}
        </button>
      </div>

      <div className="rounded-2xl border border-border overflow-hidden">
        {showForm && (
          <form onSubmit={handleAdd} className="p-4 border-b border-border-light flex gap-2">
            <input name="ticker" required maxLength={10} placeholder="Ticker" className="input-field !py-2 !text-[12px] font-mono uppercase flex-1" />
            <input name="name" placeholder="Name" className="input-field !py-2 !text-[12px] flex-1" />
            <button type="submit" className="btn-primary !py-2 !px-4 !text-[12px]">Add</button>
          </form>
        )}
        {error && <p className="text-[11px] text-danger px-4 py-2">{error}</p>}

        {items.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-[12px] text-text-muted mb-2">Your watchlist is empty</p>
            <button onClick={() => setShowForm(true)} className="text-[12px] text-accent font-medium hover:underline">Add a stock</button>
          </div>
        ) : (
          items.map((stock, i) => {
            const q = quotes[stock.ticker];
            const isUp = q?.change >= 0;
            return (
              <Link
                key={stock.watchlistId}
                href={`/market/${encodeURIComponent(stock.ticker)}`}
                className={`flex items-center justify-between px-5 py-3 hover:bg-accent-subtle transition-colors ${
                  i < items.length - 1 ? "border-b border-border-light" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                    <span className="font-mono text-[10px] font-bold text-accent">{stock.ticker?.split(".")[0]?.slice(0, 2)}</span>
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-text">{stock.ticker?.split(".")[0]}</p>
                    <p className="text-[10px] text-text-muted truncate max-w-[100px]">{stock.name}</p>
                  </div>
                </div>
                {q ? (
                  <div className="text-right">
                    <p className={`font-mono text-[13px] font-semibold ${isUp ? "text-emerald-600" : "text-red-500"}`}>
                      {formatCurrency(q.price, q.currency || currency)}
                    </p>
                    <p className={`font-mono text-[10px] ${isUp ? "text-emerald-600" : "text-red-500"}`}>
                      {isUp ? "+" : ""}{q.changePct?.toFixed(2)}%
                    </p>
                  </div>
                ) : (
                  <span className="font-mono text-[11px] text-text-muted">--</span>
                )}
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}

/* ─── Quick Actions ─── */

function QuickActions() {
  const actions = [
    { href: "/portfolio/transactions", label: "Record Trade", icon: "M12 5v14M5 12h14", color: "bg-accent/10 text-accent" },
    { href: "/advisor", label: "AI Advisor", icon: "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z", color: "bg-purple/10 text-purple" },
    { href: "/compare", label: "Compare", icon: "M18 20V10M12 20V4M6 20v-6", color: "bg-amber/10 text-amber" },
    { href: "/goals", label: "Set Goal", icon: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 16c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zM12 14a2 2 0 100-4 2 2 0 000 4z", color: "bg-cyan/10 text-cyan" },
  ];

  return (
    <div>
      <h2 className="text-[16px] font-semibold text-text mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="rounded-2xl border border-border p-4 hover:border-accent hover:shadow-card-hover transition-all group text-center"
          >
            <div className={`w-10 h-10 rounded-xl ${a.color} flex items-center justify-center mx-auto mb-2.5`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={a.icon} />
              </svg>
            </div>
            <p className="text-[13px] font-medium text-text group-hover:text-accent transition-colors">{a.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ─── Your Journey (Milestones Stepper) ─── */

function JourneySection({ profile, portfolio, allGoals, watchlist }) {
  const steps = [
    {
      key: "account",
      label: "Account created",
      done: true,
    },
    {
      key: "profile",
      label: "Profile complete",
      done: profile?.onboarding_completed === true,
    },
    {
      key: "goal",
      label: "Goal set",
      done: allGoals.length > 0,
      href: "/goals",
    },
    {
      key: "watchlist",
      label: "Watchlist started",
      done: watchlist.length > 0,
      href: "/market",
    },
    {
      key: "trade",
      label: "First trade",
      done: portfolio.holdings.length > 0,
      href: "/portfolio/transactions",
    },
    {
      key: "diverse",
      label: "3+ holdings",
      done: portfolio.holdings.length >= 3,
      href: "/market",
    },
  ];

  const completed = steps.filter((s) => s.done).length;
  const pct = Math.round((completed / steps.length) * 100);

  // Don't show if everything's done
  if (completed === steps.length) return null;

  return (
    <div className="mb-8 rounded-2xl border border-border bg-gradient-to-br from-white via-surface-muted to-white p-6 relative overflow-hidden">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h3 className="text-[15px] font-bold text-text">Your journey</h3>
          <p className="text-[12px] text-text-muted mt-0.5">
            {completed} of {steps.length} milestones completed
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-32 h-1.5 bg-border-light rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-accent transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-[12px] font-bold font-mono text-text">{pct}%</span>
        </div>
      </div>

      <div className="relative">
        {/* Connecting line */}
        <div className="absolute top-5 left-5 right-5 h-px bg-border-light" />
        <div
          className="absolute top-5 left-5 h-px bg-accent transition-all duration-700"
          style={{
            width: `calc((100% - 2.5rem) * ${completed > 0 ? (completed - 1) / (steps.length - 1) : 0})`,
          }}
        />

        <div className="relative grid grid-cols-6 gap-2">
          {steps.map((step, i) => {
            const content = (
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all ${
                    step.done
                      ? "bg-accent text-white ring-4 ring-accent-light"
                      : "bg-white text-text-muted ring-1 ring-border"
                  }`}
                >
                  {step.done ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <span className="text-[11px] font-bold font-mono">{i + 1}</span>
                  )}
                </div>
                <p className={`text-[11px] font-medium text-center leading-tight ${step.done ? "text-text" : "text-text-muted"}`}>
                  {step.label}
                </p>
              </div>
            );
            return step.href && !step.done ? (
              <Link key={step.key} href={step.href} className="group">
                {content}
              </Link>
            ) : (
              <div key={step.key}>{content}</div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── Market Sentiment Gauge ─── */

function MarketSentiment({ tickers, quotes }) {
  const enriched = tickers.map((t) => quotes[t.ticker]).filter(Boolean);
  if (enriched.length === 0) return null;

  const up = enriched.filter((q) => q.changePct > 0).length;
  const down = enriched.filter((q) => q.changePct < 0).length;
  const flat = enriched.length - up - down;
  const total = enriched.length;

  const bullishPct = (up / total) * 100;
  // Calculate needle angle: -90 (bearish) to 90 (bullish)
  const angle = ((up - down) / total) * 90;

  let label, color, textColor;
  if (bullishPct > 60) { label = "Bullish"; color = "#059669"; textColor = "text-emerald-700"; }
  else if (bullishPct > 40) { label = "Neutral"; color = "#64748b"; textColor = "text-text-sec"; }
  else { label = "Bearish"; color = "#ef4444"; textColor = "text-red-500"; }

  return (
    <div className="rounded-2xl border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[14px] font-semibold text-text">Market Sentiment</h3>
        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${textColor} bg-surface-muted`}>
          {label}
        </span>
      </div>

      <div className="relative h-[110px] flex items-end justify-center">
        <svg viewBox="0 0 200 110" className="w-full h-full">
          {/* Gauge arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="var(--border-light)"
            strokeWidth="10"
            strokeLinecap="round"
          />
          {/* Bearish zone */}
          <path
            d="M 20 100 A 80 80 0 0 1 73 30"
            fill="none"
            stroke="#ef4444"
            strokeWidth="10"
            strokeLinecap="round"
            opacity="0.7"
          />
          {/* Neutral zone */}
          <path
            d="M 73 30 A 80 80 0 0 1 127 30"
            fill="none"
            stroke="#94a3b8"
            strokeWidth="10"
            strokeLinecap="round"
            opacity="0.5"
          />
          {/* Bullish zone */}
          <path
            d="M 127 30 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#059669"
            strokeWidth="10"
            strokeLinecap="round"
            opacity="0.7"
          />
          {/* Needle */}
          <g transform={`translate(100 100) rotate(${angle})`} style={{ transition: "transform 1s cubic-bezier(0.16, 1, 0.3, 1)" }}>
            <line x1="0" y1="0" x2="0" y2="-70" stroke={color} strokeWidth="3" strokeLinecap="round" />
            <circle cx="0" cy="0" r="8" fill={color} />
            <circle cx="0" cy="0" r="3" fill="white" />
          </g>
        </svg>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center mt-3 pt-3 border-t border-border-light">
        <div>
          <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">Up</p>
          <p className="text-[14px] font-bold font-mono text-emerald-600">{up}</p>
        </div>
        <div>
          <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">Flat</p>
          <p className="text-[14px] font-bold font-mono text-text-sec">{flat}</p>
        </div>
        <div>
          <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">Down</p>
          <p className="text-[14px] font-bold font-mono text-red-500">{down}</p>
        </div>
      </div>
    </div>
  );
}

/* ─── Market Heatmap ─── */

function MarketHeatmap({ tickers, quotes }) {
  const enriched = tickers
    .map((t) => ({ ...t, quote: quotes[t.ticker] }))
    .filter((t) => t.quote);

  if (enriched.length === 0) return null;

  // Determine tile size based on market cap proxy (use absolute price as rough signal).
  // Since we don't have real market cap, weight by a sort of activity score.
  const maxChange = Math.max(...enriched.map((t) => Math.abs(t.quote.changePct)));

  function colorFor(changePct) {
    const intensity = Math.min(1, Math.abs(changePct) / Math.max(3, maxChange));
    if (changePct > 0) {
      // emerald gradient from 50 → 500
      const lightness = 95 - intensity * 40;
      return `hsl(152, 76%, ${lightness}%)`;
    } else if (changePct < 0) {
      const lightness = 95 - intensity * 40;
      return `hsl(0, 84%, ${lightness}%)`;
    }
    return "var(--surface-muted)";
  }

  function textColorFor(changePct) {
    const intensity = Math.min(1, Math.abs(changePct) / Math.max(3, maxChange));
    if (intensity > 0.5) return "text-white";
    return changePct > 0 ? "text-emerald-800" : changePct < 0 ? "text-red-800" : "text-text";
  }

  return (
    <div className="rounded-2xl border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[14px] font-semibold text-text">Market Heatmap</h3>
        <div className="flex items-center gap-3 text-[10px] font-medium">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-red-400" />
            <span className="text-text-muted">Losers</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-emerald-400" />
            <span className="text-text-muted">Gainers</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        {enriched.slice(0, 8).map((t) => {
          const pct = t.quote.changePct;
          return (
            <Link
              key={t.ticker}
              href={`/market/${encodeURIComponent(t.ticker)}`}
              className={`rounded-lg p-2.5 transition-all hover:scale-[1.04] hover:shadow-card-hover ${textColorFor(pct)}`}
              style={{ backgroundColor: colorFor(pct), minHeight: "72px" }}
            >
              <p className="font-mono text-[11px] font-bold leading-none mb-1">
                {t.ticker.split(".")[0]}
              </p>
              <p className="text-[9px] font-medium opacity-80 truncate">{t.name}</p>
              <p className="font-mono text-[11px] font-bold mt-1.5">
                {pct > 0 ? "+" : ""}{pct.toFixed(2)}%
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Learn Card (educational tip) ─── */

const LEARN_TIPS = [
  {
    emoji: "\u{1F4CA}",
    title: "Dollar-cost averaging",
    body: "Investing a fixed amount regularly — regardless of price — reduces the impact of volatility and can beat market timing over the long run.",
    tag: "Strategy",
  },
  {
    emoji: "\u{1F6E1}\u{FE0F}",
    title: "The 3-6 month rule",
    body: "Keep 3 to 6 months of expenses in an easy-access emergency fund before investing aggressively. Liquidity matters more than returns in a crisis.",
    tag: "Safety",
  },
  {
    emoji: "\u{1F4C8}",
    title: "Understanding P/E",
    body: "Price-to-earnings tells you how many years of current profit it would take to recoup the share price. A lower P/E often means a stock is relatively cheap.",
    tag: "Fundamentals",
  },
  {
    emoji: "\u{1F310}",
    title: "Diversification",
    body: "Holding stocks across different sectors and geographies reduces risk. Aim for exposure to at least 5-10 uncorrelated assets.",
    tag: "Risk",
  },
];

function LearnCard() {
  // Rotate tip by day-of-year so it changes daily but is stable within a day
  const dayOfYear = Math.floor((Date.now() / 86400000) % LEARN_TIPS.length);
  const tip = LEARN_TIPS[dayOfYear];

  return (
    <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 relative overflow-hidden group">
      {/* Decorative pattern */}
      <svg className="absolute top-0 right-0 opacity-10 pointer-events-none" width="180" height="180" viewBox="0 0 180 180" fill="none">
        <circle cx="150" cy="30" r="60" stroke="white" strokeWidth="1" />
        <circle cx="150" cy="30" r="40" stroke="white" strokeWidth="1" />
        <circle cx="150" cy="30" r="20" stroke="white" strokeWidth="1" />
      </svg>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Learn</span>
          <span className="text-[10px] font-semibold text-slate-300 bg-white/10 px-2 py-0.5 rounded-full">
            {tip.tag}
          </span>
        </div>

        <div className="text-3xl mb-3">{tip.emoji}</div>

        <h3 className="text-white text-[17px] font-bold mb-2 tracking-tight">
          {tip.title}
        </h3>
        <p className="text-slate-300 text-[13px] leading-relaxed mb-5">
          {tip.body}
        </p>

        <Link
          href="/advisor"
          className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-white hover:text-accent transition-colors group/link"
        >
          Ask the AI advisor
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover/link:translate-x-0.5">
            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

/* ─── Empty State ─── */

function EmptyState({ currency }) {
  return (
    <div className="rounded-2xl border border-dashed border-border-strong p-8 text-center">
      <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-5">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 21H4a1 1 0 01-1-1V3" />
          <path d="M7 14l4-4 4 4 5-5" />
        </svg>
      </div>
      <h3 className="text-[18px] font-bold text-text mb-2">Start building your portfolio</h3>
      <p className="text-[14px] text-text-sec mb-6 max-w-sm mx-auto">
        Browse stocks, record your first trade, or ask the AI advisor for investment ideas.
      </p>
      <div className="flex items-center justify-center gap-3">
        <Link href="/market" className="btn-primary !py-2.5 !px-6 text-[14px]">
          Explore Market
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
          </svg>
        </Link>
        <Link href="/advisor" className="btn-secondary !py-2.5 !px-6 text-[14px]">
          Talk to Advisor
        </Link>
      </div>
    </div>
  );
}

/* ─── Main Dashboard ─── */

export default function DashboardClient({
  userName, currency, profile, portfolio, initialHistory, activeGoals, allGoals,
  watchlist, quotes, news, indexes = [], popularTickers, marketConfig,
}) {
  const hasHoldings = portfolio.holdings.length > 0;

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="max-w-[1200px] mx-auto px-8 py-8 stagger-sections">
      {/* Greeting */}
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-[26px] font-bold text-text tracking-[-0.035em]">
            {getGreeting()}, {userName}
          </h1>
          <p className="text-[13px] text-text-muted mt-1">{today}</p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-muted ring-1 ring-border-light">
          <span className="relative flex w-2 h-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-text-muted opacity-60 animate-ping" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-text-sec" />
          </span>
          <span className="text-[12px] font-medium text-text-sec">Live data</span>
        </div>
      </div>

      {/* Hero */}
      <div className="mb-8">
        <PortfolioHero portfolio={portfolio} currency={currency} initialHistory={initialHistory} />
      </div>

      {/* Market Indexes */}
      {indexes.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-semibold text-text">
              {marketConfig.name} indexes
            </h2>
            <Link href="/market" className="text-[13px] text-accent font-medium hover:underline">
              Full market &rarr;
            </Link>
          </div>
          <IndexStrip indexes={indexes} />
        </div>
      )}

      {/* Journey milestones — horizontal stepper pattern */}
      <JourneySection
        profile={profile}
        portfolio={portfolio}
        allGoals={allGoals}
        watchlist={watchlist}
      />

      {/* Row: Market Sentiment + Heatmap — two different visual treatments */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <MarketSentiment tickers={popularTickers} quotes={quotes} />
        <MarketHeatmap tickers={popularTickers} quotes={quotes} />
      </div>

      {/* Market Movers */}
      <div className="mb-8">
        <MarketMovers
          tickers={popularTickers}
          quotes={quotes}
          currency={currency}
          marketName={marketConfig.name}
        />
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-5 gap-8">
        {/* Left — 3/5 */}
        <div className="lg:col-span-3 space-y-8">
          {hasHoldings ? (
            <HoldingsSection holdings={portfolio.holdings} currency={currency} />
          ) : (
            <EmptyState currency={currency} />
          )}
          <NewsSection news={news} />
        </div>

        {/* Right — 2/5 */}
        <div className="lg:col-span-2 space-y-8">
          <LearnCard />
          <GoalsSection goals={activeGoals} currency={currency} />
          <QuickActions />
          <WatchlistSection watchlist={watchlist} quotes={quotes} currency={currency} />
        </div>
      </div>
    </div>
  );
}
