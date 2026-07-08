"use client";

import { createContext, useContext } from "react";
import { useHotelRooms } from "@/hooks/use-hotel-rooms";
import type { Room } from "@/lib/ascenda/types";

type RoomsValue = { rooms: Room[]; loading: boolean; confirmedAt: string | null };

const RoomsContext = createContext<RoomsValue>({
  rooms: [],
  loading: true,
  confirmedAt: null,
});

export const useRoomsContext = () => useContext(RoomsContext);

// Fetches a hotel's live rooms once and shares them with everything under it.
// Both the gallery (which borrows room photos when the hotel's own image CDN
// 403s) and the room list read from here, so we poll the rates endpoint once
// instead of twice.
export function RoomsProvider({
  hotelId,
  query,
  children,
}: {
  hotelId: string;
  query: Record<string, string>;
  children: React.ReactNode;
}) {
  const value = useHotelRooms(hotelId, query);
  return <RoomsContext.Provider value={value}>{children}</RoomsContext.Provider>;
}
