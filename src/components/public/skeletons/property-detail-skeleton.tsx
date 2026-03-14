import { Skeleton } from '@/components/ui/skeleton'

export function PropertyDetailSkeleton() {
  return (
    <div className="mx-auto max-w-4xl">
      {/* Gallery placeholder */}
      <Skeleton className="aspect-[16/9] w-full rounded-lg" />

      {/* Content */}
      <div className="mt-6 space-y-6 px-4 pb-8 md:px-0">
        {/* Title */}
        <Skeleton className="h-8 w-3/4" />

        {/* Price */}
        <Skeleton className="h-10 w-40" />

        {/* Specs row */}
        <div className="flex gap-6">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-20" />
        </div>

        {/* Address */}
        <Skeleton className="h-4 w-64" />

        {/* Description section */}
        <div>
          <Skeleton className="mb-2 h-6 w-24" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-3/4" />
        </div>

        {/* Map placeholder */}
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    </div>
  )
}
