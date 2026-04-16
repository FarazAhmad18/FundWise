"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";

/**
 * Command Palette (Cmd/Ctrl+K).
 * Inspired by Linear, Vercel, Raycast. Global search for
 * navigation, stocks, and quick actions.
 */

const PAGES = [
  { id: "dashboard", label: "Dashboard", href: "/dashboard", hint: "Go to", group: "Pages", icon: "dashboard" },
  { id: "market", label: "Market", href: "/market", hint: "Go to", group: "Pages", icon: "market" },
  { id: "portfolio", label: "Portfolio", href: "/portfolio", hint: "Go to", group: "Pages", icon: "portfolio" },
  { id: "news", label: "News", href: "/news", hint: "Go to", group: "Pages", icon: "news" },
  { id: "advisor", label: "AI Advisor", href: "/advisor", hint: "Go to", group: "Pages", icon: "advisor" },
  { id: "goals", label: "Goals", href: "/goals", hint: "Go to", group: "Pages", icon: "goals" },
  { id: "settings", label: "Settings", href: "/settings", hint: "Go to", group: "Pages", icon: "settings" },
];

const ACTIONS = [
  { id: "new-trade", label: "Record a trade", href: "/portfolio/transactions", hint: "Action", group: "Actions", icon: "plus" },
  { id: "new-goal", label: "Create a goal", href: "/goals", hint: "Action", group: "Actions", icon: "target" },
  { id: "ask-advisor", label: "Ask the AI advisor", href: "/advisor", hint: "Action", group: "Actions", icon: "message" },
  { id: "compare", label: "Compare two stocks", href: "/compare", hint: "Action", group: "Actions", icon: "compare" },
];

const ICONS = {
  dashboard: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
  market: <><path d="M21 21H4a1 1 0 01-1-1V3" /><path d="M7 14l4-4 4 4 5-5" /></>,
  portfolio: <><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" /></>,
  news: <><path d="M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z" /><line x1="6" y1="8" x2="18" y2="8" /><line x1="6" y1="12" x2="14" y2="12" /></>,
  advisor: <><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" /></>,
  goals: <><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></>,
  plus: <><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>,
  target: <><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></>,
  message: <><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" /></>,
  compare: <><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></>,
  stock: <><path d="M3 3v18h18" /><path d="M7 12l3 3 7-7" /></>,
};

function Icon({ name }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {ICONS[name] || null}
    </svg>
  );
}

