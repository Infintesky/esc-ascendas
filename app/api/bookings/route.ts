import { NextResponse } from "next/server";
import { CreateBookingSchema } from "@/lib/booking/schema";
import { createBooking } from "@/lib/booking/service";

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  const parsed = CreateBookingSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid payload", issues: parsed.error.issues }, { status: 400 });
  }
  const result = await createBooking(parsed.data);
  if (result.status === "failed") {
    return NextResponse.json({ error: "payment failed", reference: result.reference }, { status: 402 });
  }
  return NextResponse.json({ reference: result.reference, status: result.status }, { status: 201 });
}
