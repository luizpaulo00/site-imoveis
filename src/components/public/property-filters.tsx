'use client'

export interface FilterState {
  type: string | null
  priceMin: number | null
  priceMax: number | null
  bedrooms: number | null
}

interface PropertyFiltersProps {
  filters: FilterState
  onFilterChange: (filters: FilterState) => void
  resultCount: number
}

const PRICE_RANGES = [
  { label: 'Todos', min: null, max: null },
  { label: 'Ate R$ 200k', min: null, max: 200000 },
  { label: 'R$ 200k - 500k', min: 200000, max: 500000 },
  { label: 'R$ 500k - 1M', min: 500000, max: 1000000 },
  { label: 'Acima de R$ 1M', min: 1000000, max: null },
]

const BEDROOM_OPTIONS = [
  { label: 'Todos', value: null },
  { label: '1', value: 1 },
  { label: '2', value: 2 },
  { label: '3', value: 3 },
  { label: '4+', value: 4 },
]

export function PropertyFilters({
  filters,
  onFilterChange,
  resultCount,
}: PropertyFiltersProps) {
  const activePriceIndex = PRICE_RANGES.findIndex(
    (r) => r.min === filters.priceMin && r.max === filters.priceMax
  )

  return (
    <div className="mb-8 rounded-2xl bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:gap-8">
        {/* Type filter */}
        <div className="flex-1">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#0D3B3B]/50">
            Tipo
          </label>
          <div className="flex flex-wrap gap-2">
            {['Todos', 'Casa', 'Apartamento'].map((t) => {
              const value = t === 'Todos' ? null : t.toLowerCase()
              const isActive = filters.type === value
              return (
                <button
                  key={t}
                  onClick={() => onFilterChange({ ...filters, type: value })}
                  className={`cursor-pointer rounded-full px-4 py-2.5 min-h-[44px] text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#0D3B3B] text-white shadow-md'
                      : 'bg-[#F8F5F0] text-[#0D3B3B] hover:bg-[#0D3B3B]/10'
                  }`}
                >
                  {t}
                </button>
              )
            })}
          </div>
        </div>

        {/* Price range filter */}
        <div className="flex-1">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#0D3B3B]/50">
            Faixa de Preco
          </label>
          <div className="flex flex-wrap gap-2">
            {PRICE_RANGES.map((range, i) => {
              const isActive = activePriceIndex === i
              return (
                <button
                  key={range.label}
                  onClick={() =>
                    onFilterChange({
                      ...filters,
                      priceMin: range.min,
                      priceMax: range.max,
                    })
                  }
                  className={`cursor-pointer rounded-full px-4 py-2.5 min-h-[44px] text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#0D3B3B] text-white shadow-md'
                      : 'bg-[#F8F5F0] text-[#0D3B3B] hover:bg-[#0D3B3B]/10'
                  }`}
                >
                  {range.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Bedrooms filter */}
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#0D3B3B]/50">
            Quartos
          </label>
          <div className="flex gap-2">
            {BEDROOM_OPTIONS.map((opt) => {
              const isActive = filters.bedrooms === opt.value
              return (
                <button
                  key={opt.label}
                  onClick={() =>
                    onFilterChange({ ...filters, bedrooms: opt.value })
                  }
                  className={`cursor-pointer rounded-full px-4 py-2.5 min-h-[44px] min-w-[44px] text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#0D3B3B] text-white shadow-md'
                      : 'bg-[#F8F5F0] text-[#0D3B3B] hover:bg-[#0D3B3B]/10'
                  }`}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Result count */}
      <div className="mt-4 border-t border-gray-100 pt-3">
        <p className="text-sm text-gray-500">
          <span className="font-bold text-[#0D3B3B]">{resultCount}</span>{' '}
          {resultCount === 1 ? 'imovel encontrado' : 'imoveis encontrados'}
        </p>
      </div>
    </div>
  )
}
