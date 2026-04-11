"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { chatCompletion } from "@/lib/ai/groq";

const MAX_CONTEXT_CHUNKS = 20;
const MAX_CONTEXT_CHARS = 12000;

function buildSystemPrompt(contextBlocks) {
  const contextText = contextBlocks
    .map(
      (c, i) =>
        `[Source ${i + 1}] ${c.title ?? "Untitled"}${
          c.publisher ? ` (${c.publisher})` : ""
        }\n${c.content}`
    )
    .join("\n\n---\n\n");

  return `You are a financial research assistant. Answer the user's question using ONLY the sources provided below. Cite sources inline using [Source N] notation matching the provided sources.

If the sources don't contain enough information to answer, say so explicitly. Do not fabricate facts.

Be concise, analytical, and direct. Use markdown for structure when helpful (headers, bullets, bold).

SOURCES:
${contextText || "(no sources available in this workspace yet)"}`;
}

async function retrieveContext(supabase, workspaceId) {
  const { data, error } = await supabase
    .from("source_chunks")
    .select("content, metadata_json, source:sources(title, publisher, url)")
    .eq("workspace_id", workspaceId)
    .order("chunk_index", { ascending: true })
    .limit(MAX_CONTEXT_CHUNKS);

  if (error) {
    console.error("retrieveContext error:", error);
    return [];
  }

  let charBudget = MAX_CONTEXT_CHARS;
  const kept = [];
  for (const row of data ?? []) {
    if (charBudget <= 0) break;
    const slice = row.content.slice(0, charBudget);
    kept.push({
      content: slice,
      title: row.source?.title ?? row.metadata_json?.title,
      publisher: row.source?.publisher ?? row.metadata_json?.publisher,
      url: row.source?.url ?? row.metadata_json?.url,
    });
    charBudget -= slice.length;
  }
  return kept;
}

export async function askQuestion(workspaceId, queryText, mode = "hybrid") {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };
  if (!workspaceId) return { error: "Workspace required" };

  const trimmed = queryText?.toString().trim();
  if (!trimmed) return { error: "Question cannot be empty" };
  if (trimmed.length > 2000) return { error: "Question too long (max 2000 chars)" };

  const validModes = ["live", "knowledge_base", "hybrid"];
  const normalizedMode = validModes.includes(mode) ? mode : "hybrid";

  // Save the query row first so we have it even if LLM fails
  const { data: queryRow, error: queryErr } = await supabase
    .from("queries")
    .insert({
      workspace_id: workspaceId,
      user_id: user.id,
      query_text: trimmed,
      mode: normalizedMode,
    })
    .select("id")
    .single();

  if (queryErr) return { error: queryErr.message };

  // Retrieve context. Live web mode is not yet implemented — falls back to
  // workspace sources until a web search provider is wired in.
  const contextBlocks = await retrieveContext(supabase, workspaceId);

  const systemPrompt = buildSystemPrompt(contextBlocks);

  let answerText;
  let llmError = null;
  try {
    const result = await chatCompletion({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: trimmed },
      ],
      temperature: 0.3,
      maxTokens: 1024,
    });
    answerText = result.content;
  } catch (err) {
    llmError = err.message;
    answerText = `Sorry, I hit an error generating the answer: ${err.message}`;
  }

  const sourcesJson = contextBlocks.map((c, i) => ({
    index: i + 1,
    title: c.title,
    publisher: c.publisher,
    url: c.url,
  }));

  const { data: answerRow, error: answerErr } = await supabase
    .from("answers")
    .insert({
      query_id: queryRow.id,
      answer_text: answerText,
      sources_json: sourcesJson,
      evidence_json: [],
    })
    .select("id, answer_text, sources_json, created_at")
    .single();

  if (answerErr) {
    return { error: answerErr.message };
  }

  // Touch workspace updated_at
  await supabase
    .from("workspaces")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", workspaceId);

  revalidatePath(`/workspace/${workspaceId}`);
  revalidatePath("/dashboard");

  return {
    success: true,
    queryId: queryRow.id,
    answerId: answerRow.id,
    answerText,
    sources: sourcesJson,
    createdAt: answerRow.created_at,
    llmError,
    hadContext: contextBlocks.length > 0,
  };
}
