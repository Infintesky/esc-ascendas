import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("GET /api/hotels/prices", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn(async () =>
      new Response(JSON.stringify({
        completed: false,
        hotels: [{ id: "h1", searchRank: 0.8, price: 200, market_rates: [210] }],
      }), { status: 200 }),
    ));
  });
  afterEach(() => vi.unstubAllGlobals());

  it("relays completed flag and mapped hotels", async () => {
    const { GET } = await import("@/app/api/hotels/prices/route");
    const req = new Request(
      "http://localhost/api/hotels/prices?destination_id=RsBU&checkin=2026-10-01&checkout=2026-10-07&rooms=1&guests=2",
    );
    const res = await GET(req);
    const body = await res.json();
    expect(body.completed).toBe(false);
    expect(body.hotels[0].id).toBe("h1");
  });

  it("400s on missing required params", async () => {
    const { GET } = await import("@/app/api/hotels/prices/route");
    const res = await GET(new Request("http://localhost/api/hotels/prices"));
    expect(res.status).toBe(400);
  });
});
