import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useHotelPrices } from "@/hooks/use-hotel-prices";

describe("useHotelPrices", () => {
  beforeEach(() => {
    const responses = [
      { completed: false, hotels: [{ id: "h1", searchRank: 1, price: 100, marketRates: [] }] },
      { completed: true, hotels: [{ id: "h2", searchRank: 2, price: 120, marketRates: [] }] },
    ];
    let call = 0;
    vi.stubGlobal("fetch", vi.fn(async () => {
      const body = responses[Math.min(call, responses.length - 1)];
      call += 1;
      return new Response(JSON.stringify(body), { status: 200 });
    }));
  });
  afterEach(() => vi.unstubAllGlobals());

  it("accumulates hotels until completed", async () => {
    const { result } = renderHook(() =>
      useHotelPrices({ destination_id: "RsBU", checkin: "2026-10-01", checkout: "2026-10-07", rooms: "1", guests: "2" }),
    );
    await waitFor(() => expect(result.current.completed).toBe(true), { timeout: 5000 });
    const ids = result.current.hotels.map((h) => h.id).sort();
    expect(ids).toEqual(["h1", "h2"]);
  });
});
