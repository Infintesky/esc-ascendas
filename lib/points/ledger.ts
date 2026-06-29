export type LedgerEntry = {
  delta: number;
  balanceAfter: number;
  reason: string;
};

export function deriveBalance(entries: { delta: number }[]): number {
  return entries.reduce((sum, e) => sum + e.delta, 0);
}

export function nextEntry(currentBalance: number, delta: number, reason: string): LedgerEntry {
  const balanceAfter = currentBalance + delta;
  if (balanceAfter < 0) {
    throw new Error("Insufficient points balance for this redemption.");
  }
  return { delta, balanceAfter, reason };
}
