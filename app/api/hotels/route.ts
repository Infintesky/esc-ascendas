import { NextResponse } from "next/server";
import { ASCENDA_BASE_URL, ascendaGet } from "@/lib/ascenda/client";
import { mapHotel } from "@/lib/ascenda/mappers";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const destinationId = searchParams.get("destination_id");
  if (!destinationId) {
    return NextResponse.json({ error: "destination_id is required" }, { status: 400 });
  }
  const url = `${ASCENDA_BASE_URL}/api/hotels?destination_id=${encodeURIComponent(destinationId)}`;
  const raw = await ascendaGet<unknown[]>(url, { next: { revalidate: 86_400 } });
  const hotels = (Array.isArray(raw) ? raw : []).map(mapHotel);
  return NextResponse.json(hotels);
}
