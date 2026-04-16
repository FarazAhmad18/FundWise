import Link from "next/link";

/* ================================================================
   Fundwise — Landing Page
   Server Component · No "use client" · CSS-only animations
   ================================================================ */

// ─── Feature data ────────────────────────────────────────────
const FEATURES = [
  {
    label: "DASHBOARD",
    color: "text-emerald-600",
    headline: "Everything you need. One screen.",
    body: "Your portfolio value, market pulse, goal progress, and watchlist — all in real time. No switching between apps. No spreadsheets. Just clarity.",
    stat: "Updated live",
    visual: "dashboard",
  },
  {
    label: "AI ADVISOR",
    color: "text-purple-600",
    headline: "Ask anything. Get real answers.",
    body: '"Should I invest in tech stocks?" "Am I saving enough?" "What do I do with an extra $500?" Your AI advisor knows your full financial picture and gives specific, actionable guidance — not generic articles.',
    stat: "Knows your full context",
    visual: "advisor",
  },
  {
    label: "GOALS",
    color: "text-cyan-600",
    headline: "Set it. Track it. Reach it.",
    body: "Retirement. A house. An emergency fund. Set your target, add a monthly contribution, and we\u2019ll project exactly when you\u2019ll get there — and warn you if you fall behind.",
    stat: "Auto-calculated projections",
    visual: "goals",
  },
  {
    label: "PORTFOLIO",
    color: "text-blue-600",
    headline: "Know exactly where you stand.",
    body: "Log your trades, and we handle the rest. Weighted-average cost basis, real P&L, day-by-day portfolio history. No guesswork — just numbers you can trust.",
    stat: "Weighted-average cost P&L",
    visual: "portfolio",
  },
  {
    label: "LIVE DATA",
    color: "text-amber-600",
    headline: "Real prices. Not yesterday\u2019s.",
    body: "Live stock prices, market indices, and price changes — updated throughout the trading day. No delays. No stale numbers. Track what matters, in real time.",
    stat: "Real-time via Yahoo Finance",
    visual: "livedata",
  },
  {
    label: "MULTI-MARKET",
    color: "text-rose-600",
    headline: "Two markets. One dashboard.",
    body: "Whether you trade on NYSE and NASDAQ in dollars, or on PSX in rupees — Fundwise adapts. Switch markets, and everything updates: currency, symbols, indices.",
    stat: "USD + PKR supported",
    visual: "multimarket",
  },
];

// ─── Inline SVG helpers ──────────────────────────────────────
function Logo({ size = 32 }) {
  return (
    <div className="rounded-lg bg-accent flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size * 0.47} height={size * 0.47} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 21H4a1 1 0 01-1-1V3" /><path d="M7 14l4-4 4 4 5-5" />
      </svg>
    </div>
  );
}

function Arrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

// ─── Feature mini-visuals ────────────────────────────────────
function DashboardVisual() {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
      <p className="text-[10px] text-text-muted mb-3">Portfolio Value</p>
      <p className="text-[20px] font-bold font-mono text-text tracking-tight">$24,831<span className="text-[14px]">.50</span></p>
      <p className="text-[11px] font-mono text-emerald-600 mb-3">+$487.20 (+2.00%) today</p>
      <svg viewBox="0 0 400 80" className="w-full h-16 sparkline-animate" preserveAspectRatio="none">
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#059669" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#059669" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M0 65 C30 62 60 58 100 50 S170 38 200 35 S270 28 320 22 S370 18 400 14 L400 80 L0 80Z" fill="url(#chartGrad)" />
        <path d="M0 65 C30 62 60 58 100 50 S170 38 200 35 S270 28 320 22 S370 18 400 14" fill="none" stroke="#059669" strokeWidth="2" />
      </svg>
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-border-light">
        <div><p className="text-[9px] text-text-muted">Emergency Fund</p></div>
        <div className="flex items-center gap-2 flex-1 ml-3">
          <div className="flex-1 h-1.5 bg-surface-muted rounded-full"><div className="h-1.5 rounded-full bg-accent" style={{ width: "67%" }} /></div>
          <span className="text-[9px] font-mono text-text-muted">67%</span>
        </div>
      </div>
    </div>
  );
}

