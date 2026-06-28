import { describe, it, expect } from "vitest";
import { serializeGuests, validateDates, SearchParamsSchema } from "@/lib/search/params";

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
  it("rejects check-in less than 3 days out", () => {
    expect(validateDates("2026-06-26", "2026-06-30", now).ok).toBe(false);
  });
  it("rejects checkout not after checkin", () => {
    expect(validateDates("2026-07-01", "2026-07-01", now).ok).toBe(false);
  });
  it("accepts valid dates", () => {
    expect(validateDates("2026-07-01", "2026-07-05", now).ok).toBe(true);
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
});
