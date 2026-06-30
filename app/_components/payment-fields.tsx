"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { CardElement } from "@stripe/react-stripe-js";
import { Label } from "@/components/ui/label";

// Stripe's CardElement renders inside an iframe, so it can't inherit our Tailwind
// theme. Our theme colors are authored in oklch(), which the Stripe iframe's CSS
// parser rejects — leaving the text its default color and effectively invisible.
// Feed concrete hex colors instead, picked from the resolved theme.
const PALETTE = {
  light: { color: "#0a0a0a", placeholder: "#6b7280", invalid: "#dc2626" },
  dark: { color: "#ededed", placeholder: "#9ca3af", invalid: "#f87171" },
};

export function PaymentFields() {
  const { resolvedTheme } = useTheme();
  // Avoid a hydration mismatch: only render the themed CardElement after mount,
  // when resolvedTheme is known.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const palette = resolvedTheme === "dark" ? PALETTE.dark : PALETTE.light;

  return (
    <div>
      <Label className="mb-1.5">Card details</Label>
      <div className="rounded-md border border-input bg-background px-3 py-3 shadow-sm">
        {mounted && (
          <CardElement
            key={resolvedTheme}
            options={{
              style: {
                base: {
                  fontSize: "14px",
                  color: palette.color,
                  iconColor: palette.color,
                  "::placeholder": { color: palette.placeholder },
                },
                invalid: { color: palette.invalid, iconColor: palette.invalid },
              },
            }}
          />
        )}
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Card data is sent directly to Stripe; it never touches our server.
      </p>
    </div>
  );
}
