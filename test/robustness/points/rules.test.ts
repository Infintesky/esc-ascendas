import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { pointsForBooking } from "@/lib/points/rules";
import { deriveBalance, nextEntry } from "@/lib/points/ledger";

// robustness	Points always whole, finite, never negative
describe("pointsForBooking robustness", () => {
  it("always returns a finite non-negative integer", () => {
    fc.assert(
      fc.property(fc.double(), (price) => {
        const pts = pointsForBooking(price);
        expect(Number.isFinite(pts)).toBe(true);
        expect(Number.isInteger(pts)).toBe(true);
        expect(pts).toBeGreaterThanOrEqual(0);
      }),
    );
  });

  it("is monotonic = a higher price never earns fewer points", () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 1_000_000, noNaN: true }),
        fc.double({ min: 0, max: 1_000_000, noNaN: true }),
        (a, b) => {
          const [lo, hi] = a <= b ? [a, b] : [b, a];
          expect(pointsForBooking(hi)).toBeGreaterThanOrEqual(pointsForBooking(lo));
        },
      ),
    );
  });
});

// 	Balance always match sum of transactions
describe("points ledger robustness", () => {
  it("deriveBalance equals the sum of deltas and stays finite", () => {
    fc.assert(
      fc.property(
        fc.array(fc.record({ delta: fc.integer({ min: -10_000, max: 10_000 }) }), {
          maxLength: 200,
        }),
        (entries) => {
          const bal = deriveBalance(entries);
          expect(Number.isFinite(bal)).toBe(true);
          expect(bal).toBe(entries.reduce((s, e) => s + e.delta, 0));
        },
      ),
    );
  });

  it("nextEntry never produces a negative balance without throwing", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 1_000_000 }),
        fc.integer({ min: -1_000_000, max: 1_000_000 }),
        (balance, delta) => {
          let entry;
          try {
            entry = nextEntry(balance, delta, "test");
          } catch {
            expect(balance + delta).toBeLessThan(0);
            return;
          }
          expect(entry.balanceAfter).toBeGreaterThanOrEqual(0);
          expect(entry.balanceAfter).toBe(balance + delta);
        },
      ),
    );
  });
});
