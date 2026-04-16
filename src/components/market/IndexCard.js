/**
 * Market index card.
 * Shows the current value + 1D / 7D / 30D changes and a sparkline.
 */

function IndexSparkline({ values, color }) {
  if (!values || values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const width = 120;
  const height = 36;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return [x, y];
  });
  const d = pts
    .map((p, i) => (i === 0 ? `M${p[0]} ${p[1]}` : `L${p[0]} ${p[1]}`))
    .join(" ");
  const areaD = `${d} L${width} ${height} L0 ${height} Z`;
  const gradId = `idx-grad-${color.replace("#", "")}`;
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-full"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#${gradId})`} />
      <path d={d} stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChangePill({ change, label, compact = false }) {
  if (!change) {
    return (
      <div className={compact ? "text-center" : ""}>
        <p className="text-[9px] font-semibold text-text-muted uppercase tracking-wider">{label}</p>
        <p className="text-[12px] font-mono font-bold text-text-muted">{"\u2014"}</p>
      </div>
    );
  }
  const isUp = change.pct >= 0;
  return (
    <div className={compact ? "text-center" : ""}>
      <p className="text-[9px] font-semibold text-text-muted uppercase tracking-wider">{label}</p>
      <p className={`text-[12px] font-mono font-bold ${isUp ? "text-emerald-600" : "text-red-500"}`}>
        {isUp ? "+" : ""}{change.pct.toFixed(2)}%
      </p>
    </div>
  );
}

export default function IndexCard({ index, compact = false }) {
  if (!index) return null;

  const dayChange = index.changes?.d1;
  const isUp = dayChange ? dayChange.pct >= 0 : true;
  const color = isUp ? "#10b981" : "#ef4444";

  return (
    <div className="rounded-2xl border border-border bg-white p-4 hover:border-accent/40 hover:shadow-card-hover transition-all relative overflow-hidden group">
      {/* Background sparkline */}
      <div className="absolute inset-x-0 bottom-0 h-12 opacity-30 pointer-events-none">
        <IndexSparkline values={index.sparkline} color={color} />
      </div>

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.1em] mb-0.5">Index</p>
            <h3 className="text-[14px] font-bold text-text tracking-tight">{index.short}</h3>
          </div>
          {dayChange && (
            <span className={`text-[11px] font-bold font-mono px-2 py-0.5 rounded-md ${isUp ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
              {isUp ? "+" : ""}{dayChange.pct.toFixed(2)}%
            </span>
          )}
        </div>

        <p className="text-[22px] font-bold font-mono text-text tracking-[-0.02em] leading-none mb-3">
          {index.value?.toLocaleString(undefined, {
            maximumFractionDigits: index.value > 10000 ? 0 : 2,
          })}
        </p>

        {/* Period changes */}
        <div className="grid grid-cols-3 gap-1 pt-3 border-t border-border-light">
          <ChangePill change={index.changes?.d3} label="3D" compact />
          <ChangePill change={index.changes?.d7} label="7D" compact />
          <ChangePill change={index.changes?.d30} label="30D" compact />
        </div>
      </div>
    </div>
  );
}

/**
 * Compact horizontal index bar (used in dashboard strip).
 */
export function IndexStrip({ indexes }) {
  if (!indexes?.length) return null;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {indexes.map((idx) => (
        <IndexCard key={idx.symbol} index={idx} />
      ))}
    </div>
  );
}
