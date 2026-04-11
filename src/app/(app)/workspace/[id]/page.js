"use client";

import { useState } from "react";
import { UserMessage, AssistantMessage } from "@/components/ui/ChatMessage";
import ModeToggle from "@/components/ui/ModeToggle";
import SourceCard from "@/components/ui/SourceCard";
import Badge from "@/components/ui/Badge";
import Tabs from "@/components/ui/Tabs";

const SAMPLE_MESSAGES = [
  {
    role: "user",
    text: "What are the major risks currently being discussed about Tesla?",
  },
  {
    role: "assistant",
    text: "Based on analysis of 12 sources including SEC filings, recent earnings transcripts, and financial news, the major risks for Tesla include:\n\n1. **Margin compression** — Vehicle price cuts have reduced automotive gross margins from 28.5% to 17.9% over the past year, with analysts projecting further pressure.\n\n2. **Competition in China** — BYD and other domestic manufacturers are gaining market share. Tesla's China sales declined 6.2% quarter-over-quarter.\n\n3. **Regulatory uncertainty** — Ongoing NHTSA investigations into Autopilot and Full Self-Driving features, with potential recall implications.\n\n4. **Capital allocation** — Significant investment in humanoid robotics (Optimus) and AI infrastructure raises concerns about focus dilution.\n\n5. **Demand elasticity** — Price sensitivity analysis suggests limited room for further price cuts without disproportionate margin impact.",
    sources: ["Tesla 10-K 2025", "Reuters", "Bloomberg", "Q4 Earnings Call"],
  },
];

const SAMPLE_SOURCES = [
  {
    title: "Tesla Inc. 10-K Annual Report 2025",
    url: "sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=TSLA",
    publisher: "SEC EDGAR",
    type: "filing",
    date: "Feb 2026",
    sentiment: "neutral",
    snippet: "Risk factors include competition, regulatory changes, supply chain disruptions, and dependence on key personnel...",
  },
  {
    title: "Tesla Q4 2025 Earnings Call Transcript",
    url: "seekingalpha.com/article/tesla-q4-earnings",
    publisher: "Seeking Alpha",
    type: "article",
    date: "Jan 2026",
    sentiment: "negative",
    snippet: "Gross margins fell to 17.9%, missing consensus estimates. Management cited pricing strategy and factory ramp costs...",
  },
  {
    title: "Tesla faces mounting competition in China as BYD surges",
    url: "reuters.com/business/autos/tesla-china-competition",
    publisher: "Reuters",
    type: "live",
    date: "Mar 2026",
    sentiment: "negative",
    snippet: "BYD overtook Tesla in global EV sales for the second consecutive quarter, driven by aggressive pricing and expansion...",
  },
  {
    title: "NHTSA opens new investigation into Tesla Autopilot",
    url: "nhtsa.gov/investigations/tesla-autopilot",
    publisher: "NHTSA",
    type: "article",
    date: "Mar 2026",
    sentiment: "negative",
    snippet: "The investigation covers approximately 2.4 million vehicles equipped with Autopilot hardware 4.0...",
  },
];

function SourcesPanel() {
  return (
    <div className="flex flex-col gap-3">
      {SAMPLE_SOURCES.map((source, i) => (
        <SourceCard key={i} {...source} />
      ))}
    </div>
  );
}

function EvidencePanel() {
  return (
    <div className="flex flex-col gap-3">
      {[
        { label: "Margin compression", confidence: "High", evidenceCount: 4, sentiment: "negative" },
        { label: "China competition", confidence: "High", evidenceCount: 3, sentiment: "negative" },
        { label: "Regulatory risk", confidence: "Medium", evidenceCount: 2, sentiment: "negative" },
        { label: "Capital allocation", confidence: "Medium", evidenceCount: 2, sentiment: "neutral" },
      ].map((e, i) => (
        <div key={i} className="card text-sm">
          <div className="flex items-start justify-between mb-2">
            <p className="font-semibold text-text text-[13px]">{e.label}</p>
            <Badge color={e.sentiment === "negative" ? "red" : "gray"}>
              {e.sentiment}
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-text-muted">
              Confidence: <span className="font-medium text-text-sec">{e.confidence}</span>
            </span>
            <span className="text-[11px] text-text-muted">
              {e.evidenceCount} sources
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function WorkspacePage({ params }) {
  const [mode, setMode] = useState("hybrid");
  const [inputValue, setInputValue] = useState("");

  const rightPanelTabs = [
    { key: "sources", label: "Sources", count: 4, content: <SourcesPanel /> },
    { key: "evidence", label: "Evidence", count: 4, content: <EvidencePanel /> },
  ];

  return (
    <div className="flex h-screen animate-fade-in">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Workspace Header */}
        <div className="px-6 py-3.5 border-b border-border flex items-center justify-between bg-bg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent-light flex items-center justify-center text-accent">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 4a2 2 0 012-2h5l2 2h9a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V4z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-[15px] font-semibold text-text">Tesla Deep Dive</h1>
                <span className="font-mono text-[11px] font-semibold text-text-muted bg-surface-muted px-1.5 py-0.5 rounded">
                  TSLA
                </span>
              </div>
              <p className="text-[11px] text-text-muted">24 sources &middot; 18 queries</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ModeToggle value={mode} onChange={setMode} />
            <button className="btn-ghost !px-2.5 !py-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />
              </svg>
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto">
            {SAMPLE_MESSAGES.map((msg, i) =>
              msg.role === "user" ? (
                <UserMessage key={i} text={msg.text} />
              ) : (
                <AssistantMessage key={i} text={msg.text} sources={msg.sources} />
              )
            )}
          </div>
        </div>

        {/* Chat Input */}
        <div className="p-4 border-t border-border bg-bg">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-3 px-3 py-1.5 rounded-xl border border-border bg-bg focus-within:border-accent focus-within:shadow-[0_0_0_3px_var(--accent-light)] transition-all">
              <button className="btn-ghost !p-1.5 !text-text-muted flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
                </svg>
              </button>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask a financial research question..."
                className="flex-1 py-2 text-[13.5px] bg-transparent outline-none placeholder:text-text-muted text-text"
              />
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-[10px] text-text-muted bg-surface-muted px-2 py-1 rounded font-medium">
                  {mode === "hybrid" ? "Hybrid" : mode === "live" ? "Live" : "KB"}
                </span>
                <button className="btn-primary !py-2 !px-3">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>
            </div>
            <p className="text-[10px] text-text-muted text-center mt-2">
              Answers are grounded in sources. Always verify critical financial decisions independently.
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-[340px] border-l border-border bg-bg overflow-y-auto hidden lg:block">
        <div className="p-4">
          <Tabs tabs={rightPanelTabs} defaultTab="sources" />
        </div>
      </div>
    </div>
  );
}
