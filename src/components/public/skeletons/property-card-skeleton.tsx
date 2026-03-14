import { Skeleton } from '@/components/ui/skeleton'

export function PropertyCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
      {/* Cover image placeholder */}
      <Skeleton className="aspect-[4/3] w-full rounded-none" />

      {/* Card body */}
      <div className="space-y-2 p-4">
        {/* Title */}
        <Skeleton className="h-5 w-48" />
        {/* Neighborhood */}
        <Skeleton className="h-3 w-28" />
        {/* Specs row */}
        <div className="border-t border-gray-100 pt-3">
          <div className="flex gap-4">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      </div>
    </div>
  )
}
