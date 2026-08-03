import { describe, it } from "vitest";
import fc from "fast-check";
import { properties } from "@/fuzz/properties";

// Same properties the long-run fuzzer uses, at CI sample size.
describe("robustness properties", () => {
  for (const p of properties) {
    it(`${p.target}: ${p.name}`, () => {
      fc.assert(p.prop, { numRuns: 100 });
    });
  }
});
