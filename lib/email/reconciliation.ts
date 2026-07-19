import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendReconciliationEmail({
  to,
  reference,
  amount,
  currency,
}: {
  to: string;
  reference: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
  error: string;
}) {
  await resend.emails.send({
    from: "bookings@yourdomain.com",
    to,
    subject: "Issue with your booking — we're on it",
    text: `Hi,

Your payment of ${currency} ${amount} went through (ref: ${reference}), but we hit a technical issue saving your booking. Your payment is safe — our team will follow up shortly to confirm everything.

Sorry for the hassle!`,
  });
}