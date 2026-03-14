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
    <div className="mb-6 space-y-4 rounded-xl bg-gray-50 p-4 sm:p-6">
      {/* Type filter */}
      <div>
        <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-gray-500">
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
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#0D3B3B] text-white'
                    : 'bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-100'
                }`}
              >
                {t}
              </button>
            )
          })}
        </div>
      </div>

      {/* Price range filter */}
      <div>
        <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-gray-500">
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
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#0D3B3B] text-white'
                    : 'bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-100'
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
        <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-gray-500">
          Quartos
        </label>
        <div className="flex flex-wrap gap-2">
          {BEDROOM_OPTIONS.map((opt) => {
            const isActive = filters.bedrooms === opt.value
            return (
              <button
                key={opt.label}
                onClick={() =>
                  onFilterChange({ ...filters, bedrooms: opt.value })
                }
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#0D3B3B] text-white'
                    : 'bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-100'
                }`}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Result count */}
      <p className="text-sm text-gray-500">
        <span className="font-semibold text-gray-900">{resultCount}</span>{' '}
        {resultCount === 1 ? 'imovel encontrado' : 'imoveis encontrados'}
      </p>
    </div>
  )
}
