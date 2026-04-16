import { createClient } from "@/lib/supabase/server";

export async function getProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error) return null;
  return data;
}

export async function hasCompletedOnboarding() {
  const profile = await getProfile();
  return profile?.onboarding_completed === true;
}
