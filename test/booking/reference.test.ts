import { describe, it, expect } from "vitest";
import { generateBookingReference } from "@/lib/booking/reference";

describe("generateBookingReference", () => {
  it("matches the BK-YYYYMMDD-XXXXXX format", () => {
    const ref = generateBookingReference(new Date("2026-10-01T00:00:00Z"));
    expect(ref).toMatch(/^BK-20261001-[A-Z0-9]{6}$/);
  });

  it("produces different references across calls", () => {
    const a = generateBookingReference();
    const b = generateBookingReference();
    expect(a).not.toBe(b);
  });
});
