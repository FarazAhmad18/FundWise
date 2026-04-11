"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { chunkText, htmlToText } from "@/lib/parsing/chunk";

async function fetchUrlText(url) {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; p1FinanceBot/0.1; +https://p1finance.local)",
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      return { error: `Fetch failed: ${res.status} ${res.statusText}` };
    }

    const contentType = res.headers.get("content-type") ?? "";
    const html = await res.text();
    const text = contentType.includes("html") ? htmlToText(html) : html.trim();

    if (!text) return { error: "No readable text found at URL" };

    return { text };
  } catch (err) {
    return { error: `Fetch error: ${err.message}` };
  }
}

export async function addSource(workspaceId, formData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };
  if (!workspaceId) return { error: "Workspace required" };

  const sourceType = formData.get("sourceType")?.toString();
  const title = formData.get("title")?.toString().trim();
  const url = formData.get("url")?.toString().trim() || null;
  const pastedText = formData.get("text")?.toString().trim() || null;
  const publisher = formData.get("publisher")?.toString().trim() || null;

  if (!title) return { error: "Title is required" };
  if (sourceType !== "live_url" && sourceType !== "pasted_note") {
    return { error: "Invalid source type" };
  }

  let cleanText = null;
  let fetchError = null;

  if (sourceType === "pasted_note") {
    if (!pastedText) return { error: "Text is required for pasted notes" };
    cleanText = pastedText;
  } else {
    if (!url) return { error: "URL is required for live URL sources" };
    const result = await fetchUrlText(url);
    if (result.error) {
      fetchError = result.error;
    } else {
      cleanText = result.text;
    }
  }

  const { data: source, error: sourceErr } = await supabase
    .from("sources")
    .insert({
      workspace_id: workspaceId,
      source_type: sourceType,
      title,
      url,
      publisher,
      raw_text: cleanText,
      clean_text: cleanText,
      status: fetchError ? "failed" : cleanText ? "ingested" : "pending",
    })
    .select("id")
    .single();

  if (sourceErr) return { error: sourceErr.message };

  if (cleanText) {
    const chunks = chunkText(cleanText);
    if (chunks.length > 0) {
      const rows = chunks.map((content, index) => ({
        source_id: source.id,
        workspace_id: workspaceId,
        chunk_index: index,
        content,
        metadata_json: { title, publisher, url },
      }));

      const { error: chunkErr } = await supabase
        .from("source_chunks")
        .insert(rows);

      if (chunkErr) {
        console.error("chunk insert error:", chunkErr);
      }
    }
  }

  // Touch workspace updated_at so it bubbles to top of dashboard
  await supabase
    .from("workspaces")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", workspaceId);

  revalidatePath(`/workspace/${workspaceId}`);
  revalidatePath("/dashboard");

  if (fetchError) {
    return { warning: `Source saved but fetch failed: ${fetchError}` };
  }
  return { success: true };
}

export async function deleteSource(sourceId, workspaceId) {
  const supabase = await createClient();

  const { error } = await supabase.from("sources").delete().eq("id", sourceId);

  if (error) return { error: error.message };

  revalidatePath(`/workspace/${workspaceId}`);
  return { success: true };
}
