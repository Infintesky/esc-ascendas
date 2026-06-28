import { ASCENDA_BASE_URL, ascendaGet } from "@/lib/ascenda/client";
import { mapHotel, hotelImageUrls } from "@/lib/ascenda/mappers";
import { RoomList } from "@/app/_components/room-list";

export default async function HotelDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const raw = await ascendaGet<unknown>(
    `${ASCENDA_BASE_URL}/api/hotels/${encodeURIComponent(id)}`,
    { next: { revalidate: 86_400 } },
  );
  const hotel = mapHotel(raw);
  const images = hotelImageUrls(hotel);

  const query: Record<string, string> = {};
  for (const [k, v] of Object.entries(sp)) {
    if (typeof v === "string") query[k] = v;
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">{hotel.name}</h1>
      <p className="mt-1 text-muted-foreground">{hotel.address}</p>
      <p className="mt-1 text-amber-500">{"★".repeat(Math.round(hotel.rating))}</p>
      {images[0] && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={images[0]}
          alt={hotel.name}
          className="my-6 aspect-video w-full rounded-xl object-cover shadow-sm"
        />
      )}
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
                className="rounded-md border border-border bg-card px-3 py-2 text-sm capitalize text-foreground shadow-sm"
              >
                {a}
              </li>
            ))}
          </ul>
        </>
      )}
      <h2 className="mt-8 mb-3 text-lg font-semibold text-foreground">Available rooms</h2>
      <RoomList hotelId={id} query={query} />
    </main>
  );
}
