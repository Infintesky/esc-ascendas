import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { RoomList } from "@/app/_components/room-list";
import { RoomsProvider } from "@/app/_components/rooms-provider";

describe("RoomList", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn(async () =>
      new Response(JSON.stringify({
        completed: true,
        rooms: [{ key: "k1", roomType: "Deluxe King", freeCancellation: true, description: "", longDescription: "", images: [], amenities: [], price: 300, marketRates: [] }],
      }), { status: 200 }),
    ));
  });
  afterEach(() => vi.unstubAllGlobals());

  it("renders fetched rooms and a rate-confirmed badge", async () => {
    const query = { destination_id: "RsBU", checkin: "2026-10-01", checkout: "2026-10-07", rooms: "1", guests: "2" };
    render(
      <RoomsProvider hotelId="QDaO" query={query}>
        <RoomList hotelId="QDaO" query={query} />
      </RoomsProvider>,
    );
    await waitFor(() => expect(screen.getByText("Deluxe King")).toBeInTheDocument());
    expect(screen.getByText(/rate confirmed/i)).toBeInTheDocument();
  });
});
