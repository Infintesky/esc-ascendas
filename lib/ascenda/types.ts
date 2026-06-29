import { z } from "zod";

export const HotelSchema = z.object({
  id: z.string(),
  name: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  address: z.string(),
  rating: z.number(),
  guestRating: z.number().default(0),
  description: z.string().default(""),
  amenities: z.array(z.string()).default([]),
  imagePrefix: z.string().default(""),
  imageSuffix: z.string().default(""),
  imageCount: z.number().default(0),
});
export type Hotel = z.infer<typeof HotelSchema>;

export const PriceResultSchema = z.object({
  id: z.string(),
  searchRank: z.number(),
  price: z.number(),
  marketRates: z.array(z.number()).default([]),
});
export type PriceResult = z.infer<typeof PriceResultSchema>;

export const PricesResponseSchema = z.object({
  completed: z.boolean(),
  hotels: z.array(PriceResultSchema),
});
export type PricesResponse = z.infer<typeof PricesResponseSchema>;

export const RoomSchema = z.object({
  key: z.string(),
  roomType: z.string(),
  freeCancellation: z.boolean().default(false),
  description: z.string().default(""),
  longDescription: z.string().default(""),
  images: z.array(z.string()).default([]),
  amenities: z.array(z.string()).default([]),
  price: z.number(),
  marketRates: z.array(z.number()).default([]),
});
export type Room = z.infer<typeof RoomSchema>;
