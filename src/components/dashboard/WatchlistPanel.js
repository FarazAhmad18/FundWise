"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { addToWatchlist, removeFromWatchlist } from "@/features/watchlist/actions";
import { formatCurrency } from "@/constants/markets";

function PriceDisplay({ quote, currency }) {
  if (!quote) {
    return <span className="font-mono text-[11px] text-text-muted">--</span>;
  }

  const isUp = quote.change >= 0;
  const color = isUp ? "text-emerald-600" : "text-red-500";

  return (
    <div className="text-right">
      <p className={`font-mono text-[13px] font-semibold ${color}`}>
        {formatCurrency(quote.price, quote.currency || currency)}
      </p>
      <p className={`font-mono text-[10px] ${color}`}>
        {isUp ? "+" : ""}{quote.changePct.toFixed(2)}%
      </p>
    </div>
  );
}

export default function WatchlistPanel({ initialItems, quotes = {}, currency = "USD" }) {
  const [items, setItems] = useState(initialItems);
  const [error, setError] = useState(null);
  const [pending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);

  async function handleAdd(e) {
    e.preventDefault();
    setError(null);
    const form = e.target;
    const formData = new FormData(form);
    const ticker = formData.get("ticker")?.toString().trim().toUpperCase();
    const name = formData.get("name")?.toString().trim() || ticker;

    startTransition(async () => {
      const result = await addToWatchlist(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setItems((prev) => [
          { watchlistId: `tmp-${ticker}`, ticker, name },
          ...prev,
        ]);
        form.reset();
        setShowForm(false);
      }
    });
  }

  function handleRemove(companyId) {
    setItems((prev) => prev.filter((i) => i.id !== companyId));
    startTransition(async () => {
      const result = await removeFromWatchlist(companyId);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[15px] font-semibold text-text">Watchlist</h2>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="text-[13px] text-accent font-medium hover:underline"
        >
          {showForm ? "Cancel" : "+ Add"}
        </button>
      </div>

      <div className="rounded-2xl border border-border overflow-hidden">
        {showForm && (
          <form onSubmit={handleAdd} className="p-4 border-b border-border-light">
            <div className="flex gap-2">
              <input
                name="ticker"
                required
                maxLength={10}
                placeholder="Ticker"
                className="input-field !py-2 !text-[12px] font-mono uppercase flex-1"
              />
              <input
                name="name"
                placeholder="Name (optional)"
                className="input-field !py-2 !text-[12px] flex-1"
              />
              <button
                type="submit"
                disabled={pending}
                className="btn-primary !py-2 !px-4 !text-[12px] disabled:opacity-50"
              >
                Add
              </button>
            </div>
            {error && <p className="text-[11px] text-danger mt-2">{error}</p>}
          </form>
        )}

        {items.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-[12px] text-text-muted mb-3">
              No stocks in your watchlist yet.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="text-[12px] text-accent font-medium hover:underline"
            >
              Add your first stock
            </button>
          </div>
        ) : (
          items.map((stock, i) => (
            <Link
              key={stock.watchlistId}
              href={`/market/${encodeURIComponent(stock.ticker)}`}
              className={`flex items-center justify-between px-5 py-3.5 hover:bg-accent-subtle transition-colors group ${
                i < items.length - 1 ? "border-b border-border-light" : ""
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-accent-light flex items-center justify-center flex-shrink-0">
                  <span className="font-mono text-[10px] font-bold text-accent">
                    {stock.ticker?.split(".")[0]?.slice(0, 2)}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-text">{stock.ticker?.split(".")[0]}</p>
                  <p className="text-[11px] text-text-muted truncate">{stock.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <PriceDisplay quote={quotes[stock.ticker]} currency={currency} />
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleRemove(stock.id);
                  }}
                  className="text-text-muted hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity p-1 ml-1"
                  title="Remove"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