function fuzzyMatch(query, text) {
  const q = query.toLowerCase();
  const t = (text || "").toLowerCase();
  if (!q) return 0;
  if (t.startsWith(q)) return 3;
  if (t.includes(` ${q}`)) return 2;
  if (t.includes(q)) return 1;
  // Multi-word: check if all words appear
  const words = q.split(/\s+/).filter(Boolean);
  if (words.length > 1 && words.every((w) => t.includes(w))) return 1;
  return 0;
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [watchlist, setWatchlist] = useState([]);
  const [popularTickers, setPopularTickers] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const inputRef = useRef(null);
  const router = useRouter();

  // Fetch search data once on first mount
  useEffect(() => {
    if (dataLoaded) return;
    fetch("/api/search-data")
      .then((r) => r.json())
      .then((data) => {
        setWatchlist(data.watchlist || []);
        setPopularTickers(data.popularTickers || []);
        setDataLoaded(true);
      })
      .catch(() => setDataLoaded(true));
  }, [dataLoaded]);

  // Build searchable items
  const allItems = useMemo(() => {
    const stockItems = [
      ...watchlist.map((w) => ({
        id: `wl-${w.ticker || w.watchlistId}`,
        label: w.ticker,
        sublabel: w.name,
        href: `/market/${encodeURIComponent(w.ticker)}`,
        hint: "Stock",
        group: "Watchlist",
        icon: "stock",
      })),
      ...popularTickers.map((t) => ({
        id: `pop-${t.ticker}`,
        label: t.ticker.split(".")[0],
        sublabel: t.name,
        aliases: t.aliases || [],
        sector: t.sector,
        href: `/market/${encodeURIComponent(t.ticker)}`,
        hint: "Stock",
        group: "Popular stocks",
        icon: "stock",
      })),
    ];
    return [...PAGES, ...ACTIONS, ...stockItems];
  }, [watchlist, popularTickers]);

  // Filter + sort
  const results = useMemo(() => {
    if (!query.trim()) {
      // No query: show pages + actions grouped
      return allItems.filter((i) => i.group === "Pages" || i.group === "Actions");
    }
    const scored = allItems
      .map((item) => {
        const aliasScore = (item.aliases || []).reduce(
          (best, a) => Math.max(best, fuzzyMatch(query, a)),
          0
        );
        return {
          item,
          score: Math.max(
            fuzzyMatch(query, item.label) * 2,
            fuzzyMatch(query, item.sublabel || ""),
            aliasScore * 1.5,
            fuzzyMatch(query, item.sector || ""),
            fuzzyMatch(query, item.group)
          ),
        };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score);
    return scored.map((x) => x.item).slice(0, 20);
  }, [query, allItems]);

  // Group by "group" in current order
  const grouped = useMemo(() => {
    const groups = {};
    for (const item of results) {
      if (!groups[item.group]) groups[item.group] = [];
      groups[item.group].push(item);
    }
    return groups;
  }, [results]);

  // Flat ordered list (groups concatenated) for keyboard nav
  const flat = useMemo(
    () => Object.values(grouped).flat(),
    [grouped]
  );

  // Open / close via Cmd+K
  useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Focus input on open, reset on close
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 40);
      setQuery("");
      setActiveIndex(0);
    }
  }, [open]);

  // Reset active index when results change
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  function handleKeyDown(e) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, flat.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const target = flat[activeIndex];
      if (target) {
        router.push(target.href);
        setOpen(false);
      }
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4 animate-fade-in"
      onClick={() => setOpen(false)}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-[600px] bg-white rounded-2xl shadow-elevated border border-border overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border-light">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted flex-shrink-0">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search pages, stocks, actions..."
            className="flex-1 bg-transparent outline-none text-[15px] text-text placeholder:text-text-muted"
          />
          <kbd className="text-[10px] font-mono font-semibold text-text-muted bg-surface-muted border border-border-light px-1.5 py-0.5 rounded">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto py-2">
          {flat.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="text-[13px] text-text-muted">No results found</p>
              <p className="text-[11px] text-text-muted mt-1">
                Try searching for a page, stock, or action
              </p>
            </div>
          ) : (
            (() => {
              let runningIdx = -1;
              return Object.entries(grouped).map(([group, items]) => (
                <div key={group} className="mb-1">
                  <p className="px-5 pt-2 pb-1 text-[10px] font-bold text-text-muted uppercase tracking-wider">
                    {group}
                  </p>
                  {items.map((item) => {
                    runningIdx++;
                    const isActive = runningIdx === activeIndex;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          router.push(item.href);
                          setOpen(false);
                        }}
                        onMouseEnter={() => setActiveIndex(runningIdx)}
                        className={`w-full flex items-center gap-3 px-5 py-2.5 text-left transition-colors ${
                          isActive ? "bg-accent-light" : "hover:bg-surface-muted"
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            isActive ? "bg-white text-accent" : "bg-surface-muted text-text-sec"
                          }`}
                        >
                          <Icon name={item.icon} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-[13px] font-medium truncate ${isActive ? "text-accent-text" : "text-text"}`}>
                            {item.label}
                          </p>
                          {item.sublabel && (
                            <p className="text-[11px] text-text-muted truncate">{item.sublabel}</p>
                          )}
                        </div>
                        {isActive && (
                          <kbd className="text-[10px] font-mono font-semibold text-accent-text bg-white border border-accent/20 px-1.5 py-0.5 rounded">
                            {"\u21B5"}
                          </kbd>
                        )}
                      </button>
                    );
                  })}
                </div>
              ));
            })()
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-2.5 border-t border-border-light bg-surface-muted text-[11px] text-text-muted">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="font-mono font-semibold bg-white border border-border px-1 py-0.5 rounded">{"\u2191\u2193"}</kbd>
              <span>navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="font-mono font-semibold bg-white border border-border px-1 py-0.5 rounded">{"\u21B5"}</kbd>
              <span>select</span>
            </span>
          </div>
          <span className="font-medium">Fundwise</span>
        </div>
      </div>
    </div>
  );
}
