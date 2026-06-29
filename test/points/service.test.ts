import { describe, it, expect, vi } from "vitest";
import { recordPointsEntry } from "@/lib/points/service";

describe("recordPointsEntry", () => {
  it("appends an entry with the derived next balance", async () => {
    const insert = vi.fn(async (row) => row);
    const loadEntries = vi.fn(async () => [{ delta: 100 }, { delta: -20 }]); // balance 80
    const newBalance = await recordPointsEntry(
      { userId: "u1", delta: 50, reason: "earn: booking", bookingId: "b1" },
      { insert, loadEntries },
    );
    expect(newBalance).toBe(130);
    const row = insert.mock.calls[0][0];
    expect(row).toMatchObject({ userId: "u1", delta: 50, balanceAfter: 130, reason: "earn: booking", bookingId: "b1" });
  });

  it("rejects a redemption beyond balance", async () => {
    const insert = vi.fn();
    const loadEntries = vi.fn(async () => [{ delta: 30 }]);
    await expect(
      recordPointsEntry({ userId: "u1", delta: -50, reason: "redeem" }, { insert, loadEntries }),
    ).rejects.toThrow(/insufficient/i);
    expect(insert).not.toHaveBeenCalled();
  });
});
