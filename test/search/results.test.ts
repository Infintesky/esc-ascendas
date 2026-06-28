import { describe, it, expect } from "vitest";
import { mergeHotelsWithPrices, applyFilters, sortListings } from "@/lib/search/results";
import type { Hotel } from "@/lib/ascenda/types";

const hotels: Hotel[] = [
  { id: "a", name: "A", latitude: 0, longitude: 0, address: "", rating: 5, description: "", amenities: [], imagePrefix: "", imageSuffix: "", imageCount: 0 },
  { id: "b", name: "B", latitude: 0, longitude: 0, address: "", rating: 3, description: "", amenities: [], imagePrefix: "", imageSuffix: "", imageCount: 0 },
];
const prices = [
  { id: "a", searchRank: 0.9, price: 300, marketRates: [] },
  { id: "b", searchRank: 0.5, price: 100, marketRates: [] },
];

describe("results logic", () => {
  it("merges price onto hotels", () => {
    const merged = mergeHotelsWithPrices(hotels, prices);
    expect(merged.find((m) => m.id === "a")?.price).toBe(300);
  });

  it("filters by min stars and max price", () => {
    const merged = mergeHotelsWithPrices(hotels, prices);
    expect(applyFilters(merged, { minStars: 4 }).map((m) => m.id)).toEqual(["a"]);
    expect(applyFilters(merged, { maxPrice: 150 }).map((m) => m.id)).toEqual(["b"]);
  });

  it("sorts by price ascending", () => {
    const merged = mergeHotelsWithPrices(hotels, prices);
    expect(sortListings(merged, "price", "asc").map((m) => m.id)).toEqual(["b", "a"]);
  });

  it("puts price-less listings last", () => {
    const merged = mergeHotelsWithPrices(hotels, [prices[0]]);
    expect(sortListings(merged, "price", "asc").map((m) => m.id)).toEqual(["a", "b"]);
  });
});
