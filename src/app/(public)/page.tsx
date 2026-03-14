import { getPublicProperties } from '@/lib/queries/properties'
import { getPublicSettings } from '@/lib/queries/settings'
import { PropertyListing } from '@/components/public/property-listing'
import { Search } from 'lucide-react'

export default async function HomePage() {
  const [properties, settings] = await Promise.all([
    getPublicProperties(),
    getPublicSettings(),
  ])

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-[#0D3B3B] px-4 pb-16 pt-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <h1 className="font-[family-name:var(--font-display,var(--font-poppins))] text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
              Encontre o imovel{' '}
              <span className="text-[#FF6A15]">ideal</span> para voce
            </h1>
            <p className="mt-4 text-lg text-white/70">
              {settings.brokerName || 'Jander Venancio'} — Corretor de Imoveis
            </p>
          </div>
        </div>

        {/* Curved bottom */}
        <div className="absolute inset-x-0 -bottom-1">
          <svg viewBox="0 0 1440 60" fill="none" className="w-full">
            <path d="M0 60V0C240 40 480 60 720 60C960 60 1200 40 1440 0V60H0Z" fill="#F8F5F0" />
          </svg>
        </div>
      </section>

      {/* Content */}
      <section className="relative z-10 mx-auto -mt-2 max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center gap-2 text-sm text-gray-500">
          <Search className="h-4 w-4" />
          <span>
            <strong className="text-gray-900">{properties.length}</strong>{' '}
            {properties.length === 1 ? 'imovel disponivel' : 'imoveis disponiveis'}
          </span>
        </div>

        <PropertyListing properties={properties} settings={settings} />
      </section>
    </div>
  )
}
