import { Skeleton } from '@/components/ui/skeleton'
import { PropertyCardSkeleton } from './property-card-skeleton'

export function PropertyListingSkeleton() {
  return (
    <div>
      {/* Filter bar placeholder */}
      <div className="mb-6 flex gap-3">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <PropertyCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
