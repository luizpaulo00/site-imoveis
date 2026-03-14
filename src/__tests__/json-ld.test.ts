import { describe, it, expect, vi } from 'vitest'
import { buildPropertyJsonLd } from '@/lib/structured-data'
import type { PropertyWithImages } from '@/lib/queries/property'

vi.mock('@/lib/utils/image-url', () => ({
  getImageUrl: (path: string) =>
    `https://example.supabase.co/storage/v1/object/public/property-images/${path}`,
}))

const baseProperty: PropertyWithImages = {
  id: 'prop-1',
  title: 'Casa 3 quartos',
  description: 'Descricao do imovel',
  price: 350000,
  property_type: 'casa',
  condition: 'novo',
  bedrooms: 3,
  bathrooms: 2,
  parking_spaces: 1,
  area: 120,
  address: 'Rua Teste 123',
  neighborhood: 'Centro',
  city: 'Goiania',
  state: 'GO',
  latitude: -16.686,
  longitude: -49.264,
  status: 'disponivel',
  featured: false,
  updated_at: '2026-01-01T00:00:00Z',
  created_at: '2026-01-01T00:00:00Z',
  property_images: [
    { id: 'img-1', storage_path: 'prop-1/photo1.jpg', is_cover: true, position: 0 },
    { id: 'img-2', storage_path: 'prop-1/photo2.jpg', is_cover: false, position: 1 },
  ],
}

const siteUrl = 'https://jander.com.br'

describe('JSON-LD structured data', () => {
  it('buildPropertyJsonLd returns RealEstateListing schema', () => {
    const result = buildPropertyJsonLd(baseProperty, siteUrl)
    expect(result['@context']).toBe('https://schema.org')
    expect(result['@type']).toBe('RealEstateListing')
    expect(result.name).toBe('Casa 3 quartos')
    expect(result.url).toBe('https://jander.com.br/imoveis/prop-1')
  })

  it('price is raw number string, not formatted currency', () => {
    const result = buildPropertyJsonLd(baseProperty, siteUrl)
    expect(result.offers.price).toBe('350000')
    expect(result.offers.price).not.toContain('R$')
    expect(result.offers.price).not.toContain('.')
    expect(result.offers.priceCurrency).toBe('BRL')
  })

  it('image URLs are absolute', () => {
    const result = buildPropertyJsonLd(baseProperty, siteUrl)
    expect(result.image).toHaveLength(2)
    expect(result.image[0]).toMatch(/^https:\/\//)
    expect(result.image[1]).toMatch(/^https:\/\//)
  })

  it('address fields map correctly', () => {
    const result = buildPropertyJsonLd(baseProperty, siteUrl)
    expect(result.address).toEqual({
      '@type': 'PostalAddress',
      streetAddress: 'Rua Teste 123',
      addressLocality: 'Centro',
      addressRegion: 'GO',
      addressCountry: 'BR',
    })
  })

  it('optional fields are omitted when null', () => {
    const minimal: PropertyWithImages = {
      ...baseProperty,
      description: null,
      price: null,
      bedrooms: null,
      bathrooms: null,
      area: null,
      address: null,
      neighborhood: null,
      city: null,
      state: null,
      latitude: null,
      longitude: null,
      property_images: [],
    }
    const result = buildPropertyJsonLd(minimal, siteUrl)
    const serialized = JSON.parse(JSON.stringify(result))

    expect(serialized.description).toBeUndefined()
    expect(serialized.offers.price).toBeUndefined()
    expect(serialized.numberOfRooms).toBeUndefined()
    expect(serialized.numberOfBathroomsTotal).toBeUndefined()
    expect(serialized.floorSize).toBeUndefined()
    expect(serialized.geo).toBeUndefined()
    expect(serialized.address.streetAddress).toBeUndefined()
  })

  it('geo coordinates included when available', () => {
    const result = buildPropertyJsonLd(baseProperty, siteUrl)
    expect(result.geo).toEqual({
      '@type': 'GeoCoordinates',
      latitude: -16.686,
      longitude: -49.264,
    })
  })

  it('floorSize uses QuantitativeValue with MTK unit', () => {
    const result = buildPropertyJsonLd(baseProperty, siteUrl)
    expect(result.floorSize).toEqual({
      '@type': 'QuantitativeValue',
      value: '120',
      unitCode: 'MTK',
    })
  })
})
