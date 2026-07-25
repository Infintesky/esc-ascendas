import { describe, it, expect } from "vitest";
import { mapHotel, mapPricesResponse, mapRooms, hotelImageUrls } from "@/lib/ascenda/mappers";

describe("mapHotel", () => {
  it("normalizes raw supplier hotel json", () => {
    const hotel = mapHotel({
      id: "QDaO",
      name: "Grand Hotel",
      latitude: 1.29,
      longitude: 103.85,
      address: "1 Marina",
      rating: 5,
      description: "Nice",
      amenities: { wifi: true, pool: true },
      image_details: { prefix: "https://img/", suffix: ".jpg", count: 3 },
    });
    expect(hotel.id).toBe("QDaO");
    expect(hotel.amenities).toContain("wifi");
    expect(hotel.imageCount).toBe(3);
  });

  it("prefers TrustYou kaligo_overall as the decimal rating", () => {
    const hotel = mapHotel({
      id: "a", name: "A", latitude: 0, longitude: 0, address: "z", rating: 4,
      trustyou: { score: { overall: 85, kaligo_overall: 4.3 } },
    });
    expect(hotel.rating).toBe(4.3);
    expect(hotel.guestRating).toBe(85);
  });

  it("falls back to the star rating when there are no reviews", () => {
    const hotel = mapHotel({
      id: "a", name: "A", latitude: 0, longitude: 0, address: "z", rating: 5,
      trustyou: { score: { overall: null, kaligo_overall: 0 } },
    });
    expect(hotel.rating).toBe(5);
  });

  it("tolerates missing optional fields", () => {
    const hotel = mapHotel({
      id: "x",
      name: "Y",
      latitude: 0,
      longitude: 0,
      address: "z",
      rating: 3,
    });
    expect(hotel.amenities).toEqual([]);
    expect(hotel.description).toBe("");
  });
});

describe("hotelImageUrls", () => {
  it("builds indexed image urls", () => {
    const urls = hotelImageUrls(mapHotel({
      id: "x", name: "Y", latitude: 0, longitude: 0, address: "z", rating: 3,
      image_details: { prefix: "https://img/", suffix: ".jpg", count: 2 },
    }));
    expect(urls).toEqual(["https://img/1.jpg", "https://img/2.jpg"]);
  });
});

describe("mapPricesResponse", () => {
  it("maps completed flag and hotels", () => {
    const res = mapPricesResponse({
      completed: true,
      hotels: [{ id: "a", searchRank: 0.9, price: 250, market_rates: [260, 270] }],
    });
    expect(res.completed).toBe(true);
    expect(res.hotels[0].marketRates).toEqual([260, 270]);
  });

  it("defaults missing hotels array to empty", () => {
    const res = mapPricesResponse({ completed: false });
    expect(res.hotels).toEqual([]);
  });
});

describe("mapRooms", () => {
  it("maps rooms under the rooms key", () => {
    const rooms = mapRooms({
      rooms: [{
        key: "k1",
        roomNormalizedDescription: "Deluxe King",
        free_cancellation: true,
        description: "d",
        long_description: "ld",
        images: [{ url: "https://img/r1.jpg" }],
        amenities: ["wifi"],
        price: 300,
        market_rates: [320],
      }],
    });
    expect(rooms).toHaveLength(1);
    expect(rooms[0].roomType).toBe("Deluxe King");
    expect(rooms[0].images).toEqual(["https://img/r1.jpg"]);
    expect(rooms[0].freeCancellation).toBe(true);
  });
});
