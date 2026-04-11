export function Skeleton({ className = "", ...props }) {
  return (
    <div
      className={`animate-shimmer rounded-lg ${className}`}
      {...props}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="card">
      <Skeleton className="h-3 w-24 mb-4" />
      <Skeleton className="h-7 w-16 mb-3" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="card">
      <Skeleton className="h-3 w-32 mb-4" />
      <Skeleton className="h-48 w-full rounded-lg" />
    </div>
  );
}

export function SkeletonList({ rows = 4 }) {
  return (
    <div className="card">
      <Skeleton className="h-3 w-28 mb-5" />
      <div className="flex flex-col gap-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-lg flex-shrink-0" />
            <div className="flex-1">
              <Skeleton className="h-3 w-3/4 mb-2" />
              <Skeleton className="h-2.5 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
