import { describe, it, expect } from "vitest";
import { buildIndex, searchDestinations } from "@/lib/search/fuzzy";

const entries = [
  { uid: "1", term: "Singapore, Singapore", lat: 1.3, lng: 103.8, state: "", type: "city" },
  { uid: "2", term: "Singaraja, Bali, Indonesia", lat: -8, lng: 115, state: "Bali", type: "city" },
  { uid: "3", term: "Tokyo, Japan", lat: 35, lng: 139, state: "", type: "city" },
];

describe("searchDestinations", () => {
  const index = buildIndex(entries);

  it("prefix-matches as you type", () => {
    const out = searchDestinations(index, "singa");
    expect(out.map((d) => d.uid).sort()).toContain("1");
  });

  it("tolerates typos (sinagpore -> singapore)", () => {
    const out = searchDestinations(index, "sinagpore");
    expect(out.some((d) => d.uid === "1")).toBe(true);
  });

  it("respects the result limit", () => {
    expect(searchDestinations(index, "singa", 1)).toHaveLength(1);
  });
});
