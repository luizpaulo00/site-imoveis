'use client'

import { Bed, Bath, Car, Ruler, MapPin } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { PropertyGallery } from './property-gallery'
import { PropertyMap } from './property-map'
import { WhatsAppButton } from './whatsapp-button'
import { ShareButton } from './share-button'
import { PropertyStatusBadge } from '@/components/admin/property-status-badge'
import { formatCurrency } from '@/lib/utils/currency'
import type { PropertyWithImages } from '@/lib/queries/property'
import type { PublicSettings } from '@/lib/queries/settings'

interface PropertyDetailProps {
  property: PropertyWithImages
  settings: PublicSettings
}

const typeLabels: Record<string, string> = {
  casa: 'Casa',
  apartamento: 'Apartamento',
  lote: 'Lote',
}

const conditionLabels: Record<string, string> = {
  novo: 'Novo',
  usado: 'Usado',
}

const constructionStatusLabels: Record<string, string> = {
  em_construcao: 'Em construcao',
  pronto_para_morar: 'Pronto para morar',
}

const statusBannerConfig = {
  reservado: {
    label: 'Este imovel esta reservado',
    className: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  vendido: {
    label: 'Este imovel foi vendido',
    className: 'bg-red-50 text-red-800 border-red-200',
  },
} as const

export function PropertyDetail({ property, settings }: PropertyDetailProps) {
  const pathname = usePathname()
  const propertyUrl = `${process.env.NEXT_PUBLIC_SITE_URL || ''}${pathname}`
  const hasCoordinates =
    property.latitude != null && property.longitude != null
  const isSoldOrReserved =
    property.status === 'reservado' || property.status === 'vendido'

  const specs = [
    { icon: Bed, value: property.bedrooms, label: 'quartos' },
    { icon: Bath, value: property.bathrooms, label: 'banheiros' },
    { icon: Car, value: property.parking_spaces, label: 'vagas' },
    { icon: Ruler, value: property.area, label: 'm² total', suffix: true },
    { icon: Ruler, value: property.built_area, label: 'm² construida', suffix: true },
  ].filter((s) => s.value != null && s.value > 0)

  const fullAddress = [
    property.address,
    property.neighborhood,
    property.city,
    property.state,
  ]
    .filter(Boolean)
    .join(', ')

  return (
    <article>
      {/* Gallery - full width */}
      <PropertyGallery images={property.property_images} propertyTitle={property.title} />

      {/* Content container */}
      <div className="mx-auto max-w-4xl px-4 pb-24 pt-6 sm:px-6 lg:px-8">
        {/* Status banner */}
        {isSoldOrReserved && (
          <div
            className={`mb-6 rounded-xl border px-4 py-3 text-center text-sm font-semibold ${statusBannerConfig[property.status as 'reservado' | 'vendido'].className}`}
          >
            {statusBannerConfig[property.status as 'reservado' | 'vendido'].label}
          </div>
        )}

        {/* Title + Share */}
        <div className="flex items-start gap-3">
          <h1 className="flex-1 font-[family-name:var(--font-display,var(--font-poppins))] text-2xl font-bold leading-tight text-[#0D3B3B] md:text-3xl">
            {property.title}
          </h1>
          <ShareButton title={property.title} url={propertyUrl} />
          {isSoldOrReserved && (
            <PropertyStatusBadge status={property.status} />
          )}
        </div>

        {/* Price */}
        <p className="mt-2 text-3xl font-bold text-[#FF6A15]">
          {formatCurrency(property.price)}
        </p>

        {/* Location */}
        {(property.neighborhood || fullAddress) && (
          <div className="mt-3 flex items-center gap-2 text-gray-500">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="text-sm">{property.neighborhood || fullAddress}</span>
          </div>
        )}

        {/* Specs cards */}
        {specs.length > 0 && (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {specs.map((spec) => (
              <div
                key={spec.label}
                className="flex flex-col items-center rounded-xl bg-white p-4 shadow-sm"
              >
                <spec.icon className="h-6 w-6 text-[#0D3B3B]/60" />
                <span className="mt-1.5 text-xl font-bold text-[#0D3B3B]">
                  {spec.value}
                </span>
                <span className="text-xs text-gray-500">
                  {spec.label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Description */}
        {property.description && (
          <section className="mt-8">
            <h2 className="mb-3 font-[family-name:var(--font-display,var(--font-poppins))] text-lg font-bold text-[#0D3B3B]">
              Descricao
            </h2>
            <div className="rounded-xl bg-white p-5 shadow-sm">
              <p className="whitespace-pre-wrap leading-relaxed text-gray-600">
                {property.description}
              </p>
            </div>
          </section>
        )}

        {/* Property details table */}
        <section className="mt-8">
          <h2 className="mb-3 font-[family-name:var(--font-display,var(--font-poppins))] text-lg font-bold text-[#0D3B3B]">
            Detalhes do imovel
          </h2>
          <div className="overflow-hidden rounded-xl bg-white shadow-sm">
            <table className="w-full text-sm">
              <tbody>
                {property.property_type && (
                  <tr className="border-b border-gray-50">
                    <td className="px-5 py-3.5 font-medium text-gray-500">
                      Tipo
                    </td>
                    <td className="px-5 py-3.5 font-medium text-[#0D3B3B]">
                      {typeLabels[property.property_type] ??
                        property.property_type}
                    </td>
                  </tr>
                )}
                {property.condition && (
                  <tr className="border-b border-gray-50">
                    <td className="px-5 py-3.5 font-medium text-gray-500">
                      Condicao
                    </td>
                    <td className="px-5 py-3.5 font-medium text-[#0D3B3B]">
                      {conditionLabels[property.condition] ??
                        property.condition}
                    </td>
                  </tr>
                )}
                {property.construction_status && (
                  <tr className="border-b border-gray-50">
                    <td className="px-5 py-3.5 font-medium text-gray-500">
                      Status da construcao
                    </td>
                    <td className="px-5 py-3.5 font-medium text-[#0D3B3B]">
                      {constructionStatusLabels[property.construction_status] ??
                        property.construction_status}
                    </td>
                  </tr>
                )}
                {property.status && (
                  <tr className="border-b border-gray-50">
                    <td className="px-5 py-3.5 font-medium text-gray-500">
                      Status
                    </td>
                    <td className="px-5 py-3.5">
                      <PropertyStatusBadge status={property.status} />
                    </td>
                  </tr>
                )}
                {fullAddress && (
                  <tr>
                    <td className="px-5 py-3.5 font-medium text-gray-500">
                      Endereco
                    </td>
                    <td className="px-5 py-3.5 font-medium text-[#0D3B3B]">{fullAddress}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Map */}
        {hasCoordinates && (
          <section className="mt-8">
            <h2 className="mb-3 font-[family-name:var(--font-display,var(--font-poppins))] text-lg font-bold text-[#0D3B3B]">
              Localizacao
            </h2>
            <div className="overflow-hidden rounded-xl shadow-sm">
              <PropertyMap
                latitude={property.latitude!}
                longitude={property.longitude!}
              />
            </div>
          </section>
        )}
      </div>

      {/* Sticky WhatsApp FAB */}
      {settings.whatsapp && (
        <WhatsAppButton
          phone={settings.whatsapp}
          propertyTitle={property.title}
          propertyUrl={propertyUrl}
        />
      )}
    </article>
  )
}
