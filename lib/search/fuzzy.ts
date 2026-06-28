import MiniSearch from "minisearch";
import type { DestinationEntry } from "./destination";

export function buildIndex(entries: DestinationEntry[]): MiniSearch<DestinationEntry> {
  const index = new MiniSearch<DestinationEntry>({
    fields: ["term"],
    storeFields: ["uid", "term", "type"],
    idField: "uid",
    searchOptions: { prefix: true, fuzzy: 0.2, boost: { term: 2 } },
  });
  // Real destination data contains duplicate uids; MiniSearch throws on a
  // repeated idField, so keep the first occurrence of each uid.
  const seen = new Set<string>();
  const unique = entries.filter((e) => {
    if (seen.has(e.uid)) return false;
    seen.add(e.uid);
    return true;
  });
  index.addAll(unique);
  return index;
}

// Lower tier = better match. Terms are "City, Region, Country"; a query that
// matches the city (the part before the first comma) ranks above one that only
// matches the country, and literal matches rank above fuzzy ones. So "singapore"
// surfaces "Singapore, Singapore" — not "Sentosa, Singapore" or a fuzzy hit.
function matchTier(term: string, q: string): number {
  const lower = term.toLowerCase();
  const city = lower.split(",")[0].trim();
  if (city === q) return 0; // city exact
  if (city.startsWith(q)) return 1; // city prefix
  const tokens = lower.split(/[^a-z0-9]+/).filter(Boolean);
  if (tokens.some((t) => t === q)) return 2; // any token exact (e.g. country)
  if (tokens.some((t) => t.startsWith(q))) return 3; // any token prefix
  if (lower.includes(q)) return 4; // substring
  return 5; // fuzzy-only
}

export function searchDestinations(
  index: MiniSearch<DestinationEntry>,
  query: string,
  limit = 8,
): DestinationEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const results = index.search(query.trim()) as unknown as (DestinationEntry & {
    score: number;
  })[];
  return results
    .map((r) => ({ r, tier: matchTier(r.term, q) }))
    .sort((a, b) => (a.tier !== b.tier ? a.tier - b.tier : b.r.score - a.r.score))
    .slice(0, limit)
    .map((x) => x.r);
}
