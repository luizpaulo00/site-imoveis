import type { PropertyWithImages } from '@/lib/queries/property'
import { getImageUrl } from '@/lib/utils/image-url'

export function buildPropertyJsonLd(
  property: PropertyWithImages,
  siteUrl: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: property.title,
    description: property.description || undefined,
    url: `${siteUrl}/imoveis/${property.id}`,
    datePosted: property.created_at,
    image: property.property_images.map((img) =>
      getImageUrl(img.storage_path)
    ),
    offers: {
      '@type': 'Offer',
      priceCurrency: 'BRL',
      price:
        property.price != null ? String(property.price) : undefined,
      businessFunction: 'http://purl.org/goodrelations/v1#Sell',
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: property.address || undefined,
      addressLocality:
        property.neighborhood || property.city || undefined,
      addressRegion: property.state || undefined,
      addressCountry: 'BR',
    },
    numberOfRooms: property.bedrooms || undefined,
    numberOfBathroomsTotal: property.bathrooms || undefined,
    floorSize: property.area
      ? {
          '@type': 'QuantitativeValue',
          value: String(property.area),
          unitCode: 'MTK',
        }
      : undefined,
    geo:
      property.latitude != null && property.longitude != null
        ? {
            '@type': 'GeoCoordinates',
            latitude: property.latitude,
            longitude: property.longitude,
          }
        : undefined,
  }
}
