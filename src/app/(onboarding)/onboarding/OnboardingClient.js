"use client";

import { useState, useTransition, useMemo } from "react";
import { SUPPORTED_COUNTRIES, formatCurrency } from "@/constants/markets";
import { createProfile, completeOnboarding } from "@/features/profile/actions";
import { createGoal } from "@/features/goals/actions";

const STEPS = ["country", "profile", "goal"];
const STEP_LABELS = ["Location", "Profile", "Goal"];

const RISK_LEVELS = [
  {
    value: "conservative",
    label: "Conservative",
    sub: "Safety first. Slow, steady growth.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    accent: "border-blue-200 bg-blue-50 text-blue-700",
    ring: "ring-blue-200",
  },
  {
    value: "moderate",
    label: "Moderate",
    sub: "Some ups and downs are fine for better returns.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    accent: "border-amber-200 bg-amber-50 text-amber-700",
    ring: "ring-amber-200",
  },
  {
    value: "aggressive",
    label: "Aggressive",
    sub: "I can handle big swings for maximum growth.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" />
      </svg>
    ),
    accent: "border-red-200 bg-red-50 text-red-700",
    ring: "ring-red-200",
  },
];

const EXPERIENCE = [
  { value: "beginner", label: "Beginner", sub: "Just starting out" },
  { value: "intermediate", label: "Intermediate", sub: "Invested before" },
  { value: "advanced", label: "Advanced", sub: "Invest regularly" },
];

