import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { bookings } from "@/lib/db/schema";
import { requireUserId } from "@/lib/auth/require-user";

export async function GET() {
  const { userId, response } = await requireUserId();
  if (response) return response;

  const rows = await db
    .select()
    .from(bookings)
    .where(eq(bookings.userId, userId))
    .orderBy(desc(bookings.createdAt));

  // The owner sees their own bookings. Card data stays masked; we omit billing
  // address from the list view to limit PII exposure (it remains on the booking).
  const list = rows.map((b) => ({
    reference: b.bookingReference,
    hotelId: b.hotelId,
    roomType: b.roomType,
    checkin: b.checkin,
    checkout: b.checkout,
    nights: b.nights,
    adults: b.adults,
    children: b.children,
    price: b.price,
    currency: b.currency,
    status: b.status,
    cardLast4: b.cardLast4,
    cardBrand: b.cardBrand,
    guestName: `${b.guestFirstName} ${b.guestLastName}`.trim(),
    createdAt: b.createdAt,
  }));

  return NextResponse.json({ bookings: list });
}
