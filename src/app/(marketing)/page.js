import Link from "next/link";

const features = [
  {
    title: "Live Web Research",
    desc: "Browse and analyze live financial news, SEC filings, and earnings reports in real-time at query time.",
    color: "accent",
    colorLight: "accent-light",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
      </svg>
    ),
  },
  {
    title: "AI Chat Assistant",
    desc: "Ask natural language questions and receive grounded, source-cited answers backed by real evidence.",
    color: "blue",
    colorLight: "blue-light",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" />
      </svg>
    ),
  },
  {
    title: "Analytics Dashboard",
    desc: "Visualize sentiment trends, topic clusters, event timelines, and bullish vs bearish signal analysis.",
    color: "purple",
    colorLight: "purple-light",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 21H4a1 1 0 01-1-1V3" />
        <path d="M7 14l4-4 4 4 5-5" />
      </svg>
    ),
  },
  {
    title: "Source Transparency",
    desc: "Every answer shows exact sources — title, URL, excerpt, and confidence level. No black-box answers.",
    color: "cyan",
    colorLight: "cyan-light",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
        <path d="M14 2v6h6" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    title: "Real Financial Data",
    desc: "Stock prices, fundamentals, and SEC filings from Alpha Vantage and EDGAR — real data, not just news.",
    color: "amber",
    colorLight: "amber-light",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
      </svg>
    ),
  },
  {
    title: "Structured Reports",
    desc: "One-click generation of company summaries, risk memos, bullish/bearish analysis, and comparison reports.",
    color: "rose",
    colorLight: "rose-light",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="9" y1="21" x2="9" y2="9" />
      </svg>
    ),
  },
];

