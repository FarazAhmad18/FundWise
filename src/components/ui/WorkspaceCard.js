import Link from "next/link";
import Badge from "./Badge";

export default function WorkspaceCard({
  id,
  name,
  company,
  ticker,
  sourceCount = 0,
  queryCount = 0,
  lastActive,
  className = "",
}) {
  return (
    <Link
      href={`/workspace/${id}`}
      className={`card-hover block ${className}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-accent-light flex items-center justify-center text-accent">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 4a2 2 0 012-2h5l2 2h9a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V4z" />
          </svg>
        </div>
        {ticker && (
          <span className="font-mono text-xs font-semibold text-text-sec bg-surface-muted px-2 py-1 rounded-md">
            {ticker}
          </span>
        )}
      </div>

      <h3 className="text-[14px] font-semibold text-text mb-1 truncate">{name}</h3>
      {company && (
        <p className="text-xs text-text-muted mb-3 truncate">{company}</p>
      )}

      <div className="flex items-center gap-4 pt-3 border-t border-border-light">
        <div className="flex items-center gap-1.5 text-xs text-text-muted">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
          </svg>
          {sourceCount} sources
        </div>
        <div className="flex items-center gap-1.5 text-xs text-text-muted">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" />
          </svg>
          {queryCount} queries
        </div>
        {lastActive && (
          <span className="text-[11px] text-text-muted ml-auto">{lastActive}</span>
        )}
      </div>
    </Link>
  );
}
