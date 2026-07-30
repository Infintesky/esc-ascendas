import { NextResponse } from "next/server";
import { buildPricesUrl, ascendaGet } from "@/lib/ascenda/client";
import { mapPricesResponse } from "@/lib/ascenda/mappers";
import type { PricesResponse } from "@/lib/ascenda/types";
import { parsePriceSearchParams, toPriceQuery } from "@/lib/search/params";

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
  const parsed = parsePriceSearchParams(searchParams);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid search params" }, { status: 400 });
  }
  const url = buildPricesUrl(toPriceQuery(parsed.data));
  const cached = getCached(url);
  if (cached) return NextResponse.json(cached);

  const raw = await ascendaGet<unknown>(url, { cache: "no-store" });
  const data = mapPricesResponse(raw);
  if (data.completed) cache.set(url, { at: Date.now(), data });
  return NextResponse.json(data);
}
