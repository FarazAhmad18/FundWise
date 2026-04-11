import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";

const REPORT = {
  title: "Tesla Inc. — Comprehensive Risk Assessment",
  type: "Risk Memo",
  company: "Tesla Inc.",
  ticker: "TSLA",
  generatedAt: "April 10, 2026",
  sourceCount: 12,
  sections: {
    executive: "Tesla faces a convergence of margin, competitive, and regulatory pressures heading into Q2 2026. Automotive gross margins have declined to 17.9%, driven by aggressive price cuts aimed at maintaining market share against surging Chinese competitors. The NHTSA investigation into Autopilot adds regulatory uncertainty, while significant capital allocation to non-core projects (Optimus, Dojo) raises focus dilution concerns. The overall risk profile is elevated relative to the prior quarter.",
    keyFindings: [
      { text: "Automotive gross margin declined from 28.5% to 17.9% year-over-year", sentiment: "negative" },
      { text: "BYD surpassed Tesla in global EV sales for Q4 2025", sentiment: "negative" },
      { text: "NHTSA opened investigation into 2.4M vehicles with Autopilot HW 4.0", sentiment: "negative" },
      { text: "Tesla Energy revenue grew 52% YoY, becoming a margin diversifier", sentiment: "positive" },
      { text: "FSD v13 received favorable early safety data from independent testing", sentiment: "positive" },
    ],
    bullish: [
      "Energy storage business growing rapidly with high margins",
      "FSD v13 showing improved safety metrics — potential for regulatory approval",
      "Optimus humanoid robot could open a new TAM worth trillions",
      "Manufacturing cost per vehicle continues to decline with Gigafactory ramp",
    ],
    bearish: [
      "Margin compression likely to continue as price war intensifies",
      "China market share at risk — BYD price advantage is structural",
      "Autopilot investigation could result in costly recalls",
      "EV market growth slowing — incumbents gaining share with hybrid strategy",
      "Execution risk on Optimus / robotaxi timeline",
    ],
    risks: [
      { risk: "Margin pressure", severity: "High", likelihood: "High" },
      { risk: "China market share loss", severity: "High", likelihood: "Medium" },
      { risk: "Regulatory action (NHTSA)", severity: "Medium", likelihood: "Medium" },
      { risk: "Capital allocation / focus", severity: "Medium", likelihood: "Low" },
      { risk: "Demand slowdown", severity: "Medium", likelihood: "Medium" },
    ],
    events: [
      { date: "Mar 15, 2026", event: "NHTSA opens Autopilot investigation" },
      { date: "Feb 28, 2026", event: "Tesla announces EU price cuts" },
      { date: "Feb 10, 2026", event: "Q4 2025 Earnings — margins miss" },
      { date: "Jan 22, 2026", event: "Tesla Optimus demo at CES" },
      { date: "Jan 8, 2026", event: "BYD surpasses Tesla in Q4 sales" },
    ],
    sources: [
      { title: "Tesla 10-K Annual Report 2025", publisher: "SEC EDGAR" },
      { title: "Tesla Q4 2025 Earnings Call Transcript", publisher: "Seeking Alpha" },
      { title: "Tesla faces mounting competition in China", publisher: "Reuters" },
      { title: "NHTSA opens new investigation into Autopilot", publisher: "NHTSA" },
      { title: "Tesla Energy: The undervalued segment", publisher: "Bloomberg" },
      { title: "BYD global EV sales report Q4 2025", publisher: "CNBC" },
    ],
  },
};

