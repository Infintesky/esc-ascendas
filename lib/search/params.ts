import { z } from "zod";

export function serializeGuests(rooms: number, guestsPerRoom: number): string {
  return Array.from({ length: rooms }, () => String(guestsPerRoom)).join("|");
}

const MS_PER_DAY = 86_400_000;

export function validateDates(
  checkin: string,
  checkout: string,
  now: Date = new Date(),
): { ok: boolean; error?: string } {
  const ci = new Date(checkin + "T00:00:00Z");
  const co = new Date(checkout + "T00:00:00Z");
  const today = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const daysOut = Math.round((ci.getTime() - today.getTime()) / MS_PER_DAY);
  if (daysOut < 3) return { ok: false, error: "Check-in must be at least 3 days away." };
  if (co.getTime() <= ci.getTime()) return { ok: false, error: "Check-out must be after check-in." };
  return { ok: true };
}

export const SearchParamsSchema = z.object({
  destinationId: z.string().min(1),
  checkin: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkout: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  currency: z.string().default("SGD"),
  countryCode: z.string().default("SG"),
  lang: z.string().default("en_US"),
  rooms: z.coerce.number().int().min(1).default(1),
  guests: z.coerce.number().int().min(1).default(1),
});
export type SearchParams = z.infer<typeof SearchParamsSchema>;
