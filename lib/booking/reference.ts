const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export function generateBookingReference(
  now: Date = new Date(),
  rand: () => number = Math.random,
): string {
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  const d = String(now.getUTCDate()).padStart(2, "0");
  let suffix = "";
  for (let i = 0; i < 6; i++) {
    suffix += ALPHABET[Math.floor(rand() * ALPHABET.length)];
  }
  return `BK-${y}${m}${d}-${suffix}`;
}
