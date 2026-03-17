'use client'

import { useState, useMemo } from 'react'
import { Star, SearchX } from 'lucide-react'
import { PropertyCard } from '@/components/public/property-card'
import {
  PropertyFilters,
  type FilterState,
} from '@/components/public/property-filters'
import type { PublicProperty } from '@/lib/queries/properties'

interface PropertyListingProps {
  properties: PublicProperty[]
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
      if (filters.type && p.property_type !== filters.type) return false
      if (filters.priceMin != null && (p.price ?? 0) < filters.priceMin)
        return false
      if (filters.priceMax != null && (p.price ?? 0) > filters.priceMax)
        return false
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
        <div className="rounded-none border border-foreground/10 bg-background/5 py-20 text-center transition-all">
          <SearchX className="mx-auto h-12 w-12 text-primary-foreground/50" />
          <p className="mt-4 text-lg font-serif text-foreground/70">
            Nenhuma propriedade encontrada com estes critérios.
          </p>
          <p className="mt-1 text-sm font-light text-foreground/50">
            Ajuste sua busca ou entre em contato para atendimento exclusivo.
          </p>
          <button
            onClick={() =>
              setFilters({
                type: null,
                priceMin: null,
                priceMax: null,
                bedrooms: null,
              })
            }
            className="mt-6 cursor-pointer border border-primary-foreground/50 bg-transparent px-8 py-3 text-xs uppercase tracking-widest font-bold text-foreground transition-all hover:bg-primary-foreground hover:text-background"
          >
            Limpar Filtros
          </button>
        </div>
      )}

      {/* Featured section */}
      {featured.length > 0 && (
        <section className="mb-16">
          <h2 className="mb-8 flex items-center gap-3 font-serif text-2xl uppercase tracking-widest font-bold text-foreground border-b border-foreground/10 pb-4">
            <Star className="h-5 w-5 fill-primary-foreground text-primary-foreground" />
            Acervo em Destaque
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((property, i) => (
              <div
                key={property.id}
                className="animate-card-in"
                style={{ animationDelay: `${i * 100}ms` }}
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
          <h2 className="mb-8 font-serif text-xl uppercase tracking-widest font-bold text-foreground border-b border-foreground/10 pb-4">
            Explorar Portfólio
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {regular.map((property, i) => (
              <div
                key={property.id}
                className="animate-card-in"
                style={{ animationDelay: `${(featured.length + i) * 100}ms` }}
              >
                <PropertyCard property={property} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
