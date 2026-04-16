import { redirect } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { AuthProvider } from "@/features/auth/AuthProvider";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/features/profile/queries";

export default async function AppLayout({ children }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Gate: redirect to onboarding if profile not completed
  if (user) {
    const profile = await getProfile();
    if (!profile?.onboarding_completed) {
      redirect("/onboarding");
    }
  }

  return (
    <AuthProvider initialUser={user}>
      <AppShell>{children}</AppShell>
    </AuthProvider>
  );
}
