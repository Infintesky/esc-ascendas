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
    <main className="p-8">
      <h1 className="text-2xl font-semibold">{hotel.name}</h1>
      <p className="text-muted-foreground">{hotel.address}</p>
      <p>{"★".repeat(Math.round(hotel.rating))}</p>
      {images[0] && <img src={images[0]} alt={hotel.name} className="my-4 max-w-md rounded" />}
      <p dangerouslySetInnerHTML={{ __html: hotel.description }} />
      <h2 className="mt-6 text-lg font-medium">Amenities</h2>
      <ul className="list-disc pl-5">
        {hotel.amenities.map((a) => (
          <li key={a}>{a}</li>
        ))}
      </ul>
      <h2 className="mt-6 text-lg font-medium">Available rooms</h2>
      <RoomList hotelId={id} query={query} />
    </main>
  );
}
