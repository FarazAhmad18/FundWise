"use client";

import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart,
} from "recharts";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import ChartMount from "@/components/ui/ChartMount";
import { CHART_COLORS, SENTIMENT_COLORS } from "@/constants/design";

const sentimentData = [
  { name: "Positive", value: 38, color: SENTIMENT_COLORS.bullish },
  { name: "Negative", value: 45, color: SENTIMENT_COLORS.bearish },
  { name: "Neutral", value: 17, color: SENTIMENT_COLORS.neutral },
];

const sentimentOverTime = [
  { date: "Jan", positive: 42, negative: 30, neutral: 28 },
  { date: "Feb", positive: 38, negative: 35, neutral: 27 },
  { date: "Mar", positive: 32, negative: 44, neutral: 24 },
  { date: "Apr", positive: 35, negative: 40, neutral: 25 },
  { date: "May", positive: 28, negative: 48, neutral: 24 },
  { date: "Jun", positive: 38, negative: 42, neutral: 20 },
];

const topicData = [
  { topic: "Margins", count: 28 },
  { topic: "Competition", count: 24 },
  { topic: "Regulation", count: 19 },
  { topic: "AI / FSD", count: 17 },
  { topic: "Supply Chain", count: 14 },
  { topic: "Demand", count: 12 },
  { topic: "China", count: 11 },
  { topic: "Earnings", count: 9 },
];

const sourceData = [
  { name: "Reuters", count: 18, color: CHART_COLORS[0] },
  { name: "Bloomberg", count: 14, color: CHART_COLORS[1] },
  { name: "SEC EDGAR", count: 12, color: CHART_COLORS[2] },
  { name: "Seeking Alpha", count: 9, color: CHART_COLORS[3] },
  { name: "CNBC", count: 7, color: CHART_COLORS[4] },
  { name: "Other", count: 11, color: CHART_COLORS[5] },
];

const eventTimeline = [
  { date: "Mar 15", event: "NHTSA opens Autopilot investigation", impact: "negative" },
  { date: "Feb 28", event: "Tesla announces price cuts in EU market", impact: "negative" },
  { date: "Feb 10", event: "Q4 2025 Earnings: margins miss estimates", impact: "negative" },
  { date: "Jan 22", event: "Tesla Optimus robot demo at CES 2026", impact: "positive" },
  { date: "Jan 8", event: "BYD surpasses Tesla in Q4 global sales", impact: "negative" },
];

const signalData = [
  { name: "Bullish", value: 32, color: SENTIMENT_COLORS.bullish },
  { name: "Bearish", value: 48, color: SENTIMENT_COLORS.bearish },
  { name: "Neutral", value: 20, color: SENTIMENT_COLORS.neutral },
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

export default function AnalyticsPage() {
  return (
    <div className="page-container animate-fade-in">
      <PageHeader
        title="Analytics"
        description="Sentiment trends, topic analysis, and research insights across your workspaces."
        actions={
          <div className="flex items-center gap-2">
            <select className="input-field !w-auto !py-2 !px-3 !text-xs">
              <option>All Workspaces</option>
              <option>Tesla Deep Dive</option>
              <option>Nvidia Earnings</option>
            </select>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 stagger-children">
        {/* Sentiment Distribution */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[14px] font-semibold text-text">Sentiment Distribution</h3>
            <Badge color="red">Bearish lean</Badge>
          </div>
          <ChartMount className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sentimentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {sentimentData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={customTooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </ChartMount>
          <div className="flex items-center justify-center gap-5 mt-2">
            {sentimentData.map((s) => (
              <div key={s.name} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                <span className="text-xs text-text-sec">{s.name}</span>
                <span className="text-xs font-semibold text-text font-mono">{s.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sentiment Over Time */}
        <div className="card">
          <h3 className="text-[14px] font-semibold text-text mb-5">Sentiment Over Time</h3>
          <ChartMount className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sentimentOverTime}>
                <defs>
                  <linearGradient id="gradPositive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={SENTIMENT_COLORS.bullish} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={SENTIMENT_COLORS.bullish} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradNegative" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={SENTIMENT_COLORS.bearish} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={SENTIMENT_COLORS.bearish} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={customTooltipStyle} />
                <Area type="monotone" dataKey="positive" stroke={SENTIMENT_COLORS.bullish} fill="url(#gradPositive)" strokeWidth={2} />
                <Area type="monotone" dataKey="negative" stroke={SENTIMENT_COLORS.bearish} fill="url(#gradNegative)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartMount>
        </div>

        {/* Topic Frequency */}
        <div className="card">
          <h3 className="text-[14px] font-semibold text-text mb-5">Topic Frequency</h3>
          <ChartMount className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topicData} layout="vertical" barSize={16}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="topic" tick={{ fontSize: 11, fill: "var(--text-sec)" }} axisLine={false} tickLine={false} width={85} />
                <Tooltip contentStyle={customTooltipStyle} />
                <Bar dataKey="count" fill={CHART_COLORS[0]} radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartMount>
        </div>

        {/* Source Coverage */}
        <div className="card">
          <h3 className="text-[14px] font-semibold text-text mb-5">Source Coverage</h3>
          <ChartMount className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sourceData} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={customTooltipStyle} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {sourceData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartMount>
        </div>

        {/* Event Timeline */}
        <div className="card">
          <h3 className="text-[14px] font-semibold text-text mb-5">Event Timeline</h3>
          <div className="flex flex-col gap-0">
            {eventTimeline.map((e, i) => (
              <div key={i} className="flex gap-3 pb-4 last:pb-0">
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-0.5 ${
                    e.impact === "positive" ? "bg-success" : e.impact === "negative" ? "bg-danger" : "bg-text-muted"
                  }`} />
                  {i < eventTimeline.length - 1 && (
                    <div className="w-px flex-1 bg-border-light mt-1" />
                  )}
                </div>
                <div className="pb-2">
                  <p className="text-[13px] font-medium text-text leading-snug">{e.event}</p>
                  <p className="text-[11px] text-text-muted mt-0.5">{e.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bullish vs Bearish */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[14px] font-semibold text-text">Signal Balance</h3>
            <Badge color="red">48% bearish</Badge>
          </div>
          <ChartMount className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={signalData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {signalData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={customTooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </ChartMount>
          <div className="flex items-center justify-center gap-5 mt-2">
            {signalData.map((s) => (
              <div key={s.name} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                <span className="text-xs text-text-sec">{s.name}</span>
                <span className="text-xs font-semibold text-text font-mono">{s.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
