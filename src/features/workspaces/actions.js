"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createWorkspace(formData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const name = formData.get("name")?.toString().trim();
  const description = formData.get("description")?.toString().trim() || null;

  if (!name) {
    return { error: "Workspace name is required" };
  }

  const { data, error } = await supabase
    .from("workspaces")
    .insert({ user_id: user.id, name, description })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  redirect(`/workspace/${data.id}`);
}

export async function deleteWorkspace(id) {
  const supabase = await createClient();

  const { error } = await supabase.from("workspaces").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { success: true };
}
