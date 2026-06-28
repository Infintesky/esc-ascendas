import { ASCENDA_BASE_URL, ascendaGet } from "@/lib/ascenda/client";
import { mapHotel } from "@/lib/ascenda/mappers";
import { ResultsView } from "@/app/_components/results-view";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const destinationId = typeof sp.destination_id === "string" ? sp.destination_id : "";
  if (!destinationId) {
    return <main className="p-8">Missing destination.</main>;
  }
  const raw = await ascendaGet<unknown[]>(
    `${ASCENDA_BASE_URL}/api/hotels?destination_id=${encodeURIComponent(destinationId)}`,
    { next: { revalidate: 86_400 } },
  );
  const hotels = (Array.isArray(raw) ? raw : []).map(mapHotel);

  const query: Record<string, string> = {};
  for (const [k, v] of Object.entries(sp)) {
    if (typeof v === "string") query[k] = v;
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-foreground">
        {hotels.length} hotels found
      </h1>
      <ResultsView hotels={hotels} query={query} />
    </main>
  );
}
