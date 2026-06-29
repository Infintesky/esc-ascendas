"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useHotelPrices } from "@/hooks/use-hotel-prices";
import { nightsBetween } from "@/lib/booking/nights";
import {
  mergeHotelsWithPrices,
  applyFilters,
  sortListings,
  type ResultFilters,
} from "@/lib/search/results";
import type { Hotel } from "@/lib/ascenda/types";
import { HotelCard } from "./hotel-card";
import { FadeItem } from "./motion-primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PAGE_SIZE = 10;

export function ResultsView({
  hotels,
  query,
}: {
  hotels: Hotel[];
  query: Record<string, string>;
}) {
  const { hotels: prices } = useHotelPrices(query);
  const [filters, setFilters] = useState<ResultFilters>({});
  const [sortBy, setSortBy] = useState<"price" | "rating">("price");
  const [page, setPage] = useState(0);

  const nights = useMemo(
    () => Math.max(1, nightsBetween(query.checkin ?? "", query.checkout ?? "")),
    [query.checkin, query.checkout],
  );

  const listings = useMemo(() => {
    const merged = mergeHotelsWithPrices(hotels, prices);
    // The filter panel works in per-night SGD; convert to the stay total the
    // listings are priced in before filtering.
    const stayFilters: ResultFilters = {
      ...filters,
      minPrice: filters.minPrice != null ? filters.minPrice * nights : undefined,
      maxPrice: filters.maxPrice != null ? filters.maxPrice * nights : undefined,
    };
    return sortListings(applyFilters(merged, stayFilters), sortBy, "asc");
  }, [hotels, prices, filters, sortBy, nights]);

  // Keep the current page valid as filters/data change.
  const pageCount = Math.max(1, Math.ceil(listings.length / PAGE_SIZE));
  useEffect(() => {
    if (page > pageCount - 1) setPage(0);
  }, [page, pageCount]);

  const start = page * PAGE_SIZE;
  const pageItems = listings.slice(start, start + PAGE_SIZE);

  function setNum(key: keyof ResultFilters) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = Number(e.target.value);
      setFilters((f) => ({ ...f, [key]: e.target.value === "" || Number.isNaN(v) ? undefined : v }));
      setPage(0);
    };
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end gap-4 rounded-xl bg-card/80 p-4 ring-1 ring-foreground/10 backdrop-blur">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
          Min stars
          <Input
            type="number"
            min={0}
            max={5}
            placeholder="Any"
            onChange={setNum("minStars")}
            className="h-9 w-24"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
          Min guest rating
          <Input
            type="number"
            min={0}
            max={100}
            placeholder="Any"
            onChange={setNum("minGuestRating")}
            className="h-9 w-28"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
          Min $/night
          <Input
            type="number"
            min={0}
            placeholder="Any"
            onChange={setNum("minPrice")}
            className="h-9 w-24"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
          Max $/night
          <Input
            type="number"
            min={0}
            placeholder="Any"
            onChange={setNum("maxPrice")}
            className="h-9 w-24"
          />
        </label>
        <div className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
          Sort by
          <Select value={sortBy} onValueChange={(v) => { setSortBy(v as "price" | "rating"); setPage(0); }}>
            <SelectTrigger className="h-9 w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="price">Price</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {listings.length === 0 ? (
        <p className="rounded-xl bg-card/80 p-8 text-center text-sm text-muted-foreground ring-1 ring-foreground/10">
          No hotels match your filters.
        </p>
      ) : (
        <>
          <div>
            {pageItems.map((listing, i) => (
              <FadeItem key={listing.id} index={Math.min(i, 8)}>
                <HotelCard listing={listing} query={query} nights={nights} />
              </FadeItem>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              Showing {start + 1}–{Math.min(start + PAGE_SIZE, listings.length)} of {listings.length}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="gap-1"
              >
                <ChevronLeft className="size-4" />
                Prev
              </Button>
              <span className="text-sm font-medium text-foreground">
                {page + 1} / {pageCount}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pageCount - 1}
                onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
                className="gap-1"
              >
                Next
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
