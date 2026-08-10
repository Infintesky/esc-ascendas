export const ASCENDA_BASE_URL = "https://hotelapi.loyalty.dev";

const STUB_PARAMS = {
  partner_id: "1089",
  landing_page: "wl-acme-earn",
  product_type: "earn",
} as const;

export type PriceQuery = {
  destinationId: string;
  checkin: string;
  checkout: string;
  lang: string;
  currency: string;
  countryCode: string;
  guests: string;
};

function applyStub(url: URL): void {
  for (const [k, v] of Object.entries(STUB_PARAMS)) url.searchParams.set(k, v);
}

function applyPriceParams(url: URL, q: PriceQuery): void {
  url.searchParams.set("destination_id", q.destinationId);
  url.searchParams.set("checkin", q.checkin);
  url.searchParams.set("checkout", q.checkout);
  url.searchParams.set("lang", q.lang);
  url.searchParams.set("currency", q.currency);
  url.searchParams.set("country_code", q.countryCode);
  url.searchParams.set("guests", q.guests);
  applyStub(url);
}

export function buildPricesUrl(q: PriceQuery): string {
  const url = new URL(`${ASCENDA_BASE_URL}/api/hotels/prices`);
  applyPriceParams(url, q);
  return url.toString();
}

export function buildHotelPricesUrl(hotelId: string, q: PriceQuery): string {
  const url = new URL(`${ASCENDA_BASE_URL}/api/hotels/${hotelId}/price`);
  applyPriceParams(url, q);
  return url.toString();
}

// Upstream throttles bursts (429) and briefly 503s while the price aggregation
// warms up. Both are transient, so retry a few times with backoff before giving
// up — honoring a Retry-After header when the server sends one.
const RETRYABLE_STATUS = new Set([429, 503]);
const MAX_RETRIES = 3;
const BASE_BACKOFF_MS = 400;

function parseRetryAfter(value: string | null): number | null {
  if (!value) return null;
  const seconds = Number(value);
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000);
  const date = Date.parse(value);
  if (Number.isFinite(date)) return Math.max(0, date - Date.now());
  return null;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function ascendaGet<T>(url: string, init?: RequestInit): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url, init);
    if (res.ok) return (await res.json()) as T;
    if (attempt < MAX_RETRIES && RETRYABLE_STATUS.has(res.status)) {
      const retryAfter = parseRetryAfter(res.headers.get("retry-after"));
      const backoff = retryAfter ?? BASE_BACKOFF_MS * 2 ** attempt;
      await sleep(backoff);
      continue;
    }
    throw new Error(`Ascenda request failed: ${res.status} ${url}`);
  }
}
