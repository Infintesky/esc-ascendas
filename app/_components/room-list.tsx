"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BadgeCheck, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Room } from "@/lib/ascenda/types";
import { FadeItem } from "./motion-primitives";

export function RoomList({
  hotelId,
  query,
}: {
  hotelId: string;
  query: Record<string, string>;
}) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmedAt, setConfirmedAt] = useState<string | null>(null);
  const qs = new URLSearchParams(query).toString();

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch(`/api/hotels/${hotelId}/prices?${qs}`)
      .then((r) => r.json())
      .then((data: { rooms: Room[] }) => {
        if (!active) return;
        setRooms(data.rooms ?? []);
        setConfirmedAt(new Date().toLocaleTimeString());
        setLoading(false);
      })
      .catch(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [hotelId, qs]);

  return (
    <section>
      {confirmedAt && (
        <p className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
          <BadgeCheck className="size-3.5" />
          Rate confirmed at {confirmedAt}
        </p>
      )}
      {loading && (
        <p className="text-sm text-muted-foreground">Fetching live rates…</p>
      )}
      {!loading && rooms.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No rooms available for these dates.
        </p>
      )}
      <div className="space-y-3">
        {rooms.map((room, i) => (
          <FadeItem key={room.key} index={Math.min(i, 8)}>
            <article className="flex items-start justify-between gap-4 rounded-xl bg-card p-4 ring-1 ring-foreground/10 transition-all hover:ring-primary/30">
              <div className="min-w-0">
                <h3 className="font-semibold text-foreground">{room.roomType}</h3>
                {room.freeCancellation && (
                  <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="size-3.5" />
                    Free cancellation
                  </span>
                )}
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                <p className="font-semibold text-foreground">
                  <span className="text-xs font-normal text-muted-foreground">SGD </span>
                  {room.price}
                </p>
                <Button
                  size="lg"
                  render={
                    <Link
                      href={`/book?hotel_id=${hotelId}&room_key=${encodeURIComponent(room.key)}&room_type=${encodeURIComponent(room.roomType)}&price=${room.price}&${qs}`}
                    />
                  }
                >
                  Select room
                </Button>
              </div>
            </article>
          </FadeItem>
        ))}
      </div>
    </section>
  );
}
