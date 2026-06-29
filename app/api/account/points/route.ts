import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/auth/supabase-server";
import { getCurrentUserId } from "@/lib/auth/session";
import { getBalance, getHistory } from "@/lib/points/service";

export async function GET(_request: Request) {
  const supabase = await createServerSupabase();
  const userId = await getCurrentUserId(supabase);
  if (!userId) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }
  const [balance, history] = await Promise.all([getBalance(userId), getHistory(userId)]);
  return NextResponse.json({ balance, history });
}
