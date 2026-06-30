"use client";

import { useState } from "react";
import { ImageOff } from "lucide-react";

// Supplier images are unreliable: some hotels report zero images and others 404
// (403) on individual indices. Try each candidate URL in turn and fall back to a
// placeholder once they're exhausted, so the detail page never shows a broken
// image icon.
export function HotelImage({
  candidates,
  alt,
  className,
}: {
  candidates: string[];
  alt: string;
  className?: string;
}) {
  const [index, setIndex] = useState(0);
  const src = candidates[index];

  if (!src) {
    return (
      <div
        className={`flex items-center justify-center bg-muted text-muted-foreground ${className ?? ""}`}
      >
        <ImageOff className="size-8" />
        <span className="sr-only">No image available</span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setIndex((i) => i + 1)}
    />
  );
}
