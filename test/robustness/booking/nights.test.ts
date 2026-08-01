import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { nightsBetween } from "@/lib/booking/nights";

// Night count always real number
describe("nightsBetween robustness", () => {
  it("always returns a non-negative integer", () => {
    fc.assert(
      fc.property(fc.string(), fc.string(), (a, b) => {
        const n = nightsBetween(a, b);
        expect(Number.isInteger(n)).toBe(true);
        expect(n).toBeGreaterThanOrEqual(0);
      }),
    );
  });
});