import Link from 'next/link'
import Image from 'next/image'
import { Bed, Bath, Ruler } from 'lucide-react'
import { PropertyStatusBadge } from '@/components/admin/property-status-badge'
import { formatCurrency } from '@/lib/utils/currency'
import { getImageUrl } from '@/lib/utils/image-url'
import { TiltCard } from './tilt-card'
import type { PublicProperty } from '@/lib/queries/properties'

interface PropertyCardProps {
  property: PublicProperty
}

export function PropertyCard({ property }: PropertyCardProps) {
  const isSoldOrReserved =
    property.status === 'vendido' || property.status === 'reservado'

  return (
    <TiltCard>
      <Link
        href={`/imoveis/${property.id}`}
        className="group block cursor-pointer"
      >
        <article
          className={`overflow-hidden rounded-none border border-foreground/5 bg-background shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06),0_20px_40px_rgba(0,0,0,0.04)] transition-all duration-500 hover:-translate-y-1 hover:border-primary-foreground/50 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06),0_12px_32px_rgba(0,0,0,0.1),0_24px_48px_rgba(0,0,0,0.06)] ${
            isSoldOrReserved ? 'opacity-80' : ''
          }`}
        >
          {/* Cover image */}
          <figure className="relative aspect-[4/3] overflow-hidden rounded-none">
            {property.cover ? (
              <Image
                src={getImageUrl(property.cover.storage_path)}
                alt={property.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-foreground/5">
                <span className="font-serif text-5xl text-foreground/20">JV</span>
              </div>
            )}

            {/* Gradient overlay on bottom */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/80 to-transparent" />

            {/* Price on image */}
            <div className="absolute bottom-4 left-4">
              <span className="text-xl font-serif tracking-tight text-white drop-shadow-md">
                {formatCurrency(property.price)}
              </span>
            </div>

            {/* Status badge overlay */}
            {isSoldOrReserved && (
              <div className="absolute right-4 top-4">
                <PropertyStatusBadge status={property.status} />
              </div>
            )}

            {/* Destaque badge overlay */}
            {property.featured && !isSoldOrReserved && (
              <div className="absolute right-4 top-4 border border-white/30 bg-black/40 px-3 py-1 text-xs uppercase tracking-widest text-white backdrop-blur-md">
                Exclusivo
              </div>
            )}
          </figure>

          {/* Card body */}
          <div className="p-6">
            {/* Title */}
            <h3 className="line-clamp-2 font-serif text-lg leading-tight text-foreground transition-colors group-hover:text-primary-foreground">
              {property.title}
            </h3>

            {/* Neighborhood */}
            {property.neighborhood && (
              <p className="mt-2 text-xs uppercase tracking-widest text-foreground/50">
                {property.neighborhood}
              </p>
            )}

            {/* Specs divider */}
            <div className="mt-6 border-t border-foreground/10 pt-4">
              <div className="flex items-center gap-6 text-sm font-light text-foreground/70">
                {property.bedrooms != null && property.bedrooms > 0 && (
                  <span className="flex items-center gap-2">
                    <Bed className="h-4 w-4 text-primary-foreground/70" />
                    <span>{property.bedrooms}</span>
                  </span>
                )}
                {property.bathrooms != null && property.bathrooms > 0 && (
                  <span className="flex items-center gap-2">
                    <Bath className="h-4 w-4 text-primary-foreground/70" />
                    <span>{property.bathrooms}</span>
                  </span>
                )}
                {property.area != null && property.area > 0 && (
                  <span className="flex items-center gap-2">
                    <Ruler className="h-4 w-4 text-primary-foreground/70" />
                    <span>{property.area} m&sup2;</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </article>
      </Link>
    </TiltCard>
  )
}
