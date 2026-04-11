import AppShell from "@/components/layout/AppShell";
import { AuthProvider } from "@/features/auth/AuthProvider";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({ children }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <AuthProvider initialUser={user}>
      <AppShell>{children}</AppShell>
    </AuthProvider>
  );
}
