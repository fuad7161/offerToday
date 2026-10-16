// Shimmer skeleton primitives and a couple of composed list skeletons.

export function Skeleton({ className = '' }) {
  return <div className={`shimmer rounded ${className}`} aria-hidden="true" />
}

export function PlaceListSkeleton() {
  return (
    <div className="space-y-3" aria-hidden="true" aria-label="Loading places">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-card border border-line bg-paper p-4">
          <Skeleton className="h-11 w-11 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="h-5 w-5 rounded" />
        </div>
      ))}
    </div>
  )
}

export function ShopListSkeleton() {
  return (
    <div className="space-y-3" aria-hidden="true" aria-label="Loading shops">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-card border border-line bg-paper p-4">
          <Skeleton className="h-4 w-5 rounded" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="h-9 w-16 rounded-full" />
        </div>
      ))}
    </div>
  )
}

export function DetailSkeleton() {
  return (
    <div className="space-y-4" aria-hidden="true" aria-label="Loading shop">
      <Skeleton className="h-4 w-16 rounded" />
      <div className="space-y-2">
        <Skeleton className="h-7 w-2/3 rounded" />
        <Skeleton className="h-4 w-1/2 rounded" />
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="space-y-2 rounded-card border border-line bg-paper p-4">
          <Skeleton className="h-4 w-3/4 rounded" />
          <Skeleton className="h-3 w-1/3 rounded" />
        </div>
      ))}
    </div>
  )
}
