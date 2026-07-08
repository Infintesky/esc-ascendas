"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { DestinationAutocomplete } from "./destination-autocomplete";
import { DateRangeField } from "./date-range-field";
import { GuestSelector } from "./guest-selector";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  validateDates,
  minCheckinDate,
  clampInt,
  MAX_ROOMS,
} from "@/lib/search/params";
import type { DestinationEntry } from "@/lib/search/destination";

const labelClass = "mb-1.5";

export function SearchForm() {
  const router = useRouter();
  // `destination` tracks the current best match (updated as the user types and
  // on explicit selection), so typing a place + Search works without a click.
  const [destination, setDestination] = useState<DestinationEntry | null>(null);
  const [checkin, setCheckin] = useState("");
  const [checkout, setCheckout] = useState("");
  const [rooms, setRooms] = useState(1);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const minCheckin = useMemo(() => minCheckinDate(), []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!destination) {
      setError("Please enter and pick a destination.");
      return;
    }
    const dates = validateDates(checkin, checkout);
    if (!dates.ok) {
      setError(dates.error ?? "Invalid dates.");
      return;
    }
    setError(null);
    const params = new URLSearchParams({
      destination_id: destination.uid,
      checkin,
      checkout,
      rooms: String(rooms),
      // Upstream takes a single occupancy count per room; adults + children.
      guests: String(adults + children),
      currency: "SGD",
      country_code: "SG",
      lang: "en_US",
    });
    router.push(`/search?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl bg-card p-6 text-left"
    >
      <DestinationAutocomplete
        value=""
        onSelect={setDestination}
        onTopMatchChange={setDestination}
      />

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <DateRangeField
            label="Check-in / Check-out"
            min={minCheckin}
            checkin={checkin}
            checkout={checkout}
            onChange={({ checkin, checkout }) => {
              setCheckin(checkin);
              setCheckout(checkout);
            }}
          />
        </div>
        <div>
          <Label className={labelClass}>Rooms</Label>
          <Input
            type="number"
            aria-label="Rooms"
            min={1}
            max={MAX_ROOMS}
            value={rooms}
            onChange={(e) => setRooms(clampInt(Number(e.target.value), 1, MAX_ROOMS))}
            className="h-11"
          />
        </div>
        <GuestSelector
          adults={adults}
          childCount={children}
          onChange={({ adults, childCount }) => {
            setAdults(adults);
            setChildren(childCount);
          }}
        />
      </div>

      {error && (
        <p role="alert" className="mt-4 text-sm font-medium text-destructive">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" className="mt-6 h-11 w-full gap-2 text-sm font-semibold">
        <Search className="size-4" />
        Search
      </Button>
    </form>
  );
}
