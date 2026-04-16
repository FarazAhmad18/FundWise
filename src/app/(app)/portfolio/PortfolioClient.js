"use client";

import { useState, useTransition, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  Legend,
} from "recharts";
import { formatCurrency } from "@/constants/markets";
import { deleteHolding, updateHolding } from "@/features/transactions/actions";
import ChartMount from "@/components/ui/ChartMount";

/* ────────────────────────────────────────────
   Helpers
   ──────────────────────────────────────────── */

function formatRelativeTime(date) {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  const diffHrs = (Date.now() - d.getTime()) / (1000 * 60 * 60);
  if (diffHrs < 24) return "Today";
  if (diffHrs < 48) return "Yesterday";
  if (diffHrs < 24 * 7) return `${Math.round(diffHrs / 24)}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/* ────────────────────────────────────────────
   Hero — Portfolio Value + Key Numbers
   ──────────────────────────────────────────── */

function PortfolioHero({ portfolio, currency, locale }) {
  const { totalValue, totalCost, totalPnl, totalPnlPct, dayChange } = portfolio;
  const isPnlUp = totalPnl >= 0;
  const isDayUp = dayChange >= 0;
  const dayPct = totalValue > 0 ? (dayChange / totalValue) * 100 : 0;

  return (
    <div className="rounded-3xl border border-border bg-white p-8 mb-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-accent/5 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex items-start justify-between flex-wrap gap-6">
        <div>
          <p className="text-[11px] font-semibold text-text-muted uppercase tracking-[0.12em] mb-2">
            Portfolio Value
          </p>
          <h1 className="text-[44px] font-bold text-text tracking-[-0.035em] leading-none mb-3">
            {formatCurrency(totalValue, currency, locale)}
          </h1>
          <div className="flex items-center gap-3 flex-wrap">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-semibold ${
                isDayUp
                  ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                  : "bg-red-50 text-red-700 ring-1 ring-red-200"
              }`}
            >
              <span className="text-[9px]">{isDayUp ? "\u25B2" : "\u25BC"}</span>
              <span className="font-mono">
                {isDayUp ? "+" : ""}{formatCurrency(dayChange, currency, locale)}
              </span>
              <span className="font-mono opacity-70">
                ({isDayUp ? "+" : ""}{dayPct.toFixed(2)}%)
              </span>
            </span>
            <span className="text-text-muted text-[12px]">today</span>
            <span className="text-border-strong">&middot;</span>
            <span
              className={`text-[12px] font-semibold font-mono ${
                isPnlUp ? "text-emerald-600" : "text-red-500"
              }`}
            >
              {isPnlUp ? "+" : ""}{formatCurrency(totalPnl, currency, locale)} (
              {isPnlUp ? "+" : ""}{totalPnlPct.toFixed(2)}%)
            </span>
            <span className="text-text-muted text-[12px]">all-time</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/portfolio/transactions"
            className="btn-primary !py-2.5 !px-5 text-[13px]"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Record trade
          </Link>
          <Link
            href="/portfolio/transactions"
            className="inline-flex items-center gap-1.5 py-2.5 px-4 rounded-lg text-[13px] font-medium bg-white text-text border border-border hover:border-accent/40 transition-all"
          >
            History
          </Link>
        </div>
      </div>

      {/* Bottom stats bar */}
      <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 pt-6 border-t border-border-light">
        <div>
          <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1">
            Invested
          </p>
          <p className="text-[18px] font-bold font-mono text-text">
            {formatCurrency(totalCost, currency, locale)}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1">
            Current
          </p>
          <p className="text-[18px] font-bold font-mono text-text">
            {formatCurrency(totalValue, currency, locale)}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1">
            Unrealized P&L
          </p>
          <p className={`text-[18px] font-bold font-mono ${isPnlUp ? "text-emerald-600" : "text-red-500"}`}>
            {isPnlUp ? "+" : ""}{formatCurrency(totalPnl, currency, locale)}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1">
            Holdings
          </p>
          <p className="text-[18px] font-bold font-mono text-text">
            {portfolio.holdingsCount}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────
   Portfolio vs Benchmark Chart
   ──────────────────────────────────────────── */

const HISTORY_RANGES = [
  { key: "1W", days: 7 },
  { key: "1M", days: 30 },
  { key: "3M", days: 90 },
  { key: "6M", days: 180 },
  { key: "1Y", days: 365 },
  { key: "ALL", days: 365 * 10 },
];

