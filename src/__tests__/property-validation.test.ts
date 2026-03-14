import { describe, it, expect } from 'vitest'
import { propertySchema } from '@/lib/validations/property'

describe('propertySchema', () => {
  const validData = {
    title: 'Casa no Lago Sul',
    property_type: 'casa',
    status: 'disponivel',
  }

  describe('title', () => {
    it('requires title with min 1 char', () => {
      const result = propertySchema.safeParse({ ...validData, title: '' })
      expect(result.success).toBe(false)
    })

    it('rejects title over 200 chars', () => {
      const result = propertySchema.safeParse({ ...validData, title: 'a'.repeat(201) })
      expect(result.success).toBe(false)
    })

    it('accepts valid title', () => {
      const result = propertySchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })

  describe('property_type', () => {
    it('validates property_type as enum casa/apartamento', () => {
      const result = propertySchema.safeParse({ ...validData, property_type: 'terreno' })
      expect(result.success).toBe(false)
    })

    it('accepts casa', () => {
      const result = propertySchema.safeParse({ ...validData, property_type: 'casa' })
      expect(result.success).toBe(true)
    })

    it('accepts apartamento', () => {
      const result = propertySchema.safeParse({ ...validData, property_type: 'apartamento' })
      expect(result.success).toBe(true)
    })
  })

  describe('status', () => {
    it('validates status enum', () => {
      const result = propertySchema.safeParse({ ...validData, status: 'invalid' })
      expect(result.success).toBe(false)
    })

    it('defaults to disponivel', () => {
      const { status, ...noStatus } = validData
      const result = propertySchema.safeParse(noStatus)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.status).toBe('disponivel')
      }
    })
  })

  describe('condition', () => {
    it('validates condition as enum novo/usado', () => {
      const result = propertySchema.safeParse({ ...validData, condition: 'reformado' })
      expect(result.success).toBe(false)
    })

    it('accepts novo', () => {
      const result = propertySchema.safeParse({ ...validData, condition: 'novo' })
      expect(result.success).toBe(true)
    })

    it('accepts usado', () => {
      const result = propertySchema.safeParse({ ...validData, condition: 'usado' })
      expect(result.success).toBe(true)
    })

    it('is optional', () => {
      const result = propertySchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })

  describe('price', () => {
    it('coerces price to number', () => {
      const result = propertySchema.safeParse({ ...validData, price: '350000' })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.price).toBe(350000)
      }
    })

    it('rejects negative price', () => {
      const result = propertySchema.safeParse({ ...validData, price: -100 })
      expect(result.success).toBe(false)
    })

    it('is optional', () => {
      const result = propertySchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })

  describe('latitude and longitude', () => {
    it('validates latitude range -90 to 90', () => {
      const result = propertySchema.safeParse({ ...validData, latitude: 91 })
      expect(result.success).toBe(false)
    })

    it('validates longitude range -180 to 180', () => {
      const result = propertySchema.safeParse({ ...validData, longitude: 181 })
      expect(result.success).toBe(false)
    })

    it('accepts valid coordinates', () => {
      const result = propertySchema.safeParse({ ...validData, latitude: -15.7801, longitude: -47.9292 })
      expect(result.success).toBe(true)
    })

    it('latitude and longitude are optional/nullable', () => {
      const result = propertySchema.safeParse({ ...validData, latitude: null, longitude: null })
      expect(result.success).toBe(true)
    })
  })

  describe('numeric fields', () => {
    it('validates bedrooms as int 0-20', () => {
      const result = propertySchema.safeParse({ ...validData, bedrooms: 21 })
      expect(result.success).toBe(false)
    })

    it('validates bathrooms as int 0-20', () => {
      const result = propertySchema.safeParse({ ...validData, bathrooms: -1 })
      expect(result.success).toBe(false)
    })

    it('validates parking_spaces as int 0-20', () => {
      const result = propertySchema.safeParse({ ...validData, parking_spaces: 21 })
      expect(result.success).toBe(false)
    })

    it('validates area as positive number', () => {
      const result = propertySchema.safeParse({ ...validData, area: -10 })
      expect(result.success).toBe(false)
    })

    it('all numeric fields are optional', () => {
      const result = propertySchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })

  describe('featured', () => {
    it('defaults to false', () => {
      const result = propertySchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.featured).toBe(false)
      }
    })
  })
})
