import { NextResponse } from "next/server";
import { buildHotelPricesUrl, ascendaGet } from "@/lib/ascenda/client";
import { mapRooms } from "@/lib/ascenda/mappers";
import { parsePriceSearchParams, toPriceQuery } from "@/lib/search/params";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const parsed = parsePriceSearchParams(searchParams);
  if (!parsed.success || !id) {
    return NextResponse.json({ error: "invalid params" }, { status: 400 });
  }
  const url = buildHotelPricesUrl(id, toPriceQuery(parsed.data));
  const raw = (await ascendaGet<Record<string, unknown>>(url, { cache: "no-store" })) ?? {};
  return NextResponse.json({ completed: Boolean(raw.completed), rooms: mapRooms(raw) });
}
