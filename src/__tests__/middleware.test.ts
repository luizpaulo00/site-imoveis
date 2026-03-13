/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock @supabase/ssr
const mockGetUser = vi.fn()
vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getUser: mockGetUser,
    },
  })),
}))

// Mock NextResponse and NextRequest
const mockRedirect = vi.fn()
const mockNextResponse = {
  next: vi.fn(() => ({
    cookies: { set: vi.fn() },
  })),
  redirect: mockRedirect,
}

vi.mock('next/server', () => ({
  NextResponse: mockNextResponse,
  NextRequest: vi.fn(),
}))

// Helper to create a mock request
function createMockRequest(pathname: string) {
  return {
    nextUrl: {
      pathname,
      clone: () => ({ pathname }),
    },
    cookies: {
      getAll: () => [],
      set: vi.fn(),
    },
  }
}

describe('middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockNextResponse.next.mockReturnValue({
      cookies: { set: vi.fn() },
    })
    mockRedirect.mockReturnValue({ type: 'redirect' })
  })

  it('redirects unauthenticated request to /admin/imoveis to /login', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const { middleware } = await import('@/middleware')
    const request = createMockRequest('/admin/imoveis')

    await middleware(request as any)

    expect(mockRedirect).toHaveBeenCalled()
    const redirectUrl = mockRedirect.mock.calls[0][0]
    expect(redirectUrl.pathname).toBe('/login')
  })

  it('allows authenticated request to /admin/imoveis to pass through', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-123', email: 'admin@test.com' } },
    })

    const { middleware } = await import('@/middleware')
    const request = createMockRequest('/admin/imoveis')

    const response = await middleware(request as any)

    expect(mockRedirect).not.toHaveBeenCalled()
    expect(response).toBeDefined()
  })

  it('redirects authenticated request to /login to /admin/imoveis', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-123', email: 'admin@test.com' } },
    })

    const { middleware } = await import('@/middleware')
    const request = createMockRequest('/login')

    await middleware(request as any)

    expect(mockRedirect).toHaveBeenCalled()
    const redirectUrl = mockRedirect.mock.calls[0][0]
    expect(redirectUrl.pathname).toBe('/admin/imoveis')
  })
})
