"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { aggregateMood } from "@/features/news/intelligence";

/* ──────────────────────────────────────────────
   Helpers
   ────────────────────────────────────────────── */

function extractDomain(url) {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return "";
  }
}

function formatRelativeTime(date) {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  const diffHrs = (Date.now() - d.getTime()) / (1000 * 60 * 60);
  if (diffHrs < 1) return `${Math.round(diffHrs * 60)}m ago`;
  if (diffHrs < 24) return `${Math.round(diffHrs)}h ago`;
  if (diffHrs < 24 * 7) return `${Math.round(diffHrs / 24)}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/* ──────────────────────────────────────────────
   Sentiment Badge
   ────────────────────────────────────────────── */

function SentimentBadge({ sentiment, size = "sm" }) {
  if (!sentiment || sentiment.label === "neutral") return null;
  const isBullish = sentiment.label === "bullish";
  const cls = size === "lg" ? "text-[11px] px-2.5 py-1" : "text-[9px] px-1.5 py-0.5";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-bold ${cls} ${
        isBullish
          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
          : "bg-red-50 text-red-700 ring-1 ring-red-200"
      }`}
      title={`${isBullish ? "Bullish" : "Bearish"} tone detected`}
    >
      <span className="text-[9px]">{isBullish ? "\u25B2" : "\u25BC"}</span>
      {isBullish ? "Bullish" : "Bearish"}
    </span>
  );
}

/* ──────────────────────────────────────────────
   Ticker Chips (mentions in article)
   ────────────────────────────────────────────── */

function TickerChips({ tickers }) {
  if (!tickers?.length) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {tickers.slice(0, 3).map((t) => (
        <Link
          key={t.ticker}
          href={`/market/${encodeURIComponent(t.ticker)}`}
          onClick={(e) => e.stopPropagation()}
          className="text-[10px] font-mono font-bold text-text-sec bg-surface-muted hover:bg-accent-light hover:text-accent-text border border-border-light hover:border-accent/30 rounded-md px-1.5 py-0.5 transition-colors"
        >
          {t.ticker.split(".")[0]}
        </Link>
      ))}
      {tickers.length > 3 && (
        <span className="text-[10px] text-text-muted px-1">
          +{tickers.length - 3}
        </span>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────
   News Card (regular)
   ────────────────────────────────────────────── */

function NewsCard({ item, saved, onToggleSave }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="rounded-2xl border border-border bg-white p-5 hover:border-accent hover:shadow-card-hover transition-all group flex flex-col"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          {item.category && (
            <span className="text-[10px] font-semibold text-text-sec bg-surface-muted px-2 py-0.5 rounded-full uppercase tracking-wider">
              {item.category}
            </span>
          )}
          <SentimentBadge sentiment={item.sentiment} />
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleSave(item.url);
          }}
          className={`p-1 rounded-md transition-colors ${
            saved ? "text-accent" : "text-text-muted hover:text-text-sec"
          }`}
          title={saved ? "Remove from saved" : "Save for later"}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill={saved ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      </div>

      <p className="text-[14px] font-semibold text-text leading-snug line-clamp-2 mb-2 group-hover:text-accent transition-colors">
        {item.title}
      </p>
      <p className="text-[12px] text-text-sec leading-relaxed line-clamp-2 mb-4 flex-1">
        {item.content}
      </p>

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[10px] text-text-muted font-medium truncate">
            {extractDomain(item.url)}
          </span>
          {item.publishedAt && (
            <>
              <span className="text-text-muted text-[10px]">&middot;</span>
              <span className="text-[10px] text-text-muted whitespace-nowrap">
                {formatRelativeTime(item.publishedAt)}
              </span>
            </>
          )}
        </div>
        <TickerChips tickers={item.tickers} />
      </div>
    </a>
  );
}

/* ──────────────────────────────────────────────
   Featured Story (hero card)
   ────────────────────────────────────────────── */

function FeaturedStory({ item, saved, onToggleSave }) {
  if (!item) return null;
  const isBullish = item.sentiment?.label === "bullish";
  const isBearish = item.sentiment?.label === "bearish";
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-2xl border border-border bg-white overflow-hidden group hover:border-accent hover:shadow-card-hover transition-all relative"
    >
      <div
        className={`absolute top-0 left-0 w-1 h-full ${
          isBullish ? "bg-emerald-500" : isBearish ? "bg-red-500" : "bg-accent"
        }`}
      />
      <div className="p-6 pl-7">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold text-accent-text bg-accent-light uppercase tracking-[0.15em] px-2 py-0.5 rounded-full">
              Featured
            </span>
            {item.category && (
              <span className="text-[10px] font-semibold text-text-sec bg-surface-muted px-2 py-0.5 rounded-full uppercase tracking-wider">
                {item.category}
              </span>
            )}
            <SentimentBadge sentiment={item.sentiment} size="lg" />
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleSave(item.url);
            }}
            className={`p-1 rounded-md transition-colors ${
              saved ? "text-accent" : "text-text-muted hover:text-text-sec"
            }`}
            title={saved ? "Remove from saved" : "Save for later"}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill={saved ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </button>
        </div>

        <h2 className="text-[20px] font-bold text-text tracking-tight leading-snug line-clamp-2 mb-3 group-hover:text-accent transition-colors">
          {item.title}
        </h2>
        <p className="text-[14px] text-text-sec leading-relaxed line-clamp-3 mb-4">
          {item.content}
        </p>

        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-text-muted font-medium">
              {extractDomain(item.url)}
            </span>
            {item.publishedAt && (
              <>
                <span className="text-text-muted">&middot;</span>
                <span className="text-[11px] text-text-muted">
                  {formatRelativeTime(item.publishedAt)}
                </span>
              </>
            )}
          </div>
          <TickerChips tickers={item.tickers} />
        </div>
      </div>
    </a>
  );
}

