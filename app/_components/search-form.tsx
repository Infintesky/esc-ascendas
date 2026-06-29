"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { DestinationAutocomplete } from "./destination-autocomplete";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  validateDates,
  addDaysISO,
  minCheckinDate,
  clampInt,
  MAX_ROOMS,
  MAX_GUESTS_PER_ROOM,
} from "@/lib/search/params";
import type { DestinationEntry } from "@/lib/search/destination";

const labelClass = "mb-1.5 block text-sm font-medium text-foreground";

export function SearchForm() {
  const router = useRouter();
  // `destination` tracks the current best match (updated as the user types and
  // on explicit selection), so typing a place + Search works without a click.
  const [destination, setDestination] = useState<DestinationEntry | null>(null);
  const [checkin, setCheckin] = useState("");
  const [checkout, setCheckout] = useState("");
  const [rooms, setRooms] = useState(1);
  const [guests, setGuests] = useState(2);
  const [error, setError] = useState<string | null>(null);

  const minCheckin = useMemo(() => minCheckinDate(), []);
  // Check-out must be at least the day after check-in (or after the earliest
  // allowed check-in when none is picked yet).
  const minCheckout = addDaysISO(checkin || minCheckin, 1);

  function handleCheckinChange(value: string) {
    setCheckin(value);
    // Keep check-out anchored to check-in: bump it forward if it's now empty
    // or no longer after check-in.
    if (value && (!checkout || checkout <= value)) {
      setCheckout(addDaysISO(value, 1));
    }
  }

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
      guests: String(guests),
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
        <div>
          <label className={labelClass}>Check-in</label>
          <Input
            type="date"
            aria-label="Check-in"
            min={minCheckin}
            value={checkin}
            onChange={(e) => handleCheckinChange(e.target.value)}
            className="h-11"
          />
        </div>
        <div>
          <label className={labelClass}>Check-out</label>
          <Input
            type="date"
            aria-label="Check-out"
            min={minCheckout}
            value={checkout}
            onChange={(e) => setCheckout(e.target.value)}
            className="h-11"
          />
        </div>
        <div>
          <label className={labelClass}>Rooms</label>
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
        <div>
          <label className={labelClass}>Guests per room</label>
          <Input
            type="number"
            aria-label="Guests"
            min={1}
            max={MAX_GUESTS_PER_ROOM}
            value={guests}
            onChange={(e) => setGuests(clampInt(Number(e.target.value), 1, MAX_GUESTS_PER_ROOM))}
            className="h-11"
          />
        </div>
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