function PortfolioVsBenchmarkChart({ initialHistory, benchmark, currency, locale }) {
  const [range, setRange] = useState("3M");
  const [history, setHistory] = useState(initialHistory || []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (range === "3M") {
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

  // Merge portfolio + benchmark, normalized to 100 at the first date
  const chartData = useMemo(() => {
    if (!history.length) return [];

    // Build benchmark map (date → close) from benchmark.sparkline + history
    // Actually `benchmark.sparkline` is just values; we need paired dates.
    // Use benchmark.sparkline aligned to the last N trading days.
    const benchValues = benchmark?.sparkline || [];

    // Start value for normalization
    const portStart = history[0].value;

    // We'll match benchmark data to portfolio dates by index (if lengths close)
    // For better alignment, we'd need benchmark history with dates — simplify
    // by using the last benchValues.length days of portfolio history.
    const portionLen = Math.min(history.length, benchValues.length);
    const portStartForBench = history[history.length - portionLen]?.value ?? portStart;
    const benchStart = benchValues[0];

    return history.map((p, i) => {
      const portNorm = portStart ? ((p.value - portStart) / portStart) * 100 : 0;

      // Try to match benchmark value by offset from the end
      const offsetFromEnd = history.length - 1 - i;
      const benchIdx = benchValues.length - 1 - offsetFromEnd;
      const benchValue = benchIdx >= 0 ? benchValues[benchIdx] : null;
      const benchNorm =
        benchValue != null && benchStart
          ? ((benchValue - benchStart) / benchStart) * 100
          : null;

      return {
        date: p.date,
        portfolioPct: +portNorm.toFixed(2),
        benchmarkPct: benchNorm != null ? +benchNorm.toFixed(2) : null,
        portfolioValue: p.value,
      };
    });
  }, [history, benchmark]);

  // Period metrics
  const periodMetrics = useMemo(() => {
    if (chartData.length < 2) return null;
    const last = chartData[chartData.length - 1];
    return {
      portfolioPct: last.portfolioPct,
      benchmarkPct: last.benchmarkPct,
      alpha: last.benchmarkPct != null ? last.portfolioPct - last.benchmarkPct : null,
    };
  }, [chartData]);

  if (!initialHistory?.length) {
    return (
      <div className="rounded-2xl border border-border bg-white p-8 text-center">
        <p className="text-[14px] text-text-muted">
          Portfolio performance chart appears after you record your first trade.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-white overflow-hidden">
      <div className="px-6 py-4 border-b border-border-light flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-[14px] font-semibold text-text">Performance</h3>
          {periodMetrics && (
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-0.5 bg-accent rounded-full" />
                <span className="text-[11px] text-text-muted">Your portfolio</span>
                <span className={`text-[11px] font-bold font-mono ${periodMetrics.portfolioPct >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                  {periodMetrics.portfolioPct >= 0 ? "+" : ""}{periodMetrics.portfolioPct.toFixed(2)}%
                </span>
              </div>
              {benchmark && periodMetrics.benchmarkPct != null && (
                <>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-0.5 bg-slate-400 rounded-full" />
                    <span className="text-[11px] text-text-muted">{benchmark.short}</span>
                    <span className={`text-[11px] font-bold font-mono ${periodMetrics.benchmarkPct >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                      {periodMetrics.benchmarkPct >= 0 ? "+" : ""}{periodMetrics.benchmarkPct.toFixed(2)}%
                    </span>
                  </div>
                  {periodMetrics.alpha != null && (
                    <div className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      periodMetrics.alpha > 0
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-red-50 text-red-600"
                    }`}>
                      {periodMetrics.alpha > 0 ? "Beating" : "Trailing"} by{" "}
                      <span className="font-mono">
                        {Math.abs(periodMetrics.alpha).toFixed(2)}%
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-0.5 bg-surface-muted rounded-xl p-1 border border-border-light">
          {HISTORY_RANGES.map((r) => (
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

      {chartData.length < 2 ? (
        <div className="h-[280px] flex items-center justify-center">
          <p className="text-[12px] text-text-muted">
            Not enough history for this range yet
          </p>
        </div>
      ) : (
        <div className="h-[280px] px-2 pb-2 relative">
          {loading && (
            <div className="absolute top-2 right-4 z-20">
              <div className="w-3 h-3 rounded-full border-2 border-border-light border-t-accent animate-spin" />
            </div>
          )}
          <ChartMount className="w-full h-full" fallback={<div className="w-full h-full" />}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 16, right: 16, bottom: 16, left: 16 }}>
                <defs>
                  <linearGradient id="port-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
                <XAxis dataKey="date" hide />
                <YAxis
                  tickFormatter={(v) => `${v > 0 ? "+" : ""}${v.toFixed(0)}%`}
                  stroke="var(--text-muted)"
                  fontSize={10}
                  width={42}
                />
                <ReferenceLine y={0} stroke="var(--border-strong)" strokeDasharray="2 2" />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const pt = payload[0].payload;
                    return (
                      <div className="bg-text text-white rounded-lg px-3 py-2 shadow-elevated">
                        <p className="text-[10px] text-white/60 font-mono mb-1">
                          {new Date(pt.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="text-[9px] text-emerald-300 uppercase tracking-wider">You</p>
                            <p className="text-[11px] font-semibold font-mono">
                              {pt.portfolioPct >= 0 ? "+" : ""}{pt.portfolioPct?.toFixed(2)}%
                            </p>
                          </div>
                          {pt.benchmarkPct != null && (
                            <div>
                              <p className="text-[9px] text-slate-300 uppercase tracking-wider">{benchmark?.short}</p>
                              <p className="text-[11px] font-semibold font-mono">
                                {pt.benchmarkPct >= 0 ? "+" : ""}{pt.benchmarkPct?.toFixed(2)}%
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="portfolioPct"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={false}
                  animationDuration={800}
                />
                {benchmark && (
                  <Line
                    type="monotone"
                    dataKey="benchmarkPct"
                    stroke="#94a3b8"
                    strokeWidth={1.5}
                    strokeDasharray="4 3"
                    dot={false}
                    animationDuration={800}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </ChartMount>
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────
   Holdings Treemap — size = value, color = performance
   ──────────────────────────────────────────── */

function HoldingsTreemap({ holdings, currency, totalValue }) {
  if (!holdings.length) return null;

  // Sort by current value desc
  const sorted = [...holdings].sort((a, b) => b.currentValue - a.currentValue);

  // Use a simple squarified-ish layout with CSS grid.
  // Tile width proportional to value.
  return (
    <div className="rounded-2xl border border-border bg-white overflow-hidden">
      <div className="px-6 py-4 border-b border-border-light flex items-center justify-between">
        <h3 className="text-[14px] font-semibold text-text">Holdings map</h3>
        <p className="text-[11px] text-text-muted">
          Size = value &middot; color = performance
        </p>
      </div>
      <div className="p-3">
        <div className="grid grid-cols-6 gap-1.5" style={{ gridAutoRows: "64px" }}>
          {sorted.map((h, i) => {
            const pct = totalValue > 0 ? (h.currentValue / totalValue) * 100 : 0;
            // Span calc: top holdings span more cells
            const span =
              pct > 30 ? { col: "span 6", row: "span 2" } :
              pct > 15 ? { col: "span 3", row: "span 2" } :
              pct > 8 ? { col: "span 2", row: "span 1" } :
              pct > 4 ? { col: "span 2", row: "span 1" } :
              { col: "span 1", row: "span 1" };

            const isUp = h.pnlPct >= 0;
            const intensity = Math.min(1, Math.abs(h.pnlPct) / 15);
            const bgOpacity = 0.08 + intensity * 0.65;

            return (
              <Link
                key={h.companyId}
                href={`/market/${encodeURIComponent(h.ticker)}`}
                className="relative rounded-lg overflow-hidden p-2 hover:ring-2 hover:ring-accent transition-all group"
                style={{
                  gridColumn: span.col,
                  gridRow: span.row,
                  backgroundColor: isUp
                    ? `rgba(16, 185, 129, ${bgOpacity})`
                    : `rgba(239, 68, 68, ${bgOpacity})`,
                }}
              >
                <div className="h-full flex flex-col justify-between">
                  <div>
                    <p className={`font-mono font-bold text-[10px] ${intensity > 0.4 && isUp ? "text-emerald-900" : intensity > 0.4 ? "text-red-900" : "text-text"}`}>
                      {h.ticker.split(".")[0]}
                    </p>
                    {pct > 5 && (
                      <p className={`text-[9px] leading-tight mt-0.5 ${intensity > 0.4 ? (isUp ? "text-emerald-800" : "text-red-800") : "text-text-sec"}`}>
                        {pct.toFixed(1)}%
                      </p>
                    )}
                  </div>
                  <div>
                    <p className={`text-[10px] font-mono font-bold ${isUp ? "text-emerald-700" : "text-red-600"}`}>
                      {isUp ? "+" : ""}{h.pnlPct.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────
   Best / Worst Performers
   ──────────────────────────────────────────── */

function PerformersPanel({ holdings, currency, locale }) {
  if (holdings.length < 2) return null;

  const sorted = [...holdings].sort((a, b) => b.pnlPct - a.pnlPct);
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {/* Best */}
      <Link
        href={`/market/${encodeURIComponent(best.ticker)}`}
        className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 relative overflow-hidden hover:border-emerald-300 transition-all group"
      >
        <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
        <div className="relative z-10 pl-2">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-[0.15em]">
              Best performer
            </span>
            <span className="text-[10px]">{String.fromCodePoint(0x1F3C6)}</span>
          </div>
          <p className="text-[15px] font-bold text-text tracking-tight mb-0.5">
            {best.name}
          </p>
          <p className="text-[11px] text-text-muted font-mono mb-3">
            {best.ticker.split(".")[0]}
          </p>
          <div className="flex items-end gap-3">
            <p className="text-[28px] font-bold font-mono text-emerald-600 tracking-tight leading-none">
              +{best.pnlPct.toFixed(2)}%
            </p>
            <p className="text-[12px] text-emerald-600 font-mono font-semibold pb-1">
              +{formatCurrency(best.pnl, currency, locale)}
            </p>
          </div>
        </div>
      </Link>

      {/* Worst */}
      <Link
        href={`/market/${encodeURIComponent(worst.ticker)}`}
        className={`rounded-2xl border p-5 relative overflow-hidden transition-all group ${
          worst.pnlPct < 0
            ? "border-red-200 bg-red-50/50 hover:border-red-300"
            : "border-border bg-white hover:border-accent"
        }`}
      >
        <div className={`absolute top-0 left-0 w-1 h-full ${worst.pnlPct < 0 ? "bg-red-500" : "bg-text-muted"}`} />
        <div className="relative z-10 pl-2">
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-[10px] font-bold uppercase tracking-[0.15em] ${worst.pnlPct < 0 ? "text-red-600" : "text-text-muted"}`}>
              {worst.pnlPct < 0 ? "Worst performer" : "Lowest return"}
            </span>
          </div>
          <p className="text-[15px] font-bold text-text tracking-tight mb-0.5">
            {worst.name}
          </p>
          <p className="text-[11px] text-text-muted font-mono mb-3">
            {worst.ticker.split(".")[0]}
          </p>
          <div className="flex items-end gap-3">
            <p className={`text-[28px] font-bold font-mono tracking-tight leading-none ${worst.pnlPct < 0 ? "text-red-500" : "text-text"}`}>
              {worst.pnlPct >= 0 ? "+" : ""}{worst.pnlPct.toFixed(2)}%
            </p>
            <p className={`text-[12px] font-mono font-semibold pb-1 ${worst.pnl < 0 ? "text-red-500" : "text-emerald-600"}`}>
              {worst.pnl >= 0 ? "+" : ""}{formatCurrency(worst.pnl, currency, locale)}
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
}

/* ────────────────────────────────────────────
   Diversification Score Gauge + Concentration Warnings
   ──────────────────────────────────────────── */

function DiversificationScore({ holdings, totalValue, marketConfig }) {
  if (!holdings.length) return null;

  // Compute the score:
  // 1. Number of holdings (more = better, up to 10)
  // 2. Concentration (max weight) — lower is better
  // 3. Sector spread (more sectors = better)
  const numHoldings = holdings.length;
  const weights = holdings.map((h) => totalValue > 0 ? h.currentValue / totalValue : 0);
  const maxWeight = Math.max(0, ...weights);

  // Enrich holdings with sector from market config
  const sectorMap = {};
  for (const s of marketConfig.popularTickers) sectorMap[s.ticker] = s.sector || "Other";

  const sectors = new Set(holdings.map((h) => sectorMap[h.ticker] || "Other"));
  const numSectors = sectors.size;

  // Holdings score: 0-35
  const holdingsScore = Math.min(35, (numHoldings / 8) * 35);

  // Concentration score: 0-35 (max weight > 40% → 0, < 15% → 35)
  const concentrationScore = Math.max(0, Math.min(35, 35 - (maxWeight - 0.15) * 100));

  // Sector score: 0-30 (1 sector → 0, 5+ sectors → 30)
  const sectorScore = Math.min(30, (numSectors / 5) * 30);

  const totalScore = Math.round(holdingsScore + concentrationScore + sectorScore);

  let label, color, textColor;
  if (totalScore >= 75) { label = "Excellent"; color = "#10b981"; textColor = "text-emerald-700"; }
  else if (totalScore >= 55) { label = "Good"; color = "#f59e0b"; textColor = "text-amber-600"; }
  else if (totalScore >= 35) { label = "Fair"; color = "#f59e0b"; textColor = "text-amber-700"; }
  else { label = "Poor"; color = "#ef4444"; textColor = "text-red-600"; }

  // Concentration warnings
  const warnings = [];
  holdings.forEach((h) => {
    const weight = totalValue > 0 ? (h.currentValue / totalValue) * 100 : 0;
    if (weight > 30) {
      warnings.push({
        type: "concentration",
        text: `${h.ticker.split(".")[0]} is ${weight.toFixed(0)}% of your portfolio`,
        severity: weight > 50 ? "high" : "medium",
      });
    }
  });
  if (numHoldings < 3) {
    warnings.push({
      type: "holdings",
      text: `Only ${numHoldings} stock${numHoldings === 1 ? "" : "s"} — consider adding more`,
      severity: "medium",
    });
  }
  if (numSectors === 1) {
    warnings.push({
      type: "sector",
      text: `All holdings are in one sector (${[...sectors][0]})`,
      severity: "medium",
    });
  }

  // Circle gauge
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const progress = (totalScore / 100) * circumference;

  return (
    <div className="rounded-2xl border border-border bg-white p-6">
      <h3 className="text-[14px] font-semibold text-text mb-1">Diversification</h3>
      <p className="text-[11px] text-text-muted mb-5">
        Based on your holdings, concentration, and sector mix
      </p>

      <div className="flex items-center gap-5 mb-5">
        <div className="relative w-[100px] h-[100px] flex-shrink-0">
          <svg width="100" height="100" viewBox="0 0 100 100" className="-rotate-90">
            <circle cx="50" cy="50" r={radius} fill="none" stroke="var(--border-light)" strokeWidth="8" />
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - progress}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-[24px] font-bold text-text font-mono leading-none">{totalScore}</p>
            <p className="text-[9px] text-text-muted font-semibold uppercase tracking-wider mt-0.5">/ 100</p>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className={`text-[16px] font-bold ${textColor} mb-2`}>{label}</p>
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px]">
              <span className="text-text-muted">Holdings</span>
              <span className="font-mono font-semibold text-text">{numHoldings}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-text-muted">Sectors</span>
              <span className="font-mono font-semibold text-text">{numSectors}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-text-muted">Top weight</span>
              <span className="font-mono font-semibold text-text">{(maxWeight * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="space-y-2 pt-4 border-t border-border-light">
          {warnings.map((w, i) => (
            <div
              key={i}
              className={`flex items-start gap-2 p-2.5 rounded-lg ${
                w.severity === "high"
                  ? "bg-red-50 border border-red-200"
                  : "bg-amber-50 border border-amber-200"
              }`}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke={w.severity === "high" ? "#ef4444" : "#f59e0b"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mt-0.5 flex-shrink-0"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <p className={`text-[11px] leading-snug ${w.severity === "high" ? "text-red-800" : "text-amber-800"}`}>
                {w.text}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────
   Sector Allocation
   ──────────────────────────────────────────── */

function SectorAllocation({ holdings, totalValue, marketConfig }) {
  if (!holdings.length) return null;

  const sectorMap = {};
  for (const s of marketConfig.popularTickers) sectorMap[s.ticker] = s.sector || "Other";

  const sectorTotals = {};
  for (const h of holdings) {
    const sec = sectorMap[h.ticker] || "Other";
    sectorTotals[sec] = (sectorTotals[sec] || 0) + h.currentValue;
  }

  const sectors = Object.entries(sectorTotals)
    .map(([name, value]) => ({
      name,
      value,
      pct: totalValue > 0 ? (value / totalValue) * 100 : 0,
    }))
    .sort((a, b) => b.value - a.value);

  const colors = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#06b6d4", "#f43f5e", "#94a3b8"];

  return (
    <div className="rounded-2xl border border-border bg-white p-6">
      <h3 className="text-[14px] font-semibold text-text mb-1">Sectors</h3>
      <p className="text-[11px] text-text-muted mb-5">
        {sectors.length} sector{sectors.length !== 1 ? "s" : ""}
      </p>

      {/* Horizontal stacked bar */}
      <div className="flex h-3 rounded-full overflow-hidden mb-4">
        {sectors.map((s, i) => (
          <div
            key={s.name}
            className="h-full transition-all duration-700 ease-out"
            style={{
              width: `${s.pct}%`,
              backgroundColor: colors[i % colors.length],
            }}
            title={`${s.name}: ${s.pct.toFixed(1)}%`}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="space-y-2">
        {sectors.map((s, i) => (
          <div key={s.name} className="flex items-center justify-between text-[12px]">
            <div className="flex items-center gap-2 min-w-0">
              <div
                className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                style={{ backgroundColor: colors[i % colors.length] }}
              />
              <span className="text-text truncate">{s.name}</span>
            </div>
            <div className="flex items-center gap-2 font-mono">
              <span className="text-text-muted">{s.pct.toFixed(1)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────
   Holdings Table (redesigned)
   ──────────────────────────────────────────── */

function ConfirmDialog({ title, message, confirmLabel, danger, onConfirm, onCancel }) {
  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onCancel(); }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-fade-in" onClick={onCancel}>
      <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-elevated border border-border max-w-sm w-full p-6 animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-[16px] font-semibold text-text mb-1.5">{title}</h3>
        <p className="text-[13px] text-text-sec leading-relaxed mb-6">{message}</p>
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg text-[13px] font-medium text-text-sec border border-border hover:bg-surface-muted transition-colors">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg text-[13px] font-medium text-white transition-colors ${
              danger ? "bg-red-500 hover:bg-red-600" : "bg-accent hover:bg-accent-hover"
            }`}
          >
            {confirmLabel || "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}

function HoldingsTable({ holdings, totalValue, currency, locale }) {
  const router = useRouter();
  const [sort, setSort] = useState("value");
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null); // holding to confirm delete
  const [pending, startTransition] = useTransition();

  const sorted = useMemo(() => {
    const arr = [...holdings];
    if (sort === "pnl") arr.sort((a, b) => b.pnl - a.pnl);
    else if (sort === "pnlPct") arr.sort((a, b) => b.pnlPct - a.pnlPct);
    else arr.sort((a, b) => b.currentValue - a.currentValue);
    return arr;
  }, [holdings, sort]);

  const maxAbsPnl = Math.max(2, ...holdings.map((h) => Math.abs(h.pnlPct)));

  function confirmDelete() {
    if (!deleting) return;
    startTransition(async () => {
      const r = await deleteHolding(deleting.companyId);
      if (!r.error) router.refresh();
      setDeleting(null);
    });
  }

  return (
    <div className="rounded-2xl border border-border bg-white overflow-hidden">
      <div className="px-6 py-4 border-b border-border-light flex items-center justify-between">
        <h3 className="text-[14px] font-semibold text-text">Holdings</h3>
        <div className="flex items-center gap-0.5 bg-surface-muted rounded-lg p-0.5 border border-border-light">
          {[
            { key: "value", label: "By value" },
            { key: "pnl", label: "By P&L" },
            { key: "pnlPct", label: "By %" },
          ].map((s) => (
            <button
              key={s.key}
              onClick={() => setSort(s.key)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                sort === s.key
                  ? "bg-white text-text shadow-xs ring-1 ring-border"
                  : "text-text-muted hover:text-text"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-[2rem_1fr_auto_1fr_auto_auto] gap-4 px-6 py-2.5 border-b border-border-light bg-surface-muted text-[10px] font-semibold text-text-muted uppercase tracking-wider">
        <span>#</span>
        <span>Stock</span>
        <span className="text-right">Value</span>
        <span className="text-right">P&amp;L</span>
        <span className="text-right">Weight</span>
        <span className="w-[52px]" />
      </div>

      <div>
        {sorted.map((h, i) => {
          const isUp = h.pnlPct >= 0;
          const weight = totalValue > 0 ? (h.currentValue / totalValue) * 100 : 0;
          const barPct = maxAbsPnl > 0 ? (Math.abs(h.pnlPct) / maxAbsPnl) * 50 : 0;
          const isEditing = editing === h.companyId;

          return (
            <div key={h.companyId}>
              <div
                className={`grid grid-cols-[2rem_1fr_auto_1fr_auto_auto] gap-4 items-center px-6 py-3.5 hover:bg-accent-subtle transition-colors group ${
                  i < sorted.length - 1 && !isEditing ? "border-b border-border-light" : ""
                }`}
              >
                <span className="text-[10px] font-mono text-text-muted">
                  {String(i + 1).padStart(2, "0")}
                </span>

                <Link href={`/market/${encodeURIComponent(h.ticker)}`} className="min-w-0">
                  <p className="text-[13px] font-semibold text-text truncate hover:text-accent transition-colors">
                    {h.name}
                  </p>
                  <p className="text-[11px] text-text-muted font-mono">
                    {h.ticker.split(".")[0]} &middot; {h.shares} shares &middot; {formatCurrency(h.avgCost, currency, locale)} &rarr; {formatCurrency(h.currentPrice, currency, locale)}
                  </p>
                </Link>

                <div className="text-right">
                  <p className="text-[13px] font-bold font-mono text-text">
                    {formatCurrency(h.currentValue, currency, locale)}
                  </p>
                  <p className="text-[10px] text-text-muted font-mono">
                    Invested {formatCurrency(h.totalCost, currency, locale)}
                  </p>
                </div>

                {/* P&L */}
                <div className="text-right min-w-[100px]">
                  <p className={`text-[13px] font-bold font-mono ${isUp ? "text-emerald-600" : "text-red-500"}`}>
                    {isUp ? "+" : ""}{formatCurrency(h.pnl, currency, locale)}
                  </p>
                  <p className={`text-[10px] font-mono ${isUp ? "text-emerald-600/70" : "text-red-500/70"}`}>
                    {isUp ? "+" : ""}{h.pnlPct.toFixed(2)}%
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-[11px] font-bold font-mono text-text">
                    {weight.toFixed(1)}%
                  </p>
                  <div className="mt-1 h-1 w-12 bg-border-light rounded-full overflow-hidden ml-auto">
                    <div
                      className="h-full bg-text-sec rounded-full"
                      style={{ width: `${weight}%` }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setEditing(isEditing ? null : h.companyId)}
                    disabled={pending}
                    title="Edit holding"
                    className="p-1.5 rounded-md text-text-muted hover:text-text hover:bg-surface-muted transition-colors disabled:opacity-40"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 3a2.85 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5z"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => setDeleting(h)}
                    disabled={pending}
                    title="Remove holding"
                    className="p-1.5 rounded-md text-text-muted hover:text-danger hover:bg-red-50 transition-colors disabled:opacity-40"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Inline edit form */}
              {isEditing && (
                <HoldingEditRow
                  holding={h}
                  currency={currency}
                  onCancel={() => setEditing(null)}
                  onSaved={() => { setEditing(null); router.refresh(); }}
                />
              )}
            </div>
          );
        })}
      </div>

      {deleting && (
        <ConfirmDialog
          title="Remove holding"
          message={`This will permanently delete all transactions for ${deleting.name} (${deleting.ticker.split(".")[0]}) and remove it from your portfolio.`}
          confirmLabel={pending ? "Removing..." : "Remove"}
          danger
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}

function HoldingEditRow({ holding, currency, onCancel, onSaved }) {
  const [shares, setShares] = useState(String(holding.shares));
  const [avgCost, setAvgCost] = useState(String(holding.avgCost));
  const [err, setErr] = useState("");
  const [pending, startTransition] = useTransition();

  function save() {
    setErr("");
    const s = parseFloat(shares), a = parseFloat(avgCost);
    if (!s || s <= 0) return setErr("Shares must be > 0");
    if (a == null || a < 0) return setErr("Invalid cost");
    startTransition(async () => {
      const r = await updateHolding(holding.companyId, { shares: s, avgCost: a, currency: holding.currency });
      if (r?.error) setErr(r.error);
      else onSaved();
    });
  }

  return (
    <div className="px-6 py-3 bg-surface-muted/50 border-b border-border-light">
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <label className="text-[10px] uppercase tracking-wider font-semibold text-text-muted block mb-1">Shares</label>
          <input type="number" value={shares} onChange={(e) => setShares(e.target.value)} min="0.0001" step="any" className="input-field !py-1.5 !text-[13px] font-mono w-full" />
        </div>
        <div className="flex-1">
          <label className="text-[10px] uppercase tracking-wider font-semibold text-text-muted block mb-1">Avg Cost ({currency})</label>
          <input type="number" value={avgCost} onChange={(e) => setAvgCost(e.target.value)} min="0" step="any" className="input-field !py-1.5 !text-[13px] font-mono w-full" />
        </div>
        <button onClick={save} disabled={pending} className="btn-primary !py-1.5 !px-4 !text-[12px] disabled:opacity-40">
          {pending ? "Saving..." : "Save"}
        </button>
        <button onClick={onCancel} className="btn-ghost !py-1.5 !px-3 !text-[12px]">Cancel</button>
      </div>
      {err && <p className="text-[11px] text-danger mt-1.5">{err}</p>}
    </div>
  );
}

/* ────────────────────────────────────────────
   Transactions Timeline
   ──────────────────────────────────────────── */

function TransactionTimeline({ transactions, currency, locale }) {
  if (!transactions?.length) return null;
  const latest = transactions.slice(0, 8);

  return (
    <div className="rounded-2xl border border-border bg-white p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[14px] font-semibold text-text">Recent activity</h3>
        <Link href="/portfolio/transactions" className="text-[12px] text-accent font-medium hover:underline">
          View all
        </Link>
      </div>
      <div className="relative">
        <div className="absolute left-2.5 top-2 bottom-2 w-px bg-border-light" />
        <div className="space-y-4">
          {latest.map((tx) => {
            const isBuy = tx.type === "buy";
            return (
              <div key={tx.id} className="relative pl-8">
                <div
                  className={`absolute left-0 top-1 w-5 h-5 rounded-full flex items-center justify-center ring-4 ring-white ${
                    isBuy ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                >
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    {isBuy ? (
                      <polyline points="6 9 12 15 18 9" />
                    ) : (
                      <polyline points="6 15 12 9 18 15" />
                    )}
                  </svg>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[12px] font-semibold text-text">
                      <span className={isBuy ? "text-emerald-600" : "text-amber-600"}>
                        {isBuy ? "Bought" : "Sold"}
                      </span>{" "}
                      {tx.quantity} shares of{" "}
                      <Link
                        href={`/market/${encodeURIComponent(tx.company?.ticker || "")}`}
                        className="font-mono text-text hover:text-accent"
                      >
                        {tx.company?.ticker?.split(".")[0]}
                      </Link>
                    </p>
                    <p className="text-[10px] text-text-muted font-mono mt-0.5">
                      @ {formatCurrency(tx.price_per_unit, currency, locale)} &middot; {formatRelativeTime(tx.transaction_date)}
                    </p>
                  </div>
                  <p className="text-[12px] font-bold font-mono text-text whitespace-nowrap">
                    {formatCurrency(tx.total_amount, currency, locale)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────
   Empty State
   ──────────────────────────────────────────── */

function EmptyState() {
  return (
    <div className="max-w-[1200px] mx-auto px-8 py-8">
      <div className="rounded-3xl border border-dashed border-border-strong p-12 text-center bg-white">
        <div className="w-16 h-16 rounded-2xl bg-accent-light flex items-center justify-center mx-auto mb-5">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" />
            <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
          </svg>
        </div>
        <h2 className="text-[20px] font-bold text-text mb-2 tracking-tight">
          Your portfolio is empty
        </h2>
        <p className="text-[14px] text-text-sec mb-6 max-w-md mx-auto">
          Record your first trade to start tracking your investments, see performance vs the market, and get diversification insights.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/portfolio/transactions" className="btn-primary !py-2.5 !px-6 text-[14px]">
            Record first trade
          </Link>
          <Link href="/market" className="inline-flex items-center gap-1.5 py-2.5 px-6 rounded-lg text-[14px] font-medium bg-white text-text border border-border hover:border-accent/40 transition-all">
            Browse market
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────
   Main Portfolio Page
   ──────────────────────────────────────────── */

export default function PortfolioClient({
  portfolio,
  initialHistory,
  benchmark,
  transactions,
  currency,
  locale,
  marketConfig,
}) {
  if (portfolio.holdings.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="max-w-[1200px] mx-auto px-8 py-8 stagger-sections">
      {/* Hero */}
      <PortfolioHero portfolio={portfolio} currency={currency} locale={locale} />

      {/* Performance vs Benchmark chart */}
      <div className="mb-6">
        <PortfolioVsBenchmarkChart
          initialHistory={initialHistory}
          benchmark={benchmark}
          currency={currency}
          locale={locale}
        />
      </div>

      {/* Best / Worst Performers */}
      <div className="mb-6">
        <PerformersPanel holdings={portfolio.holdings} currency={currency} locale={locale} />
      </div>

      {/* Holdings map + Holdings table row */}
      <div className="grid lg:grid-cols-[1fr_320px] gap-6 mb-6">
        <div className="space-y-6 min-w-0">
          <HoldingsTreemap
            holdings={portfolio.holdings}
            totalValue={portfolio.totalValue}
            currency={currency}
          />
          <HoldingsTable
            holdings={portfolio.holdings}
            totalValue={portfolio.totalValue}
            currency={currency}
            locale={locale}
          />
        </div>
        <div className="space-y-6">
          <DiversificationScore
            holdings={portfolio.holdings}
            totalValue={portfolio.totalValue}
            marketConfig={marketConfig}
          />
          <SectorAllocation
            holdings={portfolio.holdings}
            totalValue={portfolio.totalValue}
            marketConfig={marketConfig}
          />
          <TransactionTimeline
            transactions={transactions}
            currency={currency}
            locale={locale}
          />
        </div>
      </div>
    </div>
  );
}
