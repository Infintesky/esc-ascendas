import { describe, it, expect, vi } from "vitest";
import { createBooking } from "@/lib/booking/service";

vi.mock("@/lib/email/reconciliation", () => ({
  sendReconciliationEmail: vi.fn().mockResolvedValue(undefined),
}));

const input = {
  destinationId: "RsBU", hotelId: "QDaO", roomKey: "k1", roomType: "Deluxe",
  checkin: "2026-10-01", checkout: "2026-10-07", adults: 2, children: 0,
  currency: "SGD", price: 1200, firstName: "Ada", lastName: "Lovelace",
  email: "ada@example.com", phone: "+6512345678",
  billingAddress: { line1: "1 Road", city: "Singapore", postalCode: "123456", country: "SG" },
  paymentMethodId: "pm_test_123",
};

describe("createBooking", () => {
  it("persists a confirmed booking with only non-PII payment refs", async () => {
    const insert = vi.fn(async (row) => row);
    const confirm = vi.fn(async () => ({
      status: "succeeded", paymentIntentId: "pi_1", cardLast4: "4242", cardBrand: "visa", clientSecret: "cs",
    }));
    const out = await createBooking(input, {
      insert, confirm,
      now: new Date("2026-09-01T00:00:00Z"),
      rand: () => 0,
    });
    expect(out.status).toBe("confirmed");
    expect(out.cardLast4).toBe("4242");
    const row = insert.mock.calls[0][0];
    expect(row.status).toBe("confirmed");
    expect(row.nights).toBe(6);
    expect(row.stripePaymentIntentId).toBe("pi_1");
    expect(row.cardLast4).toBe("4242");
    expect(row).not.toHaveProperty("paymentMethodId");
    expect(JSON.stringify(row)).not.toContain("pm_test_123");
  });

  it("marks the booking failed when payment is not successful", async () => {
    const insert = vi.fn(async (row) => row);
    const confirm = vi.fn(async () => ({
      status: "requires_payment_method", paymentIntentId: "pi_2", cardLast4: null, cardBrand: null, clientSecret: null,
    }));
    const out = await createBooking(input, { insert, confirm });
    expect(out.status).toBe("failed");
  });

  it("sends a reconciliation email and rethrows when DB insert fails after payment succeeds", async () => {
    const { sendReconciliationEmail } = await import("@/lib/email/reconciliation");

    const confirm = vi.fn(async () => ({
      status: "succeeded", paymentIntentId: "pi_3", cardLast4: "4242", cardBrand: "visa", clientSecret: "cs",
    }));
    const insert = vi.fn(async () => {
      throw new Error("DB connection lost");
    });

    await expect(
      createBooking(input, { insert, confirm }),
    ).rejects.toThrow("DB connection lost");

    expect(sendReconciliationEmail).toHaveBeenCalledTimes(1);
    expect(sendReconciliationEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "ada@example.com",
        paymentIntentId: "pi_3",
        amount: 1200,
        currency: "SGD",
      }),
    );
  });

  it("does NOT send a reconciliation email when payment itself fails (nothing to reconcile)", async () => {
    const { sendReconciliationEmail } = await import("@/lib/email/reconciliation");
    vi.mocked(sendReconciliationEmail).mockClear();

    const confirm = vi.fn(async () => ({
      status: "requires_payment_method", paymentIntentId: "pi_4", cardLast4: null, cardBrand: null, clientSecret: null,
    }));
    const insert = vi.fn(async () => {
      throw new Error("DB connection lost");
    });

    await expect(
      createBooking(input, { insert, confirm }),
    ).rejects.toThrow("DB connection lost");

    expect(sendReconciliationEmail).not.toHaveBeenCalled();
  });
});