const stats = [
  { value: "3", label: "Research modes" },
  { value: "Live", label: "Web browsing" },
  { value: "SEC", label: "Filing integration" },
  { value: "Free", label: "To start" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-bg/80 backdrop-blur-lg border-b border-border-light">
        <div className="flex items-center justify-between px-8 py-3.5 max-w-7xl mx-auto">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 21H4a1 1 0 01-1-1V3" />
                <path d="M7 14l4-4 4 4 5-5" />
              </svg>
            </div>
            <span className="text-[15px] font-semibold text-text tracking-tight">
              P1 Finance
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login" className="btn-ghost text-[13px]">
              Log in
            </Link>
            <Link href="/signup" className="btn-primary text-[13px] !py-2 !px-4">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Subtle gradient orb */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] opacity-[0.04] rounded-full bg-accent blur-[120px] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center pt-28 pb-6 px-6 relative">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent-light text-accent-text text-xs font-medium mb-7 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-soft" />
            AI-Powered Financial Intelligence
          </div>
          <h1 className="text-[52px] font-bold text-text tracking-[-0.03em] leading-[1.08] mb-5 animate-slide-up">
            Research smarter.
            <br />
            <span className="text-accent">Invest with clarity.</span>
          </h1>
          <p className="text-[17px] text-text-sec max-w-xl mx-auto mb-9 leading-relaxed animate-slide-up" style={{ animationDelay: "80ms" }}>
            A chat-based research copilot that browses live sources, analyzes
            SEC filings, and turns unstructured financial data into
            source-backed insights.
          </p>
          <div className="flex items-center justify-center gap-3 animate-slide-up" style={{ animationDelay: "160ms" }}>
            <Link href="/signup" className="btn-primary text-[15px] !px-7 !py-3">
              Start Researching
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
            <Link href="/login" className="btn-secondary text-[15px] !px-7 !py-3">
              View Demo
            </Link>
          </div>
        </div>

        {/* Stats bar */}
        <div className="max-w-2xl mx-auto px-6 mt-16 mb-4">
          <div className="flex items-center justify-between rounded-2xl bg-surface border border-border-light px-8 py-5">
            {stats.map((s, i) => (
              <div key={s.label} className={`text-center ${i > 0 ? "border-l border-border-light pl-8" : ""}`}>
                <p className="font-mono text-lg font-bold text-text">{s.value}</p>
                <p className="text-[11px] text-text-muted mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* App Preview */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="rounded-2xl border border-border bg-surface overflow-hidden shadow-elevated">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border-light bg-bg">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400/60" />
              <div className="w-3 h-3 rounded-full bg-amber-400/60" />
              <div className="w-3 h-3 rounded-full bg-green-400/60" />
            </div>
            <div className="flex-1 flex justify-center">
              <div className="px-4 py-1 rounded-md bg-surface-muted text-[11px] text-text-muted font-mono">
                p1finance.app/workspace
              </div>
            </div>
          </div>
          <div className="flex h-[380px]">
            {/* Mini sidebar */}
            <div className="w-48 border-r border-border-light bg-bg p-4 hidden md:block">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-6 h-6 rounded-md bg-accent" />
                <span className="text-xs font-semibold text-text">P1 Finance</span>
              </div>
              {["Dashboard", "Workspaces", "Compare", "Analytics"].map((item, i) => (
                <div key={item} className={`px-3 py-2 rounded-md text-xs mb-0.5 ${i === 1 ? "bg-accent-light text-accent-text font-medium" : "text-text-muted"}`}>
                  {item}
                </div>
              ))}
            </div>
            {/* Chat area */}
            <div className="flex-1 p-6 flex flex-col">
              <div className="flex-1 flex flex-col gap-4">
                <div className="self-end max-w-xs bg-accent text-white rounded-2xl rounded-br-md px-4 py-2.5 text-xs">
                  What are the key risks for Tesla right now?
                </div>
                <div className="self-start max-w-sm">
                  <div className="bg-surface rounded-2xl rounded-bl-md px-4 py-3 border border-border-light text-xs text-text leading-relaxed">
                    Based on 12 sources including SEC filings and recent earnings reports, the primary risks for Tesla include...
                    <div className="flex gap-1.5 mt-2.5 pt-2.5 border-t border-border-light">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-light text-blue font-medium">Reuters</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-light text-blue font-medium">10-K Filing</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-light text-blue font-medium">Bloomberg</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 border border-border rounded-xl px-3 py-2">
                <input className="flex-1 text-xs bg-transparent outline-none text-text-muted" value="Ask about any company..." readOnly />
                <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                </div>
              </div>
            </div>
            {/* Sources panel */}
            <div className="w-52 border-l border-border-light bg-bg p-4 hidden lg:block">
              <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-3">Sources</p>
              {[
                { title: "Tesla 10-K Annual Filing", type: "SEC Filing" },
                { title: "Tesla Q4 Earnings Call", type: "Transcript" },
                { title: "Reuters: Tesla risks mount", type: "Article" },
              ].map((src) => (
                <div key={src.title} className="p-2.5 rounded-lg border border-border-light mb-2 hover:border-accent/30 transition-colors">
                  <p className="text-[11px] font-medium text-text leading-snug mb-1">{src.title}</p>
                  <p className="text-[10px] text-text-muted">{src.type}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-text tracking-tight mb-3">
            Everything you need for financial research
          </h2>
          <p className="text-sm text-text-sec max-w-lg mx-auto">
            Combine live web research, stored knowledge, real market data, and
            AI analysis in one unified workspace.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
          {features.map((f) => (
            <div key={f.title} className="card-hover group">
              <div className={`w-11 h-11 rounded-xl bg-${f.colorLight} flex items-center justify-center mb-4 text-${f.color} group-hover:scale-105 transition-transform`}>
                {f.icon}
              </div>
              <h3 className="text-[15px] font-semibold text-text mb-2">{f.title}</h3>
              <p className="text-[13px] text-text-sec leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border">
        <div className="max-w-3xl mx-auto text-center py-20 px-6">
          <h2 className="text-2xl font-bold text-text tracking-tight mb-4">
            Start researching with confidence
          </h2>
          <p className="text-sm text-text-sec max-w-md mx-auto mb-7">
            Join analysts and investors who use source-grounded AI to make
            better research decisions.
          </p>
          <Link href="/signup" className="btn-primary text-[15px] !px-8 !py-3">
            Get Started — Free
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border-light py-8 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-accent flex items-center justify-center">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M21 21H4a1 1 0 01-1-1V3" /><path d="M7 14l4-4 4 4 5-5" /></svg>
            </div>
            <span className="text-xs font-medium text-text-sec">P1 Finance</span>
          </div>
          <p className="text-xs text-text-muted">
            Built with Next.js, Supabase, and Groq
          </p>
        </div>
      </footer>
    </div>
  );
}
