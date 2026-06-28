import Link from "next/link";
import type { HotelListing } from "@/lib/search/results";

export function HotelCard({
  listing,
  query,
}: {
  listing: HotelListing;
  query: Record<string, string>;
}) {
  const qs = new URLSearchParams(query).toString();
  return (
    <article className="rounded border p-4">
      <h2 className="font-medium">{listing.name}</h2>
      <p className="text-sm text-muted-foreground">{listing.address}</p>
      <p className="text-sm">{"★".repeat(Math.round(listing.rating))}</p>
      <p className="font-semibold">
        {listing.price != null ? `SGD ${listing.price}` : "Loading price…"}
      </p>
      <Link href={`/hotels/${listing.id}?${qs}`}>Select</Link>
    </article>
  );
}
