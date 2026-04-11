import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import WorkspaceCard from "@/components/ui/WorkspaceCard";
import EmptyState from "@/components/ui/EmptyState";
import WatchlistPanel from "@/components/dashboard/WatchlistPanel";
import {
  listWorkspaces,
  getDashboardStats,
  formatRelativeTime,
} from "@/features/workspaces/queries";
import { listWatchlist } from "@/features/watchlist/queries";

export default async function DashboardPage() {
  const [workspaces, stats, watchlist] = await Promise.all([
    listWorkspaces(),
    getDashboardStats(),
    listWatchlist(),
  ]);

  return (
    <div className="page-container animate-fade-in">
      <PageHeader
        title="Dashboard"
        description="Overview of your research workspaces and recent activity."
        actions={
          <Link href="/workspace/new" className="btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Workspace
          </Link>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger-children">
        <StatCard
          label="Workspaces"
          value={String(stats.workspaces)}
          color="emerald"
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 4a2 2 0 012-2h5l2 2h9a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V4z" />
            </svg>
          }
        />
        <StatCard
          label="Sources Ingested"
          value={String(stats.sources)}
          color="blue"
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
            </svg>
          }
        />
        <StatCard
          label="Queries Made"
          value={String(stats.queries)}
          color="purple"
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" />
            </svg>
          }
        />
        <StatCard
          label="Reports Generated"
          value={String(stats.reports)}
          color="amber"
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="3" y1="9" x2="21" y2="9" />
            </svg>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Workspaces */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-semibold text-text">Your Workspaces</h2>
          </div>

          {workspaces.length === 0 ? (
            <div className="card">
              <EmptyState
                icon={
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text-sec)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 4a2 2 0 012-2h5l2 2h9a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V4z" />
                  </svg>
                }
                title="No workspaces yet"
                description="Create your first research workspace to start collecting sources, asking questions, and generating reports."
                action={
                  <Link href="/workspace/new" className="btn-primary">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Create Workspace
                  </Link>
                }
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 stagger-children">
              {workspaces.map((ws) => (
                <WorkspaceCard
                  key={ws.id}
                  id={ws.id}
                  name={ws.name}
                  company={ws.company?.name ?? null}
                  ticker={ws.company?.ticker ?? null}
                  sourceCount={ws.sourceCount}
                  queryCount={ws.queryCount}
                  lastActive={formatRelativeTime(ws.updated_at)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Watchlist */}
        <WatchlistPanel initialItems={watchlist} />
      </div>
    </div>
  );
}
