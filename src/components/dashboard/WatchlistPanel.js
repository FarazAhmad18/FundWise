"use client";

import { useState, useTransition } from "react";
import { addToWatchlist, removeFromWatchlist } from "@/features/watchlist/actions";

export default function WatchlistPanel({ initialItems }) {
  const [items, setItems] = useState(initialItems);
  const [error, setError] = useState(null);
  const [pending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(initialItems.length === 0);

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
          className="text-xs text-accent font-medium hover:underline"
        >
          {showForm ? "Close" : "Add"}
        </button>
      </div>

      <div className="card">
        {showForm && (
          <form onSubmit={handleAdd} className="flex flex-col gap-2 mb-4 pb-4 border-b border-border-light">
            <div className="grid grid-cols-[90px_1fr_auto] gap-2">
              <input
                name="ticker"
                required
                maxLength={10}
                placeholder="TSLA"
                className="input-field !py-1.5 !text-xs font-mono uppercase"
              />
              <input
                name="name"
                placeholder="Tesla (optional)"
                className="input-field !py-1.5 !text-xs"
              />
              <button
                type="submit"
                disabled={pending}
                className="btn-primary !py-1.5 !px-3 !text-xs disabled:opacity-50"
              >
                Add
              </button>
            </div>
            {error && (
              <p className="text-[11px] text-danger">{error}</p>
            )}
          </form>
        )}

        {items.length === 0 ? (
          <p className="text-xs text-text-muted text-center py-4">
            No tickers yet. Add one to track it.
          </p>
        ) : (
          <div className="flex flex-col divide-y divide-border-light">
            {items.map((stock) => (
              <div
                key={stock.watchlistId}
                className="flex items-center justify-between py-3 first:pt-0 last:pb-0 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-surface-muted flex items-center justify-center">
                    <span className="font-mono text-[11px] font-bold text-text-sec">
                      {stock.ticker?.slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-text">{stock.ticker}</p>
                    <p className="text-[11px] text-text-muted truncate max-w-[140px]">
                      {stock.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] text-text-muted">—</span>
                  <button
                    type="button"
                    onClick={() => handleRemove(stock.id)}
                    className="text-text-muted hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity p-1"
                    title="Remove"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <p className="text-[10px] text-text-muted mt-2 px-1">
        Live prices coming soon (Alpha Vantage integration).
      </p>
    </div>
  );
}
