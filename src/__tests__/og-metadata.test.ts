import { describe, it, expect } from 'vitest'
import { formatWhatsAppUrl } from '@/lib/utils/whatsapp'
import { formatOGDescription } from '@/lib/utils/og'
import { getOGImageUrl } from '@/lib/utils/image-url'

describe('formatWhatsAppUrl', () => {
  it('formats URL with country code prepended', () => {
    const url = formatWhatsAppUrl('11999887766', 'Oi!')
    expect(url).toContain('https://wa.me/5511999887766?text=')
    expect(url).toContain('Oi')
  })

  it('does not double-prefix country code', () => {
    const url = formatWhatsAppUrl('5511999887766', 'Oi!')
    expect(url).toContain('https://wa.me/5511999887766?text=')
    expect(url).toContain('Oi')
  })

  it('strips non-digit characters from phone', () => {
    const url = formatWhatsAppUrl('(11) 99988-7766', 'Oi!')
    expect(url).toContain('https://wa.me/5511999887766?text=')
    expect(url).toContain('Oi')
  })

  it('encodes special characters in message', () => {
    const msg = 'Olá! Tenho interesse no imóvel'
    const url = formatWhatsAppUrl('11999887766', msg)
    expect(url).toContain('text=')
    expect(url).toContain(encodeURIComponent(msg))
  })
})

describe('formatOGDescription', () => {
  it('returns pipe-separated specs with all fields', () => {
    const result = formatOGDescription({
      price: 500000,
      bedrooms: 3,
      bathrooms: 2,
      area: 120,
      neighborhood: 'Centro',
    })
    expect(result).toBe('R$ 500.000 | 3 quartos | 2 banheiros | 120m² | Centro')
  })

  it('omits price when null', () => {
    const result = formatOGDescription({
      price: null,
      bedrooms: 2,
      bathrooms: 1,
      area: 80,
      neighborhood: 'Jardim',
    })
    expect(result).not.toContain('R$')
    expect(result).toBe('2 quartos | 1 banheiros | 80m² | Jardim')
  })

  it('returns empty string when all fields null', () => {
    const result = formatOGDescription({
      price: null,
      bedrooms: null,
      bathrooms: null,
      area: null,
      neighborhood: null,
    })
    expect(result).toBe('')
  })
})

describe('getOGImageUrl', () => {
  it('includes ?v= cache-busting parameter from updated_at', () => {
    const updatedAt = '2025-06-15T10:30:00Z'
    const url = getOGImageUrl('prop-123', updatedAt)
    const timestamp = new Date(updatedAt).getTime()
    expect(url).toContain(`?v=${timestamp}`)
    expect(url).toContain('prop-123/og-cover.jpg')
  })
})
