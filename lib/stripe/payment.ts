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
  });
  const card =
    (intent as { charges?: { data?: Array<{ payment_method_details?: { card?: { last4?: string; brand?: string } } }> } })
      .charges?.data?.[0]?.payment_method_details?.card ?? null;
  return {
    status: intent.status,
    paymentIntentId: intent.id,
    cardLast4: card?.last4 ?? null,
    cardBrand: card?.brand ?? null,
    clientSecret: intent.client_secret ?? null,
  };
}
