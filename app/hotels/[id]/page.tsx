import { Suspense } from "react";
import { ASCENDA_BASE_URL, ascendaGet } from "@/lib/ascenda/client";
import { mapHotel, hotelImageUrls } from "@/lib/ascenda/mappers";
import { RoomList } from "@/app/_components/room-list";
import { HotelImage } from "@/app/_components/hotel-image";
import { HotelDetailSkeleton } from "@/app/_components/skeletons";
import { SiteShell } from "@/app/_components/site-shell";
import { Star } from "lucide-react";

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

  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight text-foreground">{hotel.name}</h1>
      <p className="mt-1 text-muted-foreground">{hotel.address}</p>
      <p className="mt-1.5 flex items-center gap-0.5 text-amber-500">
        {Array.from({ length: Math.round(hotel.rating) }).map((_, i) => (
          <Star key={i} className="size-4 fill-current" />
        ))}
      </p>
      <HotelImage
        candidates={images}
        alt={hotel.name}
        className="my-6 aspect-video w-full rounded-2xl object-cover ring-1 ring-foreground/10"
      />
      {hotel.description && (
        <div
          className="prose prose-sm max-w-none text-foreground/90"
          dangerouslySetInnerHTML={{ __html: hotel.description }}
        />
      )}
      {hotel.amenities.length > 0 && (
        <>
          <h2 className="mt-8 text-lg font-semibold text-foreground">Amenities</h2>
          <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {hotel.amenities.map((a) => (
              <li
                key={a}
                className="rounded-lg bg-card px-3 py-2 text-sm capitalize text-foreground ring-1 ring-foreground/10"
              >
                {a}
              </li>
            ))}
          </ul>
        </>
      )}
      <h2 className="mt-8 mb-3 text-lg font-semibold text-foreground">Available rooms</h2>
      <RoomList hotelId={id} query={query} />
    </>
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
    <SiteShell width="md">
      <Suspense fallback={<HotelDetailSkeleton />}>
        <HotelDetail id={id} query={query} />
      </Suspense>
    </SiteShell>
  );
}
