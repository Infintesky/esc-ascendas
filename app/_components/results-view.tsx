"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useHotelPricesContext } from "./prices-provider";
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
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PAGE_SIZE = 10;
const PRICE_MIN = 50;
const PRICE_MAX = 5000;
const SORT_LABELS: Record<"price" | "rating", string> = {
  price: "Price",
  rating: "Rating",
};
const STAR_OPTIONS = [
  { value: "any", label: "Any" },
  { value: "3", label: "3+ stars" },
  { value: "4", label: "4+ stars" },
  { value: "5", label: "5 stars" },
];
const GUEST_OPTIONS = [
  { value: "any", label: "Any" },
  { value: "70", label: "7.0+" },
  { value: "80", label: "8.0+" },
  { value: "90", label: "9.0+" },
];
const labelFor = (opts: { value: string; label: string }[]) => (v: string) =>
  opts.find((o) => o.value === v)?.label ?? v;

export function ResultsView({
  hotels,
  query,
}: {
  hotels: Hotel[];
  query: Record<string, string>;
}) {
  const { hotels: prices, completed: pricesDone } = useHotelPricesContext();
  const [filters, setFilters] = useState<ResultFilters>({});
  const [priceRange, setPriceRange] = useState<[number, number]>([PRICE_MIN, PRICE_MAX]);
  const [sortBy, setSortBy] = useState<"price" | "rating">("price");
  const [page, setPage] = useState(0);

  const nights = useMemo(
    () => Math.max(1, nightsBetween(query.checkin ?? "", query.checkout ?? "")),
    [query.checkin, query.checkout],
  );

  const listings = useMemo(() => {
    const merged = mergeHotelsWithPrices(hotels, prices);
    // Once polling is done, hotels with no price have no availability for these
    // dates — drop them entirely. While still loading we keep them (shown as
    // "Loading price…") so results don't shuffle as prices stream in.
    const available = pricesDone ? merged.filter((l) => l.price != null) : merged;
    // The filter panel works in per-night SGD; convert to the stay total the
    // listings are priced in before filtering.
    const stayFilters: ResultFilters = {
      ...filters,
      minPrice: filters.minPrice != null ? filters.minPrice * nights : undefined,
      maxPrice: filters.maxPrice != null ? filters.maxPrice * nights : undefined,
    };
    return sortListings(applyFilters(available, stayFilters), sortBy, "asc");
  }, [hotels, prices, filters, sortBy, nights, pricesDone]);

  // Heading count: total hotels while loading, then how many have availability
  // for these dates — independent of the user's star/price filters.
  const availableCount = pricesDone
    ? prices.filter((p) => p.price != null).length
    : hotels.length;

  // Keep the current page valid as filters/data change: clamp during render
  // rather than via an effect so there's no extra render pass.
  const pageCount = Math.max(1, Math.ceil(listings.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);

  const start = safePage * PAGE_SIZE;
  const pageItems = listings.slice(start, start + PAGE_SIZE);

  function goToPage(next: number) {
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const filtersActive =
    filters.minStars != null ||
    filters.minGuestRating != null ||
    filters.minPrice != null ||
    filters.maxPrice != null ||
    sortBy !== "price";

  function clearFilters() {
    setFilters({});
    setPriceRange([PRICE_MIN, PRICE_MAX]);
    setSortBy("price");
    setPage(0);
  }

  function commitPriceRange([lo, hi]: [number, number]) {
    setFilters((f) => ({
      ...f,
      minPrice: lo > PRICE_MIN ? lo : undefined,
      maxPrice: hi < PRICE_MAX ? hi : undefined,
    }));
    setPage(0);
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-foreground">
        <span className="text-primary">{availableCount}</span> hotels{" "}
        {pricesDone ? "available" : "found"}
      </h1>

      <Card className="mb-5 bg-card/80 backdrop-blur">
        <CardContent className="flex flex-wrap items-end gap-6">
        <div className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
          Min stars
          <Select
            value={filters.minStars ? String(filters.minStars) : "any"}
            onValueChange={(v) => {
              setFilters((f) => ({ ...f, minStars: v === "any" ? undefined : Number(v) }));
              setPage(0);
            }}
          >
            <SelectTrigger className="h-9 w-28">
              <SelectValue>{labelFor(STAR_OPTIONS)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {STAR_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
          Min guest score
          <Select
            value={filters.minGuestRating ? String(filters.minGuestRating) : "any"}
            onValueChange={(v) => {
              setFilters((f) => ({ ...f, minGuestRating: v === "any" ? undefined : Number(v) }));
              setPage(0);
            }}
          >
            <SelectTrigger className="h-9 w-28">
              <SelectValue>{labelFor(GUEST_OPTIONS)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {GUEST_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex min-w-56 flex-col gap-1.5 text-sm font-medium text-foreground">
          <div className="flex items-center justify-between">
            <span>Price / night</span>
            <span className="text-xs font-normal text-muted-foreground">
              SGD {priceRange[0]}
              {priceRange[1] >= PRICE_MAX ? "+" : ` – ${priceRange[1]}`}
            </span>
          </div>
          <div className="flex h-9 items-center">
            <Slider
              min={PRICE_MIN}
              max={PRICE_MAX}
              step={50}
              value={priceRange}
              onValueChange={(v) => {
                setPriceRange(v as [number, number]);
                commitPriceRange(v as [number, number]);
              }}
              className="w-full"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
          Sort by
          <Select value={sortBy} onValueChange={(v) => { setSortBy(v as "price" | "rating"); setPage(0); }}>
            <SelectTrigger className="h-9 w-32">
              <SelectValue>{(v: string) => SORT_LABELS[v as "price" | "rating"]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="price">Price</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filtersActive && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-9 gap-1 text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
            Clear filters
          </Button>
        )}
        </CardContent>
      </Card>

      {listings.length === 0 ? (
        <Card className="bg-card/80">
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            No hotels match your filters.
          </CardContent>
        </Card>
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
                disabled={safePage === 0}
                onClick={() => goToPage(Math.max(0, safePage - 1))}
                className="gap-1"
              >
                <ChevronLeft className="size-4" />
                Prev
              </Button>
              <span className="text-sm font-medium text-foreground">
                {safePage + 1} / {pageCount}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={safePage >= pageCount - 1}
                onClick={() => goToPage(Math.min(pageCount - 1, safePage + 1))}
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
