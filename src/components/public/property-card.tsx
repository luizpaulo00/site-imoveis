import Link from 'next/link'
import { Bed, Bath, Ruler, MapPin } from 'lucide-react'
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
      className="group block cursor-pointer"
    >
      <article
        className={`overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
          isSoldOrReserved ? 'opacity-80' : ''
        }`}
      >
        {/* Cover image */}
        <figure className="relative aspect-[4/3] overflow-hidden">
          {property.cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={getImageUrl(property.cover.storage_path)}
              alt={property.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#0D3B3B]/10 to-[#0D3B3B]/20">
              <span className="text-5xl text-[#0D3B3B]/30">JV</span>
            </div>
          )}

          {/* Gradient overlay on bottom */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />

          {/* Price on image */}
          <div className="absolute bottom-3 left-3">
            <span className="rounded-lg bg-[#FF6A15] px-3 py-1.5 text-lg font-bold text-white shadow-lg">
              {formatCurrency(property.price)}
            </span>
          </div>

          {/* Status badge overlay */}
          {isSoldOrReserved && (
            <div className="absolute right-3 top-3">
              <PropertyStatusBadge status={property.status} />
            </div>
          )}
        </figure>

        {/* Card body */}
        <div className="p-4">
          {/* Title */}
          <h3 className="truncate font-[family-name:var(--font-display,var(--font-poppins))] text-base font-semibold text-[#0D3B3B]">
            {property.title}
          </h3>

          {/* Neighborhood */}
          {property.neighborhood && (
            <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
              <MapPin className="h-3 w-3" />
              {property.neighborhood}
            </p>
          )}

          {/* Specs divider */}
          <div className="mt-3 border-t border-gray-100 pt-3">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              {property.bedrooms != null && property.bedrooms > 0 && (
                <span className="flex items-center gap-1.5">
                  <Bed className="h-4 w-4 text-[#0D3B3B]/60" />
                  <span className="font-medium">{property.bedrooms}</span>
                </span>
              )}
              {property.bathrooms != null && property.bathrooms > 0 && (
                <span className="flex items-center gap-1.5">
                  <Bath className="h-4 w-4 text-[#0D3B3B]/60" />
                  <span className="font-medium">{property.bathrooms}</span>
                </span>
              )}
              {property.area != null && property.area > 0 && (
                <span className="flex items-center gap-1.5">
                  <Ruler className="h-4 w-4 text-[#0D3B3B]/60" />
                  <span className="font-medium">{property.area} m&sup2;</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}
