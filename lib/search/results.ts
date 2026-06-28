import type { Hotel, PriceResult } from "@/lib/ascenda/types";

export type HotelListing = Hotel & {
  price: number | null;
  searchRank: number | null;
};

export function mergeHotelsWithPrices(
  hotels: Hotel[],
  prices: PriceResult[],
): HotelListing[] {
  const priceById = new Map(prices.map((p) => [p.id, p]));
  return hotels.map((h) => {
    const p = priceById.get(h.id);
    return { ...h, price: p?.price ?? null, searchRank: p?.searchRank ?? null };
  });
}

export type ResultFilters = {
  minStars?: number;
  maxPrice?: number;
};

export function applyFilters(
  listings: HotelListing[],
  f: ResultFilters,
): HotelListing[] {
  return listings.filter((l) => {
    if (f.minStars != null && l.rating < f.minStars) return false;
    if (f.maxPrice != null && (l.price == null || l.price > f.maxPrice)) return false;
    return true;
  });
}

export function sortListings(
  listings: HotelListing[],
  by: "price" | "rating",
  dir: "asc" | "desc",
): HotelListing[] {
  const sign = dir === "asc" ? 1 : -1;
  return [...listings].sort((a, b) => {
    if (by === "price") {
      if (a.price == null) return 1;
      if (b.price == null) return -1;
      return (a.price - b.price) * sign;
    }
    return (a.rating - b.rating) * sign;
  });
}
