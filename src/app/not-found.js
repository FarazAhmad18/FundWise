import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="text-center animate-slide-up">
        <p className="stat-number text-6xl text-text-muted mb-4">404</p>
        <h1 className="text-xl font-semibold text-text mb-2">Page not found</h1>
        <p className="text-sm text-text-sec mb-6">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link href="/dashboard" className="btn-primary">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
