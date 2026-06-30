// Server components — instant placeholders shown while a slow upstream
// (Ascenda) fetch streams in behind a <Suspense> boundary.

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

function CardSkeleton() {
  return (
    <Card className="mb-3">
      <CardContent className="flex items-start justify-between gap-4">
        <div className="w-full space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-2/3" />
          <Skeleton className="h-3 w-20" />
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-9 w-20" />
        </div>
      </CardContent>
    </Card>
  );
}

export function ResultsSkeleton() {
  return (
    <div>
      <Skeleton className="mb-6 h-7 w-48" />
      <Skeleton className="mb-5 h-20 w-full" />
      {Array.from({ length: 5 }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function HotelDetailSkeleton() {
  return (
    <div>
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="mt-2 h-4 w-1/2" />
      <Skeleton className="my-6 aspect-video w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="mt-2 h-4 w-5/6" />
      <Skeleton className="mt-8 h-6 w-32" />
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-full" />
        ))}
      </div>
      <Skeleton className="mt-8 h-6 w-40" />
      <div className="mt-3 space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
