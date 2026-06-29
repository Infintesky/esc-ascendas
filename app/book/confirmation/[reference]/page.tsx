import Link from "next/link";
import { eq } from "drizzle-orm";
import { CheckCircle2 } from "lucide-react";
import { db } from "@/lib/db/client";
import { bookings } from "@/lib/db/schema";
import { SiteShell } from "@/app/_components/site-shell";

export type BookingSummaryData = {
  reference: string;
  hotelId: string;
  destinationId: string;
  roomType: string;
  checkin: string;
  checkout: string;
  nights: number;
  adults: number;
  children: number;
  price: string;
  currency: string;
  status: string;
  cardLast4: string | null;
  cardBrand: string | null;
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border py-2 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  );
}

export function BookingSummary({ booking }: { booking: BookingSummaryData }) {
  return (
    <section className="rounded-2xl bg-card/90 p-6 ring-1 ring-foreground/10 shadow-xl shadow-primary/5 backdrop-blur">
      <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold capitalize text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
        <CheckCircle2 className="size-4" />
        Booking {booking.status}
      </p>
      <Row label="Reference" value={booking.reference} />
      <Row label="Room" value={booking.roomType} />
      <Row label="Stay" value={`${booking.checkin} → ${booking.checkout} (${booking.nights} nights)`} />
      <Row label="Guests" value={`${booking.adults} adults, ${booking.children} children`} />
      <Row label="Total paid" value={`${booking.currency} ${booking.price}`} />
      {booking.cardLast4 && (
        <Row label="Paid with" value={`${booking.cardBrand ?? "card"} •••• ${booking.cardLast4}`} />
      )}
    </section>
  );
}

export default async function ConfirmationPage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = await params;
  const rows = await db.select().from(bookings).where(eq(bookings.bookingReference, reference)).limit(1);
  const b = rows[0];
  if (!b) {
    return (
      <SiteShell width="sm">
        <p className="text-muted-foreground">Booking not found.</p>
      </SiteShell>
    );
  }
  return (
    <SiteShell width="sm">
      <h1 className="mb-1 text-2xl font-bold tracking-tight text-foreground">
        <span className="text-primary">
          Thank you!
        </span>
      </h1>
      <p className="mb-6 text-muted-foreground">Your booking is all set.</p>
      <BookingSummary
        booking={{
          reference: b.bookingReference, hotelId: b.hotelId, destinationId: b.destinationId,
          roomType: b.roomType, checkin: b.checkin, checkout: b.checkout, nights: b.nights,
          adults: b.adults, children: b.children, price: b.price, currency: b.currency,
          status: b.status, cardLast4: b.cardLast4, cardBrand: b.cardBrand,
        }}
      />
      <Link href="/" className="mt-6 inline-block text-sm font-medium text-primary hover:underline">
        ← Back to search
      </Link>
    </SiteShell>
  );
}
