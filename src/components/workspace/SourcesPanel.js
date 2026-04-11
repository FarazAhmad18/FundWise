"use client";

import { useState, useTransition } from "react";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import { addSource, deleteSource } from "@/features/sources/actions";

const TYPE_COLORS = {
  live_url: "cyan",
  pasted_note: "amber",
  generated_report: "emerald",
  filing: "purple",
};

const STATUS_COLORS = {
  pending: "gray",
  processing: "blue",
  ingested: "emerald",
  failed: "red",
};

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function SourcesPanel({ workspaceId, initialSources }) {
  const [sources, setSources] = useState(initialSources);
  const [showForm, setShowForm] = useState(false);
  const [sourceType, setSourceType] = useState("live_url");
  const [error, setError] = useState(null);
  const [warning, setWarning] = useState(null);
  const [pending, startTransition] = useTransition();

  async function handleAdd(e) {
    e.preventDefault();
    setError(null);
    setWarning(null);

    const form = e.target;
    const formData = new FormData(form);
    formData.set("sourceType", sourceType);

    startTransition(async () => {
      const result = await addSource(workspaceId, formData);
      if (result?.error) {
        setError(result.error);
        return;
      }
      if (result?.warning) setWarning(result.warning);

      // Optimistic refresh: just reload server data via a minimal client fetch
      // In practice, revalidatePath handles the server re-render. For the
      // panel state we bump a local placeholder; the parent re-renders on
      // next navigation. Simplest approach: close the form.
      form.reset();
      setShowForm(false);

      // Force a router refresh to pull new sources from the server.
      if (typeof window !== "undefined") {
        window.location.reload();
      }
    });
  }

  function handleDelete(sourceId) {
    if (!confirm("Delete this source?")) return;
    setSources((prev) => prev.filter((s) => s.id !== sourceId));
    startTransition(async () => {
      const result = await deleteSource(sourceId, workspaceId);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-text-muted uppercase tracking-wider font-semibold">
          {sources.length} {sources.length === 1 ? "source" : "sources"}
        </p>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="text-xs text-accent font-medium hover:underline"
        >
          {showForm ? "Cancel" : "+ Add"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="card flex flex-col gap-3">
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setSourceType("live_url")}
              className={`flex-1 text-[11px] font-medium py-1.5 rounded-md border transition-colors ${
                sourceType === "live_url"
                  ? "border-accent bg-accent-light text-accent-text"
                  : "border-border text-text-sec hover:bg-surface-muted"
              }`}
            >
              URL
            </button>
            <button
              type="button"
              onClick={() => setSourceType("pasted_note")}
              className={`flex-1 text-[11px] font-medium py-1.5 rounded-md border transition-colors ${
                sourceType === "pasted_note"
                  ? "border-accent bg-accent-light text-accent-text"
                  : "border-border text-text-sec hover:bg-surface-muted"
              }`}
            >
              Pasted text
            </button>
          </div>

          <input
            name="title"
            required
            maxLength={200}
            placeholder="Title"
            className="input-field !py-1.5 !text-xs"
          />

          {sourceType === "live_url" ? (
            <input
              name="url"
              type="url"
              required
              placeholder="https://..."
              className="input-field !py-1.5 !text-xs"
            />
          ) : (
            <textarea
              name="text"
              required
              rows={5}
              maxLength={50000}
              placeholder="Paste article text, note, or research..."
              className="input-field !py-1.5 !text-xs resize-none"
            />
          )}

          <input
            name="publisher"
            maxLength={100}
            placeholder="Publisher (optional)"
            className="input-field !py-1.5 !text-xs"
          />

          {error && (
            <p className="text-[11px] text-danger">{error}</p>
          )}
          {warning && (
            <p className="text-[11px] text-warn">{warning}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="btn-primary !py-1.5 !text-xs disabled:opacity-50"
          >
            {pending ? "Adding..." : "Add source"}
          </button>
        </form>
      )}

      {sources.length === 0 && !showForm ? (
        <EmptyState
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-sec)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
            </svg>
          }
          title="No sources yet"
          description="Add a URL or paste text to ground answers in real research."
        />
      ) : (
        sources.map((s) => (
          <div key={s.id} className="card group">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                <Badge color={TYPE_COLORS[s.source_type] ?? "gray"}>
                  {s.source_type.replace("_", " ")}
                </Badge>
                <Badge color={STATUS_COLORS[s.status] ?? "gray"}>
                  {s.status}
                </Badge>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-text-muted whitespace-nowrap">
                  {formatDate(s.created_at)}
                </span>
                <button
                  type="button"
                  onClick={() => handleDelete(s.id)}
                  className="text-text-muted hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>

            <h4 className="text-[12.5px] font-semibold text-text leading-snug line-clamp-2 mb-1">
              {s.title}
            </h4>

            {s.publisher && (
              <p className="text-[11px] text-text-muted">{s.publisher}</p>
            )}

            {s.url && (
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-accent truncate block mt-1 hover:underline"
              >
                {s.url}
              </a>
            )}
          </div>
        ))
      )}
    </div>
  );
}
