"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { BookingForm } from "@/app/_components/booking-form";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "");

export default function BookPage() {
  const sp = useSearchParams();
  const prefill = useMemo(() => {
    const out: Record<string, string> = {};
    sp.forEach((v, k) => {
      out[k] = v;
    });
    return out;
  }, [sp]);

  return (
    <main className="mx-auto max-w-xl px-6 py-10">
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-foreground">
        Complete your booking
      </h1>
      <Elements stripe={stripePromise}>
        <BookingForm prefill={prefill} />
      </Elements>
    </main>
  );
}
