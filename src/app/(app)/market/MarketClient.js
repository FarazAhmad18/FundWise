"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatCurrency, searchStocks } from "@/constants/markets";
import { IndexStrip } from "@/components/market/IndexCard";

/* ──────────────────────────────────────────────
   Helpers
   ────────────────────────────────────────────── */

function Sparkline({ positive = true, seed = 1, className = "" }) {
  // Deterministic wiggle per seed
  const points = [];
  let prng = seed * 1337 + 7;
  let v = 50;
  for (let i = 0; i < 12; i++) {
    prng = (prng * 1103515245 + 12345) % 2147483648;
    const noise = (prng / 2147483648 - 0.5) * 8;
    const trend = positive ? 1.2 : -1.2;
    v = Math.max(10, Math.min(90, v + trend + noise));
    points.push([i * 10, v]);
  }
  const d = points
    .map((p, i) => (i === 0 ? `M${p[0]} ${100 - p[1]}` : `L${p[0]} ${100 - p[1]}`))
    .join(" ");
  const color = positive ? "#10b981" : "#ef4444";
  return (
    <svg viewBox="0 0 110 100" className={className} preserveAspectRatio="none">
      <path d={d} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ──────────────────────────────────────────────
   Market Breadth — vertical bars visualization
   (Bloomberg-style: each stock is a column, height = magnitude,
    green bars go UP from center, red bars go DOWN)
   ────────────────────────────────────────────── */

function MarketBreadth({ stocks, currency }) {
  const sorted = [...stocks]
    .filter((s) => s.quote)
    .sort((a, b) => b.quote.changePct - a.quote.changePct);

  const maxAbs = Math.max(2, ...sorted.map((s) => Math.abs(s.quote.changePct)));

  return (
    <div className="rounded-2xl border border-border bg-gradient-to-br from-white to-surface-muted overflow-hidden shadow-card">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border-light bg-white">
        <div>
          <h2 className="text-[15px] font-bold text-text">Market Breadth</h2>
          <p className="text-[11px] text-text-muted mt-0.5">
            {sorted.length} stocks &middot; green = gain, red = loss, bar height = magnitude
          </p>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-semibold">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-4 rounded-sm bg-emerald-500" />
            <span className="text-text-muted uppercase tracking-wider">Gains</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-4 rounded-sm bg-red-500" />
            <span className="text-text-muted uppercase tracking-wider">Losses</span>
          </div>
        </div>
      </div>

      {/* Vertical bars chart */}
      <div className="relative px-5 pt-10 pb-2 bg-gradient-to-b from-white to-transparent">
        {/* Y-axis gridlines */}
        <div className="absolute inset-x-5 top-10 bottom-20 pointer-events-none">
          {[0, 25, 50, 75, 100].map((y) => (
            <div
              key={y}
              className="absolute left-0 right-0 border-t border-dashed border-border-light/60"
              style={{ top: `${y}%` }}
            />
          ))}
          {/* Center axis */}
          <div className="absolute left-0 right-0 h-px bg-border-strong top-1/2" />
        </div>

        {/* Bars container */}
        <div className="relative h-[320px] flex items-center justify-between gap-[2px] group/chart">
          {sorted.map((s, i) => {
            const q = s.quote;
            const isUp = q.changePct >= 0;
            const pct = Math.abs(q.changePct);
            // Height as % of half-chart (160px total, 160 max)
            const heightPct = (pct / maxAbs) * 50; // % of total 320px = 50% max each side

            return (
              <Link
                key={s.ticker}
                href={`/market/${encodeURIComponent(s.ticker)}`}
                className="flex-1 relative h-full flex flex-col justify-center group/bar"
                title={`${s.ticker.split(".")[0]}: ${isUp ? "+" : ""}${q.changePct.toFixed(2)}%`}
              >
                {/* The vertical bar */}
                <div className="relative h-full flex flex-col items-center justify-center">
                  {isUp ? (
                    <>
                      <div
                        className="w-full absolute bottom-1/2 rounded-t-sm transition-all duration-700 ease-out origin-bottom group-hover/bar:opacity-80"
                        style={{
                          height: `${heightPct}%`,
                          background: `linear-gradient(to top, #10b981, #34d399)`,
                          boxShadow: "0 0 12px rgba(16, 185, 129, 0.3)",
                        }}
                      />
                      <div className="absolute left-0 right-0 h-[2px] bg-border-strong top-1/2 -translate-y-1/2" style={{ zIndex: 2 }} />
                    </>
                  ) : (
                    <>
                      <div
                        className="w-full absolute top-1/2 rounded-b-sm transition-all duration-700 ease-out origin-top group-hover/bar:opacity-80"
                        style={{
                          height: `${heightPct}%`,
                          background: `linear-gradient(to bottom, #ef4444, #f87171)`,
                          boxShadow: "0 0 12px rgba(239, 68, 68, 0.3)",
                        }}
                      />
                    </>
                  )}
                </div>

                {/* Tooltip on hover */}
                <div className="absolute left-1/2 -translate-x-1/2 -top-1 opacity-0 group-hover/bar:opacity-100 transition-opacity pointer-events-none z-20">
                  <div className="bg-text text-white rounded-lg px-2.5 py-1.5 shadow-elevated whitespace-nowrap">
                    <p className="text-[10px] font-mono font-bold">{s.ticker.split(".")[0]}</p>
                    <p className={`text-[10px] font-mono ${isUp ? "text-emerald-300" : "text-red-300"}`}>
                      {isUp ? "+" : ""}{q.changePct.toFixed(2)}%
                    </p>
                    <p className="text-[9px] text-white/60 font-mono mt-0.5">
                      {formatCurrency(q.price, q.currency || currency)}
                    </p>
                  </div>
                </div>

                {/* Ticker label below bar */}
                <div className="absolute bottom-[-28px] left-1/2 -translate-x-1/2 text-[9px] font-mono font-bold text-text-muted group-hover/bar:text-text transition-colors whitespace-nowrap">
                  {s.ticker.split(".")[0].slice(0, 5)}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Y-axis labels */}
        <div className="absolute left-0 top-10 bottom-20 w-4 pointer-events-none">
          <span className="absolute top-0 text-[9px] font-mono text-text-muted">+{maxAbs.toFixed(0)}%</span>
          <span className="absolute top-1/2 -translate-y-1/2 text-[9px] font-mono text-text-muted">0</span>
          <span className="absolute bottom-0 text-[9px] font-mono text-text-muted">-{maxAbs.toFixed(0)}%</span>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Detailed Stocks List (sorted, with horizontal bar)
   ────────────────────────────────────────────── */

function StocksList({ stocks, currency }) {
  const sorted = [...stocks]
    .filter((s) => s.quote)
    .sort((a, b) => Math.abs(b.quote.changePct) - Math.abs(a.quote.changePct));

  const maxAbs = Math.max(2, ...sorted.map((s) => Math.abs(s.quote.changePct)));

  return (
    <div className="rounded-2xl border border-border bg-white overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border-light">
        <h2 className="text-[15px] font-bold text-text">All Stocks</h2>
        <p className="text-[11px] text-text-muted">
          Click any row to see details
        </p>
      </div>

      <div className="max-h-[600px] overflow-y-auto">
        {sorted.map((s, i) => {
          const q = s.quote;
          const isUp = q.changePct >= 0;
          const barPct = (Math.abs(q.changePct) / maxAbs) * 50;

          return (
            <Link
              key={s.ticker}
              href={`/market/${encodeURIComponent(s.ticker)}`}
              className="grid grid-cols-[2rem_9rem_1fr_5rem_3rem] gap-3 items-center px-6 py-3 hover:bg-accent-subtle transition-colors border-b border-border-light last:border-0 group"
            >
              <span className="text-[10px] font-mono text-text-muted">{String(i + 1).padStart(2, "0")}</span>

              <div className="min-w-0">
                <p className="font-mono text-[13px] font-bold text-text group-hover:text-accent transition-colors">
                  {s.ticker.split(".")[0]}
                </p>
                <p className="text-[11px] text-text-muted truncate">{s.name}</p>
              </div>

              <div className="relative h-5 flex items-center">
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border -translate-x-1/2" />
                {isUp ? (
                  <div
                    className="absolute left-1/2 h-3 rounded-r-sm bg-emerald-500 transition-all duration-700 ease-out"
                    style={{ width: `${barPct}%` }}
                  />
                ) : (
                  <div
                    className="absolute right-1/2 h-3 rounded-l-sm bg-red-500 transition-all duration-700 ease-out"
                    style={{ width: `${barPct}%` }}
                  />
                )}
                <span
                  className={`absolute text-[11px] font-bold font-mono ${isUp ? "text-emerald-700" : "text-red-600"}`}
                  style={{
                    left: isUp ? `calc(50% + ${barPct}% + 4px)` : "auto",
                    right: !isUp ? `calc(50% + ${barPct}% + 4px)` : "auto",
                  }}
                >
                  {isUp ? "+" : ""}{q.changePct.toFixed(2)}%
                </span>
              </div>

              <p className="text-[13px] font-bold font-mono text-text text-right">
                {formatCurrency(q.price, q.currency || currency)}
              </p>

              <div className="h-5">
                <Sparkline positive={isUp} seed={i + 1} className="w-full h-full" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Market Overview (top stats band)
   ────────────────────────────────────────────── */

function MarketOverview({ stocks, marketConfig }) {
  const withQuotes = stocks.filter((s) => s.quote);
  const gainers = withQuotes.filter((s) => s.quote.changePct > 0).length;
  const losers = withQuotes.filter((s) => s.quote.changePct < 0).length;
  const flat = withQuotes.length - gainers - losers;
  const avgChange = withQuotes.length
    ? withQuotes.reduce((sum, s) => sum + s.quote.changePct, 0) / withQuotes.length
    : 0;

  const biggestGainer = [...withQuotes].sort((a, b) => b.quote.changePct - a.quote.changePct)[0];
  const biggestLoser = [...withQuotes].sort((a, b) => a.quote.changePct - b.quote.changePct)[0];

  return (
    <div className="relative rounded-3xl border border-border overflow-hidden mb-6">
      {/* Subtle decorative gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-surface-muted pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-accent/5 blur-3xl pointer-events-none" />

      <div className="relative z-10 px-8 py-8">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{marketConfig.flag}</span>
              <p className="text-[11px] font-semibold text-text-muted tracking-[0.15em] uppercase">
                {marketConfig.exchangeName}
              </p>
            </div>
            <h1 className="text-[32px] font-bold text-text tracking-[-0.035em] leading-none">
              {marketConfig.name} Market
            </h1>
            <p className="text-[14px] text-text-sec mt-2">
              {withQuotes.length} stocks &middot; {marketConfig.currency}
            </p>
          </div>

          {/* Sentiment indicator */}
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ${
            avgChange > 0.5 ? "bg-emerald-50 ring-1 ring-emerald-200" :
            avgChange < -0.5 ? "bg-red-50 ring-1 ring-red-200" :
            "bg-surface-muted ring-1 ring-border-light"
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              avgChange > 0.5 ? "bg-emerald-500 animate-pulse-soft" :
              avgChange < -0.5 ? "bg-red-500 animate-pulse-soft" :
              "bg-text-muted"
            }`} />
            <span className={`text-[13px] font-bold ${
              avgChange > 0.5 ? "text-emerald-700" :
              avgChange < -0.5 ? "text-red-700" :
              "text-text-sec"
            }`}>
              Market {avgChange > 0.5 ? "Bullish" : avgChange < -0.5 ? "Bearish" : "Mixed"}
            </span>
            <span className={`font-mono text-[12px] font-semibold ${
              avgChange > 0 ? "text-emerald-600" : avgChange < 0 ? "text-red-500" : "text-text-muted"
            }`}>
              {avgChange > 0 ? "+" : ""}{avgChange.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-border-light p-4">
            <p className="text-[10px] font-semibold text-text-muted uppercase tracking-[0.1em] mb-2">Gainers</p>
            <p className="text-[26px] font-bold font-mono text-emerald-600 leading-none">{gainers}</p>
            <div className="mt-3 h-1 bg-border-light rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(gainers / withQuotes.length) * 100}%` }} />
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-border-light p-4">
            <p className="text-[10px] font-semibold text-text-muted uppercase tracking-[0.1em] mb-2">Losers</p>
            <p className="text-[26px] font-bold font-mono text-red-500 leading-none">{losers}</p>
            <div className="mt-3 h-1 bg-border-light rounded-full overflow-hidden">
              <div className="h-full bg-red-500 rounded-full" style={{ width: `${(losers / withQuotes.length) * 100}%` }} />
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-border-light p-4">
            <p className="text-[10px] font-semibold text-text-muted uppercase tracking-[0.1em] mb-2">Top Gainer</p>
            {biggestGainer ? (
              <>
                <p className="text-[15px] font-bold font-mono text-text leading-none truncate">{biggestGainer.ticker.split(".")[0]}</p>
                <p className="text-[13px] font-bold font-mono text-emerald-600 mt-2">
                  +{biggestGainer.quote.changePct.toFixed(2)}%
                </p>
              </>
            ) : <p className="text-[13px] text-text-muted">—</p>}
          </div>
          <div className="bg-white rounded-2xl border border-border-light p-4">
            <p className="text-[10px] font-semibold text-text-muted uppercase tracking-[0.1em] mb-2">Top Loser</p>
            {biggestLoser ? (
              <>
                <p className="text-[15px] font-bold font-mono text-text leading-none truncate">{biggestLoser.ticker.split(".")[0]}</p>
                <p className="text-[13px] font-bold font-mono text-red-500 mt-2">
                  {biggestLoser.quote.changePct.toFixed(2)}%
                </p>
              </>
            ) : <p className="text-[13px] text-text-muted">—</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Sector Breakdown
   ────────────────────────────────────────────── */

function SectorBreakdown({ stocks }) {
  // Group by sector, compute avg change per sector
  const sectorMap = {};
  for (const s of stocks.filter((s) => s.quote)) {
    const sec = s.sector || "Other";
    if (!sectorMap[sec]) sectorMap[sec] = { count: 0, total: 0, stocks: [] };
    sectorMap[sec].count++;
    sectorMap[sec].total += s.quote.changePct;
    sectorMap[sec].stocks.push(s);
  }
  const sectors = Object.entries(sectorMap)
    .map(([name, data]) => ({
      name,
      count: data.count,
      avg: data.total / data.count,
      stocks: data.stocks,
    }))
    .sort((a, b) => b.avg - a.avg);

  if (sectors.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border bg-white p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-[15px] font-bold text-text">Sectors</h2>
        <span className="text-[11px] text-text-muted">{sectors.length} sectors</span>
      </div>

      <div className="space-y-2.5">
        {sectors.map((sec) => {
          const isUp = sec.avg >= 0;
          const absAvg = Math.abs(sec.avg);
          const maxSectorAvg = Math.max(1, ...sectors.map((s) => Math.abs(s.avg)));
          const barWidth = (absAvg / maxSectorAvg) * 100;

          return (
            <div key={sec.name} className="group">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold text-text">{sec.name}</span>
                  <span className="text-[10px] text-text-muted font-mono">({sec.count})</span>
                </div>
                <span className={`text-[12px] font-bold font-mono ${isUp ? "text-emerald-600" : "text-red-500"}`}>
                  {isUp ? "+" : ""}{sec.avg.toFixed(2)}%
                </span>
              </div>
              <div className="relative h-1.5 bg-border-light rounded-full overflow-hidden">
                <div
                  className={`absolute top-0 h-full rounded-full transition-all duration-700 ease-out ${isUp ? "bg-emerald-500" : "bg-red-500"}`}
                  style={{
                    width: `${barWidth}%`,
                    left: isUp ? "50%" : "auto",
                    right: isUp ? "auto" : "50%",
                  }}
                />
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border-strong/30" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Smart Stock Search — name-based autocomplete
   (type "sui gas" → finds SSGC / SNGP, type "bank" → all banking stocks)
   ────────────────────────────────────────────── */

function highlightMatch(text, query) {
  if (!query) return text;
  const q = query.trim().toLowerCase();
  const t = text.toLowerCase();
  const idx = t.indexOf(q);
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <span className="font-bold text-accent bg-accent-light rounded-sm px-0.5">
        {text.slice(idx, idx + q.length)}
      </span>
      {text.slice(idx + q.length)}
    </>
  );
}

function SmartStockSearch({ marketConfig, quotes }) {
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [apiError, setApiError] = useState("");
  const [apiLoading, setApiLoading] = useState(false);
  const containerRef = useRef(null);
  const router = useRouter();

  // Local fuzzy search results
  const suggestions = useMemo(() => {
    if (!query.trim()) return [];
    return searchStocks(marketConfig, query, 8);
  }, [query, marketConfig]);

  // Close on outside click
  useEffect(() => {
    function onClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function handleSelect(stock) {
    router.push(`/market/${encodeURIComponent(stock.ticker)}`);
    setShowSuggestions(false);
    setQuery("");
  }

  async function handleDirectTickerLookup(raw) {
    // Fallback: user pressed Enter with no suggestion match — try as direct ticker
    const ticker =
      raw.includes(".") || !marketConfig.exchangeSuffix
        ? raw.toUpperCase()
        : raw.toUpperCase() + marketConfig.exchangeSuffix;

    setApiLoading(true);
    setApiError("");
    try {
      const res = await fetch(`/api/quote/${encodeURIComponent(ticker)}`);
      if (!res.ok) {
        setApiError(`No stock found matching "${raw}". Try the company name instead.`);
      } else {
        router.push(`/market/${encodeURIComponent(ticker)}`);
      }
    } catch {
      setApiError("Something went wrong. Please try again.");
    } finally {
      setApiLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === "Enter" && query.trim()) {
        e.preventDefault();
        handleDirectTickerLookup(query.trim());
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const target = suggestions[activeIndex];
      if (target) handleSelect(target);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  }

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  return (
    <div className="mb-6 relative" ref={containerRef}>
      <div className="relative">
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-border bg-white focus-within:border-accent focus-within:shadow-[0_0_0_3px_var(--accent-light)] transition-all">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted flex-shrink-0">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
              setApiError("");
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            placeholder={`Search by company name or ticker (e.g. "sui gas", "apple", "bank")`}
            className="flex-1 bg-transparent outline-none text-[14px] text-text placeholder:text-text-muted"
          />
          {apiLoading && (
            <div className="w-4 h-4 rounded-full border-2 border-border-light border-t-accent animate-spin" />
          )}
          {query && !apiLoading && (
            <button
              onClick={() => { setQuery(""); setApiError(""); }}
              className="text-text-muted hover:text-text transition-colors"
              type="button"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {/* Autocomplete dropdown */}
        {showSuggestions && query.trim() && (
          <div className="absolute left-0 right-0 top-full mt-2 rounded-xl border border-border bg-white shadow-elevated overflow-hidden z-30 animate-slide-down">
            {suggestions.length > 0 ? (
              <>
                <div className="px-4 py-2 border-b border-border-light bg-surface-muted">
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                    {suggestions.length} match{suggestions.length !== 1 ? "es" : ""}
                  </p>
                </div>
                <div className="max-h-[360px] overflow-y-auto">
                  {suggestions.map((s, i) => {
                    const q = quotes[s.ticker];
                    const isActive = i === activeIndex;
                    const isUp = q?.change >= 0;
                    return (
                      <button
                        key={s.ticker}
                        onClick={() => handleSelect(s)}
                        onMouseEnter={() => setActiveIndex(i)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                          isActive ? "bg-accent-light" : "hover:bg-surface-muted"
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          isActive ? "bg-white text-accent ring-1 ring-accent/20" : "bg-surface-muted text-text-sec"
                        }`}>
                          <span className="font-mono text-[10px] font-bold">
                            {s.ticker.split(".")[0].slice(0, 3)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold text-text truncate">
                            {highlightMatch(s.name, query)}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-[11px] font-bold text-text-muted">
                              {highlightMatch(s.ticker.split(".")[0], query)}
                            </span>
                            <span className="text-[10px] text-text-muted">&middot;</span>
                            <span className="text-[10px] text-text-muted">{s.sector}</span>
                          </div>
                        </div>
                        {q && (
                          <div className="text-right flex-shrink-0">
                            <p className="text-[12px] font-bold font-mono text-text">
                              {formatCurrency(q.price, q.currency)}
                            </p>
                            <p className={`text-[10px] font-mono ${isUp ? "text-emerald-600" : "text-red-500"}`}>
                              {isUp ? "+" : ""}{q.changePct?.toFixed(2)}%
                            </p>
                          </div>
                        )}
                        {isActive && (
                          <kbd className="hidden md:inline-flex text-[10px] font-mono font-semibold text-accent-text bg-white border border-accent/20 px-1.5 py-0.5 rounded flex-shrink-0">
                            {"\u21B5"}
                          </kbd>
                        )}
                      </button>
                    );
                  })}
                </div>
                <div className="px-4 py-2 border-t border-border-light bg-surface-muted flex items-center justify-between text-[10px] text-text-muted">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <kbd className="font-mono font-semibold bg-white border border-border px-1 py-0.5 rounded">
                        {"\u2191\u2193"}
                      </kbd>
                      navigate
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="font-mono font-semibold bg-white border border-border px-1 py-0.5 rounded">
                        {"\u21B5"}
                      </kbd>
                      open
                    </span>
                  </div>
                  <span className="text-text-muted">{marketConfig.exchangeName}</span>
                </div>
              </>
            ) : (
              <div className="px-5 py-8 text-center">
                <p className="text-[13px] text-text-muted mb-2">
                  No matches in {marketConfig.exchangeName}
                </p>
                <p className="text-[11px] text-text-muted mb-4">
                  Press <kbd className="font-mono font-semibold bg-surface-muted border border-border px-1.5 py-0.5 rounded">{"\u21B5"}</kbd> to try it as a direct ticker lookup
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {apiError && (
        <p className="text-[12px] text-danger mt-2 flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {apiError}
        </p>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────
   Tabs / View Switcher
   ────────────────────────────────────────────── */

function ViewTabs({ view, setView }) {
  const tabs = [
    { id: "all", label: "All", count: null },
    { id: "gainers", label: "Gainers", color: "text-emerald-600" },
    { id: "losers", label: "Losers", color: "text-red-500" },
  ];
  return (
    <div className="flex items-center gap-1 bg-surface-muted rounded-xl p-1 w-fit mb-4">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => setView(t.id)}
          className={`px-4 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${
            view === t.id
              ? "bg-white text-text shadow-xs ring-1 ring-border"
              : `text-text-muted hover:text-text ${t.color || ""}`
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────────
   Main Market Page
   ────────────────────────────────────────────── */

export default function MarketClient({ marketConfig, popularStocks, quotes, indexes = [], currency, activeMarket, availableMarkets = [], userMarket }) {
  const router = useRouter();
  const [view, setView] = useState("all");

  // Enrich with quotes
  const stocks = useMemo(
    () =>
      popularStocks.map((s) => ({
        ticker: s.ticker,
        name: s.name,
        sector: s.sector || "Other",
        quote: quotes[s.ticker],
      })),
    [popularStocks, quotes]
  );

  const filtered = useMemo(() => {
    const withQuotes = stocks.filter((s) => s.quote);
    if (view === "gainers") return withQuotes.filter((s) => s.quote.changePct > 0);
    if (view === "losers") return withQuotes.filter((s) => s.quote.changePct < 0);
    return withQuotes;
  }, [stocks, view]);

  return (
    <div className="max-w-[1200px] mx-auto px-8 py-8 stagger-sections">
      {/* Your market banner */}
      {availableMarkets.length > 1 && (() => {
        const homeMarket = availableMarkets.find((m) => m.code === userMarket);
        const isBrowsingOther = activeMarket && userMarket && activeMarket !== userMarket;

        return (
          <div className="mb-6 space-y-3">
            {isBrowsingOther && homeMarket && (
              <div className="flex items-center justify-between rounded-xl bg-amber-50 border border-amber-200 px-4 py-2.5">
                <p className="text-[13px] text-amber-800">
                  You&apos;re browsing <strong>{marketConfig.name}</strong>. Your account market is <strong>{homeMarket.name} ({homeMarket.currency})</strong>.
                </p>
                <button
                  onClick={() => router.push("/market")}
                  className="text-[12px] font-semibold text-amber-700 hover:underline whitespace-nowrap ml-3"
                >
                  Back to my market
                </button>
              </div>
            )}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 mr-auto">
                <span className="text-lg">{marketConfig.flag}</span>
                <div>
                  <p className="text-[14px] font-semibold text-text">
                    {marketConfig.exchangeName}
                    {!isBrowsingOther && <span className="text-[10px] font-semibold text-accent bg-accent-light px-1.5 py-0.5 rounded-full ml-2">Your Market</span>}
                  </p>
                  <p className="text-[11px] text-text-muted">{marketConfig.name} &middot; {marketConfig.currency}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
                {availableMarkets.map((m) => (
                  <button
                    key={m.code}
                    onClick={() => router.push(`/market${m.code === userMarket ? "" : `?market=${m.code}`}`)}
                    title={m.code === userMarket ? `${m.name} (Your Market)` : m.name}
                    className={`w-8 h-8 rounded-lg text-[15px] flex items-center justify-center transition-all border ${
                      activeMarket === m.code
                        ? "border-accent bg-accent-light ring-2 ring-accent/20"
                        : "border-border bg-card hover:border-accent/30"
                    }`}
                  >
                    {m.flag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Hero overview */}
      <MarketOverview stocks={stocks} marketConfig={marketConfig} />

      {/* Market indexes — real data with 1D/3D/7D/30D changes */}
      {indexes.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[14px] font-semibold text-text">Indexes</h2>
            <p className="text-[11px] text-text-muted">Live from {marketConfig.exchangeName}</p>
          </div>
          <IndexStrip indexes={indexes} />
        </div>
      )}

      {/* Smart search with autocomplete */}
      <SmartStockSearch marketConfig={marketConfig} quotes={quotes} />

      {/* Market Breadth — vertical bars (the hero visualization) */}
      <div className="mb-6">
        <MarketBreadth stocks={stocks} currency={currency} />
      </div>

      {/* Main grid: stocks list + sector breakdown */}
      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        {/* Left: Filterable stocks list */}
        <div>
          <ViewTabs view={view} setView={setView} />
          <StocksList stocks={filtered} currency={currency} />
        </div>

        {/* Right: Sector breakdown + advisor callout */}
        <div className="space-y-6">
          <SectorBreakdown stocks={stocks} />

          {/* Callout card */}
          <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-5 relative overflow-hidden">
            <svg className="absolute top-0 right-0 opacity-10 pointer-events-none" width="140" height="140" viewBox="0 0 140 140" fill="none">
              <circle cx="120" cy="20" r="50" stroke="white" strokeWidth="1" />
              <circle cx="120" cy="20" r="30" stroke="white" strokeWidth="1" />
            </svg>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Tip</span>
            <h3 className="text-white text-[14px] font-bold mt-2 mb-2 tracking-tight">
              Not sure where to start?
            </h3>
            <p className="text-slate-300 text-[12px] leading-relaxed mb-4">
              Ask our AI advisor for personalized stock picks based on your risk level and goals.
            </p>
            <Link
              href="/advisor"
              className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-white hover:text-accent transition-colors group"
            >
              Talk to Advisor
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-0.5">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
