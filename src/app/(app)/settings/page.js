import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/features/profile/queries";
import { getMarketConfig } from "@/constants/markets";
import SettingsClient from "./SettingsClient";

export const metadata = {
  title: "Settings | Fundwise",
};

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const profile = await getProfile();
  const marketConfig = profile?.country_code
    ? getMarketConfig(profile.country_code)
    : null;

  return (
    <SettingsClient
      user={{
        email: user?.email || "",
        name: user?.user_metadata?.full_name || "",
      }}
      profile={profile}
      marketName={marketConfig?.name || "United States"}
      exchangeName={marketConfig?.exchangeName || "NYSE / NASDAQ"}
    />
  );
}
