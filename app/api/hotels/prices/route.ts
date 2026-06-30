import { NextResponse } from "next/server";
import { buildPricesUrl, ascendaGet } from "@/lib/ascenda/client";
import { mapPricesResponse } from "@/lib/ascenda/mappers";
import type { PricesResponse } from "@/lib/ascenda/types";
import { SearchParamsSchema, serializeGuests } from "@/lib/search/params";

// Once Ascenda reports `completed: true`, the priced result is stable for the
// search window, so we cache it keyed by the upstream URL. Subsequent polls and
// repeat searches for the same destination/dates return instantly instead of
// re-warming the supplier aggregation. The cache is per-instance (in-memory);
// good enough to collapse a polling burst and nearby repeat searches.
const COMPLETED_TTL_MS = 5 * 60_000;
const cache = new Map<string, { at: number; data: PricesResponse }>();

function getCached(key: string): PricesResponse | null {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() - hit.at > COMPLETED_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return hit.data;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = SearchParamsSchema.safeParse({
    destinationId: searchParams.get("destination_id"),
    checkin: searchParams.get("checkin"),
    checkout: searchParams.get("checkout"),
    currency: searchParams.get("currency") ?? undefined,
    countryCode: searchParams.get("country_code") ?? undefined,
    lang: searchParams.get("lang") ?? undefined,
    rooms: searchParams.get("rooms") ?? undefined,
    guests: searchParams.get("guests") ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid search params" }, { status: 400 });
  }
  const p = parsed.data;
  const url = buildPricesUrl({
    destinationId: p.destinationId,
    checkin: p.checkin,
    checkout: p.checkout,
    lang: p.lang,
    currency: p.currency,
    countryCode: p.countryCode,
    guests: serializeGuests(p.rooms, p.guests),
  });
  const cached = getCached(url);
  if (cached) return NextResponse.json(cached);

  const raw = await ascendaGet<unknown>(url, { cache: "no-store" });
  const data = mapPricesResponse(raw);
  if (data.completed) cache.set(url, { at: Date.now(), data });
  return NextResponse.json(data);
}
