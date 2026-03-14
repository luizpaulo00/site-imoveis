import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockSelect = vi.fn()
const mockFrom = vi.fn(() => ({ select: mockSelect }))
const mockCreateClient = vi.fn(() => Promise.resolve({ from: mockFrom }))

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => mockCreateClient(),
}))

describe('sitemap generation', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://jander.com.br')
    mockSelect.mockResolvedValue({
      data: [
        { id: 'prop-1', updated_at: '2026-01-15T10:00:00Z' },
        { id: 'prop-2', updated_at: '2026-02-01T12:00:00Z' },
      ],
    })
  })

  it('sitemap includes home page entry', async () => {
    const { default: sitemap } = await import('@/app/sitemap')
    const entries = await sitemap()
    const home = entries.find((e) => e.url === 'https://jander.com.br')
    expect(home).toBeDefined()
    expect(home!.priority).toBe(1)
    expect(home!.changeFrequency).toBe('daily')
  })

  it('sitemap includes all property URLs', async () => {
    const { default: sitemap } = await import('@/app/sitemap')
    const entries = await sitemap()
    const propertyEntries = entries.filter((e) =>
      e.url.includes('/imoveis/')
    )
    expect(propertyEntries).toHaveLength(2)
  })

  it('all URLs are absolute with base URL prefix', async () => {
    const { default: sitemap } = await import('@/app/sitemap')
    const entries = await sitemap()
    for (const entry of entries) {
      expect(entry.url).toMatch(/^https:\/\/jander\.com\.br/)
    }
  })

  it('property entries use updated_at as lastModified', async () => {
    const { default: sitemap } = await import('@/app/sitemap')
    const entries = await sitemap()
    const prop1 = entries.find((e) => e.url.includes('prop-1'))
    expect(prop1!.lastModified).toEqual(new Date('2026-01-15T10:00:00Z'))
  })
})

describe('robots.txt generation', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://jander.com.br')
  })

  it('allows all user agents', async () => {
    const { default: robots } = await import('@/app/robots')
    const result = robots()
    expect(result.rules).toEqual({
      userAgent: '*',
      allow: '/',
    })
  })

  it('references sitemap URL', async () => {
    const { default: robots } = await import('@/app/robots')
    const result = robots()
    expect(result.sitemap).toBe('https://jander.com.br/sitemap.xml')
  })
})
