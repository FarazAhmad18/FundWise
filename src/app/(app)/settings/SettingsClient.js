"use client";

import { useState, useTransition } from "react";
import { SUPPORTED_COUNTRIES } from "@/constants/markets";
import { updateProfile } from "@/features/profile/actions";
import { logout } from "@/features/auth/actions";

const RISK_LABELS = {
  conservative: "Conservative",
  moderate: "Moderate",
  aggressive: "Aggressive",
};

const EXP_LABELS = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export default function SettingsClient({ user, profile, marketName, exchangeName }) {
  const [riskLevel, setRiskLevel] = useState(profile?.risk_level || "moderate");
  const [experience, setExperience] = useState(profile?.investment_experience || "beginner");
  const [country, setCountry] = useState(profile?.country_code || "US");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function handleSave() {
    setSaved(false);
    setError("");
    startTransition(async () => {
      const result = await updateProfile({
        countryCode: country,
        riskLevel,
        investmentExperience: experience,
      });
      if (result?.error) {
        setError(result.error);
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    });
  }

  const currentCountry = SUPPORTED_COUNTRIES.find((c) => c.code === country);

  return (
    <div className="page-container animate-fade-in">
      <div className="mb-8">
        <h1 className="page-title">Settings</h1>
        <p className="text-text-sec mt-1.5">Your account and preferences.</p>
      </div>

      <div className="max-w-2xl space-y-5">
        {/* Account */}
        <div className="card">
          <h2 className="text-[15px] font-semibold text-text mb-4">Account</h2>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-medium text-text-sec mb-1.5">
                Name
              </label>
              <div className="input-field bg-surface text-text">
                {user.name || "Not set"}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-sec mb-1.5">
                Email
              </label>
              <div className="input-field bg-surface text-text-sec">
                {user.email}
              </div>
            </div>
          </div>
        </div>

        {/* Market & Region */}
        <div className="card">
          <h2 className="text-[15px] font-semibold text-text mb-4">
            Market & Region
          </h2>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-medium text-text-sec mb-1.5">
                Country
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="input-field"
              >
                {SUPPORTED_COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.name} ({c.currency})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center justify-between py-1">
              <div>
                <p className="text-sm font-medium text-text">Exchange</p>
                <p className="text-xs text-text-muted">{exchangeName}</p>
              </div>
              <span className="badge bg-accent-light text-accent-text">
                {currentCountry?.currency || "USD"}
              </span>
            </div>
          </div>
        </div>

        {/* Investing Profile */}
        <div className="card">
          <h2 className="text-[15px] font-semibold text-text mb-4">
            Investing Profile
          </h2>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-medium text-text-sec mb-1.5">
                Risk Tolerance
              </label>
              <div className="flex gap-2">
                {Object.entries(RISK_LABELS).map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => setRiskLevel(value)}
                    className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all ${
                      riskLevel === value
                        ? "border-accent bg-accent-light text-accent-text"
                        : "border-border text-text-sec hover:border-accent/40"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-sec mb-1.5">
                Experience
              </label>
              <div className="flex gap-2">
                {Object.entries(EXP_LABELS).map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => setExperience(value)}
                    className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all ${
                      experience === value
                        ? "border-accent bg-accent-light text-accent-text"
                        : "border-border text-text-sec hover:border-accent/40"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Save */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={pending}
            className="btn-primary !py-2.5 !px-6 disabled:opacity-50"
          >
            {pending ? "Saving..." : "Save Changes"}
          </button>
          {saved && (
            <span className="text-sm text-success font-medium animate-fade-in">
              Saved
            </span>
          )}
          {error && (
            <span className="text-sm text-danger font-medium">{error}</span>
          )}
        </div>

        {/* Danger Zone */}
        <div className="card border-danger/20">
          <h2 className="text-[15px] font-semibold text-danger mb-4">
            Danger Zone
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text">Sign out</p>
              <p className="text-xs text-text-muted">
                Sign out of your account on this device
              </p>
            </div>
            <form action={logout}>
              <button
                type="submit"
                className="text-sm font-medium text-danger hover:underline"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
