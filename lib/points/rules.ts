export const EARN_RATE = 1; // points per currency unit

export function pointsForBooking(price: number): number {
  if (!Number.isFinite(price)) return 0;
  return Math.max(0, Math.floor(price * EARN_RATE));
}
