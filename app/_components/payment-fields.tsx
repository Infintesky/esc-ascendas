"use client";

import { CardElement } from "@stripe/react-stripe-js";
import { Label } from "@/components/ui/label";

// Stripe's CardElement renders inside an iframe, so it can't inherit our Tailwind
// theme. Our theme colors are authored in oklch(), which the Stripe iframe's CSS
// parser rejects — leaving the text its default color and effectively invisible.
// Feed concrete hex colors instead.
const PALETTE = { color: "#0a0a0a", placeholder: "#6b7280", invalid: "#dc2626" };

export function PaymentFields() {
  return (
    <div>
      <Label className="mb-1.5">Card details</Label>
      <div className="rounded-md border border-input bg-background px-3 py-3 shadow-sm">
        <CardElement
          options={{
            // We don't collect a billing address, so partial postal-code AVS
            // adds friction for little benefit — drop the field.
            hidePostalCode: true,
            style: {
              base: {
                fontSize: "14px",
                color: PALETTE.color,
                iconColor: PALETTE.color,
                "::placeholder": { color: PALETTE.placeholder },
              },
              invalid: { color: PALETTE.invalid, iconColor: PALETTE.invalid },
            },
          }}
        />
      </div>

      <p className="mt-1 text-xs text-muted-foreground">
        Card data is sent directly to Stripe; it never touches our server.
      </p>
    </div>
  );
}
