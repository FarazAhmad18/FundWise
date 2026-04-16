"use client";

import { useState, useEffect, useTransition, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer,
} from "recharts";
import {
  createGoal,
  updateGoal,
  deleteGoal,
  addToGoalSavings,
  togglePauseGoal,
} from "@/features/goals/actions";
import { formatCurrency } from "@/constants/markets";

/* ─── Constants ────────────────────────────────────────────── */

const CATEGORIES = [
  { value: "emergency_fund", label: "Emergency Fund", color: "#e11d48" },
  { value: "house",          label: "Buy a Home",     color: "#3b82f6" },
  { value: "retirement",     label: "Retirement",     color: "#8b5cf6" },
  { value: "education",      label: "Education",      color: "#d97706" },
  { value: "wealth",         label: "Build Wealth",   color: "#059669" },
  { value: "custom",         label: "Custom Goal",    color: "#64748b" },
];

/* SVG icons per category — 18x18 thin line, consistent with sidebar icons */
const CAT_ICONS = {
  emergency_fund: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></>,
  house:          <><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>,
  retirement:     <><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></>,
  education:      <><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></>,
  wealth:         <><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></>,
  custom:         <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></>,
};

function CatIcon({ value, size = 18, color }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {CAT_ICONS[value] || CAT_ICONS.custom}
    </svg>
  );
}

const STATUS = {
  on_track:        { label: "On Track",  text: "text-emerald-600", bg: "bg-emerald-50" },
  tracking:        { label: "Tracking",  text: "text-blue-600",    bg: "bg-blue-50"    },
  behind:          { label: "Behind",    text: "text-red-600",     bg: "bg-red-50"     },
  no_contribution: { label: "No Plan",   text: "text-slate-500",   bg: "bg-slate-50"   },
  completed:       { label: "Reached",   text: "text-amber-600",   bg: "bg-amber-50"   },
  paused:          { label: "Paused",    text: "text-slate-400",   bg: "bg-slate-50"   },
};

const AMOUNT_PRESETS = [
  { label: "100K", value: 100_000 },
  { label: "500K", value: 500_000 },
  { label: "1M",   value: 1_000_000 },
  { label: "5M",   value: 5_000_000 },
  { label: "10M",  value: 10_000_000 },
];

/* ─── Helpers ──────────────────────────────────────────────── */

function dur(m) {
  if (m == null || m <= 0) return "\u2014";
  const y = Math.floor(m / 12), r = m % 12;
  if (!y) return `${r}mo`;
  if (!r) return `${y}y`;
  return `${y}y ${r}mo`;
}

function shortDate(iso) {
  if (!iso) return "\u2014";
  return new Date(iso).toLocaleDateString(undefined, { month: "short", year: "numeric" });
}

function catFor(goal) {
  return CATEGORIES.find((c) => c.value === goal.category) || CATEGORIES.at(-1);
}

function projectionCopy(g, c) {
  if (g.status === "paused") return { text: "Paused. Resume to continue tracking.", type: "muted" };
  if (g.projectionStatus === "completed") return { text: "Target reached.", type: "success" };
  if (g.projectionStatus === "no_contribution") {
    if (g.requiredMonthlyForTargetDate)
      return { text: `${formatCurrency(g.requiredMonthlyForTargetDate, c)}/mo needed by ${shortDate(g.target_date)}.`, type: "hint" };
    return { text: "Set a monthly contribution to project a timeline.", type: "muted" };
  }
  if (g.projectionStatus === "on_track")
    return { text: `On pace \u2014 ${shortDate(g.projectedDate)} (${dur(g.monthsRemaining)}).`, type: "success" };
  if (g.projectionStatus === "behind") {
    const extra = g.catchupMonthly > 0 ? ` +${formatCurrency(g.catchupMonthly, c)}/mo to catch up.` : "";
    return { text: `Projected ${shortDate(g.projectedDate)} \u2014 ${dur(g.monthsRemaining)}.${extra}`, type: "warn" };
  }
  if (g.projectionStatus === "tracking")
    return { text: `${shortDate(g.projectedDate)} (${dur(g.monthsRemaining)}).`, type: "info" };
  return null;
}

function compactCurrency(val, currency) {
  if (val >= 10_000_000) return `${(val / 10_000_000).toFixed(1)}Cr`;
  if (val >= 100_000) return `${(val / 100_000).toFixed(1)}L`;
  if (val >= 1_000) return `${(val / 1_000).toFixed(0)}K`;
  return formatCurrency(val, currency);
}

/* ─── Radial Ring ──────────────────────────────────────────── */

function RadialRing({ size = 100, strokeWidth = 8, progress = 0, color = "var(--accent)", children }) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(100, Math.max(0, progress)) / 100) * circ;

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border-light)" strokeWidth={strokeWidth} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
}

/* ─── Hero ─────────────────────────────────────────────────── */

