import MiniSearch from "minisearch";
import type { DestinationEntry } from "./destination";

export function buildIndex(entries: DestinationEntry[]): MiniSearch<DestinationEntry> {
  const index = new MiniSearch<DestinationEntry>({
    fields: ["term"],
    storeFields: ["uid", "term", "lat", "lng", "state", "type"],
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

export function searchDestinations(
  index: MiniSearch<DestinationEntry>,
  query: string,
  limit = 8,
): DestinationEntry[] {
  const q = query.trim();
  if (!q) return [];
  return index.search(q).slice(0, limit) as unknown as DestinationEntry[];
}
