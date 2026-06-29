import { describe, it, expect, vi } from "vitest";
import { createBooking } from "@/lib/booking/service";

const input = {
  destinationId: "RsBU", hotelId: "QDaO", roomKey: "k1", roomType: "Deluxe",
  checkin: "2026-10-01", checkout: "2026-10-07", adults: 2, children: 0,
  currency: "SGD", price: 1200, firstName: "Ada", lastName: "Lovelace",
  email: "ada@example.com", phone: "+6512345678",
  billingAddress: { line1: "1 Road", city: "Singapore", postalCode: "123456", country: "SG" },
  paymentMethodId: "pm_test_123",
};

const confirm = vi.fn(async () => ({
  status: "succeeded", paymentIntentId: "pi_1", cardLast4: "4242", cardBrand: "visa", clientSecret: "cs",
}));

describe("createBooking earns points", () => {
  it("records an earn entry for an authenticated confirmed booking", async () => {
    const insert = vi.fn(async (r) => r);
    const earn = vi.fn(async () => 1200);
    await createBooking({ ...input, userId: "u1" }, { insert, confirm, earn });
    expect(earn).toHaveBeenCalledWith(expect.objectContaining({ userId: "u1", delta: 1200 }));
  });

  it("does not earn for guest (no userId) bookings", async () => {
    const insert = vi.fn(async (r) => r);
    const earn = vi.fn();
    await createBooking(input, { insert, confirm, earn });
    expect(earn).not.toHaveBeenCalled();
  });

  it("still confirms the booking if earning throws", async () => {
    const insert = vi.fn(async (r) => r);
    const earn = vi.fn(async () => { throw new Error("ledger down"); });
    const out = await createBooking({ ...input, userId: "u1" }, { insert, confirm, earn });
    expect(out.status).toBe("confirmed");
  });
});
