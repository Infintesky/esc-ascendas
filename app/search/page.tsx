import { Suspense } from "react";
import { getHotelsForDestination } from "@/lib/ascenda/hotels";
import { ResultsView } from "@/app/_components/results-view";
import { ResultsSkeleton } from "@/app/_components/skeletons";
import { SiteShell } from "@/app/_components/site-shell";
import { PricesProvider } from "@/app/_components/prices-provider";

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
  const hotels = await getHotelsForDestination(destinationId);

  return <ResultsView hotels={hotels} query={query} />;
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
      <PricesProvider query={query}>
        <Suspense fallback={<ResultsSkeleton />}>
          <SearchResults destinationId={destinationId} query={query} />
        </Suspense>
      </PricesProvider>
    </SiteShell>
  );
}
