import { db } from "@/lib/db/client";
import { bookings } from "@/lib/db/schema";
import { generateBookingReference } from "./reference";
import { nightsBetween } from "./nights";
import { confirmCardPayment } from "@/lib/stripe/payment";
import { recordPointsEntry } from "@/lib/points/service";
import { pointsForBooking } from "@/lib/points/rules";
import type { CreateBookingInput } from "./schema";

type BookingRow = typeof bookings.$inferInsert;

type EarnFn = (args: { userId: string; delta: number; reason: string; bookingId?: string }) => Promise<number>;

type Deps = {
  confirm?: typeof confirmCardPayment;
  insert?: (row: BookingRow) => Promise<unknown>;
  earn?: EarnFn;
  now?: Date;
  rand?: () => number;
};

export async function createBooking(
  input: CreateBookingInput & { userId?: string },
  deps: Deps = {},
): Promise<{ reference: string; status: "confirmed" | "failed"; cardLast4: string | null }> {
  const confirm = deps.confirm ?? confirmCardPayment;
  const insert =
    deps.insert ?? (async (row: BookingRow) => db.insert(bookings).values(row));
  const earn: EarnFn = deps.earn ?? recordPointsEntry;
  const now = deps.now ?? new Date();

  const payment = await confirm({
    amount: input.price,
    currency: input.currency,
    paymentMethodId: input.paymentMethodId,
  });
  const status: "confirmed" | "failed" =
    payment.status === "succeeded" ? "confirmed" : "failed";
  const reference = generateBookingReference(now, deps.rand);

  const row: BookingRow = {
    bookingReference: reference,
    userId: input.userId ?? null,
    destinationId: input.destinationId,
    hotelId: input.hotelId,
    roomKey: input.roomKey,
    roomType: input.roomType,
    checkin: input.checkin,
    checkout: input.checkout,
    nights: nightsBetween(input.checkin, input.checkout),
    adults: input.adults,
    children: input.children,
    messageToHotel: input.messageToHotel ?? null,
    price: String(input.price),
    currency: input.currency,
    status,
    stripePaymentIntentId: payment.paymentIntentId,
    cardLast4: payment.cardLast4,
    cardBrand: payment.cardBrand,
  };

  await insert(row);

  if (status === "confirmed" && input.userId) {
    try {
      await earn({
        userId: input.userId,
        delta: pointsForBooking(input.price),
        reason: `earn: booking ${reference}`,
      });
    } catch {
      // earning must not fail the booking
    }
  }

  return { reference, status, cardLast4: payment.cardLast4 };
}
