import { describe, it, expect } from "vitest";
import fc from "fast-check";
import {
  addDaysISO,
  validateDates,
  SearchParamsSchema,
  serializeGuests,
  MAX_ROOMS,
} from "@/lib/search/params";

const isoDate = fc
  .date({ min: new Date("2001-01-01"), max: new Date("2099-01-01"), noInvalidDate: true })
  .map((d) => d.toISOString().slice(0, 10));

const ymd = fc.tuple(
  fc.integer({ min: 2026, max: 2030 }),
  fc.integer({ min: 1, max: 12 }),
  fc.integer({ min: 1, max: 31 }),
);

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function isRealYmd(y: number, m: number, d: number) {
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

// Date math never make garbage date string
describe("addDaysISO robustness", () => {
  it("round-trips: add n then subtract n returns the original", () => {
    fc.assert(
      fc.property(isoDate, fc.integer({ min: -5000, max: 5000 }), (d, n) => {
        expect(addDaysISO(addDaysISO(d, n), -n)).toBe(d);
      }),
    );
  });

  it("never throws and always returns a YYYY-MM-DD string", () => {
    fc.assert(
      fc.property(isoDate, fc.integer(), (d, n) => {
        expect(addDaysISO(d, n)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }),
    );
  });
});

// Gatekeeper reject dates that not exist
describe("validateDates robustness", () => {
  it("never accepts a date string that is not a real calendar date", () => {
    fc.assert(
      fc.property(ymd, ([y, m, d]) => {
        if (isRealYmd(y, m, d)) return;
        const s = `${y}-${pad(m)}-${pad(d)}`;
        const res = validateDates(s, addDaysISO(s, 3), new Date("2026-01-01T00:00:00Z"));
        expect(res.ok).toBe(false);
      }),
    );
  });
});

//Server enforce room limit, not just UI
describe("SearchParamsSchema robustness", () => {
  it("never accepts a rooms value above MAX_ROOMS", () => {
    fc.assert(
      fc.property(fc.integer({ min: MAX_ROOMS + 1, max: 1_000_000 }), (rooms) => {
        const parsed = SearchParamsSchema.safeParse({
          destinationId: "RsBU",
          checkin: "2026-10-01",
          checkout: "2026-10-05",
          rooms: String(rooms),
          guests: "2",
        });
        expect(parsed.success).toBe(false);
      }),
    );
  });

  it("serializeGuests emits exactly one entry per room", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: MAX_ROOMS }),
        fc.integer({ min: 1, max: 4 }),
        (r, g) => {
          expect(serializeGuests(r, g).split("|").length).toBe(r);
        },
      ),
    );
  });
});
