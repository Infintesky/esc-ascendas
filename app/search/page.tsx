import { Suspense } from "react";
import { ASCENDA_BASE_URL, ascendaGet } from "@/lib/ascenda/client";
import { mapHotel } from "@/lib/ascenda/mappers";
import { ResultsView } from "@/app/_components/results-view";
import { ResultsSkeleton } from "@/app/_components/skeletons";
import { SiteShell } from "@/app/_components/site-shell";

// Slow part: the static-hotel fetch can take several seconds upstream. It lives
// in its own async component so the page shell + skeleton flush immediately and
// the results stream in when the fetch resolves (progressive render).
async function SearchResults({
  destinationId,
  query,
}: {
  destinationId: string;
  query: Record<string, string>;
}) {
  const raw = await ascendaGet<unknown[]>(
    `${ASCENDA_BASE_URL}/api/hotels?destination_id=${encodeURIComponent(destinationId)}`,
    { next: { revalidate: 86_400 } },
  );
  const hotels = (Array.isArray(raw) ? raw : []).map(mapHotel);

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-foreground">
        <span className="text-primary">
          {hotels.length}
        </span>{" "}
        hotels found
      </h1>
      <ResultsView hotels={hotels} query={query} />
    </>
  );
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const destinationId = typeof sp.destination_id === "string" ? sp.destination_id : "";
  if (!destinationId) {
    return (
      <SiteShell width="md">
        <p className="text-muted-foreground">Missing destination.</p>
      </SiteShell>
    );
  }

  const query: Record<string, string> = {};
  for (const [k, v] of Object.entries(sp)) {
    if (typeof v === "string") query[k] = v;
  }

  return (
    <SiteShell width="md">
      <Suspense fallback={<ResultsSkeleton />}>
        <SearchResults destinationId={destinationId} query={query} />
      </Suspense>
    </SiteShell>
  );
}
