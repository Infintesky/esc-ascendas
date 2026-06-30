"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BadgeCheck, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
            <Card className="transition-all hover:ring-primary/30">
              <CardContent className="flex items-start justify-between gap-4">
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
              </CardContent>
            </Card>
          </FadeItem>
        ))}
      </div>
    </section>
  );
}
