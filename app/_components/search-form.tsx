"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DestinationAutocomplete } from "./destination-autocomplete";
import { validateDates } from "@/lib/search/params";
import type { DestinationEntry } from "@/lib/search/destination";

export function SearchForm() {
  const router = useRouter();
  const [destination, setDestination] = useState<DestinationEntry | null>(null);
  const [checkin, setCheckin] = useState("");
  const [checkout, setCheckout] = useState("");
  const [rooms, setRooms] = useState(1);
  const [guests, setGuests] = useState(2);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!destination) {
      setError("Please select a destination.");
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
    <form onSubmit={handleSubmit}>
      <DestinationAutocomplete value="" onSelect={setDestination} />
      <label>
        Check-in
        <input type="date" aria-label="Check-in" value={checkin} onChange={(e) => setCheckin(e.target.value)} />
      </label>
      <label>
        Check-out
        <input type="date" aria-label="Check-out" value={checkout} onChange={(e) => setCheckout(e.target.value)} />
      </label>
      <label>
        Rooms
        <input type="number" aria-label="Rooms" min={1} value={rooms} onChange={(e) => setRooms(Number(e.target.value))} />
      </label>
      <label>
        Guests per room
        <input type="number" aria-label="Guests" min={1} value={guests} onChange={(e) => setGuests(Number(e.target.value))} />
      </label>
      {error && <p role="alert">{error}</p>}
      <button type="submit">Search</button>
    </form>
  );
}
