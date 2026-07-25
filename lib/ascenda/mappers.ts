import {
  HotelSchema,
  PricesResponseSchema,
  RoomSchema,
  type Hotel,
  type PricesResponse,
  type Room,
} from "./types";

function toStringArray(input: unknown): string[] {
  if (Array.isArray(input)) return input.map(String);
  if (input && typeof input === "object") return Object.keys(input as object);
  return [];
}

function num(input: unknown, fallback = 0): number {
  const n = typeof input === "string" ? Number(input) : input;
  return typeof n === "number" && !Number.isNaN(n) ? n : fallback;
}

export function mapHotel(raw: unknown): Hotel {
  const r = (raw ?? {}) as Record<string, unknown>;
  const img = (r.image_details ?? {}) as Record<string, unknown>;
  // TrustYou guest score (0–100); separate from the supplier star `rating`.
  const trustyou = (r.trustyou ?? {}) as Record<string, unknown>;
  const tyScore = (trustyou.score ?? {}) as Record<string, unknown>;
  // The supplier's `rating` is the official star class and is always a whole
  // number (e.g. 4.0). TrustYou's `kaligo_overall` is the decimal 0–5 rating, so
  // prefer it and fall back to the star class when a hotel has no reviews (0).
  const decimalRating = num(tyScore.kaligo_overall) || num(r.rating);
  return HotelSchema.parse({
    id: String(r.id ?? ""),
    name: String(r.name ?? ""),
    latitude: num(r.latitude),
    longitude: num(r.longitude),
    address: String(r.address ?? ""),
    rating: decimalRating,
    guestRating: num(tyScore.overall),
    description: r.description ? String(r.description) : "",
    amenities: toStringArray(r.amenities),
    imagePrefix: img.prefix ? String(img.prefix) : "",
    imageSuffix: img.suffix ? String(img.suffix) : "",
    imageCount: num(img.count),
  });
}

export function hotelImageUrls(hotel: Hotel): string[] {
  if (!hotel.imagePrefix || hotel.imageCount <= 0) return [];
  return Array.from(
    { length: hotel.imageCount },
    (_, i) => `${hotel.imagePrefix}${i + 1}${hotel.imageSuffix}`,
  );
}

export function mapPricesResponse(raw: unknown): PricesResponse {
  const r = (raw ?? {}) as Record<string, unknown>;
  const hotels = Array.isArray(r.hotels) ? r.hotels : [];
  return PricesResponseSchema.parse({
    completed: Boolean(r.completed),
    hotels: hotels.map((h) => {
      const hr = (h ?? {}) as Record<string, unknown>;
      return {
        id: String(hr.id ?? ""),
        searchRank: num(hr.searchRank),
        price: num(hr.price),
        marketRates: Array.isArray(hr.market_rates) ? hr.market_rates.map((m) => num(m)) : [],
      };
    }),
  });
}

export function mapRooms(raw: unknown): Room[] {
  const r = (raw ?? {}) as Record<string, unknown>;
  const rooms = Array.isArray(r.rooms) ? r.rooms : [];
  return rooms.map((room) => {
    const rr = (room ?? {}) as Record<string, unknown>;
    const images = Array.isArray(rr.images)
      ? rr.images.map((i) => String((i as Record<string, unknown>)?.url ?? i))
      : [];
    return RoomSchema.parse({
      key: String(rr.key ?? ""),
      roomType: String(rr.roomNormalizedDescription ?? rr.roomDescription ?? ""),
      freeCancellation: Boolean(rr.free_cancellation),
      description: rr.description ? String(rr.description) : "",
      longDescription: rr.long_description ? String(rr.long_description) : "",
      images,
      amenities: toStringArray(rr.amenities),
      price: num(rr.price),
      marketRates: Array.isArray(rr.market_rates) ? rr.market_rates.map((m) => num(m)) : [],
    });
  });
}
