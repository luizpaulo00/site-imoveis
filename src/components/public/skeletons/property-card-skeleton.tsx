import { Skeleton } from '@/components/ui/skeleton'

export function PropertyCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
      {/* Cover image placeholder */}
      <Skeleton className="aspect-[4/3] w-full rounded-none" />

      {/* Card body */}
      <div className="space-y-2 p-4">
        {/* Price */}
        <Skeleton className="h-7 w-32" />
        {/* Title */}
        <Skeleton className="h-4 w-48" />
        {/* Neighborhood */}
        <Skeleton className="h-3 w-24" />
        {/* Specs row */}
        <div className="flex gap-4 pt-1">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  )
}
