import { describe, it, expect } from "vitest";
import { pointsForBooking } from "@/lib/points/rules";

describe("pointsForBooking", () => {
  it("awards 1 point per currency unit, floored", () => {
    expect(pointsForBooking(1200.75)).toBe(1200);
  });
  it("never awards negative points", () => {
    expect(pointsForBooking(-5)).toBe(0);
  });
});
