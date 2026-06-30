"use client";

import { useState } from "react";
import { ImageOff } from "lucide-react";

// Supplier images are unreliable: some hotels report zero images and others 404
// (403) on individual indices. Try each candidate URL in turn and, once they're
// exhausted, either render a placeholder or nothing (`fallback="none"`) so we
// never show a broken image icon. Images lazy-load so we don't fetch every photo
// in a large gallery up front.
export function HotelImage({
  candidates,
  alt,
  className,
  fallback = "placeholder",
}: {
  candidates: string[];
  alt: string;
  className?: string;
  fallback?: "placeholder" | "none";
}) {
  const [index, setIndex] = useState(0);
  const src = candidates[index];

  if (!src) {
    if (fallback === "none") return null;
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
      loading="lazy"
      className={className}
      onError={() => setIndex((i) => i + 1)}
    />
  );
}
