import { describe, it, expect, vi } from "vitest";
import { deleteUserData } from "@/lib/account/gdpr";

describe("deleteUserData", () => {
  it("de-identifies bookings, removes ledger + user, and deletes the auth user", async () => {
    const calls: string[] = [];
    const ops = {
      nullBookings: vi.fn(async () => { calls.push("nullBookings"); }),
      deleteLedger: vi.fn(async () => { calls.push("deleteLedger"); }),
      deleteUser: vi.fn(async () => { calls.push("deleteUser"); }),
      deleteAuthUser: vi.fn(async () => { calls.push("deleteAuthUser"); }),
    };
    const out = await deleteUserData("u1", ops);
    expect(out.deletedUser).toBe(true);
    expect(ops.nullBookings).toHaveBeenCalledWith("u1");
    expect(ops.deleteLedger).toHaveBeenCalledWith("u1");
    expect(ops.deleteUser).toHaveBeenCalledWith("u1");
    expect(ops.deleteAuthUser).toHaveBeenCalledWith("u1");
    // bookings must be de-identified before the user row is removed (FK safety)
    expect(calls.indexOf("nullBookings")).toBeLessThan(calls.indexOf("deleteUser"));
  });
});
