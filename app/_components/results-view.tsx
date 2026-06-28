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
      <div className="mb-4 flex gap-4">
        <label>
          Min stars
          <input
            type="number"
            min={0}
            max={5}
            onChange={(e) => setFilters((f) => ({ ...f, minStars: Number(e.target.value) || undefined }))}
          />
        </label>
        <label>
          Max price
          <input
            type="number"
            min={0}
            onChange={(e) => setFilters((f) => ({ ...f, maxPrice: Number(e.target.value) || undefined }))}
          />
        </label>
        <label>
          Sort by
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as "price" | "rating")}>
            <option value="price">Price</option>
            <option value="rating">Rating</option>
          </select>
        </label>
      </div>
      {!completed && <p>Loading more prices…</p>}
      {listings.length <= 20 ? (
        <div>
          {listings.map((listing) => (
            <HotelCard key={listing.id} listing={listing} query={query} />
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
