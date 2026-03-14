import { describe, it, expect } from 'vitest'
import { formatCurrency } from '@/lib/utils/currency'

describe('formatCurrency', () => {
  it('formats whole number with R$ and Brazilian formatting', () => {
    expect(formatCurrency(350000)).toBe('R$ 350.000')
  })

  it('returns "-" for null', () => {
    expect(formatCurrency(null)).toBe('-')
  })

  it('returns "-" for undefined', () => {
    expect(formatCurrency(undefined)).toBe('-')
  })

  it('rounds decimal values and shows no cents', () => {
    expect(formatCurrency(1500.50)).toBe('R$ 1.501')
  })

  it('formats small values correctly', () => {
    expect(formatCurrency(100)).toBe('R$ 100')
  })

  it('formats zero correctly', () => {
    expect(formatCurrency(0)).toBe('R$ 0')
  })
})
