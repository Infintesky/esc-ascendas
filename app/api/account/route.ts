import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/auth/supabase-server";
import { getCurrentUserId } from "@/lib/auth/session";
import { deleteUserData } from "@/lib/account/gdpr";

export async function DELETE(_request: Request) {
  const supabase = await createServerSupabase();
  const userId = await getCurrentUserId(supabase);
  if (!userId) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }
  await deleteUserData(userId);
  return NextResponse.json({ deleted: true });
}
