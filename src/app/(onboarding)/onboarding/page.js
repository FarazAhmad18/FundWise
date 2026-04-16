import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/features/profile/queries";
import OnboardingClient from "./OnboardingClient";

export const metadata = {
  title: "Get Started | Fundwise",
};

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // If already onboarded, go to dashboard
  const profile = await getProfile();
  if (profile?.onboarding_completed) redirect("/dashboard");

  const userName =
    user.user_metadata?.full_name ||
    user.user_metadata?.first_name ||
    user.email?.split("@")[0] ||
    "there";

  return <OnboardingClient userName={userName} existingProfile={profile} />;
}
