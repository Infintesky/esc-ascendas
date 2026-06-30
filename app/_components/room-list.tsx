"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BadgeCheck, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Room } from "@/lib/ascenda/types";
import { nightsBetween } from "@/lib/booking/nights";
import { FadeItem } from "./motion-primitives";
import { HotelImage } from "./hotel-image";
import { AmenityList } from "./amenity-list";

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
  // Match the search page, which prices per night; the supplier `price` is the
  // whole-stay total, so divide by nights for the headline figure.
  const nights = Math.max(1, nightsBetween(query.checkin ?? "", query.checkout ?? ""));

  // The per-hotel rates endpoint warms up just like the bulk one: the first
  // responses come back with `completed: false` and no rooms yet. Polling until
  // it completes avoids the "No rooms available" flash on a hotel that does in
  // fact have rooms — the main source of click-in friction.
  useEffect(() => {
    let active = true;
    let polls = 0;
    const FAST_INTERVAL_MS = 600;
    const SLOW_INTERVAL_MS = 2000;
    const FAST_POLLS = 8;
    const MAX_POLLS = 26;
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

  return (
    <section>
      {confirmedAt && (
        <Badge variant="secondary" className="mb-3 text-emerald-700 dark:text-emerald-400">
          <BadgeCheck className="size-3.5" />
          Rate confirmed at {confirmedAt}
        </Badge>
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
            <Card className="overflow-hidden transition-all hover:ring-primary/30">
              <CardContent className="flex flex-col gap-4 sm:flex-row">
                {room.images.length > 0 && (
                  <HotelImage
                    candidates={room.images}
                    alt={room.roomType}
                    fallback="none"
                    className="aspect-video w-full shrink-0 rounded-xl object-cover ring-1 ring-foreground/10 sm:w-48"
                  />
                )}
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <div className="flex items-start justify-between gap-4">
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
                      <div className="text-right">
                        <p className="font-semibold text-foreground">
                          <span className="text-xs font-normal text-muted-foreground">SGD </span>
                          {Math.round(room.price / nights)}
                        </p>
                        <p className="text-xs text-muted-foreground">per night</p>
                        <p className="text-xs text-muted-foreground">
                          SGD {room.price} total · {nights} {nights === 1 ? "night" : "nights"}
                        </p>
                      </div>
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
                  </div>
                  {(room.longDescription || room.description) && (
                    <div
                      className="prose prose-sm max-w-none text-sm text-foreground/80 [&_*]:!text-foreground/80"
                      dangerouslySetInnerHTML={{
                        __html: room.longDescription || room.description,
                      }}
                    />
                  )}
                  <AmenityList
                    amenities={room.amenities}
                    className="mt-1 grid grid-cols-2 gap-x-4 gap-y-1.5 sm:grid-cols-3"
                  />
                </div>
              </CardContent>
            </Card>
          </FadeItem>
        ))}
      </div>
    </section>
  );
}
