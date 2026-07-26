import { unstable_cache } from "next/cache";
import { ASCENDA_BASE_URL, ascendaGet } from "./client";
import { mapHotel } from "./mappers";
import type { Hotel } from "./types";

// The upstream static hotel list is ~2.6MB, which exceeds Next's 2MB per-entry
// fetch-cache limit — caching that raw response fails and logs a warning on every
// request. Instead we fetch it uncached (`no-store`) and cache the much smaller
// mapped result (~1.5MB) for a day, keyed per destination.
export const getHotelsForDestination = unstable_cache(
  async (destinationId: string): Promise<Hotel[]> => {
    const url = `${ASCENDA_BASE_URL}/api/hotels?destination_id=${encodeURIComponent(destinationId)}`;
    const raw = await ascendaGet<unknown[]>(url, { cache: "no-store" });
    return (Array.isArray(raw) ? raw : []).map(mapHotel);
  },
  ["hotels"], // cache key prefix; the destinationId argument is part of the key
  { revalidate: 86_400 },
);
