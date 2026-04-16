import { createClient } from "@/lib/supabase/server";

export async function listConversations() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("conversations")
    .select("id, title, created_at, updated_at")
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("listConversations error:", error);
    return [];
  }

  return data ?? [];
}

export async function getConversation(conversationId) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("conversations")
    .select("id, title, created_at")
    .eq("id", conversationId)
    .single();

  if (error) return null;
  return data;
}

export async function listMessages(conversationId) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("messages")
    .select("id, role, content, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("listMessages error:", error);
    return [];
  }

  return data ?? [];
}
