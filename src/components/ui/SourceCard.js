import Badge from "./Badge";

export default function SourceCard({
  title,
  url,
  publisher,
  snippet,
  type = "article",
  date,
  sentiment,
  className = "",
}) {
  const typeColors = {
    article: "blue",
    filing: "purple",
    note: "amber",
    report: "emerald",
    live: "cyan",
  };

  const sentimentColors = {
    positive: "emerald",
    negative: "red",
    neutral: "gray",
  };

  return (
    <div className={`card-hover ${className}`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge color={typeColors[type] || "gray"}>
            {type}
          </Badge>
          {sentiment && (
            <Badge color={sentimentColors[sentiment] || "gray"}>
              {sentiment}
            </Badge>
          )}
        </div>
        {date && (
          <span className="text-[11px] text-text-muted whitespace-nowrap">{date}</span>
        )}
      </div>

      <h4 className="text-[13.5px] font-semibold text-text leading-snug mb-1.5 line-clamp-2">
        {title}
      </h4>

      {publisher && (
        <p className="text-xs text-text-muted mb-2">{publisher}</p>
      )}

      {snippet && (
        <p className="text-xs text-text-sec leading-relaxed line-clamp-3 mb-2">
          {snippet}
        </p>
      )}

      {url && (
        <p className="text-[11px] text-accent truncate">
          {url}
        </p>
      )}
    </div>
  );
}
