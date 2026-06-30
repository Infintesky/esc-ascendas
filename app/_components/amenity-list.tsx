import {
  Wifi,
  Waves,
  CarFront,
  Dumbbell,
  Snowflake,
  Utensils,
  Wine,
  Sparkles,
  Briefcase,
  BellRing,
  ShieldCheck,
  Tv,
  Shirt,
  PawPrint,
  Coffee,
  Phone,
  Accessibility,
  Bath,
  Check,
  type LucideIcon,
} from "lucide-react";

// camelCase / snake_case supplier key -> human readable, space-delimited label.
// "outdoorPool" -> "Outdoor pool", "air_conditioning" -> "Air conditioning".
function humanize(key: string): string {
  const words = key
    .replace(/[_-]+/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .trim()
    .toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

// Pick an icon by matching keywords in the amenity name; falls back to a check.
function iconFor(label: string): LucideIcon {
  const s = label.toLowerCase();
  const match: [string[], LucideIcon][] = [
    [["wifi", "internet", "wireless"], Wifi],
    [["pool", "swim"], Waves],
    [["parking", "garage", "valet", "car"], CarFront],
    [["gym", "fitness", "exercise"], Dumbbell],
    [["air condition", "aircon", "climate"], Snowflake],
    [["breakfast", "restaurant", "dining", "kitchen", "meal"], Utensils],
    [["bar", "lounge", "minibar"], Wine],
    [["spa", "massage", "sauna", "steam", "wellness"], Sparkles],
    [["business", "meeting", "conference", "data port"], Briefcase],
    [["room service", "concierge", "front desk", "voice mail"], BellRing],
    [["safe", "security"], ShieldCheck],
    [["tv", "television"], Tv],
    [["laundry", "dry clean", "iron", "clothing"], Shirt],
    [["pet", "dog", "cat"], PawPrint],
    [["coffee", "tea"], Coffee],
    [["phone", "telephone"], Phone],
    [["accessible", "wheelchair", "disabled"], Accessibility],
    [["bath", "shower", "toiletries", "hair dryer"], Bath],
  ];
  for (const [keys, icon] of match) {
    if (keys.some((k) => s.includes(k))) return icon;
  }
  return Check;
}

export function AmenityList({
  amenities,
  className,
}: {
  amenities: string[];
  className?: string;
}) {
  if (amenities.length === 0) return null;
  return (
    <ul className={className}>
      {amenities.map((a) => {
        const label = humanize(a);
        const Icon = iconFor(label);
        return (
          <li key={a} className="flex items-center gap-2 text-sm text-foreground/90">
            <Icon className="size-4 shrink-0 text-primary" />
            {label}
          </li>
        );
      })}
    </ul>
  );
}
