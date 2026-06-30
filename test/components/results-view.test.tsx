import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { ResultsView } from "@/app/_components/results-view";
import { PricesProvider } from "@/app/_components/prices-provider";
import type { Hotel } from "@/lib/ascenda/types";

const hotels: Hotel[] = [
  { id: "h1", name: "Hotel One", latitude: 0, longitude: 0, address: "", rating: 5, guestRating: 88, description: "", amenities: [], imagePrefix: "", imageSuffix: "", imageCount: 0 },
];

const query = { destination_id: "RsBU", checkin: "2026-10-01", checkout: "2026-10-02", rooms: "1", guests: "2" };

function renderResults() {
  return render(
    <PricesProvider query={query}>
      <ResultsView hotels={hotels} query={query} />
    </PricesProvider>,
  );
}

describe("ResultsView", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn(async () =>
      new Response(JSON.stringify({ completed: true, hotels: [{ id: "h1", searchRank: 1, price: 250, marketRates: [] }] }), { status: 200 }),
    ));
  });
  afterEach(() => vi.unstubAllGlobals());

  it("renders only available (priced) hotels once their price arrives", async () => {
    // 1-night stay so the per-night price equals the supplier stay total.
    renderResults();
    // The hotel only appears after its price (= availability) streams in.
    await waitFor(() => expect(screen.getByText("Hotel One")).toBeInTheDocument());
    expect(screen.getByText(/250/)).toBeInTheDocument();
  });

  it("hides hotels that have no price (no availability)", async () => {
    vi.stubGlobal("fetch", vi.fn(async () =>
      new Response(JSON.stringify({ completed: true, hotels: [] }), { status: 200 }),
    ));
    renderResults();
    await waitFor(() =>
      expect(screen.getByText(/No hotels are available/i)).toBeInTheDocument(),
    );
    expect(screen.queryByText("Hotel One")).not.toBeInTheDocument();
  });
});
