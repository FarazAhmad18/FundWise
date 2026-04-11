const colorMap = {
  emerald: { bg: "bg-accent-light", text: "text-accent", dot: "bg-accent" },
  blue: { bg: "bg-blue-light", text: "text-blue", dot: "bg-blue" },
  purple: { bg: "bg-purple-light", text: "text-purple", dot: "bg-purple" },
  amber: { bg: "bg-amber-light", text: "text-amber", dot: "bg-amber" },
  cyan: { bg: "bg-cyan-light", text: "text-cyan", dot: "bg-cyan" },
};

export default function StatCard({
  label,
  value,
  change,
  color = "emerald",
  icon,
}) {
  const c = colorMap[color] || colorMap.emerald;

  return (
    <div className="card-hover group">
      <div className="flex items-start justify-between mb-3">
        <p className="section-title">{label}</p>
        {icon && (
          <div className={`w-8 h-8 rounded-lg ${c.bg} flex items-center justify-center ${c.text}`}>
            {icon}
          </div>
        )}
      </div>
      <p className="stat-number">{value}</p>
      {change && (
        <p className={`text-xs font-medium mt-2 ${change >= 0 ? "text-success" : "text-danger"}`}>
          {change >= 0 ? "+" : ""}{change}%
          <span className="text-text-muted ml-1">vs last period</span>
        </p>
      )}
    </div>
  );
}
