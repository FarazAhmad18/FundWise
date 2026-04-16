"use client";

import { useState, useRef, useEffect, useTransition, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { addTransaction, deleteTransaction } from "@/features/transactions/actions";
import { formatCurrency, scoreStock } from "@/constants/markets";

/* ─── Ticker Search Input ──────────────────────────────────── */

function TickerSearch({ value, onChange, onSelect, popularTickers, exchangeSuffix }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const [activeIdx, setActiveIdx] = useState(0);
  const ref = useRef(null);

  const results = useMemo(() => {
    if (!query || query.length < 1) return popularTickers.slice(0, 6);
    return popularTickers
      .map((s) => ({ ...s, score: scoreStock(s, query) }))
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);
  }, [query, popularTickers]);

  useEffect(() => setActiveIdx(0), [results]);

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function pick(stock) {
    const display = stock.ticker.split(".")[0];
    setQuery(display);
    onChange(display);
    onSelect(stock);
    setOpen(false);
  }

  function handleKey(e) {
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, results.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, 0)); }
    if (e.key === "Enter" && results[activeIdx]) { e.preventDefault(); pick(results[activeIdx]); }
    if (e.key === "Escape") setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <label className="text-[10px] uppercase tracking-[0.08em] font-semibold text-text-muted block mb-1.5">Stock</label>
      <div className={`flex items-center gap-2 rounded-xl border bg-white px-3 py-2 transition-all ${open ? "border-accent shadow-[0_0_0_3px_var(--accent-light)]" : "border-border"}`}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => { const v = e.target.value.toUpperCase(); setQuery(v); onChange(v); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKey}
          placeholder="Search by name or ticker..."
          className="flex-1 bg-transparent outline-none text-[13px] text-text placeholder:text-text-muted"
          autoComplete="off"
          required
        />
      </div>

      {open && results.length > 0 && (
        <div className="absolute z-20 left-0 right-0 mt-1.5 bg-white rounded-xl border border-border shadow-elevated overflow-hidden">
          {results.map((stock, i) => {
            const display = stock.ticker.split(".")[0];
            return (
              <button
                key={stock.ticker}
                type="button"
                onClick={() => pick(stock)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${i === activeIdx ? "bg-accent-light" : "hover:bg-surface-muted"}`}
              >
                <span className="w-10 text-[11px] font-bold font-mono text-accent bg-accent-light rounded-md px-1.5 py-0.5 text-center flex-shrink-0">
                  {display}
                </span>
                <span className="text-[12px] text-text truncate">{stock.name}</span>
                {stock.sector && <span className="ml-auto text-[10px] text-text-muted flex-shrink-0">{stock.sector}</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── Transaction Form ─────────────────────────────────────── */

function TransactionForm({ currency, exchangeSuffix, popularTickers, prefillTicker, prefillPrice, onSuccess }) {
  const [type, setType] = useState("buy");
  const [ticker, setTicker] = useState(prefillTicker.split(".")[0] || "");
  const [companyName, setCompanyName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState(prefillPrice || "");
  const [fees, setFees] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const total = useMemo(() => {
    const q = Number(quantity), p = Number(price), f = Number(fees || 0);
    return q > 0 && p > 0 ? q * p + f : null;
  }, [quantity, price, fees]);

  function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const fullTicker = ticker.includes(".") || !exchangeSuffix
      ? ticker.toUpperCase()
      : ticker.toUpperCase() + exchangeSuffix;

    const formData = new FormData();
    formData.set("ticker", fullTicker);
    formData.set("companyName", companyName || fullTicker.split(".")[0]);
    formData.set("type", type);
    formData.set("quantity", quantity);
    formData.set("pricePerUnit", price);
    formData.set("fees", fees || "0");
    formData.set("transactionDate", date);
    formData.set("notes", notes);
    formData.set("currency", currency);

    startTransition(async () => {
      const result = await addTransaction(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setTicker(""); setCompanyName(""); setQuantity("");
        setPrice(""); setFees(""); setNotes("");
        onSuccess?.();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-white p-6">
      <h3 className="text-[15px] font-semibold text-text mb-5">Record a Trade</h3>

      {/* Buy / Sell */}
      <div className="flex gap-1 p-0.5 bg-surface-muted rounded-lg border border-border-light mb-5">
        {["buy", "sell"].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={`flex-1 py-2 rounded-md text-[12px] font-semibold uppercase tracking-wider transition-all ${
              type === t
                ? t === "buy"
                  ? "bg-white text-emerald-600 shadow-xs ring-1 ring-emerald-200"
                  : "bg-white text-red-500 shadow-xs ring-1 ring-red-200"
                : "text-text-muted"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Ticker search */}
      <div className="mb-4">
        <TickerSearch
          value={ticker}
          onChange={setTicker}
          onSelect={(stock) => setCompanyName(stock.name)}
          popularTickers={popularTickers}
          exchangeSuffix={exchangeSuffix}
        />
      </div>

      {/* Date */}
      <div className="mb-4">
        <label className="text-[10px] uppercase tracking-[0.08em] font-semibold text-text-muted block mb-1.5">Date</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="input-field !text-[13px] w-full" />
      </div>

      {/* Shares + Price + Fees */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div>
          <label className="text-[10px] uppercase tracking-[0.08em] font-semibold text-text-muted block mb-1.5">Shares</label>
          <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="100" min="0.001" step="any" required className="input-field !text-[13px] font-mono w-full" />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-[0.08em] font-semibold text-text-muted block mb-1.5">Price</label>
          <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="150.00" min="0" step="any" required className="input-field !text-[13px] font-mono w-full" />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-[0.08em] font-semibold text-text-muted block mb-1.5">Fees</label>
          <input type="number" value={fees} onChange={(e) => setFees(e.target.value)} placeholder="0" min="0" step="any" className="input-field !text-[13px] font-mono w-full" />
        </div>
      </div>

      {/* Total */}
      {total != null && (
        <div className="flex items-center justify-between rounded-lg bg-surface-muted border border-border-light px-4 py-2.5 mb-4">
          <span className="text-[11px] text-text-muted uppercase tracking-wider font-semibold">Total</span>
          <span className="text-[15px] font-bold font-mono text-text">{formatCurrency(total, currency)}</span>
        </div>
      )}

      {/* Notes */}
      <div className="mb-5">
        <label className="text-[10px] uppercase tracking-[0.08em] font-semibold text-text-muted block mb-1.5">Notes</label>
        <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional" className="input-field !text-[13px] w-full" maxLength={200} />
      </div>

      {error && <p className="text-[12px] text-danger bg-red-50 rounded-lg px-3 py-2 mb-4">{error}</p>}

      <button
        type="submit"
        disabled={pending}
        className={`w-full py-2.5 rounded-xl text-[13px] font-semibold text-white transition-colors disabled:opacity-50 ${
          type === "buy" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-500 hover:bg-red-600"
        }`}
      >
        {pending ? "Recording..." : type === "buy" ? "Record Purchase" : "Record Sale"}
      </button>
    </form>
  );
}

/* ─── Confirm Dialog ───────────────────────────────────────── */

function ConfirmDialog({ title, message, confirmLabel, onConfirm, onCancel }) {
  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onCancel(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-fade-in" onClick={onCancel}>
      <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-elevated border border-border max-w-sm w-full p-6 animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-[15px] font-semibold text-text mb-1.5">{title}</h3>
        <p className="text-[13px] text-text-sec leading-relaxed mb-6">{message}</p>
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg text-[13px] font-medium text-text-sec border border-border hover:bg-surface-muted transition-colors">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-lg text-[13px] font-medium text-white bg-red-500 hover:bg-red-600 transition-colors">{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Transaction Row ──────────────────────────────────────── */

function TransactionRow({ tx, currency, locale, onDelete, pending }) {
  const isBuy = tx.type === "buy";
  const d = new Date(tx.transaction_date);
  const now = new Date();
  const diffDays = Math.floor((now - d) / 86400000);
  const dateLabel = diffDays === 0 ? "Today" : diffDays === 1 ? "Yesterday" : diffDays < 7 ? `${diffDays}d ago` : d.toLocaleDateString(locale, { month: "short", day: "numeric", year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined });

  return (
    <div className="flex items-center gap-4 px-5 py-3.5 hover:bg-accent-subtle transition-colors group">
      {/* Type indicator */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isBuy ? "bg-emerald-50 ring-1 ring-emerald-200" : "bg-red-50 ring-1 ring-red-200"}`}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={isBuy ? "#059669" : "#ef4444"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {isBuy ? <><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></> : <><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></>}
        </svg>
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-text">
          <span className={isBuy ? "text-emerald-600" : "text-red-500"}>{isBuy ? "Bought" : "Sold"}</span>
          {" "}{tx.quantity} <Link href={`/market/${encodeURIComponent(tx.company?.ticker)}`} className="hover:text-accent transition-colors">{tx.company?.name || tx.company?.ticker}</Link>
        </p>
        <p className="text-[11px] text-text-muted font-mono">
          @ {formatCurrency(tx.price_per_unit, currency, locale)}
          {tx.notes && <span className="font-sans"> &middot; {tx.notes}</span>}
        </p>
      </div>

      {/* Amount + Date */}
      <div className="text-right flex-shrink-0">
        <p className={`text-[13px] font-bold font-mono ${isBuy ? "text-text" : "text-red-500"}`}>
          {isBuy ? "" : "+"}{formatCurrency(tx.total_amount, currency, locale)}
        </p>
        <p className="text-[10px] text-text-muted">{dateLabel}</p>
      </div>

      {/* Delete */}
      <button
        onClick={() => onDelete(tx)}
        disabled={pending}
        title="Delete"
        className="p-1.5 rounded-md text-text-muted opacity-0 group-hover:opacity-100 hover:text-danger hover:bg-red-50 transition-all disabled:opacity-40"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
        </svg>
      </button>
    </div>
  );
}

/* ─── Root ─────────────────────────────────────────────────── */

export default function TransactionsClient({ transactions, currency, locale, exchangeSuffix, popularTickers, prefillTicker, prefillPrice }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(null);
  const [pending, startTransition] = useTransition();

  function confirmDelete() {
    if (!deleting) return;
    startTransition(async () => {
      const result = await deleteTransaction(deleting.id);
      if (!result.error) router.refresh();
      setDeleting(null);
    });
  }

  return (
    <div className="page-container">
      <div className="mb-4">
        <Link href="/portfolio" className="inline-flex items-center gap-1.5 text-[12px] text-text-muted hover:text-accent transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          Portfolio
        </Link>
      </div>

      <h1 className="page-title mb-5">Transactions</h1>

      <div className="grid lg:grid-cols-[380px_1fr] gap-6">
        {/* Form */}
        <div>
          <TransactionForm
            currency={currency}
            exchangeSuffix={exchangeSuffix}
            popularTickers={popularTickers}
            prefillTicker={prefillTicker}
            prefillPrice={prefillPrice}
            onSuccess={() => router.refresh()}
          />
        </div>

        {/* History */}
        <div className="rounded-2xl border border-border bg-white overflow-hidden">
          <div className="px-5 py-4 border-b border-border-light">
            <h3 className="text-[14px] font-semibold text-text">History</h3>
            <p className="text-[11px] text-text-muted mt-0.5">{transactions.length} transaction{transactions.length !== 1 ? "s" : ""}</p>
          </div>

          {transactions.length === 0 ? (
            <div className="flex flex-col items-center text-center py-16 px-6">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--border-strong)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-4">
                <rect x="2" y="3" width="20" height="18" rx="2"/><line x1="2" y1="9" x2="22" y2="9"/>
              </svg>
              <p className="text-[14px] font-semibold text-text mb-1">No transactions yet</p>
              <p className="text-[12px] text-text-muted max-w-xs">Record your first buy or sell to start tracking your portfolio.</p>
            </div>
          ) : (
            <div className="divide-y divide-border-light">
              {transactions.map((tx) => (
                <TransactionRow
                  key={tx.id}
                  tx={tx}
                  currency={currency}
                  locale={locale}
                  onDelete={setDeleting}
                  pending={pending}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {deleting && (
        <ConfirmDialog
          title="Delete transaction"
          message={`Remove this ${deleting.type} of ${deleting.quantity} ${deleting.company?.name || deleting.company?.ticker}?`}
          confirmLabel={pending ? "Deleting..." : "Delete"}
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
