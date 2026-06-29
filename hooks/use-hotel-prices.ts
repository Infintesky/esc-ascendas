"use client";

import { useEffect, useRef, useState } from "react";
import type { PriceResult } from "@/lib/ascenda/types";

// Ascenda computes the whole destination's prices then returns them all at once,
// so the only lever for "first results sooner" is how quickly we re-poll while it
// warms up. Poll aggressively at first, then back off to spare the upstream.
const FAST_INTERVAL_MS = 600;
const SLOW_INTERVAL_MS = 2000;
const FAST_POLLS = 8; // ~4.8s of fast polling before backing off
const MAX_POLLS = 26; // ~40s ceiling overall

export function useHotelPrices(query: Record<string, string>) {
  const [hotels, setHotels] = useState<PriceResult[]>([]);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const merged = useRef<Map<string, PriceResult>>(new Map());
  const queryKey = new URLSearchParams(query).toString();

  useEffect(() => {
    let active = true;
    let polls = 0;
    merged.current = new Map();
    setHotels([]);
    setCompleted(false);
    setError(null);

    async function poll() {
      if (!active) return;
      try {
        const res = await fetch(`/api/hotels/prices?${queryKey}`);
        if (!res.ok) throw new Error(`status ${res.status}`);
        const data: { completed: boolean; hotels: PriceResult[] } = await res.json();
        for (const h of data.hotels) merged.current.set(h.id, h);
        if (!active) return;
        setHotels([...merged.current.values()]);
        polls += 1;
        if (data.completed || polls >= MAX_POLLS) {
          setCompleted(true);
        } else {
          setTimeout(poll, polls < FAST_POLLS ? FAST_INTERVAL_MS : SLOW_INTERVAL_MS);
        }
      } catch (e) {
        if (active) setError((e as Error).message);
      }
    }
    poll();
    return () => {
      active = false;
    };
  }, [queryKey]);

  return { hotels, completed, error };
}
