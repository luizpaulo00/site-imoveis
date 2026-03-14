import { Skeleton } from '@/components/ui/skeleton'
import { PropertyListingSkeleton } from '@/components/public/skeletons/property-listing-skeleton'

export default function HomeLoading() {
  return (
    <div>
      {/* Hero skeleton */}
      <div className="bg-[#0D3B3B] px-4 pb-24 pt-16 sm:px-6 sm:pb-28 sm:pt-20 lg:px-8 lg:pb-32 lg:pt-24">
        <div className="mx-auto max-w-7xl">
          <Skeleton className="h-6 w-48 rounded-full bg-white/10" />
          <Skeleton className="mt-4 h-14 w-96 bg-white/10" />
          <Skeleton className="mt-4 h-6 w-72 bg-white/10" />
          <div className="mt-8 flex gap-3">
            <Skeleton className="h-12 w-40 rounded-full bg-white/10" />
            <Skeleton className="h-12 w-36 rounded-full bg-white/10" />
          </div>
        </div>
      </div>

      {/* Stats skeleton */}
      <div className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-3">
                <Skeleton className="h-14 w-14 rounded-2xl" />
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-4 w-28" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Properties skeleton */}
      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col items-center gap-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-5 w-40" />
        </div>
        <PropertyListingSkeleton />
      </div>
    </div>
  )
}
