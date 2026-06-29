import { eq, desc } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { pointsLedger } from "@/lib/db/schema";
import { deriveBalance, nextEntry } from "./ledger";

type Row = typeof pointsLedger.$inferInsert;

type Deps = {
  insert?: (row: Row) => Promise<unknown>;
  loadEntries?: (userId: string) => Promise<{ delta: number }[]>;
};

function defaultLoadEntries(userId: string) {
  return db
    .select({ delta: pointsLedger.delta })
    .from(pointsLedger)
    .where(eq(pointsLedger.userId, userId));
}

export async function getBalance(userId: string, deps: Deps = {}): Promise<number> {
  const load = deps.loadEntries ?? defaultLoadEntries;
  return deriveBalance(await load(userId));
}

export async function getHistory(userId: string) {
  return db
    .select()
    .from(pointsLedger)
    .where(eq(pointsLedger.userId, userId))
    .orderBy(desc(pointsLedger.createdAt));
}

export async function recordPointsEntry(
  args: { userId: string; delta: number; reason: string; bookingId?: string },
  deps: Deps = {},
): Promise<number> {
  const load = deps.loadEntries ?? defaultLoadEntries;
  const insert = deps.insert ?? (async (row: Row) => db.insert(pointsLedger).values(row));

  const current = deriveBalance(await load(args.userId));
  const entry = nextEntry(current, args.delta, args.reason);
  await insert({
    userId: args.userId,
    bookingId: args.bookingId ?? null,
    delta: entry.delta,
    balanceAfter: entry.balanceAfter,
    reason: entry.reason,
  });
  return entry.balanceAfter;
}
