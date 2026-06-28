"use client";

import { useEffect, useMemo, useState } from "react";
import type MiniSearch from "minisearch";
import { buildIndex, searchDestinations } from "@/lib/search/fuzzy";
import type { DestinationEntry } from "@/lib/search/destination";

export function DestinationAutocomplete({
  value,
  onSelect,
}: {
  value: string;
  onSelect: (entry: DestinationEntry) => void;
}) {
  const [query, setQuery] = useState(value);
  const [index, setIndex] = useState<MiniSearch<DestinationEntry> | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/destinations-index.json")
      .then((r) => r.json())
      .then((entries: DestinationEntry[]) => {
        if (active) setIndex(buildIndex(entries));
      });
    return () => {
      active = false;
    };
  }, []);

  const results = useMemo(
    () => (index ? searchDestinations(index, query) : []),
    [index, query],
  );

  return (
    <div>
      <input
        aria-label="Destination"
        placeholder="City or hotel name"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {results.length > 0 && (
        <ul role="listbox">
          {results.map((d) => (
            <li
              key={d.uid}
              role="option"
              aria-selected={false}
              onClick={() => {
                onSelect(d);
                setQuery(d.term);
              }}
            >
              {d.term}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
