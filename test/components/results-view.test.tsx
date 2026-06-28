import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { ResultsView } from "@/app/_components/results-view";
import type { Hotel } from "@/lib/ascenda/types";

const hotels: Hotel[] = [
  { id: "h1", name: "Hotel One", latitude: 0, longitude: 0, address: "", rating: 5, description: "", amenities: [], imagePrefix: "", imageSuffix: "", imageCount: 0 },
];

describe("ResultsView", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn(async () =>
      new Response(JSON.stringify({ completed: true, hotels: [{ id: "h1", searchRank: 1, price: 250, marketRates: [] }] }), { status: 200 }),
    ));
  });
  afterEach(() => vi.unstubAllGlobals());

  it("renders hotels with their price once polling completes", async () => {
    render(<ResultsView hotels={hotels} query={{ destination_id: "RsBU", checkin: "2026-10-01", checkout: "2026-10-07", rooms: "1", guests: "2" }} />);
    expect(screen.getByText("Hotel One")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText(/250/)).toBeInTheDocument());
  });
});
