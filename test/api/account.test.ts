import { describe, it, expect, vi, afterEach } from "vitest";

afterEach(() => vi.resetModules());

describe("DELETE /api/account", () => {
  it("401s when unauthenticated", async () => {
    vi.doMock("@/lib/auth/supabase-server", () => ({ createServerSupabase: async () => ({}) }));
    vi.doMock("@/lib/auth/session", () => ({ getCurrentUserId: async () => null }));
    vi.doMock("@/lib/account/gdpr", () => ({ deleteUserData: vi.fn() }));
    const { DELETE } = await import("@/app/api/account/route");
    const res = await DELETE(new Request("http://localhost/api/account", { method: "DELETE" }));
    expect(res.status).toBe(401);
  });

  it("deletes the authenticated user's data", async () => {
    const deleteUserData = vi.fn(async () => ({ deletedUser: true }));
    vi.doMock("@/lib/auth/supabase-server", () => ({ createServerSupabase: async () => ({}) }));
    vi.doMock("@/lib/auth/session", () => ({ getCurrentUserId: async () => "u1" }));
    vi.doMock("@/lib/account/gdpr", () => ({ deleteUserData }));
    const { DELETE } = await import("@/app/api/account/route");
    const res = await DELETE(new Request("http://localhost/api/account", { method: "DELETE" }));
    expect(res.status).toBe(200);
    expect(deleteUserData).toHaveBeenCalledWith("u1");
  });
});

describe("GET /api/account/points", () => {
  it("returns balance and history for an authed user", async () => {
    vi.doMock("@/lib/auth/supabase-server", () => ({ createServerSupabase: async () => ({}) }));
    vi.doMock("@/lib/auth/session", () => ({ getCurrentUserId: async () => "u1" }));
    vi.doMock("@/lib/points/service", () => ({
      getBalance: async () => 1200,
      getHistory: async () => [{ delta: 1200, balanceAfter: 1200, reason: "earn", createdAt: new Date() }],
    }));
    const { GET } = await import("@/app/api/account/points/route");
    const res = await GET(new Request("http://localhost/api/account/points"));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.balance).toBe(1200);
    expect(body.history).toHaveLength(1);
  });
});
