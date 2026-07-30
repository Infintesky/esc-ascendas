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

export async function ascendaGet<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    throw new Error(`Ascenda request failed: ${res.status} ${url}`);
  }
  return (await res.json()) as T;
}
