"use client";

import { useCallback, useMemo, useState } from "react";
import { Grid3x3, X } from "lucide-react";
import { useRoomsContext } from "./rooms-provider";

// Airbnb-style hero collage: one large image on the left and a 2x2 grid on the
// right, with a "Show all photos" affordance that opens a full lightbox grid.
export function HotelGallery({
  images: hotelImages,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [open, setOpen] = useState(false);
  const { rooms } = useRoomsContext();
  // URLs that 404/403'd. Shared across every slot so a dead image is dropped
  // everywhere at once — this is what lets each tile show a *distinct* surviving
  // photo instead of all collapsing onto the same fallback.
  const [failed, setFailed] = useState<Set<string>>(new Set());
  const markFailed = useCallback(
    (url: string) =>
      setFailed((prev) => (prev.has(url) ? prev : new Set(prev).add(url))),
    [],
  );

  // The hotel's own image CDN is unreliable — some hotels advertise dozens of
  // photos that all 403. Room photos come from a different, working source, so
  // fold them in as extra images. De-duped, hotel images first so genuine hero
  // shots still lead when they load.
  const all = useMemo(() => {
    const roomImages = rooms.flatMap((r) => r.images);
    return [...new Set([...hotelImages, ...roomImages])];
  }, [hotelImages, rooms]);

  // Only images not yet known-dead. Each gallery slot draws a different entry
  // from this single ordered list, so no image is ever shown twice and slots
  // don't all fall back onto the same surviving photo.
  const live = all.filter((url) => !failed.has(url));

  // No usable photos → render nothing rather than an empty placeholder.
  if (live.length === 0) return null;

  const hero = live[0];
  const sideTiles = live.slice(1, 5);

  return (
    <>
      <div className="relative grid h-[24rem] grid-cols-1 gap-2 overflow-hidden rounded-2xl sm:grid-cols-2 md:grid-cols-4 md:grid-rows-2">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group relative col-span-1 row-span-1 sm:col-span-1 md:col-span-2 md:row-span-2"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={hero}
            alt={alt}
            loading="lazy"
            onError={() => markFailed(hero)}
            className="size-full object-cover transition group-hover:brightness-95"
          />
        </button>
        {sideTiles.map((url) => (
          <button
            type="button"
            key={url}
            onClick={() => setOpen(true)}
            className="group relative hidden md:block"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={alt}
              loading="lazy"
              onError={() => markFailed(url)}
              className="size-full object-cover transition group-hover:brightness-95"
            />
          </button>
        ))}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-lg border border-foreground/20 bg-background/95 px-3 py-1.5 text-sm font-medium text-foreground shadow-sm backdrop-blur hover:bg-background"
        >
          <Grid3x3 className="size-4" />
          Show all photos
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-background/95 backdrop-blur"
          role="dialog"
          aria-modal="true"
          aria-label={`${alt} photos`}
        >
          <div className="sticky top-0 flex justify-end p-4">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-foreground hover:bg-foreground/10"
            >
              <X className="size-5" />
              Close
            </button>
          </div>
          <div className="mx-auto grid max-w-3xl grid-cols-1 gap-3 px-4 pb-12 sm:grid-cols-2">
            {live.map((url) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={url}
                src={url}
                alt={alt}
                loading="lazy"
                onError={() => markFailed(url)}
                className="aspect-[4/3] w-full rounded-xl object-cover ring-1 ring-foreground/10"
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
