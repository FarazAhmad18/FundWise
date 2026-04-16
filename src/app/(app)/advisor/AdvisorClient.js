"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import PageHeader from "@/components/ui/PageHeader";
import {
  createConversation,
  sendAdvisorMessage,
  deleteConversation,
} from "@/features/advisor/actions";

function formatRelativeTime(timestamp) {
  if (!timestamp) return "";
  const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function ChatMessage({ role, content }) {
  if (role === "user") {
    return (
      <div className="flex justify-end mb-4">
        <div className="max-w-[75%] bg-accent text-white px-4 py-3 rounded-2xl rounded-br-md">
          <p className="text-sm whitespace-pre-wrap">{content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-4">
      <div className="max-w-[85%]">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" />
            </svg>
          </div>
          <span className="text-xs text-text-muted font-medium">P1 Advisor</span>
        </div>
        <div className="bg-surface border border-border-light px-4 py-3 rounded-2xl rounded-tl-md">
          <p className="text-sm text-text whitespace-pre-wrap">{content}</p>
        </div>
      </div>
    </div>
  );
}

export default function AdvisorClient({ conversations: initialConversations }) {
  const [conversations, setConversations] = useState(initialConversations);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  async function loadMessages(convId) {
    setActiveConvId(convId);
    setMessages([]);
    setError("");

    try {
      const res = await fetch(`/api/health`); // dummy to ensure client works
      // Load messages from client-side supabase
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data } = await supabase
        .from("messages")
        .select("id, role, content, created_at")
        .eq("conversation_id", convId)
        .order("created_at", { ascending: true });
      setMessages(data || []);
    } catch {
      setError("Failed to load messages");
    }
  }

  async function handleSend(e) {
    e.preventDefault();
    if (!input.trim() || thinking) return;

    const messageText = input.trim();
    setInput("");
    setError("");

    // If no active conversation, create one
    let convId = activeConvId;
    if (!convId) {
      startTransition(async () => {
        const result = await createConversation(messageText);
        if (result.error) {
          setError(result.error);
          return;
        }
        convId = result.conversationId;
        setActiveConvId(convId);
        setConversations((prev) => [
          { id: convId, title: messageText.slice(0, 60), updated_at: new Date().toISOString() },
          ...prev,
        ]);
        await sendAndReceive(convId, messageText);
      });
    } else {
      await sendAndReceive(convId, messageText);
    }
  }

  async function sendAndReceive(convId, messageText) {
    // Add user message immediately
    setMessages((prev) => [
      ...prev,
      { id: "temp-user", role: "user", content: messageText },
    ]);
    setThinking(true);

    const result = await sendAdvisorMessage(convId, messageText);
    setThinking(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setMessages((prev) => [
      ...prev,
      { id: "temp-assistant", role: "assistant", content: result.content },
    ]);
  }

  function handleNewChat() {
    setActiveConvId(null);
    setMessages([]);
    setError("");
    setInput("");
  }

  async function handleDeleteConv(convId) {
    startTransition(async () => {
      await deleteConversation(convId);
      setConversations((prev) => prev.filter((c) => c.id !== convId));
      if (activeConvId === convId) handleNewChat();
    });
  }

  return (
    <div className="page-container">
      <PageHeader title="AI Advisor" description="Your personal financial guide" />

      <div className="grid lg:grid-cols-4 gap-6" style={{ height: "calc(100vh - 200px)" }}>
        {/* Conversation List */}
        <div className="lg:col-span-1 flex flex-col">
          <button
            onClick={handleNewChat}
            className="btn-primary w-full py-2.5 text-sm mb-3"
          >
            New Chat
          </button>
          <div className="flex-1 overflow-y-auto space-y-1">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className={`group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                  activeConvId === conv.id
                    ? "bg-accent-light text-accent-text"
                    : "hover:bg-surface-muted text-text-sec"
                }`}
                onClick={() => loadMessages(conv.id)}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{conv.title}</p>
                  <p className="text-[10px] text-text-muted">
                    {formatRelativeTime(conv.updated_at)}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteConv(conv.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded text-text-muted hover:text-danger transition-all"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-3 flex flex-col card overflow-hidden">
          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-5">
            {messages.length === 0 && !activeConvId && (
              <div className="h-full flex items-center justify-center">
                <div className="text-center max-w-md">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5">
                      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" />
                    </svg>
                  </div>
                  <h3 className="text-base font-semibold text-text mb-2">
                    Ask me anything about investing
                  </h3>
                  <p className="text-sm text-text-sec mb-4">
                    I know your portfolio, goals, and risk profile. Ask about
                    stocks, strategy, or get personalized advice.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {[
                      "Should I diversify more?",
                      "How do I start investing?",
                      "Am I on track for my goals?",
                    ].map((q) => (
                      <button
                        key={q}
                        onClick={() => setInput(q)}
                        className="text-xs px-3 py-1.5 rounded-full bg-surface border border-border text-text-sec hover:border-accent hover:text-accent transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <ChatMessage key={msg.id || i} role={msg.role} content={msg.content} />
            ))}

            {thinking && (
              <div className="flex justify-start mb-4">
                <div className="bg-surface border border-border-light px-4 py-3 rounded-2xl rounded-tl-md">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-[pulseSoft_1s_ease-in-out_infinite]" />
                    <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-[pulseSoft_1s_ease-in-out_0.3s_infinite]" />
                    <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-[pulseSoft_1s_ease-in-out_0.6s_infinite]" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          {error && (
            <div className="px-5 py-2">
              <p className="text-xs text-danger">{error}</p>
            </div>
          )}
          <form onSubmit={handleSend} className="border-t border-border p-4 flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about investing, your portfolio, or financial goals..."
              className="input-field flex-1"
              disabled={thinking}
              maxLength={2000}
            />
            <button
              type="submit"
              disabled={!input.trim() || thinking}
              className="btn-primary px-5 disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
