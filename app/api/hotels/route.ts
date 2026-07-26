import { NextResponse } from "next/server";
import { getHotelsForDestination } from "@/lib/ascenda/hotels";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const destinationId = searchParams.get("destination_id");
  if (!destinationId) {
    return NextResponse.json({ error: "destination_id is required" }, { status: 400 });
  }
  const hotels = await getHotelsForDestination(destinationId);
  return NextResponse.json(hotels);
}
