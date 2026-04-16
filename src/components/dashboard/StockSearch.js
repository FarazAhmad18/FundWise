"use client";

import { useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@/constants/markets";

export default function StockSearch() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSearch(e) {
    e.preventDefault();
    const ticker = query.trim().toUpperCase();
    if (!ticker) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`/api/quote/${ticker}`);
      if (!res.ok) {
        setError("Stock not found. Try a valid ticker like AAPL, TSLA, or MSFT.");
        return;
      }
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        return;
      }
      setResult(data);
    } catch (err) {
      setError("Failed to fetch. Check your connection.");
    } finally {
      setLoading(false);
    }
  }

  const isUp = result?.change >= 0;
  const color = isUp ? "text-emerald-600" : "text-red-500";
  const arrow = isUp ? "\u25B2" : "\u25BC";

  return (
    <div className="mb-8">
      <form onSubmit={handleSearch} className="flex items-center gap-3 mb-4">
        <div className="flex-1 max-w-md flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-bg focus-within:border-accent focus-within:shadow-[0_0_0_3px_var(--accent-light)] transition-all">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value.toUpperCase())}
            placeholder="Search any stock ticker (e.g. AAPL, TSLA, FFC.KA)"
            className="flex-1 text-[13px] bg-transparent outline-none placeholder:text-text-muted text-text font-mono"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="btn-primary !py-2.5 !px-5 disabled:opacity-50"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {error && (
        <p className="text-[12px] text-danger mb-3">{error}</p>
      )}

      {result && (
        <div className="card max-w-md animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[14px] font-bold text-text">{result.ticker}</span>
                <span className="text-[10px] text-text-muted">{result.exchange}</span>
              </div>
              <p className="text-[10px] text-text-muted mt-0.5">
                {result.marketState === "REGULAR" ? "Market Open" : "Market Closed"}
              </p>
            </div>
            <div className="text-right">
              <p className={`font-mono text-[20px] font-bold ${color}`}>
                {formatCurrency(result.price, result.currency || "USD")}
              </p>
              <p className={`font-mono text-[11px] ${color}`}>
                {arrow} {Math.abs(result.change).toFixed(2)} ({Math.abs(result.changePct).toFixed(2)}%)
              </p>
            </div>
          </div>

          <div className="flex gap-2 pt-3 border-t border-border-light">
            {result.volume && (
              <div className="flex-1 text-center">
                <p className="text-[10px] text-text-muted">Volume</p>
                <p className="font-mono text-[11px] font-semibold text-text">{result.volume?.toLocaleString()}</p>
              </div>
            )}
            {result.dayHigh && (
              <div className="flex-1 text-center">
                <p className="text-[10px] text-text-muted">Day Range</p>
                <p className="font-mono text-[11px] font-semibold text-text">{result.dayLow?.toFixed(2)} - {result.dayHigh?.toFixed(2)}</p>
              </div>
            )}
          </div>

          <div className="flex gap-2 mt-3">
            <Link
              href={`/market/${encodeURIComponent(result.ticker)}`}
              className="flex-1 btn-primary !text-xs !py-2 text-center"
            >
              View {result.ticker}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
