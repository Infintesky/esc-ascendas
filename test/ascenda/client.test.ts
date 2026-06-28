import { describe, it, expect } from "vitest";
import { buildPricesUrl, ASCENDA_BASE_URL } from "@/lib/ascenda/client";

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
