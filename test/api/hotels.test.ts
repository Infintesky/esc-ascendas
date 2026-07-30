import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// `getHotelsForDestination` is wrapped in Next's `unstable_cache`, which requires
// the incremental-cache context that only exists inside a real Next request.
// Outside it (plain Vitest), the wrapper throws "incrementalCache missing", so
// make it a pass-through to exercise the route's mapping logic directly.
vi.mock("next/cache", () => ({
  unstable_cache: (fn: (...args: unknown[]) => unknown) => fn,
}));

describe("GET /api/hotels", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn(async () =>
      new Response(JSON.stringify([
        { id: "h1", name: "Hotel One", latitude: 1, longitude: 2, address: "a", rating: 4 },
      ]), { status: 200 }),
    ));
  });
  afterEach(() => vi.unstubAllGlobals());

  it("returns mapped hotels for a destination", async () => {
    const { GET } = await import("@/app/api/hotels/route");
    const req = new Request("http://localhost/api/hotels?destination_id=RsBU");
    const res = await GET(req);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body[0].id).toBe("h1");
  });

  it("400s when destination_id is missing", async () => {
    const { GET } = await import("@/app/api/hotels/route");
    const res = await GET(new Request("http://localhost/api/hotels"));
    expect(res.status).toBe(400);
  });
});
