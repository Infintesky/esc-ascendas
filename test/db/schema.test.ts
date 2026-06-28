import { describe, it, expect } from "vitest";
import { bookingStatus, users, bookings, pointsLedger } from "@/lib/db/schema";

describe("db schema", () => {
  it("exposes the three core tables", () => {
    expect(users).toBeDefined();
    expect(bookings).toBeDefined();
    expect(pointsLedger).toBeDefined();
  });

  it("defines booking status values", () => {
    expect(bookingStatus.enumValues).toEqual(["pending", "confirmed", "failed"]);
  });
});
