import Link from "next/link";

/**
 * Renders when a stock ticker doesn't resolve to real data.
 * Shows "Did you mean?" suggestions computed from edit distance.
 */
export default function StockNotFound({
  attemptedTicker,
  suggestions = [],
  marketName,
  exchangeName,
}) {
  const shortAttempt = attemptedTicker.split(".")[0];

  return (
    <div className="max-w-[720px] mx-auto px-8 py-16 animate-fade-in">
      {/* Breadcrumb */}
      <div className="mb-8">
        <Link
          href="/market"
          className="inline-flex items-center gap-1.5 text-[13px] text-text-muted hover:text-text transition-colors"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to Market
        </Link>
      </div>

      {/* Main 404 block */}
      <div className="rounded-3xl border border-border bg-white p-10 relative overflow-hidden mb-6">
        <div className="absolute -top-10 -right-10 w-56 h-56 rounded-full bg-amber-100/50 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          {/* Icon */}
          <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mb-5 ring-1 ring-amber-200">
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>

          <h1 className="text-[26px] font-bold text-text tracking-[-0.025em] mb-2">
            We couldn&apos;t find{" "}
            <span className="font-mono bg-surface-muted border border-border-light rounded-lg px-2 py-0.5 text-[22px]">
              {shortAttempt}
            </span>
          </h1>
          <p className="text-[14px] text-text-sec leading-relaxed max-w-md">
            That ticker doesn&apos;t exist on{" "}
            <span className="font-medium text-text">{exchangeName}</span>, or the
            market data provider doesn&apos;t have it.{" "}
            {suggestions.length > 0 && "Here are some similar stocks you might mean:"}
          </p>
        </div>
      </div>

      {/* Did You Mean suggestions */}
      {suggestions.length > 0 && (
        <div className="rounded-2xl border border-border bg-white overflow-hidden mb-6">
          <div className="px-6 py-3 bg-surface-muted border-b border-border-light">
            <p className="text-[11px] font-bold text-text-muted uppercase tracking-[0.1em]">
              Did you mean?
            </p>
          </div>
          <div>
            {suggestions.map((s, i) => (
              <Link
                key={s.ticker}
                href={`/market/${encodeURIComponent(s.ticker)}`}
                className={`flex items-center justify-between px-6 py-4 hover:bg-accent-subtle transition-colors group ${
                  i < suggestions.length - 1 ? "border-b border-border-light" : ""
                }`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-accent-light flex items-center justify-center flex-shrink-0">
                    <span className="font-mono text-[11px] font-bold text-accent">
                      {s.ticker.split(".")[0].slice(0, 3)}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[14px] font-semibold text-text truncate group-hover:text-accent transition-colors">
                      {s.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-mono text-[11px] font-bold text-text-muted">
                        {s.ticker.split(".")[0]}
                      </span>
                      {s.sector && (
                        <>
                          <span className="text-text-muted">&middot;</span>
                          <span className="text-[11px] text-text-muted">{s.sector}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-text-muted group-hover:text-accent transition-colors flex-shrink-0"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Alternative actions */}
      <div className="flex items-center gap-3 flex-wrap">
        <Link href="/market" className="btn-primary !py-2.5 !px-5 text-[13px]">
          Browse {marketName} stocks
        </Link>
        <Link
          href="/advisor"
          className="inline-flex items-center gap-1.5 py-2.5 px-5 rounded-lg text-[13px] font-medium bg-white text-text border border-border hover:border-accent/40 transition-all"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" />
          </svg>
          Ask AI advisor
        </Link>
      </div>

      {/* Helpful hint */}
      <div className="mt-8 rounded-xl bg-surface-muted border border-border-light p-4 flex items-start gap-3">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--text-muted)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="flex-shrink-0 mt-0.5"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4M12 8h.01" />
        </svg>
        <div>
          <p className="text-[13px] font-semibold text-text mb-1">Tip</p>
          <p className="text-[12px] text-text-sec leading-relaxed">
            Try searching by company name instead of the ticker. Type &quot;sui gas&quot;
            or &quot;apple&quot; in the search box — we&apos;ll match it for you.
          </p>
        </div>
      </div>
    </div>
  );
}
