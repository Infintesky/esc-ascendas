import { describe, it, expect } from "vitest";
import { deriveBalance, nextEntry } from "@/lib/points/ledger";

describe("deriveBalance", () => {
  it("sums deltas", () => {
    expect(deriveBalance([{ delta: 100 }, { delta: -30 }, { delta: 50 }])).toBe(120);
  });
  it("is 0 for no entries", () => {
    expect(deriveBalance([])).toBe(0);
  });
});

describe("nextEntry", () => {
  it("creates an earn entry with the new balance", () => {
    expect(nextEntry(100, 50, "earn: booking")).toEqual({ delta: 50, balanceAfter: 150, reason: "earn: booking" });
  });
  it("creates a redeem entry", () => {
    expect(nextEntry(100, -40, "redeem")).toEqual({ delta: -40, balanceAfter: 60, reason: "redeem" });
  });
  it("throws when redemption exceeds balance", () => {
    expect(() => nextEntry(30, -40, "redeem")).toThrow(/insufficient/i);
  });
});
