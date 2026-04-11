import { createClient } from "@/lib/supabase/server";

/**
 * Load conversation history for a workspace as an interleaved array
 * of user/assistant messages sorted by time. Each query row is paired
 * with its most recent answer (if any).
 */
export async function listMessages(workspaceId) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("queries")
    .select(
      `
      id,
      query_text,
      mode,
      created_at,
      answers(id, answer_text, sources_json, created_at)
      `
    )
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("listMessages error:", error);
    return [];
  }

  const messages = [];
  for (const q of data ?? []) {
    messages.push({
      role: "user",
      id: `q-${q.id}`,
      text: q.query_text,
      mode: q.mode,
      createdAt: q.created_at,
    });

    const latestAnswer = (q.answers ?? []).sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    )[0];

    if (latestAnswer) {
      messages.push({
        role: "assistant",
        id: `a-${latestAnswer.id}`,
        text: latestAnswer.answer_text,
        sources: latestAnswer.sources_json ?? [],
        createdAt: latestAnswer.created_at,
      });
    }
  }

  return messages;
}
