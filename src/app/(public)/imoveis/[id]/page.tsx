import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getPropertyWithImages } from '@/lib/queries/property'
import { getPublicSettings } from '@/lib/queries/settings'
import { getOGImageUrl } from '@/lib/utils/image-url'
import { formatCurrency } from '@/lib/utils/currency'
import { PropertyDetail } from '@/components/public/property-detail'

type Props = { params: Promise<{ id: string }> }

function formatOGDescription(property: {
  price: number | null
  bedrooms: number | null
  bathrooms: number | null
  area: number | null
  neighborhood: string | null
}): string {
  const parts: string[] = []
  if (property.price) parts.push(formatCurrency(property.price))
  if (property.bedrooms) parts.push(`${property.bedrooms} quartos`)
  if (property.bathrooms) parts.push(`${property.bathrooms} banheiros`)
  if (property.area) parts.push(`${property.area}m²`)
  if (property.neighborhood) parts.push(property.neighborhood)
  return parts.join(' | ')
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const property = await getPropertyWithImages(id)

  if (!property) {
    return { title: 'Imovel nao encontrado' }
  }

  const description = formatOGDescription(property)
  const ogImageUrl = getOGImageUrl(property.id, property.updated_at)

  return {
    title: property.title,
    description,
    openGraph: {
      title: property.title,
      description,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: property.title,
        },
      ],
      type: 'website',
      locale: 'pt_BR',
    },
  }
}

export default async function PropertyDetailPage({ params }: Props) {
  const { id } = await params
  const [property, settings] = await Promise.all([
    getPropertyWithImages(id),
    getPublicSettings(),
  ])

  if (!property) {
    notFound()
  }

  return <PropertyDetail property={property} settings={settings} />
}
