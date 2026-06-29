"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { PaymentFields } from "./payment-fields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Prefill = Record<string, string>;

const labelClass = "mb-1.5 block text-sm font-medium text-foreground";

export function BookingForm({ prefill }: { prefill: Prefill }) {
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    line1: "", city: "", postalCode: "", country: "", messageToHotel: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError(null);
    const card = elements.getElement(CardElement);
    const pm = await stripe.createPaymentMethod({ type: "card", card: card! });
    if (!pm.paymentMethod) {
      setError("Invalid card details.");
      setSubmitting(false);
      return;
    }
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        destinationId: prefill.destination_id,
        hotelId: prefill.hotel_id,
        roomKey: prefill.room_key,
        roomType: prefill.room_type,
        checkin: prefill.checkin,
        checkout: prefill.checkout,
        adults: Number(prefill.guests ?? 1),
        children: 0,
        currency: prefill.currency ?? "SGD",
        price: Number(prefill.price),
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        messageToHotel: form.messageToHotel || undefined,
        billingAddress: {
          line1: form.line1, city: form.city, postalCode: form.postalCode, country: form.country,
        },
        paymentMethodId: pm.paymentMethod.id,
      }),
    });
    if (res.status === 201) {
      const { reference } = await res.json();
      router.push(`/book/confirmation/${reference}`);
      return;
    }
    setError(res.status === 402 ? "Payment failed. Please try another card." : "Could not complete booking.");
    setSubmitting(false);
  }

  const priceLabel =
    prefill.price ? `${prefill.currency ?? "SGD"} ${prefill.price}` : null;

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-2xl bg-card/90 p-6 ring-1 ring-foreground/10 shadow-xl shadow-primary/5 backdrop-blur"
    >
      <fieldset className="space-y-4">
        <legend className="mb-2 text-sm font-semibold text-foreground">Guest details</legend>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="firstName">First name</label>
            <Input id="firstName" aria-label="First name" className="h-11" value={form.firstName} onChange={(e) => set("firstName", e.target.value)} required />
          </div>
          <div>
            <label className={labelClass} htmlFor="lastName">Last name</label>
            <Input id="lastName" aria-label="Last name" className="h-11" value={form.lastName} onChange={(e) => set("lastName", e.target.value)} required />
          </div>
          <div>
            <label className={labelClass} htmlFor="email">Email</label>
            <Input id="email" aria-label="Email" type="email" className="h-11" value={form.email} onChange={(e) => set("email", e.target.value)} required />
          </div>
          <div>
            <label className={labelClass} htmlFor="phone">Phone</label>
            <Input id="phone" aria-label="Phone" className="h-11" value={form.phone} onChange={(e) => set("phone", e.target.value)} required />
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="mb-2 text-sm font-semibold text-foreground">Billing address</legend>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelClass} htmlFor="line1">Address</label>
            <Input id="line1" aria-label="Address" className="h-11" value={form.line1} onChange={(e) => set("line1", e.target.value)} required />
          </div>
          <div>
            <label className={labelClass} htmlFor="city">City</label>
            <Input id="city" aria-label="City" className="h-11" value={form.city} onChange={(e) => set("city", e.target.value)} required />
          </div>
          <div>
            <label className={labelClass} htmlFor="postalCode">Postal code</label>
            <Input id="postalCode" aria-label="Postal code" className="h-11" value={form.postalCode} onChange={(e) => set("postalCode", e.target.value)} required />
          </div>
          <div>
            <label className={labelClass} htmlFor="country">Country</label>
            <Input id="country" aria-label="Country" className="h-11" value={form.country} onChange={(e) => set("country", e.target.value)} required />
          </div>
        </div>
      </fieldset>

      <div>
        <label className={labelClass} htmlFor="messageToHotel">Message to hotel</label>
        <Textarea id="messageToHotel" aria-label="Message to hotel" rows={3} value={form.messageToHotel} onChange={(e) => set("messageToHotel", e.target.value)} />
      </div>

      <PaymentFields />

      {error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" disabled={submitting} className="h-11 w-full text-sm font-semibold">
        {submitting ? "Processing…" : priceLabel ? `Pay ${priceLabel} & book` : "Pay & book"}
      </Button>
    </form>
  );
}
