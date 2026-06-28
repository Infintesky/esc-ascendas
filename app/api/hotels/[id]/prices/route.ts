import { NextResponse } from "next/server";
import { buildHotelPricesUrl, ascendaGet } from "@/lib/ascenda/client";
import { mapRooms } from "@/lib/ascenda/mappers";
import { SearchParamsSchema, serializeGuests } from "@/lib/search/params";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
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
  if (!parsed.success || !id) {
    return NextResponse.json({ error: "invalid params" }, { status: 400 });
  }
  const p = parsed.data;
  const url = buildHotelPricesUrl(id, {
    destinationId: p.destinationId,
    checkin: p.checkin,
    checkout: p.checkout,
    lang: p.lang,
    currency: p.currency,
    countryCode: p.countryCode,
    guests: serializeGuests(p.rooms, p.guests),
  });
  const raw = (await ascendaGet<Record<string, unknown>>(url, { cache: "no-store" })) ?? {};
  return NextResponse.json({ completed: Boolean(raw.completed), rooms: mapRooms(raw) });
}
