"use client";

import { createContext, useContext } from "react";
import { useHotelPrices } from "@/hooks/use-hotel-prices";
import type { PriceResult } from "@/lib/ascenda/types";

type PricesValue = { hotels: PriceResult[]; completed: boolean; error: string | null };

const PricesContext = createContext<PricesValue>({
  hotels: [],
  completed: false,
  error: null,
});

export const useHotelPricesContext = () => useContext(PricesContext);

// Lives outside the Suspense boundary that awaits the (slow) static-hotel fetch,
// so price polling starts as soon as the page shell hydrates instead of waiting
// for the hotel list. The two upstream calls are independent; results are merged
// downstream once both arrive.
export function PricesProvider({
  query,
  children,
}: {
  query: Record<string, string>;
  children: React.ReactNode;
}) {
  const value = useHotelPrices(query);
  return <PricesContext.Provider value={value}>{children}</PricesContext.Provider>;
}
