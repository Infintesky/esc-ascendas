import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth/require-user";
import { getBalance, getHistory } from "@/lib/points/service";

export async function GET(_request: Request) {
  const { userId, response } = await requireUserId();
  if (response) return response;
  const [balance, history] = await Promise.all([getBalance(userId), getHistory(userId)]);
  return NextResponse.json({ balance, history });
}
