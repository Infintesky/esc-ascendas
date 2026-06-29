"use client";

import { useMemo, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useHotelPrices } from "@/hooks/use-hotel-prices";
import {
  mergeHotelsWithPrices,
  applyFilters,
  sortListings,
  type ResultFilters,
} from "@/lib/search/results";
import type { Hotel } from "@/lib/ascenda/types";
import { HotelCard } from "./hotel-card";
import { FadeItem } from "./motion-primitives";

export function ResultsView({
  hotels,
  query,
}: {
  hotels: Hotel[];
  query: Record<string, string>;
}) {
  const { hotels: prices, completed } = useHotelPrices(query);
  const [filters, setFilters] = useState<ResultFilters>({});
  const [sortBy, setSortBy] = useState<"price" | "rating">("price");

  const listings = useMemo(() => {
    const merged = mergeHotelsWithPrices(hotels, prices);
    return sortListings(applyFilters(merged, filters), sortBy, "asc");
  }, [hotels, prices, filters, sortBy]);

  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: listings.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 160,
    overscan: 6,
  });

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end gap-4 rounded-xl bg-card/80 p-4 ring-1 ring-foreground/10 backdrop-blur">
        <label className="flex flex-col gap-1 text-sm font-medium text-foreground">
          Min stars
          <input
            type="number"
            min={0}
            max={5}
            onChange={(e) => setFilters((f) => ({ ...f, minStars: Number(e.target.value) || undefined }))}
            className="h-9 w-28 rounded-md border border-input bg-background px-3 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-foreground">
          Max price
          <input
            type="number"
            min={0}
            onChange={(e) => setFilters((f) => ({ ...f, maxPrice: Number(e.target.value) || undefined }))}
            className="h-9 w-28 rounded-md border border-input bg-background px-3 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-foreground">
          Sort by
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "price" | "rating")}
            className="h-9 w-32 rounded-md border border-input bg-background px-3 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          >
            <option value="price">Price</option>
            <option value="rating">Rating</option>
          </select>
        </label>
      </div>
      {!completed && (
        <p className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
          <span className="size-2 animate-pulse rounded-full bg-primary" />
          Loading more prices…
        </p>
      )}
      {listings.length <= 20 ? (
        <div>
          {listings.map((listing, i) => (
            <FadeItem key={listing.id} index={Math.min(i, 8)}>
              <HotelCard listing={listing} query={query} />
            </FadeItem>
          ))}
        </div>
      ) : (
        <div ref={parentRef} style={{ height: 600, overflow: "auto" }}>
          <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
            {virtualizer.getVirtualItems().map((vi) => {
              const listing = listings[vi.index];
              return (
                <div
                  key={listing.id}
                  style={{ position: "absolute", top: 0, left: 0, width: "100%", transform: `translateY(${vi.start}px)` }}
                >
                  <HotelCard listing={listing} query={query} />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
