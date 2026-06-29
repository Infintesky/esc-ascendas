import { describe, it, expect, vi } from "vitest";
import { getCurrentUserId } from "@/lib/auth/session";

describe("getCurrentUserId", () => {
  it("returns the user id when authenticated", async () => {
    const client = { auth: { getUser: vi.fn(async () => ({ data: { user: { id: "u1" } } })) } };
    expect(await getCurrentUserId(client as never)).toBe("u1");
  });
  it("returns null when not authenticated", async () => {
    const client = { auth: { getUser: vi.fn(async () => ({ data: { user: null } })) } };
    expect(await getCurrentUserId(client as never)).toBeNull();
  });
});
