import { z } from "zod";
import { isRealISODate } from "@/lib/date";

export const CreateBookingSchema = z.object({
  destinationId: z.string().min(1),
  hotelId: z.string().min(1),
  roomKey: z.string().min(1),
  roomType: z.string().min(1),
  checkin: z.string().refine(isRealISODate, "real calendar date?"),
  checkout: z.string().refine(isRealISODate, "real calendar date?"),
  adults: z.coerce.number().int().min(1),
  children: z.coerce.number().int().min(0).default(0),
  currency: z.string().min(1),
  price: z.coerce.number().positive(),
  salutation: z.string().optional(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.email(),
  phone: z.string().min(1),
  messageToHotel: z.string().optional(),
  billingAddress: z.object({
    line1: z.string().min(1),
    city: z.string().min(1),
    postalCode: z.string().min(1),
    country: z.string().min(1),
  }),
  paymentMethodId: z.string().min(1),
});
export type CreateBookingInput = z.infer<typeof CreateBookingSchema>;
