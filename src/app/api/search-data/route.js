import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/features/profile/queries";
import { getMarketConfig } from "@/constants/markets";
import { listWatchlist } from "@/features/watchlist/queries";

/**
 * Lightweight endpoint for the command palette.
 * Returns the current user's watchlist + popular stocks for their market.
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ watchlist: [], popularTickers: [] });
  }

  const profile = await getProfile();
  const marketConfig = getMarketConfig(profile?.country_code);

  const watchlist = await listWatchlist();

  return NextResponse.json(
    {
      watchlist: watchlist.map((w) => ({
        ticker: w.company?.ticker || w.ticker,
        name: w.company?.name || w.name,
      })),
      popularTickers: marketConfig.popularTickers,
    },
    {
      headers: { "Cache-Control": "private, max-age=60" },
    }
  );
}
