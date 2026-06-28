import { db } from "@/lib/db/client";
import { bookings } from "@/lib/db/schema";
import { generateBookingReference } from "./reference";
import { nightsBetween } from "./nights";
import { confirmCardPayment } from "@/lib/stripe/payment";
import type { CreateBookingInput } from "./schema";

type BookingRow = typeof bookings.$inferInsert;

type Deps = {
  confirm?: typeof confirmCardPayment;
  insert?: (row: BookingRow) => Promise<unknown>;
  now?: Date;
  rand?: () => number;
};

export async function createBooking(
  input: CreateBookingInput,
  deps: Deps = {},
): Promise<{ reference: string; status: "confirmed" | "failed"; cardLast4: string | null }> {
  const confirm = deps.confirm ?? confirmCardPayment;
  const insert =
    deps.insert ?? (async (row: BookingRow) => db.insert(bookings).values(row));
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
  return { reference, status, cardLast4: payment.cardLast4 };
}
