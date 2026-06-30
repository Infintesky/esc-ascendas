"use client";

import { CardElement } from "@stripe/react-stripe-js";
import { Label } from "@/components/ui/label";

export function PaymentFields() {
  return (
    <div>
      <Label className="mb-1.5">Card details</Label>
      <div className="rounded-md border border-input bg-background px-3 py-3 shadow-sm">
        <CardElement options={{ style: { base: { fontSize: "14px" } } }} />
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Card data is sent directly to Stripe; it never touches our server.
      </p>
    </div>
  );
}
