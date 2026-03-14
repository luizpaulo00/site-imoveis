import { Skeleton } from '@/components/ui/skeleton'
import { PropertyListingSkeleton } from '@/components/public/skeletons/property-listing-skeleton'

export default function HomeLoading() {
  return (
    <div>
      {/* h1 placeholder */}
      <Skeleton className="mb-6 h-9 w-48" />
      <PropertyListingSkeleton />
    </div>
  )
}
