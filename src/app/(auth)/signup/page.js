"use client";

import Link from "next/link";
import { useState } from "react";
import { signup } from "@/features/auth/actions";

export default function SignupPage() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.target);
    const result = await signup(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-[400px] animate-slide-up">
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2 mb-6">
          <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 21H4a1 1 0 01-1-1V3" />
              <path d="M7 14l4-4 4 4 5-5" />
            </svg>
          </div>
        </Link>
        <h1 className="text-[22px] font-bold text-text tracking-tight mb-1.5">
          Create your account
        </h1>
        <p className="text-sm text-text-sec">
          Free to use. Takes 30 seconds.
        </p>
      </div>

      <div className="card-elevated">
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-danger-light text-danger text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text mb-1.5">
                First name
              </label>
              <input type="text" name="firstName" required className="input-field" placeholder="John" />
            </div>
            <div>
              <label className="block text-xs font-medium text-text mb-1.5">
                Last name
              </label>
              <input type="text" name="lastName" required className="input-field" placeholder="Doe" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-text mb-1.5">
              Email address
            </label>
            <input
              type="email"
              name="email"
              required
              className="input-field"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text mb-1.5">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              minLength={8}
              className="input-field"
              placeholder="Minimum 8 characters"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full !py-2.5 mt-1 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
                Creating account...
              </span>
            ) : (
              <>
                Create Account
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </>
            )}
          </button>
        </form>

        <p className="text-[11px] text-text-muted text-center mt-4 leading-relaxed">
          By creating an account, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>

      <p className="text-center text-[13px] text-text-sec mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-accent font-semibold hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