const GOAL_TYPES = [
  {
    value: "emergency_fund",
    label: "Emergency Fund",
    sub: "3-6 months of expenses as a safety net",
    icon: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></>,
    color: "border-rose-200 bg-rose-50 text-rose-700",
  },
  {
    value: "house",
    label: "Buy a Home",
    sub: "Save for a down payment on your first property",
    icon: <><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></>,
    color: "border-blue-200 bg-blue-50 text-blue-700",
  },
  {
    value: "retirement",
    label: "Retirement",
    sub: "Build long-term wealth for financial freedom",
    icon: <><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /></>,
    color: "border-purple-200 bg-purple-50 text-purple-700",
  },
  {
    value: "education",
    label: "Education",
    sub: "Fund your own or your child's education",
    icon: <><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" /><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" /></>,
    color: "border-amber-200 bg-amber-50 text-amber-700",
  },
  {
    value: "wealth",
    label: "Grow Wealth",
    sub: "General investing to build your net worth",
    icon: <><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></>,
    color: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  {
    value: "custom",
    label: "Something Else",
    sub: "Travel, car, wedding — anything you want",
    icon: <><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></>,
    color: "border-slate-200 bg-slate-50 text-slate-600",
  },
];

const AMOUNT_PRESETS = [
  { label: "100K", value: 100_000 },
  { label: "500K", value: 500_000 },
  { label: "1M", value: 1_000_000 },
  { label: "5M", value: 5_000_000 },
];

export default function OnboardingClient({ userName, existingProfile }) {
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const [country, setCountry] = useState(existingProfile?.country_code || "");
  const [riskLevel, setRiskLevel] = useState(existingProfile?.risk_level || "moderate");
  const [experience, setExperience] = useState(existingProfile?.investment_experience || "beginner");
  const [monthlyIncome, setMonthlyIncome] = useState(existingProfile?.monthly_income || "");
  const [monthlyExpenses, setMonthlyExpenses] = useState(existingProfile?.monthly_expenses || "");
  const [goalCategory, setGoalCategory] = useState("");
  const [goalName, setGoalName] = useState("");
  const [goalAmount, setGoalAmount] = useState("");

  const selectedCountry = SUPPORTED_COUNTRIES.find((c) => c.code === country);
  const currency = selectedCountry?.currency || "USD";

  function nextFromCountry() {
    if (!country) { setError("Pick your country to continue."); return; }
    setError(""); setStep(1);
  }

  function nextFromProfile() {
    setError("");
    startTransition(async () => {
      const r = await createProfile({
        countryCode: country, riskLevel, investmentExperience: experience,
        monthlyIncome: monthlyIncome ? Number(monthlyIncome) : null,
        monthlyExpenses: monthlyExpenses ? Number(monthlyExpenses) : null,
      });
      if (r.error) { setError(r.error); return; }
      setStep(2);
    });
  }

  function finish() {
    startTransition(async () => {
      if (goalCategory && goalAmount) {
        const formData = new FormData();
        formData.set("name", goalName || GOAL_TYPES.find((g) => g.value === goalCategory)?.label || "My Goal");
        formData.set("category", goalCategory);
        formData.set("targetAmount", goalAmount);
        formData.set("monthlyContribution", "0");
        await createGoal(formData);
      }
      await completeOnboarding();
    });
  }

  const preview = useMemo(() => {
    if (!monthlyIncome || !goalAmount) return null;
    const saveable = Math.max(0, Number(monthlyIncome) - Number(monthlyExpenses || 0));
    const monthly = Math.round(saveable * 0.3);
    if (monthly <= 0 || Number(goalAmount) <= 0) return null;
    const months = Math.ceil(Number(goalAmount) / monthly);
    return { monthly, months };
  }, [monthlyIncome, monthlyExpenses, goalAmount]);

  return (
    <div className="animate-fade-in">
      {/* ── Step indicator ── */}
      <div className="flex items-center justify-center gap-8 mb-10">
        {STEP_LABELS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold transition-all duration-300 ${
              i < step ? "bg-accent text-white" :
              i === step ? "bg-accent text-white ring-4 ring-accent/15" :
              "bg-surface-muted text-text-muted"
            }`}>
              {i < step ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              ) : i + 1}
            </div>
            <span className={`text-[12px] font-medium hidden sm:block ${i === step ? "text-text" : "text-text-muted"}`}>{label}</span>
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-6 p-3 rounded-xl bg-red-50 border border-red-200 text-[13px] text-red-700">{error}</div>
      )}

      {/* ═══════════ STEP 1: Country ═══════════ */}
      {step === 0 && (
        <div>
          <h1 className="text-[24px] font-bold text-text tracking-tight mb-1">Where are you based, {userName}?</h1>
          <p className="text-[14px] text-text-sec mb-8">This sets your currency, exchange, and market data.</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
            {SUPPORTED_COUNTRIES.map((c) => (
              <button
                key={c.code}
                onClick={() => setCountry(c.code)}
                className={`p-4 rounded-2xl border text-left transition-all duration-200 ${
                  country === c.code
                    ? "border-accent bg-accent-light ring-2 ring-accent/20 shadow-xs"
                    : "border-border bg-card hover:border-accent/30 hover:shadow-xs"
                }`}
              >
                <span className="text-2xl block mb-2">{c.flag}</span>
                <span className="text-[14px] font-semibold text-text block">{c.name}</span>
                <span className="text-[12px] text-text-muted">{c.currency}</span>
              </button>
            ))}
          </div>

          <button onClick={nextFromCountry} disabled={!country} className="btn-primary w-full !py-3 !text-[15px] disabled:opacity-40">
            Continue
          </button>
        </div>
      )}

      {/* ═══════════ STEP 2: Profile ═══════════ */}
      {step === 1 && (
        <div>
          <h1 className="text-[24px] font-bold text-text tracking-tight mb-1">A bit about your finances</h1>
          <p className="text-[14px] text-text-sec mb-8">This helps your AI advisor give personalized guidance. Everything here is optional and private.</p>

          {/* Risk */}
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-muted mb-3">Risk comfort</p>
          <div className="grid gap-2.5 mb-7">
            {RISK_LEVELS.map((r) => (
              <button
                key={r.value}
                onClick={() => setRiskLevel(r.value)}
                className={`flex items-center gap-3.5 p-4 rounded-2xl border text-left transition-all duration-200 ${
                  riskLevel === r.value ? `${r.accent} ring-2 ${r.ring}` : "border-border bg-card hover:border-accent/30"
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${riskLevel === r.value ? "" : "bg-surface-muted text-text-muted"}`}>
                  {r.icon}
                </div>
                <div>
                  <span className="text-[14px] font-semibold block">{r.label}</span>
                  <span className="text-[12px] opacity-70">{r.sub}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Experience */}
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-muted mb-3">Investing experience</p>
          <div className="grid grid-cols-3 gap-2.5 mb-7">
            {EXPERIENCE.map((e) => (
              <button
                key={e.value}
                onClick={() => setExperience(e.value)}
                className={`p-3 rounded-xl border text-center transition-all duration-200 ${
                  experience === e.value
                    ? "border-accent bg-accent-light text-accent-text ring-1 ring-accent/20"
                    : "border-border bg-card hover:border-accent/30"
                }`}
              >
                <span className="text-[13px] font-semibold block">{e.label}</span>
                <span className="text-[11px] text-text-muted">{e.sub}</span>
              </button>
            ))}
          </div>

          {/* Income / Expenses */}
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-muted mb-3">Monthly numbers <span className="text-text-muted font-normal normal-case">(optional)</span></p>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-[12px] text-text-sec block mb-1.5">Income ({currency})</label>
              <input type="number" value={monthlyIncome} onChange={(e) => setMonthlyIncome(e.target.value)} placeholder="e.g. 150,000" className="input-field !text-[13px] w-full font-mono" />
            </div>
            <div>
              <label className="text-[12px] text-text-sec block mb-1.5">Expenses ({currency})</label>
              <input type="number" value={monthlyExpenses} onChange={(e) => setMonthlyExpenses(e.target.value)} placeholder="e.g. 80,000" className="input-field !text-[13px] w-full font-mono" />
            </div>
          </div>
          <p className="text-[11px] text-text-muted mb-8">This stays private. Your advisor uses it to give specific advice instead of generic tips.</p>

          <div className="flex gap-3">
            <button onClick={() => setStep(0)} className="btn-secondary flex-1 !py-3">Back</button>
            <button onClick={nextFromProfile} disabled={pending} className="btn-primary flex-1 !py-3 !text-[15px] disabled:opacity-40">
              {pending ? "Saving..." : "Continue"}
            </button>
          </div>
        </div>
      )}

      {/* ═══════════ STEP 3: Goal ═══════════ */}
      {step === 2 && (
        <div>
          <h1 className="text-[24px] font-bold text-text tracking-tight mb-1">What are you saving toward?</h1>
          <p className="text-[14px] text-text-sec mb-8">Pick one to get started. You can add more goals later from your dashboard.</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-6">
            {GOAL_TYPES.map((g) => (
              <button
                key={g.value}
                onClick={() => { setGoalCategory(g.value); if (!goalName) setGoalName(g.label); }}
                className={`p-4 rounded-2xl border text-left transition-all duration-200 ${
                  goalCategory === g.value ? `${g.color} ring-2` : "border-border bg-card hover:border-accent/30 hover:shadow-xs"
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2.5 ${goalCategory === g.value ? "" : "bg-surface-muted"}`}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{g.icon}</svg>
                </div>
                <span className="text-[13px] font-semibold block leading-tight">{g.label}</span>
                <span className="text-[11px] opacity-60 leading-snug block mt-0.5">{g.sub}</span>
              </button>
            ))}
          </div>

          {goalCategory && (
            <div className="rounded-2xl border border-border bg-surface-muted/50 p-4 mb-6 space-y-3 animate-slide-up">
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-muted block mb-1.5">Goal name</label>
                <input type="text" value={goalName} onChange={(e) => setGoalName(e.target.value)} maxLength={100} className="input-field !text-[13px] w-full" placeholder="e.g. Emergency Fund" />
              </div>
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-muted block mb-1.5">Target amount ({currency})</label>
                <input type="number" value={goalAmount} onChange={(e) => setGoalAmount(e.target.value)} min="1" max="1000000000000" className="input-field !text-[13px] w-full font-mono" placeholder="e.g. 1,000,000" />
                <div className="flex gap-1.5 mt-2">
                  {AMOUNT_PRESETS.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setGoalAmount(String(p.value))}
                      className={`text-[10px] font-mono px-2.5 py-1 rounded-lg border transition-all ${
                        Number(goalAmount) === p.value ? "border-accent bg-accent text-white" : "border-border text-text-muted hover:border-accent/30"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {preview && (
                <div className="rounded-xl bg-emerald-50 border border-emerald-200/60 px-3 py-2">
                  <p className="text-[12px] text-emerald-800">
                    If you save ~{formatCurrency(preview.monthly, currency)}/mo (30% of your disposable income), you&apos;ll reach this in roughly <strong>{Math.floor(preview.months / 12)}y {preview.months % 12}mo</strong>.
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="btn-secondary flex-1 !py-3">Back</button>
            <button onClick={finish} disabled={pending} className="btn-primary flex-1 !py-3 !text-[15px] disabled:opacity-40">
              {pending ? "Setting up..." : goalCategory && goalAmount ? "Create Goal & Start" : "Skip for Now"}
            </button>
          </div>
          {!goalCategory && (
            <p className="text-[12px] text-text-muted text-center mt-3">You can always create goals from the Goals page later.</p>
          )}
        </div>
      )}
    </div>
  );
}
