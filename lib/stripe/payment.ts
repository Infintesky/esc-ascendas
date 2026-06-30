import { getStripe } from "./server";

export async function confirmCardPayment(args: {
  amount: number;
  currency: string;
  paymentMethodId: string;
}): Promise<{
  status: string;
  paymentIntentId: string;
  cardLast4: string | null;
  cardBrand: string | null;
  clientSecret: string | null;
}> {
  const stripe = getStripe();
  const intent = await stripe.paymentIntents.create({
    amount: Math.round(args.amount * 100),
    currency: args.currency.toLowerCase(),
    payment_method: args.paymentMethodId,
    confirm: true,
    automatic_payment_methods: { enabled: true, allow_redirects: "never" },
    // Modern Stripe API versions no longer inline `charges`; expand the latest
    // charge so we can read the card's last4/brand for the confirmation page.
    expand: ["latest_charge"],
  });
  const latestCharge = intent.latest_charge;
  const card =
    typeof latestCharge === "object" && latestCharge
      ? latestCharge.payment_method_details?.card ?? null
      : null;
  return {
    status: intent.status,
    paymentIntentId: intent.id,
    cardLast4: card?.last4 ?? null,
    cardBrand: card?.brand ?? null,
    clientSecret: intent.client_secret ?? null,
  };
}
