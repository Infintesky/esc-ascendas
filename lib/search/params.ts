import { z } from "zod";
import type { PriceQuery } from "@/lib/ascenda/client";
import { MS_PER_DAY } from "@/lib/date";

export function serializeGuests(rooms: number, guestsPerRoom: number): string {
  return Array.from({ length: rooms }, () => String(guestsPerRoom)).join("|");
}

// Booking constraints.
export const MIN_CHECKIN_DAYS_AHEAD = 3; // Ascenda: check-in ≥ 3 days out
export const MAX_ROOMS = 8;
export const MAX_GUESTS_PER_ROOM = 4;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

// check date real
export function isRealISODate(s: string): boolean {
  if (!ISO_DATE.test(s)) 
    return false;
  const d = new Date(s + "T00:00:00Z");
  if (Number.isNaN(d.getTime())) 
    return false;
  return toISODate(d) === s;
}

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Add `n` days to a YYYY-MM-DD string, returning YYYY-MM-DD. */
export function addDaysISO(date: string, n: number): string {
  const d = new Date(date + "T00:00:00Z");
  if (Number.isNaN(d.getTime())) return date;
  d.setUTCDate(d.getUTCDate() + n);
  if (Number.isNaN(d.getTime())) return date;
  const out = toISODate(d);
  return ISO_DATE.test(out) ? out : date;
}

/** Earliest selectable check-in date (today + MIN_CHECKIN_DAYS_AHEAD), as YYYY-MM-DD. */
export function minCheckinDate(now: Date = new Date()): string {
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  today.setUTCDate(today.getUTCDate() + MIN_CHECKIN_DAYS_AHEAD);
  return toISODate(today);
}

/** Clamp an integer into [min, max]; falls back to min when not a finite number. */
export function clampInt(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.round(value)));
}

export function validateDates(
  checkin: string,
  checkout: string,
  now: Date = new Date(),
): { ok: boolean; error?: string } {
  if (!isRealISODate(checkin) || !isRealISODate(checkout)) {
    return { ok: false, error: "Please choose your check-in and check-out dates." };
  }
  const ci = new Date(checkin + "T00:00:00Z");
  const co = new Date(checkout + "T00:00:00Z");
  if (Number.isNaN(ci.getTime()) || Number.isNaN(co.getTime())) {
    return { ok: false, error: "Please choose valid dates." };
  }
  const today = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const daysOut = Math.round((ci.getTime() - today.getTime()) / MS_PER_DAY);
  if (daysOut < MIN_CHECKIN_DAYS_AHEAD) {
    return { ok: false, error: `Check-in must be at least ${MIN_CHECKIN_DAYS_AHEAD} days away.` };
  }
  if (co.getTime() <= ci.getTime()) return { ok: false, error: "Check-out must be after check-in." };
  return { ok: true };
}

export const SearchParamsSchema = z.object({
  destinationId: z.string().min(1),
  checkin: z.string().refine(isRealISODate, "real calendar date?"),
  checkout: z.string().refine(isRealISODate, "real calendar date?"),
  currency: z.string().default("SGD"),
  countryCode: z.string().default("SG"),
  lang: z.string().default("en_US"),
  rooms: z.coerce.number().int().min(1).max(MAX_ROOMS).default(1),
  guests: z.coerce.number().int().min(1).max(MAX_GUESTS_PER_ROOM).default(1),
});
export type SearchParams = z.infer<typeof SearchParamsSchema>;

/** Parse the shared hotel-price query string against `SearchParamsSchema`. */
export function parsePriceSearchParams(sp: URLSearchParams) {
  return SearchParamsSchema.safeParse({
    destinationId: sp.get("destination_id"),
    checkin: sp.get("checkin"),
    checkout: sp.get("checkout"),
    currency: sp.get("currency") ?? undefined,
    countryCode: sp.get("country_code") ?? undefined,
    lang: sp.get("lang") ?? undefined,
    rooms: sp.get("rooms") ?? undefined,
    guests: sp.get("guests") ?? undefined,
  });
}

/** Map validated search params to the upstream Ascenda `PriceQuery` shape. */
export function toPriceQuery(p: SearchParams): PriceQuery {
  return {
    destinationId: p.destinationId,
    checkin: p.checkin,
    checkout: p.checkout,
    lang: p.lang,
    currency: p.currency,
    countryCode: p.countryCode,
    guests: serializeGuests(p.rooms, p.guests),
  };
}
