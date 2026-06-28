import { describe, it, expect, vi, afterEach } from "vitest";

afterEach(() => vi.resetModules());

const validBody = {
  destinationId: "RsBU", hotelId: "QDaO", roomKey: "k1", roomType: "Deluxe",
  checkin: "2026-10-01", checkout: "2026-10-07", adults: 2, children: 0,
  currency: "SGD", price: 1200, firstName: "Ada", lastName: "Lovelace",
  email: "ada@example.com", phone: "+6512345678",
  billingAddress: { line1: "1 Road", city: "Singapore", postalCode: "123456", country: "SG" },
  paymentMethodId: "pm_test_123",
};

describe("POST /api/bookings", () => {
  it("201s with a reference on a confirmed booking", async () => {
    vi.doMock("@/lib/booking/service", () => ({
      createBooking: vi.fn(async () => ({ reference: "BK-20261001-ABC123", status: "confirmed", cardLast4: "4242" })),
    }));
    const { POST } = await import("@/app/api/bookings/route");
    const res = await POST(new Request("http://localhost/api/bookings", {
      method: "POST", body: JSON.stringify(validBody),
    }));
    expect(res.status).toBe(201);
    expect((await res.json()).reference).toBe("BK-20261001-ABC123");
  });

  it("400s on an invalid payload", async () => {
    vi.doMock("@/lib/booking/service", () => ({ createBooking: vi.fn() }));
    const { POST } = await import("@/app/api/bookings/route");
    const res = await POST(new Request("http://localhost/api/bookings", {
      method: "POST", body: JSON.stringify({ ...validBody, email: "bad" }),
    }));
    expect(res.status).toBe(400);
  });

  it("402s when payment fails", async () => {
    vi.doMock("@/lib/booking/service", () => ({
      createBooking: vi.fn(async () => ({ reference: "BK-x", status: "failed", cardLast4: null })),
    }));
    const { POST } = await import("@/app/api/bookings/route");
    const res = await POST(new Request("http://localhost/api/bookings", {
      method: "POST", body: JSON.stringify(validBody),
    }));
    expect(res.status).toBe(402);
  });
});
