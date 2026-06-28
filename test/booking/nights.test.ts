import { describe, it, expect } from "vitest";
import { nightsBetween } from "@/lib/booking/nights";

describe("nightsBetween", () => {
  it("counts nights between two dates", () => {
    expect(nightsBetween("2026-10-01", "2026-10-07")).toBe(6);
  });
  it("returns 0 when same day", () => {
    expect(nightsBetween("2026-10-01", "2026-10-01")).toBe(0);
  });
});
