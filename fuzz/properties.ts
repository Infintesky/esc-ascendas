import fc from "fast-check";
import { nightsBetween } from "@/lib/booking/nights";
import { CreateBookingSchema } from "@/lib/booking/schema";
import {
  addDaysISO,
  validateDates,
  SearchParamsSchema,
  serializeGuests,
  MAX_ROOMS,
} from "@/lib/search/params";
import { applyFilters, sortListings, type HotelListing } from "@/lib/search/results";
import { pointsForBooking } from "@/lib/points/rules";
import { deriveBalance, nextEntry } from "@/lib/points/ledger";

/*
Runner-agnostic assertion. The properties below are executed by two harnesses,
Vitest (test/robustness) and the standalone long-run fuzzer (fuzz/run.ts)
 */

function check(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

function eq(a: unknown, b: unknown, message: string): void {
  check(JSON.stringify(a) === JSON.stringify(b), message);
}

export type FuzzProperty = {
  target: string;
  name: string;
  prop: fc.IProperty<unknown>;
};

// Shared arbitraries

const isoDate = fc
  .date({ min: new Date("2001-01-01"), max: new Date("2099-01-01"), noInvalidDate: true })
  .map((d) => d.toISOString().slice(0, 10));

const ymd = fc.tuple(
  fc.integer({ min: 2026, max: 2030 }),
  fc.integer({ min: 1, max: 12 }),
  fc.integer({ min: 1, max: 31 }),
);

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

const validBookingPayload = {
  destinationId: "RsBU",
  hotelId: "QDaO",
  roomKey: "k1",
  roomType: "Deluxe",
  checkin: "2026-10-01",
  checkout: "2026-10-07",
  adults: 2,
  children: 0,
  currency: "SGD",
  price: 1200,
  firstName: "Ada",
  lastName: "Lovelace",
  email: "ada@example.com",
  phone: "+6512345678",
  billingAddress: { line1: "1 Road", city: "Singapore", postalCode: "123456", country: "SG" },
  paymentMethodId: "pm_test_123",
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function isRealYmd(y: number, m: number, d: number) {
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

// Property definitions

export const properties: FuzzProperty[] = [
  // Night count always real number, never broken
  {
    target: "nightsBetween",
    name: "always returns a non-negative integer",
    prop: fc.property(fc.string(), fc.string(), (a, b) => {
      const n = nightsBetween(a, b);
      check(Number.isInteger(n), `not an integer: ${n}`);
      check(n >= 0, `negative nights: ${n}`);
    }),
  },

  // Booking door reject junk before money moves
  {
    target: "CreateBookingSchema",
    name: "rejects check-in strings that are not real calendar dates",
    prop: fc.property(
      fc.integer({ min: 2026, max: 2030 }),
      fc.integer({ min: 0, max: 99 }),
      fc.integer({ min: 0, max: 99 }),
      (y, m, d) => {
        if (isRealYmd(y, m, d)) return;
        const parsed = CreateBookingSchema.safeParse({
          ...validBookingPayload,
          checkin: `${y}-${pad(m)}-${pad(d)}`,
        });
        check(!parsed.success, `accepted impossible date ${y}-${pad(m)}-${pad(d)}`);
      },
    ),
  },
  {
    target: "CreateBookingSchema -> nightsBetween",
    name: "never lets a parsed payload produce NaN nights",
    prop: fc.property(
      fc.integer({ min: 2026, max: 2030 }),
      fc.integer({ min: 0, max: 99 }),
      fc.integer({ min: 0, max: 99 }),
      (y, m, d) => {
        const parsed = CreateBookingSchema.safeParse({
          ...validBookingPayload,
          checkin: `${y}-${pad(m)}-${pad(d)}`,
        });
        if (!parsed.success) return;
        const n = nightsBetween(parsed.data.checkin, parsed.data.checkout);
        check(Number.isInteger(n), `schema accepted a payload yielding NaN nights`);
      },
    ),
  },
  {
    target: "CreateBookingSchema",
    name: "rejects a non-finite price",
    prop: fc.property(fc.constantFrom(Infinity, -Infinity, NaN), (price) => {
      const parsed = CreateBookingSchema.safeParse({ ...validBookingPayload, price });
      check(!parsed.success, `accepted non-finite price ${price}`);
    }),
  },
  {
    target: "CreateBookingSchema",
    name: "never throws on arbitrary unknown input",
    prop: fc.property(fc.anything(), (input) => {
      CreateBookingSchema.safeParse(input);
    }),
  },

  // Date math never make garbage date string
  {
    target: "addDaysISO",
    name: "round-trips: add n then subtract n returns the original",
    prop: fc.property(isoDate, fc.integer({ min: -5000, max: 5000 }), (d, n) => {
      eq(addDaysISO(addDaysISO(d, n), -n), d, `round-trip failed for ${d} +${n}`);
    }),
  },
  {
    target: "addDaysISO",
    name: "never throws and always returns a YYYY-MM-DD string",
    prop: fc.property(isoDate, fc.integer(), (d, n) => {
      const out = addDaysISO(d, n);
      check(/^\d{4}-\d{2}-\d{2}$/.test(out), `malformed output: ${out}`);
    }),
  },

  // Gatekeeper reject dates that not exist
  {
    target: "validateDates",
    name: "never accepts a date string that is not a real calendar date",
    prop: fc.property(ymd, ([y, m, d]) => {
      if (isRealYmd(y, m, d)) return;
      const s = `${y}-${pad(m)}-${pad(d)}`;
      const res = validateDates(s, addDaysISO(s, 3), new Date("2026-01-01T00:00:00Z"));
      check(!res.ok, `accepted impossible date ${s}`);
    }),
  },

  // Server enforce room limit, not just UI
  {
    target: "SearchParamsSchema",
    name: "never accepts a rooms value above MAX_ROOMS",
    prop: fc.property(fc.integer({ min: MAX_ROOMS + 1, max: 1_000_000 }), (rooms) => {
      const parsed = SearchParamsSchema.safeParse({
        destinationId: "RsBU",
        checkin: "2026-10-01",
        checkout: "2026-10-05",
        rooms: String(rooms),
        guests: "2",
      });
      check(!parsed.success, `accepted rooms=${rooms} above MAX_ROOMS=${MAX_ROOMS}`);
    }),
  },
  {
    target: "serializeGuests",
    name: "emits exactly one entry per room",
    prop: fc.property(
      fc.integer({ min: 1, max: MAX_ROOMS }),
      fc.integer({ min: 1, max: 4 }),
      (r, g) => {
        check(serializeGuests(r, g).split("|").length === r, `wrong entry count for ${r} rooms`);
      },
    ),
  },

  // Sorting never lose, duplicate, invent hotel
  {
    target: "sortListings",
    name: "is a permutation of its input (same length, same ids)",
    prop: fc.property(
      listings,
      fc.constantFrom("price", "rating"),
      fc.constantFrom("asc", "desc"),
      (ls, by, dir) => {
        const out = sortListings(ls, by as "price" | "rating", dir as "asc" | "desc");
        check(out.length === ls.length, "length changed");
        eq(
          out.map((l) => l.id).sort(),
          ls.map((l) => l.id).sort(),
          "ids changed",
        );
      },
    ),
  },
  {
    target: "sortListings",
    name: "does not mutate its input",
    prop: fc.property(listings, (ls) => {
      const before = ls.map((l) => l.id);
      sortListings(ls, "price", "asc");
      eq(
        ls.map((l) => l.id),
        before,
        "input was mutated",
      );
    }),
  },
  {
    target: "sortListings",
    name: "orders consistently regardless of input order",
    prop: fc.property(listings, fc.constantFrom("asc", "desc"), (ls, dir) => {
      const forward = sortListings(ls, "price", dir as "asc" | "desc");
      const backward = sortListings([...ls].reverse(), "price", dir as "asc" | "desc");
      eq(
        forward.map((l) => l.price),
        backward.map((l) => l.price),
        "ordering depends on input order (contradictory comparator)",
      );
    }),
  },
  {
    target: "sortListings",
    name: "puts every priced listing before every unpriced one",
    prop: fc.property(listings, (ls) => {
      const out = sortListings(ls, "price", "asc");
      const firstNull = out.findIndex((l) => l.price == null);
      if (firstNull === -1) return;
      for (let i = firstNull; i < out.length; i++) {
        check(out[i].price == null, "priced listing found after an unpriced one");
      }
    }),
  },
  {
    target: "sortListings",
    name: "ascending price order is non-decreasing",
    prop: fc.property(listings, (ls) => {
      const prices = sortListings(ls, "price", "asc")
        .map((l) => l.price)
        .filter((p): p is number => p != null);
      for (let i = 1; i < prices.length; i++) {
        check(prices[i] >= prices[i - 1], "prices not in non-decreasing order");
      }
    }),
  },

  // Filter only remove, never add anything
  {
    target: "applyFilters",
    name: "output is always a subset of the input",
    prop: fc.property(
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
        check(out.length <= ls.length, "filter grew the list");
        for (const l of out) check(ls.includes(l), "filter invented a listing");
      },
    ),
  },
  {
    target: "applyFilters",
    name: "is idempotent, filtering twice equals filtering once",
    prop: fc.property(
      listings,
      fc.record({ minStars: fc.double({ min: 0, max: 5, noNaN: true }) }, { requiredKeys: [] }),
      (ls, f) => {
        const once = applyFilters(ls, f);
        check(applyFilters(once, f).length === once.length, "filter is not idempotent");
      },
    ),
  },

  // Points always whole, finite, never negative
  {
    target: "pointsForBooking",
    name: "always returns a finite non-negative integer",
    prop: fc.property(fc.double(), (price) => {
      const pts = pointsForBooking(price);
      check(Number.isFinite(pts), `non-finite points for price ${price}`);
      check(Number.isInteger(pts), `non-integer points for price ${price}`);
      check(pts >= 0, `negative points for price ${price}`);
    }),
  },
  {
    target: "pointsForBooking",
    name: "is monotonic, a higher price never earns fewer points",
    prop: fc.property(
      fc.double({ min: 0, max: 1_000_000, noNaN: true }),
      fc.double({ min: 0, max: 1_000_000, noNaN: true }),
      (a, b) => {
        const [lo, hi] = a <= b ? [a, b] : [b, a];
        check(pointsForBooking(hi) >= pointsForBooking(lo), "monotonicity violated");
      },
    ),
  },

  // Balance always match sum of transactions
  {
    target: "deriveBalance",
    name: "equals the sum of deltas and stays finite",
    prop: fc.property(
      fc.array(fc.record({ delta: fc.integer({ min: -10_000, max: 10_000 }) }), {
        maxLength: 200,
      }),
      (entries) => {
        const bal = deriveBalance(entries);
        check(Number.isFinite(bal), "balance is not finite");
        check(
          bal === entries.reduce((s, e) => s + e.delta, 0),
          "balance does not equal the sum of deltas",
        );
      },
    ),
  },
  {
    target: "nextEntry",
    name: "never produces a negative balance without throwing",
    prop: fc.property(
      fc.integer({ min: 0, max: 1_000_000 }),
      fc.integer({ min: -1_000_000, max: 1_000_000 }),
      (balance, delta) => {
        let entry;
        try {
          entry = nextEntry(balance, delta, "fuzz");
        } catch {
          check(balance + delta < 0, "threw on a valid redemption");
          return;
        }
        check(entry.balanceAfter >= 0, "produced a negative balance");
        check(entry.balanceAfter === balance + delta, "balance arithmetic is wrong");
      },
    ),
  },
];