function GoalsHero({ goals, currency, monthlyIncome, monthlyExpenses }) {
  const s = useMemo(() => {
    const active = goals.filter((g) => g.status !== "paused");
    const saved  = active.reduce((n, g) => n + (Number(g.current_saved) || 0), 0);
    const target = active.reduce((n, g) => n + (Number(g.target_amount) || 0), 0);
    const monthly = active.reduce((n, g) => n + (Number(g.monthly_contribution) || 0), 0);
    const pct = target > 0 ? Math.min(100, (saved / target) * 100) : 0;
    const nearest = active
      .filter((g) => g.projectionStatus !== "completed" && g.projectedDate)
      .sort((a, b) => new Date(a.projectedDate) - new Date(b.projectedDate))[0];
    return { saved, target, monthly, pct, count: active.length, nearest };
  }, [goals]);

  const capacity = useMemo(() => {
    if (!monthlyIncome || monthlyIncome <= 0) return null;
    const expPct  = Math.min(100, (monthlyExpenses / monthlyIncome) * 100);
    const goalPct = Math.min(100 - expPct, (s.monthly / monthlyIncome) * 100);
    const availPct = Math.max(0, 100 - expPct - goalPct);
    const available = monthlyIncome - monthlyExpenses - s.monthly;
    return { expPct, goalPct, availPct, available, over: available < 0 };
  }, [monthlyIncome, monthlyExpenses, s.monthly]);

  return (
    <div className="rounded-2xl border border-border bg-white p-7 mb-5">
      <div className="flex items-center justify-between gap-8 flex-wrap">
        <div className="flex-1 min-w-[260px]">
          <p className="text-[10px] font-semibold text-text-muted uppercase tracking-[0.1em] mb-3">
            Overall Progress
          </p>
          <p className="text-[34px] font-bold font-mono text-text tracking-tight leading-none mb-1">
            {formatCurrency(s.saved, currency)}
          </p>
          <p className="text-[13px] text-text-muted">
            of {formatCurrency(s.target, currency)} across {s.count} active goal{s.count !== 1 ? "s" : ""}
          </p>

          <div className="grid grid-cols-3 gap-5 mt-6 pt-5 border-t border-border-light">
            <div>
              <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1">Monthly</p>
              <p className="text-[16px] font-bold font-mono text-text">{formatCurrency(s.monthly, currency)}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1">Next Milestone</p>
              <p className="text-[16px] font-bold text-text">{s.nearest ? shortDate(s.nearest.projectedDate) : "\u2014"}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1">Completion</p>
              <p className="text-[16px] font-bold font-mono text-text">{s.pct.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <RadialRing size={130} strokeWidth={10} progress={s.pct} color="var(--accent)">
          <p className="text-[26px] font-bold text-text font-mono leading-none">{Math.round(s.pct)}</p>
          <p className="text-[9px] text-text-muted font-semibold tracking-wider mt-0.5">%</p>
        </RadialRing>
      </div>

      {/* Cash flow bar */}
      {capacity && (
        <div className="mt-6 pt-5 border-t border-border-light">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-semibold text-text-muted uppercase tracking-[0.08em]">Monthly Cash Flow</p>
            {capacity.over && (
              <span className="text-[10px] font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                Over-committed by {formatCurrency(Math.abs(capacity.available), currency)}/mo
              </span>
            )}
          </div>
          <div className="flex h-2.5 rounded-full overflow-hidden">
            <div className="h-full bg-slate-300" style={{ width: `${capacity.expPct}%` }} />
            <div className="h-full bg-accent" style={{ width: `${capacity.goalPct}%` }} />
            <div className="h-full bg-border-light" style={{ width: `${capacity.availPct}%` }} />
          </div>
          <div className="flex items-center gap-5 mt-2 text-[10px] text-text-muted">
            <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-sm bg-slate-300" />Expenses {formatCurrency(monthlyExpenses, currency)}</span>
            <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-sm bg-accent" />Goals {formatCurrency(s.monthly, currency)}</span>
            <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-sm bg-border-light border border-border" />Free {formatCurrency(Math.max(0, capacity.available), currency)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Insights Strip ───────────────────────────────────────── */

function InsightsStrip({ goals, currency, monthlyIncome }) {
  const insights = useMemo(() => {
    const active = goals.filter((g) => g.status !== "paused" && g.projectionStatus !== "completed");
    const out = [];

    // Almost there
    for (const g of active) {
      if (g.progress >= 90) {
        const left = Number(g.target_amount) - Number(g.current_saved);
        out.push({ text: `${g.name} is ${g.progress.toFixed(0)}% there. ${formatCurrency(left, currency)} to go.`, type: "success" });
      }
    }

    // Behind
    const behind = active.filter((g) => g.projectionStatus === "behind" && g.catchupMonthly);
    if (behind.length) {
      const w = behind.sort((a, b) => b.catchupMonthly - a.catchupMonthly)[0];
      out.push({ text: `${w.name} is behind schedule. +${formatCurrency(w.catchupMonthly, currency)}/mo to catch up.`, type: "warn" });
    }

    // Income ratio
    if (monthlyIncome > 0) {
      const total = active.reduce((n, g) => n + (Number(g.monthly_contribution) || 0), 0);
      const ratio = (total / monthlyIncome) * 100;
      if (ratio > 50) out.push({ text: `${ratio.toFixed(0)}% of income committed to goals. Verify essentials are covered.`, type: "warn" });
      else if (ratio > 0 && ratio < 10) out.push({ text: `Only ${ratio.toFixed(0)}% of income goes to goals. Room to accelerate.`, type: "info" });
    }

    // No plan
    const noPlan = active.filter((g) => g.projectionStatus === "no_contribution");
    if (noPlan.length) out.push({ text: `${noPlan.length} goal${noPlan.length > 1 ? "s" : ""} without a monthly contribution.`, type: "info" });

    return out.slice(0, 3);
  }, [goals, currency, monthlyIncome]);

  if (!insights.length) return null;

  const accent = { success: "border-l-emerald-400", warn: "border-l-amber-400", info: "border-l-blue-400" };

  return (
    <div className="flex gap-3 overflow-x-auto pb-1 mb-5 scrollbar-none">
      {insights.map((ins, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.06, duration: 0.35 }}
          className={`min-w-[260px] max-w-[320px] flex-shrink-0 rounded-lg border border-border bg-white px-4 py-3 border-l-[3px] ${accent[ins.type]}`}
        >
          <p className="text-[12px] leading-relaxed text-text-sec">{ins.text}</p>
        </motion.div>
      ))}
    </div>
  );
}

/* ─── What-If Simulator ────────────────────────────────────── */

function WhatIfSimulator({ goal, currency, onApply, applying }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const currentMonthly = Number(goal.monthly_contribution) || 0;
  const maxSlider = Math.max(currentMonthly * 4, 50000);
  const [simMonthly, setSimMonthly] = useState(currentMonthly);
  const [lumpSum, setLumpSum] = useState("");

  const lumpVal = Number(lumpSum) || 0;
  const remaining = Math.max(0, Number(goal.target_amount) - Number(goal.current_saved));
  const remainingAfterLump = Math.max(0, remaining - lumpVal);

  const currentMonths  = currentMonthly > 0 ? Math.ceil(remaining / currentMonthly) : null;
  const simMonths      = simMonthly > 0 ? Math.ceil(remainingAfterLump / simMonthly) : null;
  const delta          = currentMonths != null && simMonths != null ? currentMonths - simMonths : null;
  const changed        = simMonthly !== currentMonthly || lumpVal > 0;

  // Chart data: project both trajectories month by month
  const chartData = useMemo(() => {
    const maxM = Math.min(360, Math.max(currentMonths || 60, simMonths || 60, 12));
    const target = Number(goal.target_amount);
    const saved = Number(goal.current_saved);
    const data = [];
    for (let m = 0; m <= maxM; m++) {
      const cur = Math.min(target, saved + currentMonthly * m);
      const sim = Math.min(target, saved + lumpVal + simMonthly * m);
      data.push({ month: m, current: cur, simulated: sim, target });
      if (cur >= target && sim >= target) break;
    }
    return data;
  }, [goal.target_amount, goal.current_saved, currentMonthly, simMonthly, lumpVal, currentMonths, simMonths]);

  const simDate = useMemo(() => {
    if (!simMonths) return null;
    const d = new Date();
    d.setMonth(d.getMonth() + simMonths);
    return d;
  }, [simMonths]);

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="overflow-hidden"
    >
      <div className="mx-5 mb-5 rounded-xl border border-border bg-surface-muted/40 p-5">
        <p className="text-[11px] font-semibold text-text-muted uppercase tracking-[0.1em] mb-5">
          What if you changed your plan?
        </p>

        {/* Monthly slider */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] text-text-sec">Monthly Contribution</span>
            <span className="text-[14px] font-bold font-mono text-text">{formatCurrency(simMonthly, currency)}</span>
          </div>
          <input
            type="range"
            className="sim-slider"
            min={0}
            max={maxSlider}
            step={Math.max(100, Math.round(maxSlider / 200) * 100)}
            value={simMonthly}
            onChange={(e) => setSimMonthly(Number(e.target.value))}
          />
          <div className="flex justify-between text-[9px] text-text-muted mt-1 font-mono">
            <span>0</span>
            <span>{compactCurrency(maxSlider, currency)}</span>
          </div>
        </div>

        {/* Lump sum */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] text-text-sec">One-time addition</span>
          </div>
          <input
            type="number"
            value={lumpSum}
            onChange={(e) => setLumpSum(e.target.value)}
            min="0"
            step="any"
            placeholder="0"
            className="input-field !py-2 !text-[13px] font-mono w-full"
          />
        </div>

        {/* Chart */}
        {mounted && chartData.length > 2 && (
          <div className="mb-5 -mx-2">
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="simGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
                <XAxis
                  dataKey="month"
                  tickFormatter={(m) => m === 0 ? "Now" : `${m}mo`}
                  tick={{ fontSize: 9, fill: "var(--text-muted)" }}
                  axisLine={false} tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tickFormatter={(v) => compactCurrency(v, currency)}
                  tick={{ fontSize: 9, fill: "var(--text-muted)" }}
                  axisLine={false} tickLine={false}
                  width={45}
                />
                <Tooltip
                  contentStyle={{
                    background: "#fff",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 11,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  }}
                  formatter={(val) => formatCurrency(val, currency)}
                  labelFormatter={(m) => `Month ${m}`}
                />
                <ReferenceLine
                  y={Number(goal.target_amount)}
                  stroke="var(--border-strong)"
                  strokeDasharray="4 4"
                  label={{ value: "Target", position: "right", fontSize: 9, fill: "var(--text-muted)" }}
                />
                {/* Current trajectory (gray, dashed) */}
                <Area
                  type="monotone" dataKey="current" name="Current Pace"
                  stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="4 3"
                  fill="none"
                  animationDuration={800}
                />
                {/* Simulated trajectory (accent, filled) */}
                <Area
                  type="monotone" dataKey="simulated" name="Simulated"
                  stroke="var(--accent)" strokeWidth={2}
                  fill="url(#simGrad)"
                  animationDuration={800}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="rounded-lg bg-white border border-border p-3 text-center">
            <p className="text-[9px] font-semibold text-text-muted uppercase tracking-wider mb-1">Current ETA</p>
            <p className="text-[15px] font-bold font-mono text-text">{currentMonths ? dur(currentMonths) : "\u2014"}</p>
          </div>
          <div className="rounded-lg bg-white border border-border p-3 text-center">
            <p className="text-[9px] font-semibold text-text-muted uppercase tracking-wider mb-1">Simulated</p>
            <p className="text-[15px] font-bold font-mono text-accent">{simMonths ? dur(simMonths) : "\u2014"}</p>
            {simDate && <p className="text-[9px] text-text-muted mt-0.5">{shortDate(simDate.toISOString())}</p>}
          </div>
          <div className="rounded-lg bg-white border border-border p-3 text-center">
            <p className="text-[9px] font-semibold text-text-muted uppercase tracking-wider mb-1">Difference</p>
            <p className={`text-[15px] font-bold font-mono ${delta > 0 ? "text-emerald-600" : delta < 0 ? "text-red-500" : "text-text"}`}>
              {delta != null && delta !== 0 ? `${Math.abs(delta)}mo ${delta > 0 ? "faster" : "slower"}` : "\u2014"}
            </p>
          </div>
        </div>

        {/* Apply */}
        {changed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2">
            {simMonthly !== currentMonthly && (
              <button
                onClick={() => onApply({ monthlyContribution: simMonthly })}
                disabled={applying}
                className="btn-primary flex-1 !text-[12px] !py-2 disabled:opacity-40"
              >
                {applying ? "Saving..." : `Set to ${formatCurrency(simMonthly, currency)}/mo`}
              </button>
            )}
            {lumpVal > 0 && (
              <button
                onClick={() => onApply({ addSavings: lumpVal })}
                disabled={applying}
                className="btn-primary flex-1 !text-[12px] !py-2 disabled:opacity-40"
              >
                {applying ? "Adding..." : `Add ${formatCurrency(lumpVal, currency)}`}
              </button>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

/* ─── Goal Card ────────────────────────────────────────────── */

function GoalCard({ goal, currency, index, onAction, onRefresh }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [err, setErr] = useState(null);
  const [showSim, setShowSim] = useState(false);

  const cat = catFor(goal);
  const sKey = goal.status === "paused" ? "paused" : goal.projectionStatus;
  const st = STATUS[sKey] || STATUS.tracking;
  const proj = projectionCopy(goal, currency);
  const done = goal.projectionStatus === "completed";
  const paused = goal.status === "paused";
  const pct = Math.min(100, goal.progress);

  function refresh() { onRefresh?.(); router.refresh(); }

  function doDelete() {
    if (!confirm(`Delete "${goal.name}"?`)) return;
    setErr(null);
    start(async () => { const r = await deleteGoal(goal.id); if (r?.error) setErr(r.error); else refresh(); });
  }
  function doPause() {
    start(async () => { const r = await togglePauseGoal(goal.id); if (r?.error) setErr(r.error); else refresh(); });
  }
  function handleSimApply(changes) {
    setErr(null);
    start(async () => {
      if (changes.monthlyContribution != null) {
        const r = await updateGoal(goal.id, { monthlyContribution: changes.monthlyContribution });
        if (r?.error) { setErr(r.error); return; }
      }
      if (changes.addSavings) {
        const r = await addToGoalSavings(goal.id, changes.addSavings);
        if (r?.error) { setErr(r.error); return; }
      }
      setShowSim(false);
      refresh();
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, type: "spring", damping: 28, stiffness: 220 }}
      className={`rounded-2xl border bg-white transition-shadow duration-200 hover:shadow-card-hover overflow-hidden ${
        done ? "border-amber-200" : paused ? "opacity-55 border-border" : "border-border"
      }`}
    >
      {/* Accent top line */}
      <div className="h-[3px]" style={{ background: done ? "#f59e0b" : paused ? "#cbd5e1" : cat.color }} />

      {/* Main content */}
      <div className="p-5 flex gap-5">
        {/* Ring */}
        <RadialRing size={64} strokeWidth={5} progress={pct} color={done ? "#f59e0b" : paused ? "#94a3b8" : cat.color}>
          <p className="text-[14px] font-bold text-text font-mono leading-none">{Math.round(pct)}%</p>
        </RadialRing>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="min-w-0">
              <h3 className="text-[14px] font-semibold text-text leading-tight truncate">{goal.name}</h3>
              <p className="text-[10px] text-text-muted">{cat.label}</p>
            </div>
            <span className={`flex-shrink-0 text-[9px] font-bold uppercase tracking-[0.05em] px-2 py-0.5 rounded-full ${st.bg} ${st.text}`}>
              {st.label}
            </span>
          </div>

          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-[18px] font-bold font-mono text-text tracking-tight">
              {formatCurrency(goal.current_saved, currency)}
            </span>
            <span className="text-[11px] font-mono text-text-muted">
              / {formatCurrency(goal.target_amount, currency)}
            </span>
          </div>

          {goal.monthly_contribution > 0 && (
            <p className="text-[10px] text-text-muted font-mono mb-1">{formatCurrency(goal.monthly_contribution, currency)}/mo</p>
          )}

          {proj && (
            <p className={`text-[11px] leading-relaxed ${
              proj.type === "success" ? "text-emerald-600" :
              proj.type === "warn"    ? "text-amber-600" :
              proj.type === "hint"    ? "text-blue-600" :
              "text-text-muted"
            }`}>
              {proj.text}
            </p>
          )}

          {err && <p className="text-[10px] text-danger mt-1">{err}</p>}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 px-5 pb-3">
        {!done && !paused && (
          <>
            <button
              onClick={() => onAction("add-money", goal)}
              disabled={pending}
              className="text-[11px] font-semibold text-accent bg-accent-light hover:bg-accent-light/70 px-2.5 py-1 rounded-md transition-colors disabled:opacity-40"
            >
              + Add
            </button>
            <button
              onClick={() => setShowSim(!showSim)}
              disabled={pending}
              className={`text-[11px] font-semibold px-2.5 py-1 rounded-md transition-colors disabled:opacity-40 ${
                showSim
                  ? "text-accent bg-accent-light"
                  : "text-text-muted hover:text-text hover:bg-surface-muted"
              }`}
            >
              What If
            </button>
          </>
        )}
        <div className="flex items-center gap-0.5 ml-auto">
          <IconBtn title="Edit" onClick={() => onAction("edit", goal)} disabled={pending}>
            <path d="M17 3a2.85 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5z"/>
          </IconBtn>
          {!done && (
            <IconBtn title={paused ? "Resume" : "Pause"} onClick={doPause} disabled={pending}>
              {paused ? <polygon points="5 3 19 12 5 21 5 3"/> : <><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></>}
            </IconBtn>
          )}
          <IconBtn title="Delete" onClick={doDelete} disabled={pending} danger>
            <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
          </IconBtn>
        </div>
      </div>

      {/* What-If Simulator */}
      <AnimatePresence>
        {showSim && (
          <WhatIfSimulator
            goal={goal}
            currency={currency}
            onApply={handleSimApply}
            applying={pending}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function IconBtn({ children, onClick, disabled, title, danger }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded-md transition-colors disabled:opacity-40 ${
        danger
          ? "text-text-muted hover:text-danger hover:bg-red-50"
          : "text-text-muted hover:text-text hover:bg-surface-muted"
      }`}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {children}
      </svg>
    </button>
  );
}

/* ─── Slide-Over Panel ─────────────────────────────────────── */

function SlideOver({ mode, goal, prefill, currency, onClose, onDone }) {
  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex justify-end"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" />
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="relative w-full max-w-[460px] bg-white shadow-elevated overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {mode === "edit" && goal && <EditGoalForm goal={goal} currency={currency} onClose={onClose} onDone={onDone} />}
        {mode === "add-money" && goal && <AddMoneyForm goal={goal} currency={currency} onClose={onClose} onDone={onDone} />}
      </motion.div>
    </motion.div>
  );
}

function PanelHeader({ title, subtitle, onClose }) {
  return (
    <div className="flex items-start justify-between p-6 pb-0 mb-5">
      <div>
        <h2 className="text-[17px] font-bold text-text tracking-tight">{title}</h2>
        {subtitle && <p className="text-[12px] text-text-sec mt-0.5">{subtitle}</p>}
      </div>
      <button onClick={onClose} className="p-1 rounded-md text-text-muted hover:text-text hover:bg-surface-muted transition-colors -mt-1">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
  );
}

/* ─── Inline Create Form (on-page, not panel) ─────────────── */

function InlineCreateForm({ currency, prefill, onClose, onCreated }) {
  const [cat, setCat] = useState(prefill?.category || "");
  const [name, setName] = useState(prefill?.name || "");
  const [target, setTarget] = useState(prefill?.target ? String(prefill.target) : "");
  const [monthly, setMonthly] = useState("");
  const [date, setDate] = useState("");
  const [err, setErr] = useState("");
  const [pending, start] = useTransition();

  const preview = useMemo(() => {
    const t = Number(target), m = Number(monthly);
    if (!t || t <= 0 || !m || m <= 0) return null;
    const months = Math.ceil(t / m);
    const d = new Date(); d.setMonth(d.getMonth() + months);
    return { months, date: d };
  }, [target, monthly]);

  function submit(e) {
    e.preventDefault();
    setErr("");
    if (!cat) return setErr("Pick a category.");
    const fd = new FormData();
    fd.set("name", name); fd.set("category", cat); fd.set("targetAmount", target);
    fd.set("monthlyContribution", monthly || "0"); fd.set("targetDate", date);
    start(async () => { const r = await createGoal(fd); if (r?.error) setErr(r.error); else onCreated?.(); });
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-border bg-white p-6 mb-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-[16px] font-semibold text-text">New Goal</h3>
        <button type="button" onClick={onClose} className="p-1 rounded-md text-text-muted hover:text-text hover:bg-surface-muted transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      {/* Two-column: category on left, fields on right */}
      <div className="flex gap-6 flex-col lg:flex-row">
        {/* Left — category picker */}
        <div className="lg:w-[220px] flex-shrink-0">
          <label className="text-[10px] uppercase tracking-[0.08em] font-semibold text-text-muted block mb-2">Category</label>
          <div className="space-y-0.5">
            {CATEGORIES.map((c) => {
              const active = cat === c.value;
              return (
                <button
                  key={c.value} type="button"
                  onClick={() => { setCat(c.value); if (!name) setName(c.label); }}
                  className={`w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-all ${
                    active ? "bg-accent-light" : "hover:bg-surface-muted"
                  }`}
                >
                  <span className="flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center" style={{ background: active ? c.color : "var(--surface-muted)" }}>
                    <CatIcon value={c.value} size={14} color={active ? "#fff" : c.color} />
                  </span>
                  <span className={`text-[12px] font-medium ${active ? "text-text" : "text-text-sec"}`}>{c.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right — fields */}
        <div className="flex-1 space-y-4">
          <div>
            <label className="text-[10px] uppercase tracking-[0.08em] font-semibold text-text-muted block mb-1.5">Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} required placeholder="e.g. Retirement Fund" className="input-field !text-[13px] w-full" />
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-[0.08em] font-semibold text-text-muted block mb-1.5">Target ({currency})</label>
            <input type="number" value={target} onChange={(e) => setTarget(e.target.value)} min="1" max="1000000000000" step="any" required placeholder="1,000,000" className="input-field !text-[13px] font-mono w-full" />
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {AMOUNT_PRESETS.map((p) => (
                <button key={p.label} type="button" onClick={() => setTarget(String(p.value))}
                  className={`text-[10px] font-mono px-2.5 py-1 rounded-md border transition-all ${
                    Number(target) === p.value ? "border-accent bg-accent text-white" : "border-border text-text-muted hover:border-accent/30"
                  }`}
                >{p.label}</button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase tracking-[0.08em] font-semibold text-text-muted block mb-1.5">Monthly ({currency})</label>
              <input type="number" value={monthly} onChange={(e) => setMonthly(e.target.value)} min="0" step="any" placeholder="5,000" className="input-field !text-[13px] font-mono w-full" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.08em] font-semibold text-text-muted block mb-1.5">Target Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input-field !text-[13px] w-full" />
            </div>
          </div>

          {preview && (
            <div className="rounded-lg border border-border-light px-4 py-3">
              <p className="text-[12px] text-text-sec">
                Estimated <span className="font-semibold text-text">~{dur(preview.months)}</span> to goal <span className="text-text-muted">({shortDate(preview.date.toISOString())})</span>
              </p>
            </div>
          )}

          {err && <p className="text-[12px] text-danger bg-red-50 rounded-lg px-3 py-2">{err}</p>}

          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={pending || !cat} className="btn-primary !text-[13px] disabled:opacity-40">
              {pending ? "Creating..." : "Create Goal"}
            </button>
            <button type="button" onClick={onClose} className="btn-ghost !text-[13px]">Cancel</button>
          </div>
        </div>
      </div>
    </form>
  );
}

/* ─── Edit Goal Form ───────────────────────────────────────── */

function EditGoalForm({ goal, currency, onClose, onDone }) {
  const router = useRouter();
  const [name, setName]       = useState(goal.name);
  const [target, setTarget]   = useState(String(goal.target_amount));
  const [monthly, setMonthly] = useState(String(goal.monthly_contribution || 0));
  const [date, setDate]       = useState(goal.target_date || "");
  const [err, setErr]         = useState("");
  const [pending, start]      = useTransition();

  function submit(e) {
    e.preventDefault(); setErr("");
    start(async () => {
      const r = await updateGoal(goal.id, { name, targetAmount: parseFloat(target), monthlyContribution: parseFloat(monthly || "0"), targetDate: date || null });
      if (r?.error) setErr(r.error); else { router.refresh(); onDone?.(); }
    });
  }

  return (
    <form onSubmit={submit} className="flex flex-col h-full">
      <PanelHeader title={`Edit ${goal.name}`} subtitle={catFor(goal).label} onClose={onClose} />
      <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-4">
        <div>
          <label className="text-[10px] uppercase tracking-[0.08em] font-semibold text-text-muted block mb-1.5">Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} required className="input-field !text-[13px] w-full" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] uppercase tracking-[0.08em] font-semibold text-text-muted block mb-1.5">Target ({currency})</label>
            <input type="number" value={target} onChange={(e) => setTarget(e.target.value)} min="1" step="any" className="input-field !text-[13px] font-mono w-full" />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-[0.08em] font-semibold text-text-muted block mb-1.5">Monthly ({currency})</label>
            <input type="number" value={monthly} onChange={(e) => setMonthly(e.target.value)} min="0" step="any" className="input-field !text-[13px] font-mono w-full" />
          </div>
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-[0.08em] font-semibold text-text-muted block mb-1.5">Target Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input-field !text-[13px] w-full" />
        </div>
        {err && <p className="text-[12px] text-danger bg-red-50 rounded-lg px-3 py-2">{err}</p>}
      </div>
      <div className="border-t border-border p-6 flex gap-3">
        <button type="submit" disabled={pending} className="btn-primary flex-1 !text-[13px] disabled:opacity-40">{pending ? "Saving..." : "Save"}</button>
        <button type="button" onClick={onClose} className="btn-secondary !text-[13px] px-5">Cancel</button>
      </div>
    </form>
  );
}

/* ─── Add Money Form ───────────────────────────────────────── */

function AddMoneyForm({ goal, currency, onClose, onDone }) {
  const router = useRouter();
  const [val, setVal] = useState(goal.monthly_contribution > 0 ? String(goal.monthly_contribution) : "");
  const [err, setErr] = useState("");
  const [pending, start] = useTransition();
  const chips = [1000, 5000, 10000, 25000, 50000];
  const numVal = Number(val) || 0;
  const remaining = Math.max(0, Number(goal.target_amount) - Number(goal.current_saved) - numVal);
  const newPct = Math.min(100, ((Number(goal.current_saved) + numVal) / Number(goal.target_amount)) * 100);

  function submit(e) {
    e.preventDefault();
    if (numVal <= 0) return;
    setErr("");
    start(async () => {
      const r = await addToGoalSavings(goal.id, numVal);
      if (r?.error) setErr(r.error); else { router.refresh(); onDone?.(); }
    });
  }

  return (
    <form onSubmit={submit} className="flex flex-col h-full">
      <PanelHeader title={`Add to ${goal.name}`} subtitle={catFor(goal).label} onClose={onClose} />
      <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-5">
        {/* Before → After */}
        <div className="flex items-center justify-center gap-6 py-3">
          <div className="text-center">
            <RadialRing size={70} strokeWidth={5} progress={goal.progress} color={catFor(goal).color}>
              <p className="text-[12px] font-bold font-mono text-text">{Math.round(goal.progress)}%</p>
            </RadialRing>
            <p className="text-[9px] text-text-muted mt-1.5 uppercase tracking-wider font-semibold">Now</p>
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
          </svg>
          <div className="text-center">
            <RadialRing size={70} strokeWidth={5} progress={newPct} color={newPct >= 100 ? "#f59e0b" : catFor(goal).color}>
              <p className="text-[12px] font-bold font-mono text-text">{Math.round(newPct)}%</p>
            </RadialRing>
            <p className="text-[9px] text-text-muted mt-1.5 uppercase tracking-wider font-semibold">After</p>
          </div>
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-[0.08em] font-semibold text-text-muted block mb-2">Quick Add</label>
          <div className="flex gap-2 flex-wrap">
            {chips.map((c) => (
              <button key={c} type="button" onClick={() => setVal(String(c))}
                className={`text-[11px] font-mono px-3 py-1.5 rounded-md border transition-all ${
                  numVal === c ? "border-accent bg-accent text-white" : "border-border text-text-sec hover:border-accent/40"
                }`}
              >+{(c / 1000).toFixed(0)}K</button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-[0.08em] font-semibold text-text-muted block mb-1.5">Amount ({currency})</label>
          <input type="number" value={val} onChange={(e) => setVal(e.target.value)} autoFocus min="1" step="any" placeholder="Enter amount" className="input-field !text-[14px] font-mono w-full" />
        </div>

        {numVal > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-lg bg-surface-muted border border-border-light p-4 space-y-1.5 text-[12px]">
            <div className="flex justify-between"><span className="text-text-muted">Current</span><span className="font-mono font-semibold text-text">{formatCurrency(goal.current_saved, currency)}</span></div>
            <div className="flex justify-between"><span className="text-text-muted">Adding</span><span className="font-mono font-semibold text-accent">+{formatCurrency(numVal, currency)}</span></div>
            <div className="border-t border-border-light pt-1.5 flex justify-between"><span className="text-text-muted">Remaining</span><span className="font-mono font-semibold text-text">{formatCurrency(remaining, currency)}</span></div>
          </motion.div>
        )}

        {err && <p className="text-[12px] text-danger bg-red-50 rounded-lg px-3 py-2">{err}</p>}
      </div>
      <div className="border-t border-border p-6 flex gap-3">
        <button type="submit" disabled={pending || numVal <= 0} className="btn-primary flex-1 !text-[13px] disabled:opacity-40">
          {pending ? "Adding..." : `Add ${numVal > 0 ? formatCurrency(numVal, currency) : "Money"}`}
        </button>
        <button type="button" onClick={onClose} className="btn-secondary !text-[13px] px-5">Cancel</button>
      </div>
    </form>
  );
}

/* ─── Empty State ──────────────────────────────────────────── */

function EmptyState({ currency, monthlyExpenses, onPreset, onBlank }) {
  const suggestions = [
    { category: "emergency_fund", name: "Emergency Fund", desc: "3 months of expenses for the unexpected.", target: monthlyExpenses > 0 ? Math.round(monthlyExpenses * 3) : 300_000, color: "#e11d48" },
    { category: "retirement", name: "Retirement", desc: "Long-term wealth for financial freedom.", target: 10_000_000, color: "#8b5cf6" },
    { category: "house", name: "Home Down Payment", desc: "20% down on your future home.", target: 2_000_000, color: "#3b82f6" },
  ];

  return (
    <div className="flex flex-col items-center text-center py-20">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-6 mx-auto">
          <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
        </svg>
      </motion.div>
      <motion.h2 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="text-[22px] font-bold text-text tracking-tight mb-2">
        What are you saving for?
      </motion.h2>
      <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="text-[14px] text-text-sec max-w-md mb-10 leading-relaxed">
        Set a financial goal, add a monthly contribution, and we&apos;ll track your progress.
      </motion.p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl mb-8">
        {suggestions.map((s, i) => (
          <motion.button key={s.category} type="button"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.06, type: "spring", damping: 25 }}
            whileHover={{ y: -2 }}
            onClick={() => onPreset(s)}
            className="group relative rounded-xl border border-border bg-white p-5 text-left transition-shadow duration-200 hover:shadow-card-hover overflow-hidden"
          >
            <div className="h-[3px] absolute top-0 left-0 right-0" style={{ background: s.color }} />
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg mb-2 mt-1" style={{ background: s.color + "12" }}>
              <CatIcon value={s.category} size={16} color={s.color} />
            </span>
            <h4 className="text-[14px] font-semibold text-text mb-1">{s.name}</h4>
            <p className="text-[11px] text-text-muted leading-relaxed mb-3">{s.desc}</p>
            <p className="text-[14px] font-mono font-bold text-text">{formatCurrency(s.target, currency)}</p>
          </motion.button>
        ))}
      </div>

      <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
        type="button" onClick={onBlank} className="text-[13px] text-accent font-medium hover:underline">
        or create a custom goal
      </motion.button>
    </div>
  );
}

/* ─── Root ─────────────────────────────────────────────────── */

export default function GoalsClient({ goals, currency, monthlyExpenses, monthlyIncome }) {
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [prefill, setPrefill] = useState(null);
  const [panel, setPanel] = useState({ mode: null, goal: null });

  const openCreate = useCallback((pre = null) => { setPrefill(pre); setShowCreate(true); }, []);
  const closeCreate = useCallback(() => { setShowCreate(false); setPrefill(null); }, []);
  const openPanel = useCallback((mode, goal = null) => setPanel({ mode, goal }), []);
  const closePanel = useCallback(() => setPanel({ mode: null, goal: null }), []);
  const onDone = useCallback(() => { closePanel(); router.refresh(); }, [closePanel, router]);

  const hasGoals = goals.length > 0;

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="flex items-center justify-between mb-5">
        <div>
          <h1 className="page-title">Goals</h1>
          <p className="text-[13px] text-text-sec mt-1">Track targets. Simulate scenarios. Stay on course.</p>
        </div>
        {hasGoals && !showCreate && (
          <button onClick={() => openCreate()} className="btn-primary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New Goal
          </button>
        )}
      </motion.div>

      {/* Create form — inline on the page, not a panel */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <InlineCreateForm
              currency={currency}
              prefill={prefill}
              onClose={closeCreate}
              onCreated={() => { closeCreate(); router.refresh(); }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {hasGoals && <GoalsHero goals={goals} currency={currency} monthlyIncome={monthlyIncome} monthlyExpenses={monthlyExpenses} />}
      {hasGoals && <InsightsStrip goals={goals} currency={currency} monthlyIncome={monthlyIncome} />}

      {!hasGoals && !showCreate ? (
        <EmptyState currency={currency} monthlyExpenses={monthlyExpenses} onPreset={(p) => openCreate(p)} onBlank={() => openCreate()} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((g, i) => (
            <GoalCard key={g.id} goal={g} currency={currency} index={i} onAction={openPanel} onRefresh={() => router.refresh()} />
          ))}
        </div>
      )}

      {/* Edit / Add Money — slide-over for contextual actions */}
      <AnimatePresence>
        {panel.mode && <SlideOver mode={panel.mode} goal={panel.goal} prefill={null} currency={currency} onClose={closePanel} onDone={onDone} />}
      </AnimatePresence>
    </div>
  );
}
