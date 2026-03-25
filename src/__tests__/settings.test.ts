// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { formatPhone } from '@/lib/utils/phone'

// Mock Supabase server client
const mockSelect = vi.fn()
const mockSingle = vi.fn()
const mockUpdate = vi.fn()
const mockInsert = vi.fn()
const mockEq = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'test-user' } },
        error: null,
      }),
    },
    from: (table: string) => {
      if (table === 'site_settings') {
        return {
          select: (...args: unknown[]) => {
            mockSelect(...args)
            return {
              single: () => mockSingle(),
              limit: () => ({ single: () => mockSingle() }),
            }
          },
          update: (data: unknown) => {
            mockUpdate(data)
            return { eq: (...args: unknown[]) => mockEq(...args) }
          },
          insert: (data: unknown) => mockInsert(data),
        }
      }
      return {}
    },
  }),
}))

// Import after mocks
import { loadSettings, saveSettings } from '@/actions/settings'

describe('Settings Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('loadSettings', () => {
    it('returns current settings from database', async () => {
      mockSingle.mockResolvedValue({
        data: {
          whatsapp: '(61) 99999-9999',
          site_name: 'Jander Imoveis',
          broker_name: 'Jander Silva',
        },
        error: null,
      })

      const result = await loadSettings()

      expect(result).toEqual({
        whatsapp: '(61) 99999-9999',
        site_name: 'Jander Imoveis',
        broker_name: 'Jander Silva',
      })
      expect(mockSelect).toHaveBeenCalledWith('whatsapp, site_name, broker_name')
    })

    it('returns defaults when no data exists', async () => {
      mockSingle.mockResolvedValue({ data: null, error: { message: 'Not found' } })

      const result = await loadSettings()

      expect(result).toEqual({
        whatsapp: '',
        site_name: '',
        broker_name: '',
      })
    })
  })

  describe('saveSettings', () => {
    it('updates existing settings row', async () => {
      // First call: select('id').limit(1).single() returns existing row
      mockSingle
        .mockResolvedValueOnce({ data: { id: 'settings-1' }, error: null })
      mockEq.mockResolvedValue({ error: null })

      const data = {
        whatsapp: '(61) 99999-9999',
        site_name: 'Jander Imoveis',
        broker_name: 'Jander Silva',
      }

      const result = await saveSettings(data)

      expect(result).toEqual({ success: true })
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          whatsapp: '(61) 99999-9999',
          site_name: 'Jander Imoveis',
          broker_name: 'Jander Silva',
          updated_at: expect.any(String),
        })
      )
    })

    it('returns validation error with invalid WhatsApp format', async () => {
      const data = {
        whatsapp: '61999999999', // no mask
        site_name: 'Jander Imoveis',
        broker_name: 'Jander Silva',
      }

      const result = await saveSettings(data)

      expect(result).toEqual({ error: 'Dados invalidos. Verifique os campos.' })
      expect(mockUpdate).not.toHaveBeenCalled()
    })

    it('returns error when Supabase update fails', async () => {
      mockSingle
        .mockResolvedValueOnce({ data: { id: 'settings-1' }, error: null })
      mockEq.mockResolvedValue({ error: { message: 'DB error' } })

      const data = {
        whatsapp: '(61) 99999-9999',
        site_name: 'Jander Imoveis',
        broker_name: 'Jander Silva',
      }

      const result = await saveSettings(data)

      expect(result).toEqual({ error: 'Erro ao salvar configuracoes' })
    })
  })
})

describe('Phone formatting', () => {
  it('formats raw digits to Brazilian phone mask', () => {
    expect(formatPhone('61999999999')).toBe('(61) 99999-9999')
  })

  it('formats partial input progressively', () => {
    expect(formatPhone('6')).toBe('(6')
    expect(formatPhone('61')).toBe('(61')
    expect(formatPhone('619')).toBe('(61) 9')
    expect(formatPhone('6199999')).toBe('(61) 99999')
    expect(formatPhone('61999991234')).toBe('(61) 99999-1234')
  })

  it('strips non-digit characters before formatting', () => {
    expect(formatPhone('(61) 999-99')).toBe('(61) 99999')
    expect(formatPhone('abc61def99999ghi9999')).toBe('(61) 99999-9999')
  })

  it('returns empty string for empty input', () => {
    expect(formatPhone('')).toBe('')
  })

  it('truncates to 11 digits max', () => {
    expect(formatPhone('619999999991234')).toBe('(61) 99999-9999')
  })
})
