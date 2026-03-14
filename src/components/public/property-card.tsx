import Link from 'next/link'
import { Bed, Bath, Ruler } from 'lucide-react'
import { PropertyStatusBadge } from '@/components/admin/property-status-badge'
import { formatCurrency } from '@/lib/utils/currency'
import { getImageUrl } from '@/lib/utils/image-url'
import type { PublicProperty } from '@/lib/queries/properties'

interface PropertyCardProps {
  property: PublicProperty
}

export function PropertyCard({ property }: PropertyCardProps) {
  const isSoldOrReserved =
    property.status === 'vendido' || property.status === 'reservado'

  return (
    <Link
      href={`/imoveis/${property.id}`}
      className={`group block overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200 transition-shadow hover:shadow-md ${
        isSoldOrReserved ? 'opacity-75' : ''
      }`}
    >
      <article>
        {/* Cover image */}
        <figure className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          {property.cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={getImageUrl(property.cover.storage_path)}
              alt={property.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
              <span className="text-4xl text-gray-400">&#9675;</span>
            </div>
          )}

          {/* Status badge overlay */}
          <div className="absolute left-3 top-3">
            <PropertyStatusBadge status={property.status} />
          </div>
        </figure>

        {/* Card body */}
        <div className="p-4">
          {/* Price */}
          <p className="text-xl font-bold text-[#FF6A15]">
            {formatCurrency(property.price)}
          </p>

          {/* Title */}
          <h3 className="mt-1 truncate text-sm font-medium text-gray-900">
            {property.title}
          </h3>

          {/* Neighborhood */}
          {property.neighborhood && (
            <p className="mt-0.5 text-xs text-gray-500">
              {property.neighborhood}
            </p>
          )}

          {/* Specs */}
          <div className="mt-3 flex items-center gap-4 text-xs text-gray-600">
            {property.bedrooms != null && property.bedrooms > 0 && (
              <span className="flex items-center gap-1">
                <Bed className="h-3.5 w-3.5" />
                {property.bedrooms}
              </span>
            )}
            {property.bathrooms != null && property.bathrooms > 0 && (
              <span className="flex items-center gap-1">
                <Bath className="h-3.5 w-3.5" />
                {property.bathrooms}
              </span>
            )}
            {property.area != null && property.area > 0 && (
              <span className="flex items-center gap-1">
                <Ruler className="h-3.5 w-3.5" />
                {property.area} m&sup2;
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  )
}
