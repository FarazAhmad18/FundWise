const colorMap = {
  emerald: "bg-accent-light text-accent-text",
  blue: "bg-blue-light text-blue",
  purple: "bg-purple-light text-purple",
  amber: "bg-amber-light text-amber",
  red: "bg-danger-light text-danger",
  cyan: "bg-cyan-light text-cyan",
  gray: "bg-surface-muted text-text-sec",
};

export default function Badge({ color = "emerald", children, className = "" }) {
  return (
    <span className={`badge ${colorMap[color] || colorMap.emerald} ${className}`}>
      {children}
    </span>
  );
}
