"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { CheckCircle2 } from "lucide-react";
import { PaymentFields } from "./payment-fields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createBrowserSupabase } from "@/lib/auth/supabase-browser";
import { isTestEmail, TEST_EMAIL } from "@/lib/auth/test-email";
import { COUNTRIES } from "@/lib/geo/countries";

type Prefill = Record<string, string>;

const labelClass = "mb-1.5";
const digitsOnly = (v: string) => v.replace(/\D/g, "");

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

  // Email OTP verification state.
  const [emailVerified, setEmailVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpBusy, setOtpBusy] = useState(false);
  const [otpMessage, setOtpMessage] = useState<string | null>(null);

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function setEmail(v: string) {
    set("email", v);
    // Any change to the email invalidates a prior verification.
    setEmailVerified(false);
    setOtpSent(false);
    setOtpCode("");
    setOtpMessage(null);
  }

  async function sendOtp() {
    setOtpMessage(null);
    if (!form.email) {
      setOtpMessage("Enter your email first.");
      return;
    }
    // Reserved demo address skips the OTP challenge entirely.
    if (isTestEmail(form.email)) {
      setEmailVerified(true);
      setOtpMessage("Demo email — verification skipped.");
      return;
    }
    setOtpBusy(true);
    const supabase = createBrowserSupabase();
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: form.email,
      options: { shouldCreateUser: true },
    });
    setOtpBusy(false);
    if (otpError) {
      setOtpMessage("Could not send code. Check the email address.");
      return;
    }
    setOtpSent(true);
    setOtpMessage("We sent a 6-digit code to your email.");
  }

  async function confirmOtp() {
    setOtpMessage(null);
    setOtpBusy(true);
    const supabase = createBrowserSupabase();
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email: form.email,
      token: otpCode,
      type: "email",
    });
    setOtpBusy(false);
    if (verifyError) {
      setOtpMessage("Invalid or expired code. Try again.");
      return;
    }
    setEmailVerified(true);
    setOtpSent(false);
    setOtpMessage("Email verified.");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    if (!emailVerified) {
      setError("Please verify your email before booking.");
      return;
    }
    if (!form.country) {
      setError("Please select your billing country.");
      return;
    }
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
    <Card className="bg-card/90 shadow-xl shadow-primary/5 backdrop-blur [--card-spacing:--spacing(6)]">
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
      <fieldset className="space-y-4">
        <legend className="mb-2 text-sm font-semibold text-foreground">Guest details</legend>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label className={labelClass} htmlFor="firstName">First name</Label>
            <Input id="firstName" aria-label="First name" className="h-11" value={form.firstName} onChange={(e) => set("firstName", e.target.value)} required />
          </div>
          <div>
            <Label className={labelClass} htmlFor="lastName">Last name</Label>
            <Input id="lastName" aria-label="Last name" className="h-11" value={form.lastName} onChange={(e) => set("lastName", e.target.value)} required />
          </div>
          <div>
            <Label className={labelClass} htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              aria-label="Phone"
              type="tel"
              inputMode="numeric"
              className="h-11"
              value={form.phone}
              onChange={(e) => set("phone", digitsOnly(e.target.value))}
              required
            />
          </div>
          <div className="sm:col-span-2">
            <Label className={labelClass} htmlFor="email">Email</Label>
            <div className="flex gap-2">
              <Input
                id="email"
                aria-label="Email"
                type="email"
                className="h-11"
                value={form.email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={emailVerified}
                required
              />
              {emailVerified ? (
                <span className="inline-flex h-11 shrink-0 items-center gap-1 rounded-md px-3 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="size-4" />
                  Verified
                </span>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 shrink-0"
                  disabled={otpBusy}
                  onClick={sendOtp}
                >
                  {otpBusy ? "Sending…" : otpSent ? "Resend" : "Verify"}
                </Button>
              )}
            </div>
            {otpSent && !emailVerified && (
              <div className="mt-2 flex gap-2">
                <Input
                  aria-label="Verification code"
                  inputMode="numeric"
                  placeholder="6-digit code"
                  className="h-11"
                  value={otpCode}
                  onChange={(e) => setOtpCode(digitsOnly(e.target.value).slice(0, 6))}
                />
                <Button
                  type="button"
                  className="h-11 shrink-0"
                  disabled={otpBusy || otpCode.length < 6}
                  onClick={confirmOtp}
                >
                  Confirm
                </Button>
              </div>
            )}
            {otpMessage && (
              <p className="mt-1.5 text-xs text-muted-foreground">{otpMessage}</p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              Tip: use <code className="rounded bg-muted px-1">{TEST_EMAIL}</code> to skip
              verification while testing.
            </p>
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="mb-2 text-sm font-semibold text-foreground">Billing address</legend>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label className={labelClass} htmlFor="line1">Address</Label>
            <Input id="line1" aria-label="Address" className="h-11" value={form.line1} onChange={(e) => set("line1", e.target.value)} required />
          </div>
          <div>
            <Label className={labelClass} htmlFor="city">City</Label>
            <Input id="city" aria-label="City" className="h-11" value={form.city} onChange={(e) => set("city", e.target.value)} required />
          </div>
          <div>
            <Label className={labelClass} htmlFor="postalCode">Postal code</Label>
            <Input
              id="postalCode"
              aria-label="Postal code"
              inputMode="numeric"
              className="h-11"
              value={form.postalCode}
              onChange={(e) => set("postalCode", digitsOnly(e.target.value))}
              required
            />
          </div>
          <div>
            <Label className={labelClass} htmlFor="country">Country</Label>
            <Select value={form.country} onValueChange={(v) => set("country", v ?? "")}>
              <SelectTrigger id="country" aria-label="Country" className="h-11 w-full">
                <SelectValue placeholder="Select country">
                  {(v: string) =>
                    COUNTRIES.find((c) => c.code === v)?.name ?? "Select country"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </fieldset>

      <div>
        <Label className={labelClass} htmlFor="messageToHotel">Message to hotel</Label>
        <Textarea id="messageToHotel" aria-label="Message to hotel" rows={3} value={form.messageToHotel} onChange={(e) => set("messageToHotel", e.target.value)} />
      </div>

      <PaymentFields />

      {error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" disabled={submitting || !emailVerified} className="h-11 w-full text-sm font-semibold">
        {submitting
          ? "Processing…"
          : !emailVerified
            ? "Verify your email to continue"
            : priceLabel
              ? `Pay ${priceLabel} & book`
              : "Pay & book"}
      </Button>
        </form>
      </CardContent>
    </Card>
  );
}
