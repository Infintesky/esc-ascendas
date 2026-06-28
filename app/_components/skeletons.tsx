// Server components — instant placeholders shown while a slow upstream
// (Ascenda) fetch streams in behind a <Suspense> boundary.

function Bar({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-muted ${className}`} />;
}

function CardSkeleton() {
  return (
    <div className="mb-3 flex items-start justify-between gap-4 rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="w-full space-y-2">
        <Bar className="h-4 w-1/2" />
        <Bar className="h-3 w-2/3" />
        <Bar className="h-3 w-20" />
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2">
        <Bar className="h-4 w-16" />
        <Bar className="h-9 w-20" />
      </div>
    </div>
  );
}

export function ResultsSkeleton() {
  return (
    <div>
      <Bar className="mb-6 h-7 w-48" />
      <Bar className="mb-5 h-20 w-full" />
      {Array.from({ length: 5 }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function HotelDetailSkeleton() {
  return (
    <div>
      <Bar className="h-8 w-2/3" />
      <Bar className="mt-2 h-4 w-1/2" />
      <Bar className="my-6 aspect-video w-full" />
      <Bar className="h-4 w-full" />
      <Bar className="mt-2 h-4 w-5/6" />
      <Bar className="mt-8 h-6 w-32" />
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Bar key={i} className="h-9 w-full" />
        ))}
      </div>
      <Bar className="mt-8 h-6 w-40" />
      <div className="mt-3 space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
