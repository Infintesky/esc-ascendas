"use client";

import { useState } from "react";
import { Grid3x3, X } from "lucide-react";
import { HotelImage } from "./hotel-image";

// Airbnb-style hero collage: one large image on the left and a 2x2 grid on the
// right, with a "Show all photos" affordance that opens a full lightbox grid.
// Each slot starts from a different candidate index and reuses HotelImage's
// forward-fallback so unreliable supplier images degrade gracefully.
export function HotelGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [open, setOpen] = useState(false);

  // No photos at all → render nothing rather than an empty placeholder.
  if (images.length === 0) return null;

  const sideTiles = images.slice(1, 5);

  return (
    <>
      <div className="relative grid h-[24rem] grid-cols-1 gap-2 overflow-hidden rounded-2xl sm:grid-cols-2 md:grid-cols-4 md:grid-rows-2">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group relative col-span-1 row-span-1 sm:col-span-1 md:col-span-2 md:row-span-2"
        >
          <HotelImage
            candidates={images}
            alt={alt}
            className="size-full object-cover transition group-hover:brightness-95"
          />
        </button>
        {sideTiles.map((_, i) => (
          <button
            type="button"
            key={i}
            onClick={() => setOpen(true)}
            className="group relative hidden md:block"
          >
            <HotelImage
              candidates={images.slice(i + 1)}
              alt={`${alt} photo ${i + 2}`}
              fallback="none"
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
            {images.map((_, i) => (
              <HotelImage
                key={i}
                candidates={images.slice(i)}
                alt={`${alt} photo ${i + 1}`}
                fallback="none"
                className="aspect-[4/3] w-full rounded-xl object-cover ring-1 ring-foreground/10"
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
