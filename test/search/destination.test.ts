import { describe, it, expect } from "vitest";
import { trimDestinations } from "@/lib/search/destination";

describe("trimDestinations", () => {
  it("keeps only the needed fields and drops entries without uid/term", () => {
    const out = trimDestinations([
      { uid: "RsBU", term: "Singapore, Singapore", lat: 1.3, lng: 103.8, state: "", type: "city", extra: "drop me" },
      { uid: "", term: "No id" },
      { term: "No uid" },
    ]);
    expect(out).toHaveLength(1);
    expect(out[0]).toEqual({ uid: "RsBU", term: "Singapore, Singapore", lat: 1.3, lng: 103.8, state: "", type: "city" });
  });
});
