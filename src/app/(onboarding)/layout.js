import { AuthProvider } from "@/features/auth/AuthProvider";
import { createClient } from "@/lib/supabase/server";

export default async function OnboardingLayout({ children }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <AuthProvider initialUser={user}>
      <div className="min-h-screen bg-surface">
        <div className="max-w-2xl mx-auto px-4 py-12">
          {children}
        </div>
      </div>
    </AuthProvider>
  );
}
