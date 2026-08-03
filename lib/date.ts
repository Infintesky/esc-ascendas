export const MS_PER_DAY = 86_400_000;

export const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** True only for a YYYY-MM-DD string that names a real calendar date. */
export function isRealISODate(s: string): boolean {
  if (!ISO_DATE.test(s)) return false;
  const d = new Date(s + "T00:00:00Z");
  if (Number.isNaN(d.getTime())) return false;
  return toISODate(d) === s;
}
