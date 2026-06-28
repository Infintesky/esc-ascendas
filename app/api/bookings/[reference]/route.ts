import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { bookings } from "@/lib/db/schema";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ reference: string }> },
) {
  const { reference } = await params;
  const rows = await db.select().from(bookings).where(eq(bookings.bookingReference, reference)).limit(1);
  const booking = rows[0];
  if (!booking) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  // Only non-PII / masked payment data leaves the server.
  return NextResponse.json({
    reference: booking.bookingReference,
    hotelId: booking.hotelId,
    destinationId: booking.destinationId,
    roomType: booking.roomType,
    checkin: booking.checkin,
    checkout: booking.checkout,
    nights: booking.nights,
    adults: booking.adults,
    children: booking.children,
    price: booking.price,
    currency: booking.currency,
    status: booking.status,
    cardLast4: booking.cardLast4,
    cardBrand: booking.cardBrand,
  });
}
