"use client";

import Link from "next/link";
import { useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import { createWorkspace } from "@/features/workspaces/actions";

export default function NewWorkspacePage() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.target);
    const result = await createWorkspace(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="page-container animate-fade-in">
      <PageHeader
        title="New Workspace"
        description="Create a research workspace to organize sources, queries, and reports."
      />

      <div className="max-w-xl">
        <div className="card-elevated">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-danger-light text-danger text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-xs font-medium text-text mb-1.5">
                Workspace name
              </label>
              <input
                type="text"
                name="name"
                required
                maxLength={120}
                autoFocus
                className="input-field"
                placeholder="e.g. Tesla Deep Dive"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text mb-1.5">
                Description
                <span className="text-text-muted font-normal ml-1">(optional)</span>
              </label>
              <textarea
                name="description"
                rows={3}
                maxLength={500}
                className="input-field resize-none"
                placeholder="What's this workspace for?"
              />
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                    </svg>
                    Creating...
                  </span>
                ) : (
                  "Create Workspace"
                )}
              </button>
              <Link href="/dashboard" className="btn-ghost">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
