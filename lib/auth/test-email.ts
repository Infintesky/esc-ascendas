// A reserved demo address that skips email OTP verification, so the booking flow
// can be tested end-to-end without access to a real inbox. Any other email must
// complete the Supabase one-time-password challenge.
export const TEST_EMAIL = "demo@ascenda.test";

export function isTestEmail(email: string): boolean {
  return email.trim().toLowerCase() === TEST_EMAIL;
}
