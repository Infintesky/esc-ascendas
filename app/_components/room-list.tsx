"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Room } from "@/lib/ascenda/types";

export function RoomList({
  hotelId,
  query,
}: {
  hotelId: string;
  query: Record<string, string>;
}) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [confirmedAt, setConfirmedAt] = useState<string | null>(null);
  const qs = new URLSearchParams(query).toString();

  useEffect(() => {
    let active = true;
    fetch(`/api/hotels/${hotelId}/prices?${qs}`)
      .then((r) => r.json())
      .then((data: { rooms: Room[] }) => {
        if (!active) return;
        setRooms(data.rooms ?? []);
        setConfirmedAt(new Date().toLocaleTimeString());
      });
    return () => {
      active = false;
    };
  }, [hotelId, qs]);

  return (
    <section>
      {confirmedAt && <p className="text-xs text-muted-foreground">Rate confirmed at {confirmedAt}</p>}
      {rooms.map((room) => (
        <article key={room.key} className="rounded border p-4">
          <h3 className="font-medium">{room.roomType}</h3>
          {room.freeCancellation && <span className="text-xs text-green-600">Free cancellation</span>}
          <p className="font-semibold">SGD {room.price}</p>
          <Link href={`/book?hotel_id=${hotelId}&room_key=${encodeURIComponent(room.key)}&room_type=${encodeURIComponent(room.roomType)}&price=${room.price}&${qs}`}>
            Select room
          </Link>
        </article>
      ))}
    </section>
  );
}
