import { MapPin } from "lucide-react";

// "Where you'll be" location map. Uses the Google Maps Embed API (key-scoped,
// browser-safe) when NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is set, and falls back to a
// key-free OpenStreetMap embed otherwise so the section still renders in dev.
export function HotelMap({
  latitude,
  longitude,
  name,
  address,
}: {
  latitude: number;
  longitude: number;
  name: string;
  address?: string;
}) {
  if (!latitude || !longitude) return null;

  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  // Google Maps resolves the pin by place name, which drops a labelled marker on
  // the actual hotel rather than a bare coordinate. Include the address to
  // disambiguate same-named properties across cities.
  const query = [name, address].filter(Boolean).join(", ");

  let src: string;
  if (key) {
    src = `https://www.google.com/maps/embed/v1/place?key=${key}&q=${encodeURIComponent(
      query,
    )}&zoom=15`;
  } else {
    const d = 0.01;
    const bbox = [longitude - d, latitude - d, longitude + d, latitude + d]
      .map((n) => n.toFixed(6))
      .join("%2C");
    src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latitude}%2C${longitude}`;
  }

  const link = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

  return (
    <section className="border-t border-foreground/10 py-8">
      <h2 className="text-2xl font-semibold tracking-tight text-foreground">
        Where you&apos;ll be
      </h2>
      {address && (
        <p className="mt-1 flex items-center gap-1.5 text-muted-foreground">
          <MapPin className="size-4 text-primary" />
          {address}
        </p>
      )}
      <iframe
        title={`Map showing the location of ${name}`}
        src={src}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="mt-4 aspect-[16/9] w-full rounded-2xl ring-1 ring-foreground/10"
      />
      <a
        href={link}
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
      >
        Open in Google Maps →
      </a>
    </section>
  );
}
