"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import ModeToggle from "@/components/ui/ModeToggle";
import Tabs from "@/components/ui/Tabs";
import EmptyState from "@/components/ui/EmptyState";
import SourcesPanel from "@/components/workspace/SourcesPanel";
import { UserMessage, AssistantMessage } from "@/components/ui/ChatMessage";
import { askQuestion } from "@/features/chat/actions";

export default function WorkspaceClient({
  workspace,
  sources,
  initialMessages,
}) {
  const [mode, setMode] = useState("hybrid");
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState(initialMessages);
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState(null);
  const [pending, startTransition] = useTransition();
  const scrollRef = useRef(null);

  const sourceCount = sources.length;
  const queryCount = messages.filter((m) => m.role === "user").length;
  const ticker = workspace.company?.ticker ?? null;
  const hasSources = sourceCount > 0;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, thinking]);

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed || pending) return;

    setError(null);
    setInputValue("");

    const tempUserId = `tmp-u-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { role: "user", id: tempUserId, text: trimmed, mode },
    ]);
    setThinking(true);

    startTransition(async () => {
      const result = await askQuestion(workspace.id, trimmed, mode);
      setThinking(false);

      if (result?.error) {
        setError(result.error);
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          id: `a-${result.answerId}`,
          text: result.answerText,
          sources: result.sources ?? [],
        },
      ]);
    });
  }

  const sourcesPanelContent = (
    <SourcesPanel workspaceId={workspace.id} initialSources={sources} />
  );

  const evidencePanel = (
    <EmptyState
      icon={
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-sec)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4M12 16h.01" />
        </svg>
      }
      title="Evidence extraction coming soon"
      description="Structured claims and confidence scoring will appear here in a later chunk."
    />
  );

  const rightPanelTabs = [
    { key: "sources", label: "Sources", count: sourceCount, content: sourcesPanelContent },
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
          </div>
        </div>

        {/* Chat Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto">
            {messages.length === 0 && !thinking ? (
              <div className="h-full flex items-center justify-center py-16">
                <EmptyState
                  icon={
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" />
                    </svg>
                  }
                  title={hasSources ? "Ask your first question" : "Add sources first"}
                  description={
                    hasSources
                      ? "Your workspace has sources ready. Ask a question to get grounded, cited answers."
                      : "Add at least one source (URL or pasted text) from the right panel, then ask your first question."
                  }
                />
              </div>
            ) : (
              <>
                {messages.map((msg) =>
                  msg.role === "user" ? (
                    <UserMessage key={msg.id} text={msg.text} />
                  ) : (
                    <AssistantMessage
                      key={msg.id}
                      text={msg.text}
                      sources={msg.sources ?? []}
                    />
                  )
                )}
                {thinking && <AssistantMessage thinking />}
              </>
            )}
          </div>
        </div>

        {/* Chat Input */}
        <div className="p-4 border-t border-border bg-bg">
          <div className="max-w-2xl mx-auto">
            {error && (
              <div className="mb-2 p-2 rounded-lg bg-danger-light text-danger text-[11px]">
                {error}
              </div>
            )}
            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-3 px-3 py-1.5 rounded-xl border border-border bg-bg focus-within:border-accent focus-within:shadow-[0_0_0_3px_var(--accent-light)] transition-all"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={
                  hasSources
                    ? "Ask a financial research question..."
                    : "Add sources first to enable chat"
                }
                disabled={pending || !hasSources}
                className="flex-1 py-2 text-[13.5px] bg-transparent outline-none placeholder:text-text-muted text-text disabled:cursor-not-allowed"
              />
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-[10px] text-text-muted bg-surface-muted px-2 py-1 rounded font-medium">
                  {mode === "hybrid" ? "Hybrid" : mode === "live" ? "Live" : "KB"}
                </span>
                <button
                  type="submit"
                  disabled={pending || !inputValue.trim() || !hasSources}
                  className="btn-primary !py-2 !px-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>
            </form>
            <p className="text-[10px] text-text-muted text-center mt-2">
              Answers are grounded in your workspace sources. Live web mode falls back to workspace sources for now.
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
