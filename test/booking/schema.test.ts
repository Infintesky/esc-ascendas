import { describe, it, expect } from "vitest";
import { CreateBookingSchema } from "@/lib/booking/schema";

const valid = {
  destinationId: "RsBU", hotelId: "QDaO", roomKey: "k1", roomType: "Deluxe",
  checkin: "2026-10-01", checkout: "2026-10-07", adults: 2, children: 0,
  currency: "SGD", price: 1200, firstName: "Ada", lastName: "Lovelace",
  email: "ada@example.com", phone: "+6512345678",
  billingAddress: { line1: "1 Road", city: "Singapore", postalCode: "123456", country: "SG" },
  paymentMethodId: "pm_test_123",
};

describe("CreateBookingSchema", () => {
  it("accepts a valid payload", () => {
    expect(CreateBookingSchema.parse(valid).email).toBe("ada@example.com");
  });
  it("rejects an invalid email", () => {
    expect(() => CreateBookingSchema.parse({ ...valid, email: "nope" })).toThrow();
  });
  it("rejects a negative price", () => {
    expect(() => CreateBookingSchema.parse({ ...valid, price: -1 })).toThrow();
  });
  it("rejects a missing payment method", () => {
    const { paymentMethodId, ...rest } = valid;
    expect(() => CreateBookingSchema.parse(rest)).toThrow();
  });
});