export default function ReportPage({ params }) {
  const r = REPORT;

  return (
    <div className="page-container animate-fade-in">
      <PageHeader
        title={r.title}
        description={`Generated on ${r.generatedAt} from ${r.sourceCount} sources`}
        badge={
          <div className="flex items-center gap-2">
            <Badge color="emerald">{r.type}</Badge>
            <Badge color="gray">
              <span className="font-mono">{r.ticker}</span>
            </Badge>
          </div>
        }
        actions={
          <div className="flex items-center gap-2">
            <button className="btn-secondary text-xs">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Export PDF
            </button>
            <button className="btn-ghost text-xs">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
              Share
            </button>
          </div>
        }
      />

      <div className="max-w-3xl stagger-children">
        {/* Executive Summary */}
        <div className="card mb-5">
          <h2 className="text-[15px] font-semibold text-text mb-3 flex items-center gap-2">
            <div className="w-1.5 h-5 rounded-full bg-accent" />
            Executive Summary
          </h2>
          <p className="text-[13.5px] text-text-sec leading-relaxed">{r.sections.executive}</p>
        </div>

        {/* Key Findings */}
        <div className="card mb-5">
          <h2 className="text-[15px] font-semibold text-text mb-4 flex items-center gap-2">
            <div className="w-1.5 h-5 rounded-full bg-blue" />
            Key Findings
          </h2>
          <div className="flex flex-col gap-2.5">
            {r.sections.keyFindings.map((f, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-surface">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                  f.sentiment === "positive" ? "bg-success" : f.sentiment === "negative" ? "bg-danger" : "bg-text-muted"
                }`} />
                <p className="text-[13px] text-text leading-snug">{f.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bullish / Bearish Side by Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <div className="card border-l-2 !border-l-success">
            <h2 className="text-[15px] font-semibold text-text mb-3 flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                <polyline points="16 7 22 7 22 13" />
              </svg>
              Bullish Signals
            </h2>
            <ul className="flex flex-col gap-2">
              {r.sections.bullish.map((b, i) => (
                <li key={i} className="flex items-start gap-2 text-[13px] text-text-sec leading-snug">
                  <span className="text-success mt-0.5">+</span>
                  {b}
                </li>
              ))}
            </ul>
          </div>
          <div className="card border-l-2 !border-l-danger">
            <h2 className="text-[15px] font-semibold text-text mb-3 flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
                <polyline points="16 17 22 17 22 11" />
              </svg>
              Bearish Signals
            </h2>
            <ul className="flex flex-col gap-2">
              {r.sections.bearish.map((b, i) => (
                <li key={i} className="flex items-start gap-2 text-[13px] text-text-sec leading-snug">
                  <span className="text-danger mt-0.5">&minus;</span>
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Risk Assessment */}
        <div className="card mb-5">
          <h2 className="text-[15px] font-semibold text-text mb-4 flex items-center gap-2">
            <div className="w-1.5 h-5 rounded-full bg-danger" />
            Risk Assessment
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-3 text-[11px] font-semibold text-text-muted uppercase tracking-wider">Risk</th>
                  <th className="pb-3 text-[11px] font-semibold text-text-muted uppercase tracking-wider">Severity</th>
                  <th className="pb-3 text-[11px] font-semibold text-text-muted uppercase tracking-wider">Likelihood</th>
                </tr>
              </thead>
              <tbody>
                {r.sections.risks.map((risk, i) => (
                  <tr key={i} className="border-b border-border-light last:border-0">
                    <td className="py-3 text-[13px] font-medium text-text">{risk.risk}</td>
                    <td className="py-3">
                      <Badge color={risk.severity === "High" ? "red" : "amber"}>
                        {risk.severity}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <Badge color={risk.likelihood === "High" ? "red" : risk.likelihood === "Medium" ? "amber" : "gray"}>
                        {risk.likelihood}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Event Timeline */}
        <div className="card mb-5">
          <h2 className="text-[15px] font-semibold text-text mb-4 flex items-center gap-2">
            <div className="w-1.5 h-5 rounded-full bg-purple" />
            Key Events
          </h2>
          <div className="flex flex-col">
            {r.sections.events.map((e, i) => (
              <div key={i} className="flex gap-4 pb-4 last:pb-0">
                <div className="flex flex-col items-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-purple flex-shrink-0 mt-1" />
                  {i < r.sections.events.length - 1 && (
                    <div className="w-px flex-1 bg-border-light mt-1" />
                  )}
                </div>
                <div className="pb-1">
                  <p className="text-[13px] font-medium text-text">{e.event}</p>
                  <p className="text-[11px] text-text-muted mt-0.5">{e.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sources */}
        <div className="card">
          <h2 className="text-[15px] font-semibold text-text mb-4 flex items-center gap-2">
            <div className="w-1.5 h-5 rounded-full bg-cyan" />
            Sources ({r.sections.sources.length})
          </h2>
          <div className="flex flex-col divide-y divide-border-light">
            {r.sections.sources.map((src, i) => (
              <div key={i} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <div className="w-8 h-8 rounded-lg bg-surface-muted flex items-center justify-center flex-shrink-0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
                    <path d="M14 2v6h6" />
                  </svg>
                </div>
                <div>
                  <p className="text-[13px] font-medium text-text">{src.title}</p>
                  <p className="text-[11px] text-text-muted">{src.publisher}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
