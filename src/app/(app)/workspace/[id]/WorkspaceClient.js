"use client";

import { useState } from "react";
import { UserMessage, AssistantMessage } from "@/components/ui/ChatMessage";
import ModeToggle from "@/components/ui/ModeToggle";
import SourceCard from "@/components/ui/SourceCard";
import Badge from "@/components/ui/Badge";
import Tabs from "@/components/ui/Tabs";
import EmptyState from "@/components/ui/EmptyState";

export default function WorkspaceClient({ workspace }) {
  const [mode, setMode] = useState("hybrid");
  const [inputValue, setInputValue] = useState("");

  const sourceCount = workspace.sourceCount ?? 0;
  const queryCount = workspace.queryCount ?? 0;
  const ticker = workspace.company?.ticker ?? null;

  const sourcesPanel = (
    <EmptyState
      icon={
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-sec)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
        </svg>
      }
      title="No sources yet"
      description="Add sources to ground answers in real research material."
    />
  );

  const evidencePanel = (
    <EmptyState
      icon={
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-sec)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4M12 16h.01" />
        </svg>
      }
      title="No evidence yet"
      description="Evidence will appear once you ask questions in this workspace."
    />
  );

  const rightPanelTabs = [
    { key: "sources", label: "Sources", count: sourceCount, content: sourcesPanel },
    { key: "evidence", label: "Evidence", count: 0, content: evidencePanel },
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
                <h1 className="text-[15px] font-semibold text-text">{workspace.name}</h1>
                {ticker && (
                  <span className="font-mono text-[11px] font-semibold text-text-muted bg-surface-muted px-1.5 py-0.5 rounded">
                    {ticker}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-text-muted">
                {sourceCount} sources &middot; {queryCount} queries
              </p>
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
          <div className="max-w-2xl mx-auto h-full flex items-center justify-center">
            <EmptyState
              icon={
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" />
                </svg>
              }
              title="Start your research"
              description="Add sources and ask a question to get grounded, cited answers from your workspace."
            />
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
                <button className="btn-primary !py-2 !px-3" disabled>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>
            </div>
            <p className="text-[10px] text-text-muted text-center mt-2">
              Chat engine coming in chunk 5. Answers will be grounded in your sources.
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
