import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getPropertyWithImages } from '@/lib/queries/property'
import { getPublicSettings } from '@/lib/queries/settings'
import { getOGImageUrl } from '@/lib/utils/image-url'
import { formatOGDescription } from '@/lib/utils/og'
import { buildPropertyJsonLd } from '@/lib/structured-data'
import { PropertyDetail } from '@/components/public/property-detail'

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const property = await getPropertyWithImages(id)

  if (!property) {
    return { title: 'Imovel nao encontrado' }
  }

  const description = formatOGDescription(property)
  const ogImageUrl = getOGImageUrl(property.id, property.updated_at)

  return {
    title: `${property.title} | Jander Imoveis`,
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

  const jsonLd = buildPropertyJsonLd(
    property,
    process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  )

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <PropertyDetail property={property} settings={settings} />
    </>
  )
}
