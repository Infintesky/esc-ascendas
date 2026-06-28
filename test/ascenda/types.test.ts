import { describe, it, expect } from "vitest";
import { HotelSchema, RoomSchema, PricesResponseSchema } from "@/lib/ascenda/types";

describe("domain schemas", () => {
  it("applies defaults for optional hotel fields", () => {
    const hotel = HotelSchema.parse({
      id: "abc",
      name: "Test Hotel",
      latitude: 1.3,
      longitude: 103.8,
      address: "1 Road",
      rating: 4,
    });
    expect(hotel.amenities).toEqual([]);
    expect(hotel.imageCount).toBe(0);
  });

  it("rejects a room missing a key", () => {
    expect(() => RoomSchema.parse({ roomType: "Deluxe", price: 200 })).toThrow();
  });

  it("parses a prices response", () => {
    const res = PricesResponseSchema.parse({ completed: false, hotels: [] });
    expect(res.completed).toBe(false);
  });
});
