export default function PageHeader({
  title,
  description,
  badge,
  actions,
  className = "",
}) {
  return (
    <div className={`flex items-start justify-between gap-4 mb-8 ${className}`}>
      <div>
        {badge && <div className="mb-3">{badge}</div>}
        <h1 className="page-title">{title}</h1>
        {description && (
          <p className="text-text-sec mt-1.5 max-w-xl">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>
      )}
    </div>
  );
}
