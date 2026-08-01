import { describe, it, expect } from "vitest";
import {
  serializeGuests,
  validateDates,
  SearchParamsSchema,
  addDaysISO,
  minCheckinDate,
  clampInt,
  MAX_ROOMS,
  MAX_GUESTS_PER_ROOM,
} from "@/lib/search/params";

describe("serializeGuests", () => {
  it("serializes one room", () => {
    expect(serializeGuests(1, 2)).toBe("2");
  });
  it("serializes multiple rooms with pipe separator", () => {
    expect(serializeGuests(2, 2)).toBe("2|2");
    expect(serializeGuests(4, 3)).toBe("3|3|3|3");
  });
});

describe("validateDates", () => {
  const now = new Date("2026-06-25T00:00:00Z");
  it("rejects impossible calendar dates (fuzz, seed 1111526429)", () => {
    expect(validateDates("2027-02-29", "2027-03-05", now).ok).toBe(false);  // 2027 not a leap year
    expect(validateDates("2026-00-00", "2026-12-05", now).ok).toBe(false);
    expect(validateDates("2026-09-31", "2026-10-05", now).ok).toBe(false);  // September 30 days
  });
  it("rejects check-in less than 3 days out", () => {
    expect(validateDates("2026-06-26", "2026-06-30", now).ok).toBe(false);
  });
  it("rejects checkout not after checkin", () => {
    expect(validateDates("2026-07-01", "2026-07-01", now).ok).toBe(false);
  });
  it("accepts valid dates", () => {
    expect(validateDates("2026-07-01", "2026-07-05", now).ok).toBe(true);
  });
  it("rejects empty / blank dates (regression: NaN comparison slipped through)", () => {
    expect(validateDates("", "", now).ok).toBe(false);
    expect(validateDates("2026-07-01", "", now).ok).toBe(false);
    expect(validateDates("not-a-date", "also-bad", now).ok).toBe(false);
  });
});

describe("date helpers", () => {
  it("addDaysISO advances a date and stays ISO", () => {
    expect(addDaysISO("2026-10-01", 1)).toBe("2026-10-02");
    expect(addDaysISO("2026-10-31", 1)).toBe("2026-11-01");
  });
  it("minCheckinDate is 3 days ahead of now", () => {
    expect(minCheckinDate(new Date("2026-06-25T00:00:00Z"))).toBe("2026-06-28");
  });
});

describe("clampInt", () => {
  it("clamps rooms and guests into a sensible range", () => {
    expect(clampInt(0, 1, MAX_ROOMS)).toBe(1);
    expect(clampInt(99, 1, MAX_ROOMS)).toBe(MAX_ROOMS);
    expect(clampInt(3, 1, MAX_GUESTS_PER_ROOM)).toBe(3);
    expect(clampInt(NaN, 1, MAX_ROOMS)).toBe(1);
  });
});

describe("SearchParamsSchema", () => {
  it("coerces numeric fields from strings", () => {
    const p = SearchParamsSchema.parse({
      destinationId: "RsBU", checkin: "2026-10-01", checkout: "2026-10-07",
      currency: "SGD", countryCode: "SG", lang: "en_US", rooms: "2", guests: "2",
    });
    expect(p.rooms).toBe(2);
    expect(p.guests).toBe(2);
  });
  it("rejects rooms above MAX_ROOMS (fuzz, seed -1855372981)", () => {
    const p = { destinationId: "RsBU", checkin: "2026-10-01", checkout: "2026-10-05", guests: "2" };
    expect(SearchParamsSchema.safeParse({ ...p, rooms: "9" }).success).toBe(false);
    expect(SearchParamsSchema.safeParse({ ...p, rooms: "100000000" }).success).toBe(false);
    expect(SearchParamsSchema.safeParse({ ...p, rooms: "8" }).success).toBe(true);
  });
});
