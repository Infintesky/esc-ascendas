import Link from "next/link";
import { MapPin, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { HotelListing } from "@/lib/search/results";

export function HotelCard({
  listing,
  query,
  nights,
}: {
  listing: HotelListing;
  query: Record<string, string>;
  nights: number;
}) {
  const qs = new URLSearchParams(query).toString();
  // The supplier `price` is the total for the whole stay; show it per night so
  // listings read like every other hotel site.
  const perNight =
    listing.price != null && nights > 0 ? Math.round(listing.price / nights) : null;
  return (
    <Card className="mb-3 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5 hover:ring-primary/30">
      <CardContent className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="truncate font-semibold text-foreground">{listing.name}</h2>
          {listing.address && (
            <p className="mt-0.5 flex items-center gap-1 truncate text-sm text-muted-foreground">
              <MapPin className="size-3.5 shrink-0" />
              {listing.address}
            </p>
          )}
          <div className="mt-1 flex items-center gap-3">
            {listing.rating > 0 && (
              <p className="flex items-center gap-1 text-amber-500">
                <span className="flex items-center gap-0.5">
                  {Array.from({ length: Math.round(listing.rating) }).map((_, i) => (
                    <Star key={i} className="size-3.5 fill-current" />
                  ))}
                </span>
                <span className="text-xs font-medium">{listing.rating.toFixed(1)}</span>
              </p>
            )}
            {listing.guestRating > 0 && (
              <Badge variant="secondary" className="gap-1">
                <span className="font-semibold text-primary">
                  {(listing.guestRating / 10).toFixed(1)}
                </span>
                <span className="text-muted-foreground">guest score</span>
              </Badge>
            )}
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <div className="text-right">
            {perNight != null ? (
              <>
                <p className="font-semibold text-foreground">
                  <span className="text-xs font-normal text-muted-foreground">SGD </span>
                  {perNight.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">per night</p>
              </>
            ) : (
              <span className="text-sm font-normal text-muted-foreground">
                Loading price…
              </span>
            )}
          </div>
          <Button size="lg" render={<Link href={`/hotels/${listing.id}?${qs}`} />}>
            Select
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
