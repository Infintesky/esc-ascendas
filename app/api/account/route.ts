import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth/require-user";
import { deleteUserData } from "@/lib/account/gdpr";

export async function DELETE(_request: Request) {
  const { userId, response } = await requireUserId();
  if (response) return response;
  await deleteUserData(userId);
  return NextResponse.json({ deleted: true });
}
