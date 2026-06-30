import {
  pgTable,
  uuid,
  text,
  integer,
  numeric,
  date,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";

export const bookingStatus = pgEnum("booking_status", [
  "pending",
  "confirmed",
  "failed",
]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey(), // matches Supabase auth.users.id
  email: text("email").notNull(),
  salutation: text("salutation"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  phone: text("phone"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const bookings = pgTable("bookings", {
  id: uuid("id").primaryKey().defaultRandom(),
  bookingReference: text("booking_reference").notNull().unique(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  destinationId: text("destination_id").notNull(),
  hotelId: text("hotel_id").notNull(),
  roomKey: text("room_key").notNull(),
  checkin: date("checkin").notNull(),
  checkout: date("checkout").notNull(),
  nights: integer("nights").notNull(),
  adults: integer("adults").notNull(),
  children: integer("children").notNull().default(0),
  roomType: text("room_type").notNull(),
  messageToHotel: text("message_to_hotel"),
  // Guest contact details captured at booking time — persisted on the booking
  // itself so guest/anonymous bookings (user_id null) still carry who to contact.
  guestSalutation: text("guest_salutation"),
  guestFirstName: text("guest_first_name").notNull(),
  guestLastName: text("guest_last_name").notNull(),
  guestEmail: text("guest_email").notNull(),
  guestPhone: text("guest_phone").notNull(),
  // Billing address.
  billingLine1: text("billing_line1"),
  billingCity: text("billing_city"),
  billingPostalCode: text("billing_postal_code"),
  billingCountry: text("billing_country"),
  price: numeric("price").notNull(),
  currency: text("currency").notNull(),
  status: bookingStatus("status").notNull().default("pending"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  cardLast4: text("card_last4"),
  cardBrand: text("card_brand"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const pointsLedger = pgTable("points_ledger", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  bookingId: uuid("booking_id").references(() => bookings.id, { onDelete: "set null" }),
  delta: integer("delta").notNull(),
  balanceAfter: integer("balance_after").notNull(),
  reason: text("reason").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
