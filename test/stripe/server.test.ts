import { describe, it, expect, afterEach, vi } from "vitest";

describe("getStripe", () => {
  const original = process.env.STRIPE_SECRET_KEY;
  afterEach(() => {
    process.env.STRIPE_SECRET_KEY = original;
    vi.resetModules();
  });

  it("throws when the secret key is missing", async () => {
    delete process.env.STRIPE_SECRET_KEY;
    const { getStripe } = await import("@/lib/stripe/server");
    expect(() => getStripe()).toThrow(/STRIPE_SECRET_KEY/);
  });

  it("returns a client when the key is set", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_dummy";
    const { getStripe } = await import("@/lib/stripe/server");
    expect(getStripe()).toBeTruthy();
  });
});
