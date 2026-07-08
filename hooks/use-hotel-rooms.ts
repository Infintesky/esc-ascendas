"use client";

import { useEffect, useState } from "react";
import type { Room } from "@/lib/ascenda/types";

// The per-hotel rates endpoint warms up just like the bulk one: the first
// responses come back with `completed: false` and no rooms yet. Polling until
// it completes avoids the "No rooms available" flash on a hotel that does in
// fact have rooms — the main source of click-in friction.
const FAST_INTERVAL_MS = 600;
const SLOW_INTERVAL_MS = 2000;
const FAST_POLLS = 8;
const MAX_POLLS = 26;

export function useHotelRooms(hotelId: string, query: Record<string, string>) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmedAt, setConfirmedAt] = useState<string | null>(null);
  const qs = new URLSearchParams(query).toString();

  useEffect(() => {
    let active = true;
    let polls = 0;
    setLoading(true);
    setRooms([]);
    setConfirmedAt(null);

    async function poll() {
      if (!active) return;
      try {
        const res = await fetch(`/api/hotels/${hotelId}/prices?${qs}`);
        const data: { completed?: boolean; rooms?: Room[] } = await res.json();
        if (!active) return;
        if (data.rooms?.length) setRooms(data.rooms);
        polls += 1;
        if (data.completed || polls >= MAX_POLLS) {
          setRooms(data.rooms ?? []);
          setConfirmedAt(new Date().toLocaleTimeString());
          setLoading(false);
        } else {
          setTimeout(poll, polls < FAST_POLLS ? FAST_INTERVAL_MS : SLOW_INTERVAL_MS);
        }
      } catch {
        if (active) setLoading(false);
      }
    }
    poll();
    return () => {
      active = false;
    };
  }, [hotelId, qs]);

  return { rooms, loading, confirmedAt };
}