function AdvisorVisual() {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-card space-y-3">
      <div className="flex justify-end"><div className="bg-accent text-white text-[11px] rounded-2xl rounded-br-sm px-3 py-2 max-w-[80%]">Should I invest my bonus in stocks or mutual funds?</div></div>
      <div className="flex gap-2 items-start">
        <div className="w-5 h-5 rounded-md bg-accent-light flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5"><path d="M21 21H4a1 1 0 01-1-1V3" /><path d="M7 14l4-4 4 4 5-5" /></svg>
        </div>
        <div className="bg-surface border border-border-light text-[11px] text-text-sec rounded-2xl rounded-tl-sm px-3 py-2 leading-relaxed">
          Given your <strong className="text-text">moderate risk profile</strong> and that your emergency fund is only 67% funded, I&apos;d recommend:<br /><br />
          <strong className="text-text">70%</strong> to emergency fund<br />
          <strong className="text-text">30%</strong> into an index fund (lower risk than individual stocks)
        </div>
      </div>
    </div>
  );
}

function GoalsVisual() {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-card space-y-3">
      {[
        { name: "Emergency Fund", pct: 67, status: "On Track", statusColor: "text-emerald-600 bg-emerald-50", color: "bg-rose-500" },
        { name: "Retirement", pct: 23, status: "Behind", statusColor: "text-red-600 bg-red-50", color: "bg-purple-500" },
      ].map((g) => (
        <div key={g.name} className="flex items-center gap-3">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-medium text-text">{g.name}</span>
              <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${g.statusColor}`}>{g.status}</span>
            </div>
            <div className="w-full h-1.5 bg-surface-muted rounded-full"><div className={`h-1.5 rounded-full ${g.color}`} style={{ width: `${g.pct}%` }} /></div>
            <p className="text-[9px] text-text-muted mt-0.5 font-mono">{g.pct}%</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function PortfolioVisual() {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">
      <div className="px-4 py-2.5 border-b border-border-light"><p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Holdings</p></div>
      {[
        { ticker: "AAPL", name: "Apple", val: "$2,976", ret: "+12.4%", up: true },
        { ticker: "TSLA", name: "Tesla", val: "$1,459", ret: "-3.2%", up: false },
        { ticker: "NVDA", name: "Nvidia", val: "$4,623", ret: "+28.7%", up: true },
      ].map((h) => (
        <div key={h.ticker} className="flex items-center justify-between px-4 py-2.5 border-b border-border-light last:border-0">
          <div className="flex items-center gap-2.5">
            <span className="text-[10px] font-mono font-bold text-text bg-surface-muted rounded px-1.5 py-0.5">{h.ticker}</span>
            <span className="text-[11px] text-text-sec">{h.name}</span>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-mono font-medium text-text">{h.val}</p>
            <p className={`text-[10px] font-mono ${h.up ? "text-emerald-600" : "text-red-500"}`}>{h.ret}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function LiveDataVisual() {
  return (
    <div className="grid grid-cols-3 gap-2">
      {[
        { t: "AAPL", p: "$198.45", c: "+1.84%", up: true },
        { t: "MSFT", p: "$441.20", c: "+0.92%", up: true },
        { t: "NVDA", p: "$924.60", c: "+3.45%", up: true },
      ].map((s) => (
        <div key={s.t} className="rounded-xl border border-border bg-card p-3 shadow-xs">
          <p className="text-[10px] font-mono font-bold text-text">{s.t}</p>
          <p className="text-[13px] font-mono font-semibold text-text mt-1">{s.p}</p>
          <p className={`text-[10px] font-mono mt-0.5 ${s.up ? "text-emerald-600" : "text-red-500"}`}>{s.c}</p>
        </div>
      ))}
    </div>
  );
}

function MultiMarketVisual() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {[
        { flag: "\u{1F1FA}\u{1F1F8}", market: "United States", idx: "S&P 500", val: "5,842.31", c: "+0.82%", cur: "USD" },
        { flag: "\u{1F1F5}\u{1F1F0}", market: "Pakistan", idx: "KSE-100", val: "89,420", c: "+1.34%", cur: "PKR" },
      ].map((m) => (
        <div key={m.cur} className="rounded-xl border border-border bg-card p-3 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{m.flag}</span>
            <span className="text-[10px] font-medium text-text-sec">{m.market}</span>
          </div>
          <p className="text-[10px] text-text-muted">{m.idx}</p>
          <p className="text-[15px] font-mono font-bold text-text">{m.val}</p>
          <p className="text-[10px] font-mono text-emerald-600">{m.c}</p>
        </div>
      ))}
    </div>
  );
}

const VISUAL_MAP = {
  dashboard: DashboardVisual,
  advisor: AdvisorVisual,
  goals: GoalsVisual,
  portfolio: PortfolioVisual,
  livedata: LiveDataVisual,
  multimarket: MultiMarketVisual,
};

// ─── Page ────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg">

      {/* ══════ 1. NAV ══════ */}
      <nav className="sticky top-0 z-50 bg-bg/60 backdrop-blur-xl border-b border-border-light">
        <div className="flex items-center justify-between px-6 py-3 max-w-6xl mx-auto">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo size={30} />
            <span className="text-[15px] font-semibold text-text tracking-tight">Fundwise</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/login" className="btn-ghost !text-[13px] !py-2">Log in</Link>
            <Link href="/signup" className="btn-primary !text-[13px] !py-2 !px-5">Start Free</Link>
          </div>
        </div>
      </nav>

      {/* ══════ 2. HERO ══════ */}
      <section className="relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] opacity-[0.03] rounded-full bg-accent blur-[140px] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center pt-28 pb-6 px-6 relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-light text-accent-text text-xs font-medium mb-8 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-soft" />
            AI-powered financial advisor
          </div>

          <h1 className="text-[36px] sm:text-[48px] md:text-[56px] lg:text-[64px] font-bold text-text tracking-[-0.035em] leading-[1.05] mb-6 animate-slide-up">
            Your money deserves
            <br />
            <span className="text-accent">a real plan.</span>
          </h1>

          <p className="text-[16px] md:text-[18px] text-text-sec max-w-2xl mx-auto mb-9 leading-relaxed animate-slide-up" style={{ animationDelay: "80ms" }}>
            Fundwise is your personal AI advisor that understands your income,
            your goals, and your portfolio — then tells you exactly what to do next.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-slide-up" style={{ animationDelay: "160ms" }}>
            <Link href="/signup" className="btn-primary !text-[15px] !px-8 !py-3.5 w-full sm:w-auto">
              Get Started — It&apos;s Free <Arrow />
            </Link>
            <Link href="#how-it-works" className="btn-secondary !text-[15px] !px-8 !py-3.5 w-full sm:w-auto">
              See how it works
            </Link>
          </div>

          <p className="text-[13px] text-text-muted mt-6 animate-slide-up" style={{ animationDelay: "240ms" }}>
            No credit card required. Free forever.
          </p>
        </div>
      </section>

      {/* ══════ 3. TRUST BAR ══════ */}
      <div className="max-w-3xl mx-auto px-6 mt-14 mb-4 animate-slide-up" style={{ animationDelay: "300ms" }}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-0 rounded-2xl bg-surface border border-border-light px-6 md:px-10 py-6">
          {[
            { value: "6", label: "Tools built in" },
            { value: "8", label: "Markets supported" },
            { value: "AI", label: "Advisor included" },
            { value: "Free", label: "Forever" },
          ].map((s, i) => (
            <div key={s.label} className={`text-center ${i > 0 ? "md:border-l md:border-border-light md:pl-6" : ""}`}>
              <p className="font-mono text-[20px] md:text-[22px] font-bold text-text">{s.value}</p>
              <p className="text-[10px] text-text-muted mt-1 uppercase tracking-wider font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ══════ 4. APP PREVIEW ══════ */}
      <section className="max-w-6xl mx-auto px-6 py-14 animate-scale-in" style={{ animationDelay: "400ms" }}>
        <div className="rounded-3xl border border-border shadow-elevated overflow-hidden">
          {/* Chrome bar */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border-light bg-surface-muted">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400/50" />
              <div className="w-3 h-3 rounded-full bg-amber-400/50" />
              <div className="w-3 h-3 rounded-full bg-green-400/50" />
            </div>
            <div className="flex-1 flex justify-center">
              <div className="px-4 py-1 rounded-md bg-bg text-[11px] text-text-muted font-mono">fundwise.app/dashboard</div>
            </div>
          </div>

          <div className="flex h-[360px] md:h-[440px] bg-bg">
            {/* Sidebar */}
            <div className="w-44 border-r border-border-light p-4 hidden md:flex flex-col">
              <div className="flex items-center gap-2 mb-6">
                <Logo size={22} />
                <span className="text-[11px] font-semibold text-text">Fundwise</span>
              </div>
              {["Dashboard", "Market", "Portfolio", "AI Advisor", "Goals", "Settings"].map((item, i) => (
                <div key={item} className={`px-3 py-2 rounded-lg text-[11px] mb-0.5 ${i === 0 ? "bg-accent-light text-accent-text font-medium" : "text-text-muted"}`}>{item}</div>
              ))}
            </div>

            {/* Main */}
            <div className="flex-1 p-5 md:p-6 overflow-hidden">
              <p className="text-[14px] font-semibold text-text mb-0.5">Good morning, Sarah</p>
              <p className="text-[10px] text-text-muted mb-4">Wednesday, April 16</p>

              <div className="flex items-baseline gap-3 mb-1">
                <span className="text-[24px] font-bold font-mono text-text tracking-tight">$24,831<span className="text-[16px]">.50</span></span>
                <span className="text-[12px] font-mono text-emerald-600 font-medium">+$487.20 (+2.00%)</span>
              </div>

              {/* Chart */}
              <svg viewBox="0 0 500 70" className="w-full h-14 mb-4 sparkline-animate" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="previewGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#059669" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="#059669" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0 55 C40 52 80 48 130 42 S200 32 260 28 S340 20 400 16 S460 12 500 10 L500 70 L0 70Z" fill="url(#previewGrad)" />
                <path d="M0 55 C40 52 80 48 130 42 S200 32 260 28 S340 20 400 16 S460 12 500 10" fill="none" stroke="#059669" strokeWidth="1.5" />
              </svg>

              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { l: "Holdings", v: "12" },
                  { l: "Day Change", v: "+2.00%", green: true },
                  { l: "Total Return", v: "+$3,241", green: true },
                ].map((s) => (
                  <div key={s.l} className="rounded-lg border border-border-light p-2.5">
                    <p className="text-[9px] text-text-muted">{s.l}</p>
                    <p className={`text-[12px] font-bold font-mono ${s.green ? "text-emerald-600" : "text-text"}`}>{s.v}</p>
                  </div>
                ))}
              </div>

              <p className="text-[9px] font-semibold text-text-muted uppercase tracking-wider mb-2">Market Pulse</p>
              <div className="flex gap-2">
                {[
                  { t: "AAPL", p: "$198.45", c: "+1.84%" },
                  { t: "MSFT", p: "$441.20", c: "+0.92%" },
                  { t: "NVDA", p: "$924.60", c: "+3.45%" },
                ].map((s) => (
                  <div key={s.t} className="flex-1 rounded-lg border border-border-light p-2">
                    <p className="text-[9px] font-mono font-bold text-text">{s.t}</p>
                    <p className="text-[10px] font-mono text-text mt-0.5">{s.p}</p>
                    <p className="text-[9px] font-mono text-emerald-600">{s.c}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Watchlist */}
            <div className="w-48 border-l border-border-light p-4 hidden lg:block">
              <p className="text-[9px] font-semibold text-text-muted uppercase tracking-wider mb-3">Watchlist</p>
              {[
                { t: "TSLA", n: "Tesla", p: "$182.40", c: "+2.1%", up: true },
                { t: "GOOG", n: "Alphabet", p: "$178.30", c: "+0.4%", up: true },
                { t: "AMZN", n: "Amazon", p: "$189.55", c: "-0.2%", up: false },
                { t: "META", n: "Meta", p: "$512.80", c: "+1.6%", up: true },
              ].map((s) => (
                <div key={s.t} className="flex items-center justify-between py-2 border-b border-border-light last:border-0">
                  <div><p className="text-[10px] font-mono font-bold text-text">{s.t}</p><p className="text-[9px] text-text-muted">{s.n}</p></div>
                  <div className="text-right"><p className="text-[10px] font-mono text-text">{s.p}</p><p className={`text-[9px] font-mono ${s.up ? "text-emerald-600" : "text-red-500"}`}>{s.c}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════ 5. THE PROBLEM ══════ */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-24">
        <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-text-muted text-center mb-4">The Problem</p>
        <h2 className="text-[28px] sm:text-[36px] md:text-[44px] font-bold text-text tracking-tight text-center max-w-3xl mx-auto mb-16 leading-[1.1]">
          Investing shouldn&apos;t feel<br className="hidden sm:block" /> this overwhelming.
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 stagger-children">
          {[
            {
              title: "Scattered everywhere",
              body: "Your portfolio is in one app, research in another, news in a third. Nothing talks to each other.",
              icon: <><circle cx="5" cy="5" r="2" /><circle cx="19" cy="8" r="2" /><circle cx="8" cy="18" r="2" /><circle cx="17" cy="17" r="2" /><circle cx="12" cy="11" r="2" /></>,
            },
            {
              title: "Fear of getting it wrong",
              body: "Every article says something different. You\u2019re afraid one bad decision could set you back years.",
              icon: <><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></>,
            },
            {
              title: "No one in your corner",
              body: "Financial advisors cost thousands. YouTube gurus have their own agenda. You\u2019re left guessing alone.",
              icon: <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" /></>,
            },
          ].map((card) => (
            <div key={card.title} className="rounded-2xl border border-border-light p-8 text-center">
              <div className="w-12 h-12 rounded-xl bg-surface-muted flex items-center justify-center mx-auto mb-5">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{card.icon}</svg>
              </div>
              <h3 className="text-[16px] font-semibold text-text mb-3">{card.title}</h3>
              <p className="text-[14px] text-text-sec leading-relaxed">{card.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════ 6. HOW IT WORKS ══════ */}
      <section id="how-it-works" className="bg-surface-muted py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-text-muted mb-4">How It Works</p>
          <h2 className="text-[28px] sm:text-[36px] md:text-[42px] font-bold text-text tracking-tight mb-16 leading-[1.1]">
            Three steps. Five minutes. You&apos;re set.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 stagger-children">
            {[
              { n: "1", title: "Create your free account", body: "Sign up with email or Google. Takes 30 seconds. No credit card, no catch." },
              { n: "2", title: "Tell us about you", body: "Your income, goals, and risk comfort. The AI needs context to give real advice." },
              { n: "3", title: "Get your personalized plan", body: "Your dashboard lights up with tailored guidance, goal tracking, and a portfolio strategy built for you." },
            ].map((step) => (
              <div key={step.n}>
                <div className="w-12 h-12 rounded-full bg-accent text-white text-[18px] font-bold flex items-center justify-center mx-auto mb-5">{step.n}</div>
                <h3 className="text-[17px] font-semibold text-text mb-2">{step.title}</h3>
                <p className="text-[14px] text-text-sec leading-relaxed max-w-[280px] mx-auto">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ 7. FEATURE SHOWCASE ══════ */}
      <section className="max-w-6xl mx-auto px-6">
        {FEATURES.map((f, i) => {
          const Visual = VISUAL_MAP[f.visual];
          const reversed = i % 2 === 1;
          return (
            <div key={f.label} className={`grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center py-20 ${i > 0 ? "border-t border-border-light" : ""}`}>
              {/* Copy */}
              <div className={reversed ? "lg:order-2" : ""}>
                <p className={`text-[11px] font-semibold uppercase tracking-[0.15em] ${f.color} mb-3`}>{f.label}</p>
                <h3 className="text-[28px] sm:text-[32px] md:text-[38px] font-bold text-text tracking-tight leading-[1.1] mb-4">{f.headline}</h3>
                <p className="text-[15px] text-text-sec leading-relaxed mb-5">{f.body}</p>
                <div className="inline-flex items-center gap-2 text-[13px] text-text-muted">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  {f.stat}
                </div>
              </div>
              {/* Visual */}
              <div className={reversed ? "lg:order-1" : ""}>
                {Visual && <Visual />}
              </div>
            </div>
          );
        })}
      </section>

      {/* ══════ 8. AI ADVISOR SPOTLIGHT ══════ */}
      <section className="bg-[#0f172a]">
        <div className="max-w-4xl mx-auto px-6 py-24">
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/40 text-center mb-4">AI In Action</p>
          <h2 className="text-[28px] sm:text-[36px] md:text-[42px] font-bold !text-white tracking-tight text-center leading-[1.1] mb-4">
            Like having a financial advisor<br className="hidden sm:block" /> in your pocket.
          </h2>
          <p className="text-[15px] text-white/50 text-center max-w-xl mx-auto mb-12">
            Here&apos;s what a real conversation looks like.
          </p>

          <div className="rounded-2xl bg-white/5 border border-white/10 p-5 md:p-6 space-y-4 stagger-children">
            {/* User 1 */}
            <div className="flex justify-end">
              <div className="bg-accent text-white text-[13px] rounded-2xl rounded-br-sm px-4 py-2.5 max-w-[75%] leading-relaxed">
                I have $500 extra this month. What should I do with it?
              </div>
            </div>
            {/* AI 1 */}
            <div className="flex gap-3 items-start">
              <div className="w-6 h-6 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5"><path d="M21 21H4a1 1 0 01-1-1V3" /><path d="M7 14l4-4 4 4 5-5" /></svg>
              </div>
              <div className="bg-white/8 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%] text-[13px] text-white/80 leading-relaxed">
                <p className="text-white font-medium mb-2">Based on your profile, here&apos;s my recommendation:</p>
                <p className="mb-2"><strong className="text-white">$300</strong> &rarr; Emergency Fund <span className="text-white/50">(gets you from 67% to 78%)</span></p>
                <p className="mb-2"><strong className="text-white">$150</strong> &rarr; Index fund <span className="text-white/50">(lower risk than individual stocks)</span></p>
                <p className="mb-3"><strong className="text-white">$50</strong> &rarr; Keep liquid <span className="text-white/50">(unexpected expenses buffer)</span></p>
                <p className="text-white/50 text-[12px]">Your emergency fund should be priority #1. Once it&apos;s complete, we&apos;ll redirect that $300/mo into growth.</p>
              </div>
            </div>
            {/* User 2 */}
            <div className="flex justify-end">
              <div className="bg-accent text-white text-[13px] rounded-2xl rounded-br-sm px-4 py-2.5 max-w-[75%] leading-relaxed">
                What about Bitcoin? My friend says I should buy some.
              </div>
            </div>
            {/* AI 2 */}
            <div className="flex gap-3 items-start">
              <div className="w-6 h-6 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5"><path d="M21 21H4a1 1 0 01-1-1V3" /><path d="M7 14l4-4 4 4 5-5" /></svg>
              </div>
              <div className="bg-white/8 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%] text-[13px] text-white/80 leading-relaxed">
                <p className="text-white font-medium mb-2">I&apos;d hold off for now. Here&apos;s why:</p>
                <p className="mb-1">&bull; Your risk profile is <strong className="text-white">moderate</strong> — crypto can drop 30-50% in weeks</p>
                <p className="mb-1">&bull; Your emergency fund isn&apos;t complete yet</p>
                <p className="mb-3">&bull; Rule of thumb: only invest in crypto what you can afford to lose entirely</p>
                <p className="text-white/50 text-[12px]">Build your safety net first. Once that&apos;s done, a 5-10% crypto allocation is reasonable if you&apos;re comfortable with the volatility.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════ 9. QUOTE ══════ */}
      <section className="bg-[#0f172a] border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center px-6 py-20">
          <span className="text-[80px] leading-none text-accent/20 font-serif">&ldquo;</span>
          <p className="text-[18px] md:text-[22px] text-white/80 font-medium leading-relaxed tracking-tight -mt-8 mb-6 italic">
            We built Fundwise because we were tired of being told to &ldquo;just invest&rdquo;
            without anyone showing us how. This is the advisor we wished we had when we started.
          </p>
          <p className="text-[14px] font-semibold text-white/60">The Fundwise Team</p>
          <p className="text-[13px] text-white/30 mt-1">Built by everyday investors, for everyday investors.</p>
        </div>
      </section>

      {/* ══════ 10. FINAL CTA ══════ */}
      <section className="bg-[#0f172a] border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center py-24 px-6 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-accent/5 blur-[100px] pointer-events-none" />
          <h2 className="text-[28px] sm:text-[36px] md:text-[44px] font-bold !text-white tracking-tight leading-[1.1] mb-5 relative">
            Your money won&apos;t<br />manage itself.
          </h2>
          <p className="text-[16px] text-white/50 leading-relaxed max-w-xl mx-auto mb-10 relative">
            Stop guessing and start growing. It takes two minutes to sign up.
            It&apos;s free. What are you waiting for?
          </p>
          <Link href="/signup" className="relative inline-flex items-center gap-2 px-10 py-4 bg-accent text-white text-[16px] font-semibold rounded-xl hover:bg-accent-hover transition-all shadow-glow">
            Get Started — Free Forever <Arrow />
          </Link>
          <p className="text-[13px] text-white/30 mt-6 relative">No credit card. No trial. No catch.</p>
        </div>
      </section>

      {/* ══════ 11. FOOTER ══════ */}
      <footer className="bg-[#0f172a] border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Logo size={24} />
                <span className="text-[14px] font-semibold text-white">Fundwise</span>
              </div>
              <p className="text-[13px] text-white/40 leading-relaxed">Your AI financial advisor.<br />Smart investing, made simple.</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/30 mb-4">Product</p>
              <div className="space-y-2">
                {["Dashboard", "Market", "Portfolio", "AI Advisor", "Goals"].map((link) => (
                  <p key={link}><Link href="/signup" className="text-[13px] text-white/50 hover:text-white transition-colors">{link}</Link></p>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/30 mb-4">Company</p>
              <div className="space-y-2">
                {["About", "Privacy", "Terms"].map((link) => (
                  <p key={link}><span className="text-[13px] text-white/50">{link}</span></p>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-white/10 flex items-center justify-between">
            <p className="text-[12px] text-white/25">&copy; {new Date().getFullYear()} Fundwise. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
