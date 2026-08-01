import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { CreateBookingSchema } from "@/lib/booking/schema";
import { nightsBetween } from "@/lib/booking/nights";

const validPayload = {
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

// Booking door reject junk before money moves
describe("CreateBookingSchema robustness", () => {
  it("rejects check-in strings that are not real calendar dates", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2026, max: 2030 }),
        fc.integer({ min: 0, max: 99 }),
        fc.integer({ min: 0, max: 99 }),
        (y, m, d) => {
          if (isRealYmd(y, m, d)) return;
          const parsed = CreateBookingSchema.safeParse({
            ...validPayload,
            checkin: `${y}-${pad(m)}-${pad(d)}`,
          });
          expect(parsed.success).toBe(false);
        },
      ),
    );
  });

  it("never lets a parsed payload produce NaN nights", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2026, max: 2030 }),
        fc.integer({ min: 0, max: 99 }),
        fc.integer({ min: 0, max: 99 }),
        (y, m, d) => {
          const parsed = CreateBookingSchema.safeParse({
            ...validPayload,
            checkin: `${y}-${pad(m)}-${pad(d)}`,
          });
          if (!parsed.success) return;
          const n = nightsBetween(parsed.data.checkin, parsed.data.checkout);
          expect(Number.isInteger(n)).toBe(true);
        },
      ),
    );
  });

  it("rejects a non-finite price", () => {
    fc.assert(
      fc.property(fc.constantFrom(Infinity, -Infinity, NaN), (price) => {
        expect(CreateBookingSchema.safeParse({ ...validPayload, price }).success).toBe(false);
      }),
    );
  });

  it("never throws on arbitrary unknown input", () => {
    fc.assert(
      fc.property(fc.anything(), (input) => {
        expect(() => CreateBookingSchema.safeParse(input)).not.toThrow();
      }),
    );
  });
});
