import { NextResponse } from "next/server";
import { createServerSupabase } from "./supabase-server";
import { getCurrentUserId } from "./session";

// Shared auth guard for account routes. On success returns the user id; on
// failure returns a ready-to-send 401 so every route responds consistently.
//   const { userId, response } = await requireUserId();
//   if (!userId) return response;
export async function requireUserId(): Promise<
  { userId: string; response: null } | { userId: null; response: NextResponse }
> {
  const supabase = await createServerSupabase();
  const userId = await getCurrentUserId(supabase);
  if (!userId) {
    return {
      userId: null,
      response: NextResponse.json({ error: "unauthenticated" }, { status: 401 }),
    };
  }
  return { userId, response: null };
}
