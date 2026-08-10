import { describe, it, expect, vi, afterEach } from "vitest";
import { buildPricesUrl, ASCENDA_BASE_URL, ascendaGet } from "@/lib/ascenda/client";

describe("buildPricesUrl", () => {
  const base = {
    destinationId: "RsBU",
    checkin: "2026-10-01",
    checkout: "2026-10-07",
    lang: "en_US",
    currency: "SGD",
    countryCode: "SG",
    guests: "2",
  };

  it("targets the destination prices endpoint", () => {
    const url = new URL(buildPricesUrl(base));
    expect(url.origin + url.pathname).toBe(`${ASCENDA_BASE_URL}/api/hotels/prices`);
  });

  it("injects the required stub params", () => {
    const url = new URL(buildPricesUrl(base));
    expect(url.searchParams.get("partner_id")).toBe("1089");
    expect(url.searchParams.get("landing_page")).toBe("wl-acme-earn");
    expect(url.searchParams.get("product_type")).toBe("earn");
  });

  it("passes through caller params", () => {
    const url = new URL(buildPricesUrl(base));
    expect(url.searchParams.get("destination_id")).toBe("RsBU");
    expect(url.searchParams.get("guests")).toBe("2");
  });
});

describe("ascendaGet", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("retries transient 429s then succeeds", async () => {
    let call = 0;
    vi.stubGlobal("fetch", vi.fn(async () => {
      call += 1;
      if (call < 3) return new Response("busy", { status: 429, headers: { "retry-after": "0" } });
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }));
    const data = await ascendaGet<{ ok: boolean }>("https://x.test/api");
    expect(data.ok).toBe(true);
    expect(call).toBe(3);
  });

  it("gives up after exhausting retries", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("busy", { status: 429, headers: { "retry-after": "0" } })));
    await expect(ascendaGet("https://x.test/api")).rejects.toThrow(/429/);
    expect(fetch).toHaveBeenCalledTimes(4); // initial + 3 retries
  });

  it("does not retry non-retryable statuses", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("nope", { status: 404 })));
    await expect(ascendaGet("https://x.test/api")).rejects.toThrow(/404/);
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
