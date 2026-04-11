"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import { SENTIMENT_COLORS } from "@/constants/design";

const COMPANIES = {
  a: {
    name: "Tesla Inc.",
    ticker: "TSLA",
    price: "$178.32",
    marketCap: "$567B",
    pe: "48.2",
    revenue: "$96.8B",
    margin: "17.9%",
    sentiment: { bullish: 32, bearish: 48, neutral: 20 },
    sources: 24,
    topRisk: "Margin compression from price wars",
    topCatalyst: "Energy storage business growth (52% YoY)",
  },
  b: {
    name: "Nvidia Corporation",
    ticker: "NVDA",
    price: "$892.15",
    marketCap: "$2.2T",
    pe: "62.5",
    revenue: "$130.5B",
    margin: "73.6%",
    sentiment: { bullish: 64, bearish: 18, neutral: 18 },
    sources: 15,
    topRisk: "AI spending cycle slowdown concerns",
    topCatalyst: "Data center revenue +154% YoY",
  },
};

const comparisonMetrics = [
  { label: "Market Cap", a: "$567B", b: "$2.2T" },
  { label: "P/E Ratio", a: "48.2", b: "62.5" },
  { label: "Revenue (TTM)", a: "$96.8B", b: "$130.5B" },
  { label: "Gross Margin", a: "17.9%", b: "73.6%" },
  { label: "Sources Analyzed", a: "24", b: "15" },
  { label: "Research Queries", a: "18", b: "9" },
];

const sentimentCompare = [
  { name: "Bullish", tsla: 32, nvda: 64 },
  { name: "Bearish", tsla: 48, nvda: 18 },
  { name: "Neutral", tsla: 20, nvda: 18 },
];

const customTooltipStyle = {
  backgroundColor: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "10px",
  padding: "10px 14px",
  boxShadow: "var(--shadow-elevated)",
  fontSize: "12px",
  color: "var(--text)",
};

function CompanyHeader({ company }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-11 h-11 rounded-xl bg-surface-muted flex items-center justify-center">
        <span className="font-mono text-sm font-bold text-text-sec">
          {company.ticker.slice(0, 2)}
        </span>
      </div>
      <div>
        <div className="flex items-center gap-2">
          <h3 className="text-[15px] font-semibold text-text">{company.name}</h3>
          <span className="font-mono text-[11px] font-bold text-text-muted bg-surface-muted px-1.5 py-0.5 rounded">
            {company.ticker}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="font-mono text-sm font-semibold text-text">{company.price}</span>
        </div>
      </div>
    </div>
  );
}

export default function ComparePage() {
  const a = COMPANIES.a;
  const b = COMPANIES.b;

  return (
    <div className="page-container animate-fade-in">
      <PageHeader
        title="Compare"
        description="Side-by-side comparison of companies based on research data and sentiment."
        actions={
          <button className="btn-secondary text-xs">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
            </svg>
            Change Companies
          </button>
        }
      />

      {/* Company Headers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        <div className="card">
          <CompanyHeader company={a} />
        </div>
        <div className="card">
          <CompanyHeader company={b} />
        </div>
      </div>

      {/* Metrics Comparison Table */}
      <div className="card mb-5">
        <h3 className="text-[14px] font-semibold text-text mb-4 flex items-center gap-2">
          <div className="w-1.5 h-5 rounded-full bg-accent" />
          Key Metrics
        </h3>
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="pb-3 text-[11px] font-semibold text-text-muted uppercase tracking-wider text-left">Metric</th>
              <th className="pb-3 text-[11px] font-semibold text-text-muted uppercase tracking-wider text-right">
                <span className="font-mono">{a.ticker}</span>
              </th>
              <th className="pb-3 text-[11px] font-semibold text-text-muted uppercase tracking-wider text-right">
                <span className="font-mono">{b.ticker}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {comparisonMetrics.map((m, i) => (
              <tr key={i} className="border-b border-border-light last:border-0">
                <td className="py-3 text-[13px] text-text-sec">{m.label}</td>
                <td className="py-3 text-[13px] font-mono font-semibold text-text text-right">{m.a}</td>
                <td className="py-3 text-[13px] font-mono font-semibold text-text text-right">{m.b}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Sentiment Comparison Chart */}
      <div className="card mb-5">
        <h3 className="text-[14px] font-semibold text-text mb-5 flex items-center gap-2">
          <div className="w-1.5 h-5 rounded-full bg-blue" />
          Sentiment Comparison
        </h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sentimentCompare} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} unit="%" />
              <Tooltip contentStyle={customTooltipStyle} />
              <Bar dataKey="tsla" name="TSLA" fill="#ef4444" radius={[6, 6, 0, 0]} barSize={28} />
              <Bar dataKey="nvda" name="NVDA" fill="#10b981" radius={[6, 6, 0, 0]} barSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-6 mt-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-danger" />
            <span className="text-xs text-text-sec">TSLA</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-accent" />
            <span className="text-xs text-text-sec">NVDA</span>
          </div>
        </div>
      </div>

      {/* Risk & Catalyst Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        <div className="card border-l-2 !border-l-danger">
          <h3 className="text-[14px] font-semibold text-text mb-4">Top Risks</h3>
          <div className="flex flex-col gap-3">
            <div className="p-3 rounded-lg bg-surface">
              <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1">{a.ticker}</p>
              <p className="text-[13px] text-text leading-snug">{a.topRisk}</p>
            </div>
            <div className="p-3 rounded-lg bg-surface">
              <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1">{b.ticker}</p>
              <p className="text-[13px] text-text leading-snug">{b.topRisk}</p>
            </div>
          </div>
        </div>
        <div className="card border-l-2 !border-l-success">
          <h3 className="text-[14px] font-semibold text-text mb-4">Top Catalysts</h3>
          <div className="flex flex-col gap-3">
            <div className="p-3 rounded-lg bg-surface">
              <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1">{a.ticker}</p>
              <p className="text-[13px] text-text leading-snug">{a.topCatalyst}</p>
            </div>
            <div className="p-3 rounded-lg bg-surface">
              <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1">{b.ticker}</p>
              <p className="text-[13px] text-text leading-snug">{b.topCatalyst}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Overall Summary */}
      <div className="card">
        <h3 className="text-[14px] font-semibold text-text mb-3 flex items-center gap-2">
          <div className="w-1.5 h-5 rounded-full bg-purple" />
          Summary
        </h3>
        <p className="text-[13.5px] text-text-sec leading-relaxed">
          NVDA shows significantly stronger sentiment with 64% bullish signals driven by dominant AI/data center positioning and industry-leading margins (73.6%).
          TSLA faces headwinds with 48% bearish sentiment, primarily from margin compression and competitive pressure in China.
          However, Tesla&apos;s energy storage segment and FSD progress represent underappreciated catalysts. NVDA carries concentration risk in AI spending cycles.
          Overall, NVDA presents a stronger near-term outlook while TSLA offers higher optionality with greater downside risk.
        </p>
      </div>
    </div>
  );
}
