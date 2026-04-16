"use client";

import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import ChartMount from "@/components/ui/ChartMount";
import { formatCurrency } from "@/constants/markets";

function project({ initial, monthly, years, annualRate }) {
  const points = [];
  const r = annualRate / 100 / 12;
  let balance = initial;
  let contributed = initial;

  points.push({ year: 0, balance, contributed, growth: 0 });

  for (let y = 1; y <= years; y++) {
    for (let m = 0; m < 12; m++) {
      balance = balance * (1 + r) + monthly;
      contributed += monthly;
    }
    points.push({
      year: y,
      balance: Math.round(balance),
      contributed: Math.round(contributed),
      growth: Math.round(balance - contributed),
    });
  }
  return points;
}

function NumberInput({ label, value, onChange, prefix, suffix, step = 1, min = 0 }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
        {label}
      </span>
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-white focus-within:border-accent focus-within:shadow-[0_0_0_3px_var(--accent-light)] transition-all">
        {prefix && <span className="text-[13px] text-text-muted font-medium">{prefix}</span>}
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          step={step}
          min={min}
          className="flex-1 bg-transparent outline-none text-[14px] font-semibold text-text w-full min-w-0"
        />
        {suffix && <span className="text-[12px] text-text-muted font-medium">{suffix}</span>}
      </div>
    </label>
  );
}

export default function ScenarioSimulator({ currency = "USD", defaultMonthly = 500 }) {
  const [initial, setInitial] = useState(0);
  const [monthly, setMonthly] = useState(defaultMonthly);
  const [years, setYears] = useState(20);
  const [rate, setRate] = useState(8);

  const points = useMemo(
    () => project({ initial, monthly, years, annualRate: rate }),
    [initial, monthly, years, rate]
  );

  const final = points[points.length - 1];
  const compact = (n) => {
    if (Math.abs(n) >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
    if (Math.abs(n) >= 1e3) return `${(n / 1e3).toFixed(0)}k`;
    return String(n);
  };

  return (
    <div className="rounded-2xl border border-border bg-white overflow-hidden">
      <div className="p-5 border-b border-border-light bg-gradient-to-br from-accent-light/40 to-white">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.15em] mb-1">
              Scenario simulator
            </p>
            <h3 className="text-[16px] font-bold text-text tracking-tight">
              What could consistent investing become?
            </h3>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">
              In {years} years
            </p>
            <p className="text-[22px] font-bold text-text tracking-tight font-mono">
              {formatCurrency(final.balance, currency)}
            </p>
            <p className="text-[11px] text-emerald-600 font-semibold">
              +{formatCurrency(final.growth, currency)} growth
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <NumberInput
            label="Starting amount"
            value={initial}
            onChange={setInitial}
            prefix={currency}
            step={100}
          />
          <NumberInput
            label="Monthly contribution"
            value={monthly}
            onChange={setMonthly}
            prefix={currency}
            step={50}
          />
          <NumberInput
            label="Years"
            value={years}
            onChange={(v) => setYears(Math.max(1, Math.min(50, v)))}
            suffix="yrs"
            min={1}
          />
          <NumberInput
            label="Annual return"
            value={rate}
            onChange={(v) => setRate(Math.max(0, Math.min(30, v)))}
            suffix="%"
            step={0.5}
          />
        </div>

        <ChartMount
          className="h-[220px]"
          fallback={<div className="h-full rounded-xl bg-surface-muted animate-pulse" />}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={points} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="simGrowth" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="simContrib" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#94a3b8" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#94a3b8" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
              <XAxis
                dataKey="year"
                tickFormatter={(v) => `Y${v}`}
                stroke="var(--text-muted)"
                fontSize={10}
              />
              <YAxis
                tickFormatter={compact}
                stroke="var(--text-muted)"
                fontSize={10}
                width={48}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid var(--border)",
                  fontSize: 12,
                }}
                formatter={(value, name) => [
                  formatCurrency(value, currency),
                  name === "balance" ? "Balance" : name === "contributed" ? "Contributed" : "Growth",
                ]}
                labelFormatter={(l) => `Year ${l}`}
              />
              <Area
                type="monotone"
                dataKey="contributed"
                stroke="#94a3b8"
                strokeWidth={1.5}
                fill="url(#simContrib)"
              />
              <Area
                type="monotone"
                dataKey="balance"
                stroke="var(--accent)"
                strokeWidth={2}
                fill="url(#simGrowth)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartMount>

        <div className="grid grid-cols-3 gap-3 pt-2 border-t border-border-light">
          <div>
            <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold mb-0.5">
              You put in
            </p>
            <p className="text-[14px] font-bold text-text font-mono">
              {formatCurrency(final.contributed, currency)}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold mb-0.5">
              Grew by
            </p>
            <p className="text-[14px] font-bold text-emerald-600 font-mono">
              +{formatCurrency(final.growth, currency)}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold mb-0.5">
              Final value
            </p>
            <p className="text-[14px] font-bold text-text font-mono">
              {formatCurrency(final.balance, currency)}
            </p>
          </div>
        </div>

        <p className="text-[11px] text-text-muted leading-relaxed">
          Projection assumes a constant {rate}% annual return and steady monthly contributions.
          Real markets are volatile — this is a planning tool, not a prediction.
        </p>
      </div>
    </div>
  );
}
