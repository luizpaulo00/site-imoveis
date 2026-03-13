// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock next/navigation
const mockRedirect = vi.fn()
vi.mock('next/navigation', () => ({
  redirect: (url: string) => {
    mockRedirect(url)
    throw new Error(`NEXT_REDIRECT:${url}`)
  },
}))

// Mock Supabase server client
const mockSignInWithPassword = vi.fn()
const mockSignOut = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      signInWithPassword: (...args: unknown[]) => mockSignInWithPassword(...args),
      signOut: () => mockSignOut(),
    },
  }),
}))

// Import after mocks
import { signIn, signOut } from '@/actions/auth'

describe('Auth Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('signIn', () => {
    it('calls signInWithPassword with valid credentials', async () => {
      mockSignInWithPassword.mockResolvedValue({ error: null })

      const formData = new FormData()
      formData.append('email', 'admin@example.com')
      formData.append('password', 'password123')

      try {
        await signIn(formData)
      } catch {
        // redirect throws
      }

      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: 'admin@example.com',
        password: 'password123',
      })
    })

    it('redirects to /admin/imoveis on successful login', async () => {
      mockSignInWithPassword.mockResolvedValue({ error: null })

      const formData = new FormData()
      formData.append('email', 'admin@example.com')
      formData.append('password', 'password123')

      try {
        await signIn(formData)
      } catch {
        // redirect throws
      }

      expect(mockRedirect).toHaveBeenCalledWith('/admin/imoveis')
    })

    it('returns error message on invalid credentials', async () => {
      mockSignInWithPassword.mockResolvedValue({
        error: { message: 'Invalid login credentials' },
      })

      const formData = new FormData()
      formData.append('email', 'admin@example.com')
      formData.append('password', 'wrongpassword')

      const result = await signIn(formData)

      expect(result).toEqual({ error: 'Email ou senha incorretos' })
      expect(mockRedirect).not.toHaveBeenCalled()
    })

    it('returns error message when email is invalid format', async () => {
      const formData = new FormData()
      formData.append('email', 'not-an-email')
      formData.append('password', 'password123')

      const result = await signIn(formData)

      expect(result).toEqual({ error: 'Email ou senha incorretos' })
      expect(mockSignInWithPassword).not.toHaveBeenCalled()
    })

    it('returns error message when password is too short', async () => {
      const formData = new FormData()
      formData.append('email', 'admin@example.com')
      formData.append('password', '12345')

      const result = await signIn(formData)

      expect(result).toEqual({ error: 'Email ou senha incorretos' })
      expect(mockSignInWithPassword).not.toHaveBeenCalled()
    })
  })

  describe('signOut', () => {
    it('calls supabase.auth.signOut and redirects to /login', async () => {
      mockSignOut.mockResolvedValue({ error: null })

      try {
        await signOut()
      } catch {
        // redirect throws
      }

      expect(mockSignOut).toHaveBeenCalled()
      expect(mockRedirect).toHaveBeenCalledWith('/login')
    })
  })
})
