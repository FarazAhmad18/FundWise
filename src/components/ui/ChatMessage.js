import Badge from "./Badge";

export function UserMessage({ text }) {
  return (
    <div className="flex justify-end mb-5">
      <div className="max-w-lg bg-accent text-white rounded-2xl rounded-br-md px-4 py-3">
        <p className="text-[13.5px] leading-relaxed">{text}</p>
      </div>
    </div>
  );
}

export function AssistantMessage({ text, sources = [], thinking = false }) {
  if (thinking) {
    return (
      <div className="flex mb-5">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-lg bg-accent-light flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 21H4a1 1 0 01-1-1V3" />
                <path d="M7 14l4-4 4 4 5-5" />
              </svg>
            </div>
            <span className="text-xs font-medium text-text-muted">Researching...</span>
          </div>
          <div className="bg-surface rounded-2xl rounded-bl-md px-4 py-3 border border-border-light">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-soft" />
              <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-soft" style={{ animationDelay: "0.3s" }} />
              <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-soft" style={{ animationDelay: "0.6s" }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex mb-5">
      <div className="max-w-2xl">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-lg bg-accent-light flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 21H4a1 1 0 01-1-1V3" />
              <path d="M7 14l4-4 4 4 5-5" />
            </svg>
          </div>
          <span className="text-xs font-medium text-text-muted">Research Copilot</span>
        </div>
        <div className="bg-surface rounded-2xl rounded-bl-md px-4 py-3 border border-border-light">
          <div className="text-[13.5px] text-text leading-relaxed whitespace-pre-wrap">
            {text}
          </div>
          {sources.length > 0 && (
            <div className="mt-3 pt-3 border-t border-border-light">
              <p className="text-[11px] font-medium text-text-muted uppercase tracking-wider mb-2">
                Sources
              </p>
              <div className="flex flex-wrap gap-1.5">
                {sources.map((s, i) => (
                  <Badge key={i} color="blue">{s}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
