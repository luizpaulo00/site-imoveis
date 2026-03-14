'use client'

import { Bed, Bath, Car, Ruler, MapPin } from 'lucide-react'
import { PropertyGallery } from './property-gallery'
import { PropertyMap } from './property-map'
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
}

const conditionLabels: Record<string, string> = {
  novo: 'Novo',
  usado: 'Usado',
}

const statusBannerConfig = {
  reservado: {
    label: 'Este imovel esta reservado',
    className: 'bg-amber-100 text-amber-800 border-amber-300',
  },
  vendido: {
    label: 'Este imovel foi vendido',
    className: 'bg-red-100 text-red-800 border-red-300',
  },
} as const

export function PropertyDetail({ property, settings }: PropertyDetailProps) {
  const hasCoordinates =
    property.latitude != null && property.longitude != null
  const isSoldOrReserved =
    property.status === 'reservado' || property.status === 'vendido'

  const specs = [
    { icon: Bed, value: property.bedrooms, label: 'quartos' },
    { icon: Bath, value: property.bathrooms, label: 'banheiros' },
    { icon: Car, value: property.parking_spaces, label: 'vagas' },
    { icon: Ruler, value: property.area, label: 'm²', suffix: true },
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
    <div className="mx-auto max-w-4xl">
      {/* Status banner for sold/reserved */}
      {isSoldOrReserved && (
        <div
          className={`mb-4 rounded-lg border px-4 py-3 text-center font-medium ${statusBannerConfig[property.status as 'reservado' | 'vendido'].className}`}
        >
          {statusBannerConfig[property.status as 'reservado' | 'vendido'].label}
        </div>
      )}

      {/* Gallery */}
      <PropertyGallery images={property.property_images} />

      {/* Content */}
      <div className="mt-6 space-y-6 px-4 pb-8 md:px-0">
        {/* Title + Status */}
        <div className="flex items-start gap-3">
          <h1 className="flex-1 text-2xl font-bold leading-tight md:text-3xl">
            {property.title}
          </h1>
          {isSoldOrReserved && (
            <PropertyStatusBadge status={property.status} />
          )}
        </div>

        {/* Price */}
        <p className="text-3xl font-bold" style={{ color: '#FF6A15' }}>
          {formatCurrency(property.price)}
        </p>

        {/* Specs row */}
        {specs.length > 0 && (
          <div className="flex gap-6 overflow-x-auto pb-1">
            {specs.map((spec) => (
              <div
                key={spec.label}
                className="flex shrink-0 items-center gap-2 text-muted-foreground"
              >
                <spec.icon className="h-5 w-5" />
                <span className="text-base font-medium text-foreground">
                  {spec.value}
                  {spec.suffix ? '' : ` ${spec.label}`}
                  {spec.suffix ? ` ${spec.label}` : ''}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Neighborhood / Address */}
        {(property.neighborhood || fullAddress) && (
          <div className="flex items-start gap-2 text-muted-foreground">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0" />
            <span>{property.neighborhood || fullAddress}</span>
          </div>
        )}

        {/* Description */}
        {property.description && (
          <div>
            <h2 className="mb-2 text-lg font-semibold">Descricao</h2>
            <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
              {property.description}
            </p>
          </div>
        )}

        {/* Property details table */}
        <div>
          <h2 className="mb-3 text-lg font-semibold">Detalhes do imovel</h2>
          <div className="rounded-lg border">
            <table className="w-full text-sm">
              <tbody>
                {property.property_type && (
                  <tr className="border-b last:border-b-0">
                    <td className="px-4 py-3 font-medium text-muted-foreground">
                      Tipo
                    </td>
                    <td className="px-4 py-3">
                      {typeLabels[property.property_type] ??
                        property.property_type}
                    </td>
                  </tr>
                )}
                {property.condition && (
                  <tr className="border-b last:border-b-0">
                    <td className="px-4 py-3 font-medium text-muted-foreground">
                      Condicao
                    </td>
                    <td className="px-4 py-3">
                      {conditionLabels[property.condition] ??
                        property.condition}
                    </td>
                  </tr>
                )}
                {property.status && (
                  <tr className="border-b last:border-b-0">
                    <td className="px-4 py-3 font-medium text-muted-foreground">
                      Status
                    </td>
                    <td className="px-4 py-3">
                      <PropertyStatusBadge status={property.status} />
                    </td>
                  </tr>
                )}
                {fullAddress && (
                  <tr className="border-b last:border-b-0">
                    <td className="px-4 py-3 font-medium text-muted-foreground">
                      Endereco
                    </td>
                    <td className="px-4 py-3">{fullAddress}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Map */}
        {hasCoordinates && (
          <div>
            <h2 className="mb-3 text-lg font-semibold">Localizacao</h2>
            <PropertyMap
              latitude={property.latitude!}
              longitude={property.longitude!}
            />
          </div>
        )}
      </div>
    </div>
  )
}
