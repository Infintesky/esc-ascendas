import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { applyFilters, sortListings, type HotelListing } from "@/lib/search/results";

const listing: fc.Arbitrary<HotelListing> = fc.record({
  id: fc.string({ minLength: 1 }),
  name: fc.string(),
  latitude: fc.double({ noNaN: true }),
  longitude: fc.double({ noNaN: true }),
  address: fc.string(),
  rating: fc.double({ min: 0, max: 5, noNaN: true }),
  guestRating: fc.double({ min: 0, max: 100, noNaN: true }),
  description: fc.string(),
  amenities: fc.array(fc.string()),
  imagePrefix: fc.string(),
  imageSuffix: fc.string(),
  imageCount: fc.integer({ min: 0, max: 50 }),
  price: fc.option(fc.double({ min: 0, max: 100_000, noNaN: true }), { nil: null }),
  searchRank: fc.option(fc.double({ noNaN: true }), { nil: null }),
});

const listings = fc.array(listing, { maxLength: 25 });

// Sorting never lose, duplicate, invent hotel
describe("sortListings robustness", () => {
  it("is a permutation of its input (same length, same ids)", () => {
    fc.assert(
      fc.property(
        listings,
        fc.constantFrom("price", "rating"),
        fc.constantFrom("asc", "desc"),
        (ls, by, dir) => {
          const out = sortListings(ls, by as "price" | "rating", dir as "asc" | "desc");
          expect(out).toHaveLength(ls.length);
          expect(out.map((l) => l.id).sort()).toEqual(ls.map((l) => l.id).sort());
        },
      ),
    );
  });

  it("does not mutate its input", () => {
    fc.assert(
      fc.property(listings, (ls) => {
        const before = ls.map((l) => l.id);
        sortListings(ls, "price", "asc");
        expect(ls.map((l) => l.id)).toEqual(before);
      }),
    );
  });

  it("orders consistently regardless of input order, no contradictory comparisons", () => {
    fc.assert(
      fc.property(listings, fc.constantFrom("asc", "desc"), (ls, dir) => {
        const forward = sortListings(ls, "price", dir as "asc" | "desc");
        const backward = sortListings([...ls].reverse(), "price", dir as "asc" | "desc");
        expect(forward.map((l) => l.price)).toEqual(backward.map((l) => l.price));
      }),
    );
  });

  it("puts every priced listing before every unpriced one", () => {
    fc.assert(
      fc.property(listings, (ls) => {
        const out = sortListings(ls, "price", "asc");
        const firstNull = out.findIndex((l) => l.price == null);
        if (firstNull === -1) return;
        for (let i = firstNull; i < out.length; i++) expect(out[i].price).toBeNull();
      }),
    );
  });

  it("ascending price order places every non-null price in non-decreasing order", () => {
    fc.assert(
      fc.property(listings, (ls) => {
        const prices = sortListings(ls, "price", "asc")
          .map((l) => l.price)
          .filter((p): p is number => p != null);
        for (let i = 1; i < prices.length; i++) {
          expect(prices[i]).toBeGreaterThanOrEqual(prices[i - 1]);
        }
      }),
    );
  });
});

// Filter only remove, never add anything
describe("applyFilters robustness", () => {
  it("output is always a subset of the input", () => {
    fc.assert(
      fc.property(
        listings,
        fc.record(
          {
            minStars: fc.double({ min: 0, max: 5, noNaN: true }),
            minGuestRating: fc.double({ min: 0, max: 100, noNaN: true }),
            minPrice: fc.double({ min: 0, max: 100_000, noNaN: true }),
            maxPrice: fc.double({ min: 0, max: 100_000, noNaN: true }),
          },
          { requiredKeys: [] },
        ),
        (ls, f) => {
          const out = applyFilters(ls, f);
          expect(out.length).toBeLessThanOrEqual(ls.length);
          for (const l of out) expect(ls).toContain(l);
        },
      ),
    );
  });

  it("is idempotent, filtering twice equals filtering once", () => {
    fc.assert(
      fc.property(
        listings,
        fc.record(
          { minStars: fc.double({ min: 0, max: 5, noNaN: true }) },
          { requiredKeys: [] },
        ),
        (ls, f) => {
          expect(applyFilters(applyFilters(ls, f), f)).toEqual(applyFilters(ls, f));
        },
      ),
    );
  });
});


