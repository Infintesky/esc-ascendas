"use client";

import { useState } from "react";
import { MapPin, Plane, ChevronDown } from "lucide-react";
import type { Distance, ParsedDescription } from "@/lib/hotel/description";

const NEARBY_PREVIEW = 6;

function DistanceRow({ item, icon }: { item: Distance; icon: React.ReactNode }) {
  return (
    <li className="flex items-center gap-3 py-2">
      <span className="text-primary">{icon}</span>
      <span className="min-w-0 flex-1 truncate text-[15px] text-foreground">
        {item.name}
      </span>
      <span className="shrink-0 text-sm text-muted-foreground">{item.km} km</span>
    </li>
  );
}

export function HotelAbout({ paragraphs, nearby, airports }: ParsedDescription) {
  const [expanded, setExpanded] = useState(false);
  const shownNearby = expanded ? nearby : nearby.slice(0, NEARBY_PREVIEW);
  const hiddenCount = nearby.length - shownNearby.length;

  return (
    <div className="space-y-8">
      {paragraphs.length > 0 && (
        <div className="max-w-2xl space-y-4 text-[15px] leading-relaxed text-foreground/90">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      )}

      {nearby.length > 0 && (
        <div>
          <h3 className="mb-1 flex items-center gap-2 text-lg font-semibold text-foreground">
            <MapPin className="size-4 text-primary" />
            What&apos;s nearby
          </h3>
          <ul className="max-w-xl divide-y divide-foreground/5">
            {shownNearby.map((item) => (
              <DistanceRow
                key={item.name}
                item={item}
                icon={<MapPin className="size-4" />}
              />
            ))}
          </ul>
          {hiddenCount > 0 && (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              <ChevronDown className="size-4" />
              Show all {nearby.length}
            </button>
          )}
        </div>
      )}

      {airports.length > 0 && (
        <div>
          <h3 className="mb-1 flex items-center gap-2 text-lg font-semibold text-foreground">
            <Plane className="size-4 text-primary" />
            Getting around
          </h3>
          <ul className="max-w-xl divide-y divide-foreground/5">
            {airports.map((item) => (
              <DistanceRow
                key={item.name}
                item={item}
                icon={<Plane className="size-4" />}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
