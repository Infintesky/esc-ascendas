import { NextResponse } from "next/server";
import { ASCENDA_BASE_URL, ascendaGet } from "@/lib/ascenda/client";
import { mapHotel } from "@/lib/ascenda/mappers";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "hotel id is required" }, { status: 400 });
  }
  const url = `${ASCENDA_BASE_URL}/api/hotels/${encodeURIComponent(id)}`;
  const raw = await ascendaGet<unknown>(url, { next: { revalidate: 86_400 } });
  return NextResponse.json(mapHotel(raw));
}
