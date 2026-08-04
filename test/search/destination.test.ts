import { describe, it, expect } from "vitest";
import { trimDestinations } from "@/lib/search/destination";

describe("trimDestinations", () => {
  it("keeps only the fields autocomplete uses and drops entries without uid/term", () => {
    const out = trimDestinations([
      { uid: "RsBU", term: "Singapore, Singapore", lat: 1.3, lng: 103.8, state: "", type: "city", extra: "drop me" },
      { uid: "", term: "No id" },
      { term: "No uid" },
    ]);
    expect(out).toHaveLength(1);
    // lat/lng/state are intentionally dropped — unused by search or UI, and
    // they roughly halve the shipped index size.
    expect(out[0]).toEqual({ uid: "RsBU", term: "Singapore, Singapore", type: "city" });
  });
});
