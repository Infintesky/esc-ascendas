import { MS_PER_DAY } from "@/lib/date";

export function nightsBetween(checkin: string, checkout: string): number {
  const ci = new Date(checkin + "T00:00:00Z").getTime();
  const co = new Date(checkout + "T00:00:00Z").getTime();
  if (Number.isNaN(ci) || Number.isNaN(co)) return 0;
  return Math.max(0, Math.round((co - ci) / MS_PER_DAY));
}
