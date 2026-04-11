"use client";

import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import WorkspaceCard from "@/components/ui/WorkspaceCard";
import EmptyState from "@/components/ui/EmptyState";
import Badge from "@/components/ui/Badge";

const SAMPLE_WORKSPACES = [
  {
    id: "tesla-research",
    name: "Tesla Deep Dive",
    company: "Tesla Inc.",
    ticker: "TSLA",
    sourceCount: 24,
    queryCount: 18,
    lastActive: "2h ago",
  },
  {
    id: "nvidia-earnings",
    name: "Nvidia Earnings Analysis",
    company: "Nvidia Corporation",
    ticker: "NVDA",
    sourceCount: 15,
    queryCount: 9,
    lastActive: "1d ago",
  },
  {
    id: "market-outlook",
    name: "Q1 2026 Market Outlook",
    company: null,
    ticker: null,
    sourceCount: 32,
    queryCount: 22,
    lastActive: "3d ago",
  },
];

const RECENT_QUERIES = [
  {
    query: "What are the biggest risks for Tesla in 2026?",
    workspace: "Tesla Deep Dive",
    time: "2 hours ago",
    mode: "hybrid",
  },
  {
    query: "Summarize Nvidia's latest earnings call",
    workspace: "Nvidia Earnings Analysis",
    time: "1 day ago",
    mode: "live",
  },
  {
    query: "Compare semiconductor demand trends across top players",
    workspace: "Q1 2026 Market Outlook",
    time: "3 days ago",
    mode: "knowledge",
  },
];

const WATCHLIST = [
  { ticker: "TSLA", name: "Tesla", price: "$178.32", change: +2.4, sentiment: "mixed" },
  { ticker: "NVDA", name: "Nvidia", price: "$892.15", change: +5.1, sentiment: "bullish" },
  { ticker: "AAPL", name: "Apple", price: "$214.67", change: -0.8, sentiment: "neutral" },
  { ticker: "MSFT", name: "Microsoft", price: "$428.90", change: +1.2, sentiment: "bullish" },
];

export default function DashboardPage() {
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
          value="3"
          color="emerald"
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 4a2 2 0 012-2h5l2 2h9a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V4z" />
            </svg>
          }
        />
        <StatCard
          label="Sources Ingested"
          value="71"
          change={12}
          color="blue"
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
            </svg>
          }
        />
        <StatCard
          label="Queries Made"
          value="49"
          change={8}
          color="purple"
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" />
            </svg>
          }
        />
        <StatCard
          label="Reports Generated"
          value="7"
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
            <h2 className="text-[15px] font-semibold text-text">Recent Workspaces</h2>
            <Link href="/workspace" className="text-xs text-accent font-medium hover:underline">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 stagger-children">
            {SAMPLE_WORKSPACES.map((ws) => (
              <WorkspaceCard key={ws.id} {...ws} />
            ))}
          </div>
        </div>

        {/* Watchlist */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-semibold text-text">Watchlist</h2>
            <button className="text-xs text-accent font-medium hover:underline">
              Edit
            </button>
          </div>
          <div className="card">
            <div className="flex flex-col divide-y divide-border-light">
              {WATCHLIST.map((stock) => (
                <div key={stock.ticker} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-surface-muted flex items-center justify-center">
                      <span className="font-mono text-[11px] font-bold text-text-sec">
                        {stock.ticker.slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-text">{stock.ticker}</p>
                      <p className="text-[11px] text-text-muted">{stock.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-[13px] font-semibold text-text">{stock.price}</p>
                    <p className={`font-mono text-[11px] font-medium ${stock.change >= 0 ? "text-success" : "text-danger"}`}>
                      {stock.change >= 0 ? "+" : ""}{stock.change}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Queries */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-semibold text-text">Recent Queries</h2>
        </div>
        <div className="card">
          <div className="flex flex-col divide-y divide-border-light">
            {RECENT_QUERIES.map((q, i) => (
              <div key={i} className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0">
                <div className="w-9 h-9 rounded-lg bg-accent-light flex items-center justify-center flex-shrink-0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-text truncate">{q.query}</p>
                  <p className="text-[11px] text-text-muted mt-0.5">
                    {q.workspace} &middot; {q.time}
                  </p>
                </div>
                <Badge color={q.mode === "hybrid" ? "emerald" : q.mode === "live" ? "cyan" : "purple"}>
                  {q.mode}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
