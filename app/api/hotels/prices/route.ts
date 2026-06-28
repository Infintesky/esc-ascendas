import { NextResponse } from "next/server";
import { buildPricesUrl, ascendaGet } from "@/lib/ascenda/client";
import { mapPricesResponse } from "@/lib/ascenda/mappers";
import { SearchParamsSchema, serializeGuests } from "@/lib/search/params";

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
  const raw = await ascendaGet<unknown>(url, { cache: "no-store" });
  return NextResponse.json(mapPricesResponse(raw));
}
