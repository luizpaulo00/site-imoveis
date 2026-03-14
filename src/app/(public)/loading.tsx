import { Skeleton } from '@/components/ui/skeleton'
import { PropertyListingSkeleton } from '@/components/public/skeletons/property-listing-skeleton'

export default function HomeLoading() {
  return (
    <div>
      {/* Hero skeleton */}
      <div className="bg-[#0D3B3B] px-4 pb-16 pt-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Skeleton className="h-12 w-80 bg-white/10" />
          <Skeleton className="mt-4 h-5 w-48 bg-white/10" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <PropertyListingSkeleton />
      </div>
    </div>
  )
}
