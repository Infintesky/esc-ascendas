import { Suspense } from "react";
import { ASCENDA_BASE_URL, ascendaGet } from "@/lib/ascenda/client";
import { mapHotel, hotelImageUrls } from "@/lib/ascenda/mappers";
import { RoomList } from "@/app/_components/room-list";
import { RoomsProvider } from "@/app/_components/rooms-provider";
import { HotelGallery } from "@/app/_components/hotel-gallery";
import { HotelMap } from "@/app/_components/hotel-map";
import { HotelDetailSkeleton } from "@/app/_components/skeletons";
import { SiteShell } from "@/app/_components/site-shell";
import { AmenityList } from "@/app/_components/amenity-list";
import { Star, Info, Sparkles, BedDouble } from "lucide-react";

// Slow part: the static-hotel fetch. Isolated in an async component so the page
// shell flushes instantly and the detail streams in behind the skeleton.
async function HotelDetail({
  id,
  query,
}: {
  id: string;
  query: Record<string, string>;
}) {
  const raw = await ascendaGet<unknown>(
    `${ASCENDA_BASE_URL}/api/hotels/${encodeURIComponent(id)}`,
    { next: { revalidate: 86_400 } },
  );
  const hotel = mapHotel(raw);
  const images = hotelImageUrls(hotel);
  // Supplier descriptions come in two shapes: some are plain text with blank-line
  // paragraph breaks, others are HTML (<p>, <br />). Detect markup and render it
  // as HTML; otherwise split the plain text into paragraphs for readability.
  const description = hotel.description.trim();
  const isHtml = /<\/?[a-z][\s\S]*>/i.test(description);
  const paragraphs = isHtml
    ? []
    : description
        .split(/\n{2,}|\r\n\r\n/)
        .map((p) => p.trim())
        .filter(Boolean);
  const hasDescription = isHtml ? description.length > 0 : paragraphs.length > 0;

  return (
    <RoomsProvider hotelId={id} query={query}>
      {/* Title + rating/score/address summary, Airbnb-style */}
      <header className="mb-5">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {hotel.name}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-foreground">
          {hotel.rating > 0 && (
            <span className="flex items-center gap-1 text-amber-500">
              {Array.from({ length: Math.round(hotel.rating) }).map((_, i) => (
                <Star key={i} className="size-4 fill-current" />
              ))}
              <span className="font-medium text-foreground">{hotel.rating.toFixed(1)}</span>
            </span>
          )}
          {hotel.guestRating > 0 && (
            <>
              <span className="text-muted-foreground">·</span>
              <span>
                <span className="font-semibold">{(hotel.guestRating / 10).toFixed(1)}</span>{" "}
                <span className="text-muted-foreground">guest score</span>
              </span>
            </>
          )}
          {hotel.address && (
            <>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground underline underline-offset-2">
                {hotel.address}
              </span>
            </>
          )}
        </div>
      </header>

      <HotelGallery images={images} alt={hotel.name} />

      {hasDescription && (
        <section className="border-t border-foreground/10 py-8">
          <h2 className="mb-3 flex items-center gap-2 text-2xl font-semibold tracking-tight text-foreground">
            <Info className="size-5 text-primary" />
            About this hotel
          </h2>
          {isHtml ? (
            <div
              className="prose prose-sm max-w-2xl leading-relaxed text-foreground/90 prose-p:text-foreground/90 prose-headings:text-foreground prose-strong:text-foreground"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          ) : (
            <div className="max-w-2xl space-y-4 text-[15px] leading-relaxed text-foreground/90">
              {paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          )}
        </section>
      )}

      {hotel.amenities.length > 0 && (
        <section className="border-t border-foreground/10 py-8">
          <h2 className="mb-4 flex items-center gap-2 text-2xl font-semibold tracking-tight text-foreground">
            <Sparkles className="size-5 text-primary" />
            What this place offers
          </h2>
          <AmenityList
            amenities={hotel.amenities}
            className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3"
          />
        </section>
      )}

      <HotelMap
        latitude={hotel.latitude}
        longitude={hotel.longitude}
        name={hotel.name}
        address={hotel.address}
      />

      <section className="border-t border-foreground/10 py-8">
        <h2 className="mb-4 flex items-center gap-2 text-2xl font-semibold tracking-tight text-foreground">
          <BedDouble className="size-5 text-primary" />
          Available rooms
        </h2>
        <RoomList hotelId={id} query={query} />
      </section>
    </RoomsProvider>
  );
}

export default async function HotelDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const sp = await searchParams;

  const query: Record<string, string> = {};
  for (const [k, v] of Object.entries(sp)) {
    if (typeof v === "string") query[k] = v;
  }

  return (
    <SiteShell width="lg">
      <Suspense fallback={<HotelDetailSkeleton />}>
        <HotelDetail id={id} query={query} />
      </Suspense>
    </SiteShell>
  );
}