/* ──────────────────────────────────────────────
   AI Briefing Card
   ────────────────────────────────────────────── */

function BriefingCard({ briefing, userName, mood }) {
  if (!briefing) return null;

  const moodColors = {
    bullish: { bg: "from-emerald-50 via-white to-white", accent: "bg-emerald-500", text: "text-emerald-700" },
    bearish: { bg: "from-red-50 via-white to-white", accent: "bg-red-500", text: "text-red-600" },
    neutral: { bg: "from-slate-50 via-white to-white", accent: "bg-text-muted", text: "text-text-sec" },
  };
  const m = moodColors[mood?.label || "neutral"];

  return (
    <div className={`rounded-2xl border border-border bg-gradient-to-br ${m.bg} p-6 relative overflow-hidden mb-6`}>
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-accent/5 blur-3xl pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-text flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l2.09 6.26L20 9l-5.09 4.74L16.18 20 12 16.77 7.82 20l1.27-6.26L4 9l5.91-.74L12 2z" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.15em]">AI Briefing</p>
              <h2 className="text-[15px] font-bold text-text tracking-tight">
                Your market in 30 seconds
              </h2>
            </div>
          </div>

          {mood && mood.total > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-border-light">
                <span className={`w-2 h-2 rounded-full ${m.accent}`} />
                <span className={`text-[11px] font-bold ${m.text} capitalize`}>
                  {mood.label} mood
                </span>
              </div>
            </div>
          )}
        </div>

        <p className="text-[15px] text-text leading-relaxed font-medium">
          {briefing}
        </p>

        {mood && mood.total > 0 && (
          <div className="mt-5 pt-4 border-t border-border-light/60 flex items-center gap-4 flex-wrap text-[11px]">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-text-sec">
                <span className="font-bold text-emerald-600 font-mono">{mood.bullishPct.toFixed(0)}%</span> bullish
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
              <span className="text-text-sec">
                <span className="font-bold text-red-600 font-mono">{mood.bearishPct.toFixed(0)}%</span> bearish
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-text-muted" />
              <span className="text-text-sec">
                <span className="font-bold font-mono">{mood.neutralPct.toFixed(0)}%</span> neutral
              </span>
            </div>
            <span className="text-text-muted">&middot;</span>
            <span className="text-text-muted">Based on {mood.total} articles</span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Main News Page
   ────────────────────────────────────────────── */

const TABS = [
  { key: "all", label: "All news" },
  { key: "mine", label: "My stocks" },
  { key: "saved", label: "Saved" },
];

const CATEGORY_FILTERS = [
  { key: "all", label: "All" },
  { key: "Markets", label: "Markets" },
  { key: "Earnings", label: "Earnings" },
  { key: "Economy", label: "Economy" },
  { key: "M&A", label: "M&A" },
  { key: "Regulation", label: "Regulation" },
];

const SENTIMENT_FILTERS = [
  { key: "all", label: "All" },
  { key: "bullish", label: "Bullish", icon: "\u25B2", color: "text-emerald-600" },
  { key: "bearish", label: "Bearish", icon: "\u25BC", color: "text-red-500" },
];

export default function NewsClient({
  marketNews,
  stockNews,
  hasHoldings,
  marketName,
  userName,
  briefing,
}) {
  const [tab, setTab] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sentimentFilter, setSentimentFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [savedUrls, setSavedUrls] = useState([]);

  // Load saved articles from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("fundwise_saved_articles");
      if (raw) setSavedUrls(JSON.parse(raw));
    } catch {}
  }, []);

  function toggleSave(url) {
    setSavedUrls((prev) => {
      const next = prev.includes(url)
        ? prev.filter((u) => u !== url)
        : [url, ...prev];
      try {
        localStorage.setItem("fundwise_saved_articles", JSON.stringify(next));
      } catch {}
      return next;
    });
  }

  // Build saved articles array (union of all news that matches saved URLs)
  const savedArticles = useMemo(() => {
    const all = [...marketNews, ...stockNews];
    const seen = new Set();
    return all
      .filter((a) => {
        if (!savedUrls.includes(a.url) || seen.has(a.url)) return false;
        seen.add(a.url);
        return true;
      });
  }, [marketNews, stockNews, savedUrls]);

  // Choose source list based on tab
  const sourceList = useMemo(() => {
    if (tab === "mine") return stockNews;
    if (tab === "saved") return savedArticles;
    return marketNews;
  }, [tab, marketNews, stockNews, savedArticles]);

  // Apply filters
  const filtered = useMemo(() => {
    return sourceList.filter((a) => {
      if (categoryFilter !== "all" && a.category !== categoryFilter) return false;
      if (sentimentFilter !== "all" && a.sentiment?.label !== sentimentFilter) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        const hay = `${a.title || ""} ${a.content || ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [sourceList, categoryFilter, sentimentFilter, query]);

  // Split featured from the rest
  const [featured, ...rest] = filtered;

  // Aggregate mood (market news only, for the briefing sidebar)
  const marketMood = useMemo(() => aggregateMood(marketNews), [marketNews]);

  // Count articles per category for the filter chips
  const categoryCounts = useMemo(() => {
    const counts = { all: sourceList.length };
    for (const a of sourceList) {
      if (a.category) counts[a.category] = (counts[a.category] || 0) + 1;
    }
    return counts;
  }, [sourceList]);

  return (
    <div className="max-w-[1200px] mx-auto px-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[26px] font-bold text-text tracking-[-0.035em]">News</h1>
        <p className="text-[13px] text-text-muted mt-1">
          {marketName} market updates, analyzed for sentiment and ticker mentions.
        </p>
      </div>

      {/* AI Briefing */}
      <BriefingCard briefing={briefing} userName={userName} mood={marketMood} />

      {/* Search + tabs row */}
      <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
        {/* Tabs */}
        <div className="flex items-center gap-1 bg-surface-muted rounded-xl p-1 border border-border-light">
          {TABS.map((t) => {
            const disabled = t.key === "mine" && !hasHoldings;
            const count = t.key === "saved" ? savedUrls.length : null;
            return (
              <button
                key={t.key}
                onClick={() => !disabled && setTab(t.key)}
                disabled={disabled}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all flex items-center gap-1.5 ${
                  tab === t.key
                    ? "bg-white text-text shadow-xs ring-1 ring-border"
                    : disabled
                    ? "text-text-muted cursor-not-allowed opacity-50"
                    : "text-text-muted hover:text-text"
                }`}
                title={disabled ? "Record a trade to see news about your stocks" : undefined}
              >
                {t.label}
                {count != null && count > 0 && (
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${tab === t.key ? "bg-accent-light text-accent-text" : "bg-border-light text-text-muted"}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="flex-1 min-w-[200px] max-w-md">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-white focus-within:border-accent focus-within:shadow-[0_0_0_3px_var(--accent-light)] transition-all">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search news..."
              className="flex-1 bg-transparent outline-none text-[13px] text-text placeholder:text-text-muted"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="text-text-muted hover:text-text transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Category filters */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        {CATEGORY_FILTERS.map((c) => {
          const count = categoryCounts[c.key] || 0;
          if (c.key !== "all" && count === 0) return null;
          return (
            <button
              key={c.key}
              onClick={() => setCategoryFilter(c.key)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all flex items-center gap-1.5 ${
                categoryFilter === c.key
                  ? "bg-text text-white"
                  : "bg-white text-text-sec border border-border-light hover:border-text-muted"
              }`}
            >
              {c.label}
              {count > 0 && c.key !== "all" && (
                <span className={`text-[9px] font-mono ${categoryFilter === c.key ? "text-white/60" : "text-text-muted"}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}

        <div className="w-px h-5 bg-border-light mx-1" />

        {SENTIMENT_FILTERS.map((s) => (
          <button
            key={s.key}
            onClick={() => setSentimentFilter(s.key)}
            className={`px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all flex items-center gap-1.5 ${
              sentimentFilter === s.key
                ? "bg-text text-white"
                : "bg-white text-text-sec border border-border-light hover:border-text-muted"
            }`}
          >
            {s.icon && <span className={sentimentFilter === s.key ? "" : s.color}>{s.icon}</span>}
            {s.label}
          </button>
        ))}
      </div>

      {/* Results summary */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[12px] text-text-muted">
          Showing {filtered.length} article{filtered.length !== 1 ? "s" : ""}
          {(categoryFilter !== "all" || sentimentFilter !== "all" || query) && (
            <button
              onClick={() => {
                setCategoryFilter("all");
                setSentimentFilter("all");
                setQuery("");
              }}
              className="ml-2 text-accent hover:underline"
            >
              Clear filters
            </button>
          )}
        </p>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border-strong p-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-surface-muted flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z" />
              <line x1="6" y1="8" x2="18" y2="8" />
              <line x1="6" y1="12" x2="14" y2="12" />
            </svg>
          </div>
          <p className="text-[14px] font-semibold text-text mb-1">
            {tab === "saved"
              ? "No saved articles yet"
              : tab === "mine"
              ? "No news about your stocks right now"
              : "No articles match your filters"}
          </p>
          <p className="text-[12px] text-text-muted">
            {tab === "saved"
              ? "Click the bookmark icon on any article to save it for later."
              : "Try different filters or search terms."}
          </p>
        </div>
      )}

      {/* Featured + grid */}
      {featured && (
        <div className="mb-6">
          <FeaturedStory
            item={featured}
            saved={savedUrls.includes(featured.url)}
            onToggleSave={toggleSave}
          />
        </div>
      )}
      {rest.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rest.map((item, i) => (
            <NewsCard
              key={item.url || i}
              item={item}
              saved={savedUrls.includes(item.url)}
              onToggleSave={toggleSave}
            />
          ))}
        </div>
      )}
    </div>
  );
}
