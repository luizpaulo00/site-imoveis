'use client'

import { useState, useMemo } from 'react'
import { PropertyCard } from '@/components/public/property-card'
import {
  PropertyFilters,
  type FilterState,
} from '@/components/public/property-filters'
import type { PublicProperty } from '@/lib/queries/properties'
import type { PublicSettings } from '@/lib/queries/settings'

interface PropertyListingProps {
  properties: PublicProperty[]
  settings: PublicSettings
}

export function PropertyListing({ properties }: PropertyListingProps) {
  const [filters, setFilters] = useState<FilterState>({
    type: null,
    priceMin: null,
    priceMax: null,
    bedrooms: null,
  })

  const filtered = useMemo(() => {
    return properties.filter((p) => {
      // Type filter
      if (filters.type && p.property_type !== filters.type) return false

      // Price range filter
      if (filters.priceMin != null && (p.price ?? 0) < filters.priceMin)
        return false
      if (filters.priceMax != null && (p.price ?? 0) > filters.priceMax)
        return false

      // Bedrooms filter
      if (filters.bedrooms != null) {
        const beds = p.bedrooms ?? 0
        if (filters.bedrooms === 4) {
          if (beds < 4) return false
        } else {
          if (beds !== filters.bedrooms) return false
        }
      }

      return true
    })
  }, [properties, filters])

  const featured = useMemo(
    () => filtered.filter((p) => p.featured),
    [filtered]
  )
  const regular = useMemo(
    () => filtered.filter((p) => !p.featured),
    [filtered]
  )

  return (
    <div>
      <PropertyFilters
        filters={filters}
        onFilterChange={setFilters}
        resultCount={filtered.length}
      />

      {filtered.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-lg text-gray-500">
            Nenhum imovel encontrado com esses filtros
          </p>
        </div>
      )}

      {/* Featured section */}
      {featured.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Destaques
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((property) => (
              <div
                key={property.id}
                className="rounded-xl ring-2 ring-[#FF6A15]/30"
              >
                <PropertyCard property={property} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* All properties section */}
      {regular.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Todos os Imoveis
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {regular.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
