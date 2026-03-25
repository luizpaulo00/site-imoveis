import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock next/cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

// Mock Supabase server client
const mockInsert = vi.fn()
const mockUpdate = vi.fn()
const mockDelete = vi.fn()
const mockSelect = vi.fn()
const mockEq = vi.fn()
const mockOrder = vi.fn()
const mockSingle = vi.fn()

// Build a chainable query mock
// For listProperties: select -> eq -> order (order is terminal, awaited)
// For update/delete: update/delete -> eq (eq is terminal, awaited)
// For getProperty: select -> eq -> single (single is terminal, awaited)
// We use a dual-purpose eq: it tracks the call AND returns something awaitable
// mockEq doubles as both tracker and resolver
function chainable() {
  const chain: Record<string, (...args: unknown[]) => unknown> = {
    eq: (...args: unknown[]) => {
      mockEq(...args)
      // Return an object that is both thenable (for terminal await) and chainable
      const result = mockEq(...args)
      // If mockEq has a resolved value set, it returns a promise — use that
      // Otherwise return chain for further chaining
      if (result && typeof result === 'object' && 'then' in result) {
        // Terminal: return the promise but also attach chain methods
        return Object.assign(result, { single: () => mockSingle(), order: (...oArgs: unknown[]) => mockOrder(...oArgs) })
      }
      return chain
    },
    order: (...args: unknown[]) => mockOrder(...args),
    single: () => mockSingle(),
    select: (...args: unknown[]) => { mockSelect(...args); return chain },
  }
  return chain
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'test-user' } },
        error: null,
      }),
    },
    from: (table: string) => {
      if (table === 'properties') {
        return {
          insert: (data: unknown) => {
            mockInsert(data)
            return { select: () => ({ single: () => mockSingle() }) }
          },
          update: (data: unknown) => {
            mockUpdate(data)
            return chainable()
          },
          delete: () => {
            mockDelete()
            return chainable()
          },
          select: (...args: unknown[]) => {
            mockSelect(...args)
            return chainable()
          },
        }
      }
      return {}
    },
  }),
}))

import { revalidatePath } from 'next/cache'
import {
  createProperty,
  updateProperty,
  deleteProperty,
  listProperties,
  getProperty,
} from '@/actions/properties'

describe('Property Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const validPropertyData = {
    title: 'Casa no Lago Sul',
    property_type: 'casa' as const,
    status: 'disponivel' as const,
    description: 'Bela casa',
    price: 500000,
    bedrooms: 3,
    bathrooms: 2,
    parking_spaces: 2,
    area: 200,
    address: 'SHIS QI 15',
    neighborhood: 'Lago Sul',
    city: 'Brasilia',
    state: 'DF',
    latitude: -15.78,
    longitude: -47.93,
    condition: 'novo' as const,
    featured: false,
  }

  describe('createProperty', () => {
    it('creates property with valid data and returns success with id', async () => {
      mockSingle.mockResolvedValue({
        data: { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' },
        error: null,
      })

      const result = await createProperty(validPropertyData)

      expect(result).toEqual({ success: true, id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
      expect(mockInsert).toHaveBeenCalled()
      expect(revalidatePath).toHaveBeenCalledWith('/admin/imoveis')
    })

    it('returns error with invalid data', async () => {
      const result = await createProperty({ title: '' } as typeof validPropertyData)

      expect(result).toEqual({ error: 'Dados invalidos' })
      expect(mockInsert).not.toHaveBeenCalled()
    })

    it('returns error when Supabase insert fails', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { message: 'DB error' },
      })

      const result = await createProperty(validPropertyData)

      expect(result).toHaveProperty('error')
    })
  })

  describe('updateProperty', () => {
    it('updates property with valid data and returns success', async () => {
      mockEq.mockResolvedValue({ error: null })

      const result = await updateProperty('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', validPropertyData)

      expect(result).toEqual({ success: true })
      expect(mockUpdate).toHaveBeenCalled()
      expect(mockEq).toHaveBeenCalledWith('id', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')
      expect(revalidatePath).toHaveBeenCalledWith('/admin/imoveis')
    })

    it('returns error with invalid data', async () => {
      const result = await updateProperty('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', { title: '' } as typeof validPropertyData)

      expect(result).toEqual({ error: 'Dados invalidos' })
      expect(mockUpdate).not.toHaveBeenCalled()
    })

    it('returns error when Supabase update fails', async () => {
      mockEq.mockResolvedValue({ error: { message: 'DB error' } })

      const result = await updateProperty('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', validPropertyData)

      expect(result).toHaveProperty('error')
    })
  })

  describe('deleteProperty', () => {
    it('deletes property and returns success', async () => {
      mockEq.mockResolvedValue({ error: null })

      const result = await deleteProperty('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')

      expect(result).toEqual({ success: true })
      expect(mockDelete).toHaveBeenCalled()
      expect(mockEq).toHaveBeenCalledWith('id', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')
      expect(revalidatePath).toHaveBeenCalledWith('/admin/imoveis')
    })

    it('returns error when Supabase delete fails', async () => {
      mockEq.mockResolvedValue({ error: { message: 'DB error' } })

      const result = await deleteProperty('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')

      expect(result).toHaveProperty('error')
    })
  })

  describe('listProperties', () => {
    it('returns properties sorted by created_at DESC', async () => {
      const properties = [
        { id: '1', title: 'Casa 1', property_images: [{ count: 0 }] },
        { id: '2', title: 'Casa 2', property_images: [{ count: 3 }] },
      ]
      mockOrder.mockResolvedValue({ data: properties, error: null })

      const result = await listProperties()

      expect(result).toEqual([
        { id: '1', title: 'Casa 1', image_count: 0 },
        { id: '2', title: 'Casa 2', image_count: 3 },
      ])
      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false })
    })

    it('filters by status when provided', async () => {
      mockOrder.mockResolvedValue({ data: [], error: null })

      await listProperties('disponivel')

      expect(mockEq).toHaveBeenCalledWith('status', 'disponivel')
    })

    it('returns empty array on error', async () => {
      mockOrder.mockResolvedValue({ data: null, error: { message: 'error' } })

      const result = await listProperties()

      expect(result).toEqual([])
    })
  })

  describe('getProperty', () => {
    it('returns single property by id', async () => {
      const property = { ...validPropertyData, id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' }
      mockSingle.mockResolvedValue({ data: property, error: null })

      const result = await getProperty('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')

      expect(result).toEqual(property)
      expect(mockEq).toHaveBeenCalledWith('id', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')
    })

    it('returns null when property not found', async () => {
      mockSingle.mockResolvedValue({ data: null, error: { message: 'not found' } })

      const result = await getProperty('nonexistent')

      expect(result).toBeNull()
    })
  })
})
