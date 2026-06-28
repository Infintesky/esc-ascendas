"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type MiniSearch from "minisearch";
import { MapPin } from "lucide-react";
import { buildIndex, searchDestinations } from "@/lib/search/fuzzy";
import type { DestinationEntry } from "@/lib/search/destination";

export function DestinationAutocomplete({
  value,
  onSelect,
  onTopMatchChange,
}: {
  value: string;
  onSelect: (entry: DestinationEntry) => void;
  // Reports the current best suggestion (or null) so the form can auto-select
  // it when the user typed a destination but didn't click a suggestion.
  onTopMatchChange?: (entry: DestinationEntry | null) => void;
}) {
  const [query, setQuery] = useState(value);
  const [index, setIndex] = useState<MiniSearch<DestinationEntry> | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const loadStarted = useRef(false);

  // Lazily fetch (~5MB) and build the MiniSearch index only when the user first
  // touches the destination field — keeps the landing page paint instant and
  // avoids indexing ~70k entries on the main thread until it's actually needed.
  const ensureIndex = useCallback(() => {
    if (loadStarted.current) return;
    loadStarted.current = true;
    setLoading(true);
    fetch("/destinations-index.json")
      .then((r) => r.json())
      .then((entries: DestinationEntry[]) => {
        setIndex(buildIndex(entries));
      })
      .catch(() => {
        loadStarted.current = false; // allow a retry on next interaction
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const results = useMemo(
    () => (index ? searchDestinations(index, query) : []),
    [index, query],
  );

  // Keep the parent informed of the current best match for auto-select.
  useEffect(() => {
    onTopMatchChange?.(results[0] ?? null);
  }, [results, onTopMatchChange]);

  return (
    <div ref={containerRef} className="relative">
      <label className="mb-1.5 block text-sm font-medium text-foreground">
        Destination
      </label>
      <div className="relative">
        <MapPin className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          aria-label="Destination"
          placeholder="City or hotel name"
          value={query}
          onChange={(e) => {
            ensureIndex();
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            ensureIndex();
            setOpen(true);
          }}
          className="h-11 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
        />
      </div>
      {open && loading && !index && query.length > 0 && (
        <div className="absolute z-20 mt-1 w-full rounded-md border border-border bg-popover px-3 py-2 text-sm text-muted-foreground shadow-lg">
          Loading destinations…
        </div>
      )}
      {open && results.length > 0 && (
        <ul
          role="listbox"
          className="absolute z-20 mt-1 max-h-72 w-full overflow-auto rounded-md border border-border bg-popover p-1 shadow-lg"
        >
          {results.map((d) => (
            <li
              key={d.uid}
              role="option"
              aria-selected={false}
              onClick={() => {
                onSelect(d);
                setQuery(d.term);
                setOpen(false);
              }}
              className="flex cursor-pointer items-start gap-2 rounded-sm px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
            >
              <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <span>
                <span className="block">{d.term}</span>
                {d.type && (
                  <span className="block text-xs capitalize text-muted-foreground">
                    {d.type}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
