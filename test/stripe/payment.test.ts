import { describe, it, expect, vi } from "vitest";

const create = vi.fn(async () => ({
  id: "pi_123",
  status: "succeeded",
  client_secret: "cs_123",
  charges: { data: [{ payment_method_details: { card: { last4: "4242", brand: "visa" } } }] },
}));

vi.mock("@/lib/stripe/server", () => ({
  getStripe: () => ({ paymentIntents: { create } }),
}));

import { confirmCardPayment } from "@/lib/stripe/payment";

describe("confirmCardPayment", () => {
  it("creates a confirmed PaymentIntent in the smallest currency unit", async () => {
    const out = await confirmCardPayment({ amount: 1200, currency: "SGD", paymentMethodId: "pm_1" });
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 120000, currency: "sgd", confirm: true, payment_method: "pm_1" }),
    );
    expect(out.status).toBe("succeeded");
    expect(out.paymentIntentId).toBe("pi_123");
    expect(out.cardLast4).toBe("4242");
    expect(out.cardBrand).toBe("visa");
  });
});
