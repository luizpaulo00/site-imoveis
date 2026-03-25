# Testing Patterns

**Analysis Date:** 2026-03-25

## Test Framework

**Unit/Integration Runner:**
- Vitest 4.x
- Config: `vitest.config.ts`
- Environment: `jsdom` (browser-like DOM simulation)
- Globals mode: enabled (no need to import `describe`, `it`, `expect` in test files — though imports are explicit anyway)

**Assertion Library:**
- Vitest built-in (compatible with Jest API)
- `@testing-library/react` installed but not yet used in tests

**E2E Runner:**
- Playwright 1.58.x
- Config: `playwright.config.ts`
- Browser: Chromium only (`Desktop Chrome`)
- Base URL: `http://localhost:3000`
- Web server: auto-starts with `npm run dev` unless already running

**Run Commands:**
```bash
npm test                    # Run all Vitest unit/integration tests (non-watch)
npx vitest                  # Run in watch mode
npx vitest run --coverage   # Coverage (no threshold configured)
npm run test:e2e            # Run Playwright E2E tests
npm run test:e2e:ui         # Open Playwright UI mode
```

## Test File Organization

**Unit/integration tests:**
- Location: `src/__tests__/` (centralized, not co-located with source)
- Naming: `{subject}.test.ts` (e.g., `currency.test.ts`, `auth.test.ts`, `properties.test.ts`)
- All test files use `.ts` extension even when testing components (no `.tsx` tests yet)

**E2E tests:**
- Primary location: `e2e/` (project root)
- Secondary location: `tests/e2e/` (used for in-progress/skipped specs)
- Naming: `{subject}.spec.ts` (e.g., `full-flow.spec.ts`, `home.spec.ts`)
- Fixtures: `e2e/fixtures/` for test images

**Structure:**
```
src/__tests__/          # Unit + integration tests
  auth.test.ts
  currency.test.ts
  image-loading.test.ts
  json-ld.test.ts
  middleware.test.ts
  og-metadata.test.ts
  properties.test.ts
  property-validation.test.ts
  rls.test.ts
  settings.test.ts
  sitemap.test.ts
  skeletons.test.ts
  validations.test.ts

e2e/                    # Playwright E2E specs (active)
  full-flow.spec.ts     # Full admin + public CRUD flow
  home.spec.ts          # Smoke test

tests/e2e/              # Playwright E2E (incomplete/skipped)
  seo.spec.ts

e2e/fixtures/           # Test assets
  test-image-1.png
  test-image-2.png
  test-image-3.png
```

## Test Structure

**Suite Organization:**
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mocks declared BEFORE imports of the modules under test
vi.mock('@/lib/supabase/server', () => ({ ... }))

// Import after mocks to capture mock setup
import { createProperty } from '@/actions/properties'

describe('Property Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()  // always clear between tests
  })

  const validPropertyData = { ... }  // shared fixture at describe level

  describe('createProperty', () => {
    it('creates property with valid data and returns success with id', async () => {
      // arrange: set mock return value
      mockSingle.mockResolvedValue({ data: { id: 'uuid-123' }, error: null })

      // act
      const result = await createProperty(validPropertyData)

      // assert
      expect(result).toEqual({ success: true, id: 'uuid-123' })
      expect(mockInsert).toHaveBeenCalled()
    })
  })
})
```

**Patterns:**
- `beforeEach(() => vi.clearAllMocks())` in every top-level describe block
- Shared fixture object declared at describe scope (`validPropertyData`, `baseProperty`)
- Nested `describe` blocks for grouping by function/method being tested
- Test names describe the expected outcome, not the implementation

## Mocking

**Framework:** Vitest `vi.mock()` and `vi.fn()`

**Mocks are declared before the import of the module under test:**
```typescript
// 1. Declare mock functions
const mockInsert = vi.fn()

// 2. Mock the dependency module
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    from: (table: string) => ({
      insert: (data: unknown) => { mockInsert(data); return { select: () => ({ single: () => mockSingle() }) } },
    }),
  }),
}))

// 3. Import the module under test AFTER mocks
import { createProperty } from '@/actions/properties'
```

**Dynamic module import for re-mocking:**
```typescript
// Used for modules that can't be statically mocked (e.g., middleware)
const { middleware } = await import('@/middleware')
```

**Mocking Next.js `redirect` (throws by design):**
```typescript
vi.mock('next/navigation', () => ({
  redirect: (url: string) => {
    mockRedirect(url)
    throw new Error(`NEXT_REDIRECT:${url}`)  // redirect throws in Next.js — reproduce the behavior
  },
}))

// In test: catch the throw
try {
  await signIn(formData)
} catch {
  // redirect throws — expected, ignore
}
expect(mockRedirect).toHaveBeenCalledWith('/admin/imoveis')
```

**Supabase chainable query mocking:**
- Supabase queries chain methods (`.select().eq().single()`). Mock each step with `vi.fn()` and build a chainable return object.
- Terminal methods (`.single()`, `.order()`) are mocked with `.mockResolvedValue()` to resolve the promise.
- The `chainable()` helper function in `properties.test.ts` (`src/__tests__/properties.test.ts`) demonstrates the pattern for complex chain mocking.

**Environment variable mocking:**
```typescript
vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://jander.com.br')
```

**What to Mock:**
- All external I/O: `@/lib/supabase/server`, `@supabase/ssr`
- Next.js navigation: `next/navigation` (redirect), `next/server` (NextResponse, NextRequest)
- Next.js cache: `next/cache` (revalidatePath)
- Utility functions with side effects: `@/lib/utils/image-url` when testing data transformations

**What NOT to Mock:**
- Pure utility functions being tested directly (`formatCurrency`, `formatPhone`, `formatWhatsAppUrl`)
- Zod schemas being tested directly (`propertySchema.safeParse(...)`)
- File system reads in schema tests (`fs.readFileSync` reads actual `supabase/schema.sql`)

## Fixtures and Factories

**Test Data:**
```typescript
// Shared fixture object at describe scope
const validPropertyData = {
  title: 'Casa no Lago Sul',
  property_type: 'casa' as const,
  status: 'disponivel' as const,
  // ... all fields typed with `as const` for enum values
}

// Minimal override pattern for edge cases
const minimal: PropertyWithImages = {
  ...baseProperty,
  description: null,
  price: null,
  // only override what differs
}
```

**Location:**
- Fixtures are inline in test files — no shared factory module
- E2E image fixtures: `e2e/fixtures/test-image-{1,2,3}.png`

## Coverage

**Requirements:** No threshold configured — coverage is opt-in

**View Coverage:**
```bash
npx vitest run --coverage
```

## Test Types

**Unit Tests (`src/__tests__/*.test.ts`):**
- Scope: single function or schema in isolation
- Subject types covered:
  - Pure utility functions (`currency.ts`, `phone.ts`, `whatsapp.ts`, `og.ts`)
  - Zod schemas (`propertySchema`, `settingsSchema`)
  - Server actions with mocked Supabase (`auth.ts`, `properties.ts`, `settings.ts`)
  - Middleware with mocked Next.js APIs
  - Structured data builders (`buildPropertyJsonLd`)
  - Sitemap/robots generation
  - Database schema RLS (reads actual SQL file)
  - Placeholder/todo tests for future component tests (`skeletons.test.ts`, `image-loading.test.ts`)

**E2E Tests (`e2e/*.spec.ts`):**
- Scope: full browser flow against running dev server
- Coverage: login, admin CRUD (create/edit/delete property), photo upload, settings, public listing, property detail, logout
- Organized with `test.describe` groups numbered by feature area
- Serial mode for stateful admin flow: `test.describe.configure({ mode: 'serial' })`
- Helper functions extracted per spec file for reuse:
  ```typescript
  async function adminLogin(page: Page) { ... }
  async function expectToast(page: Page, text: string) { ... }
  async function selectOption(page: Page, triggerId: string, optionText: string) { ... }
  ```

**Component Tests:**
- `@testing-library/react` installed but no component tests exist yet
- `src/__tests__/skeletons.test.ts` and `src/__tests__/image-loading.test.ts` are placeholder suites with `it.todo()`

## Common Patterns

**Async Server Action Testing:**
```typescript
it('creates property and returns success', async () => {
  mockSingle.mockResolvedValue({ data: { id: 'uuid-123' }, error: null })

  const result = await createProperty(validPropertyData)

  expect(result).toEqual({ success: true, id: 'uuid-123' })
})
```

**Testing Error Paths:**
```typescript
it('returns error when Supabase insert fails', async () => {
  mockSingle.mockResolvedValue({ data: null, error: { message: 'DB error' } })

  const result = await createProperty(validPropertyData)

  expect(result).toHaveProperty('error')
})
```

**Testing Zod Validation Directly:**
```typescript
it('fails when field is empty', () => {
  const result = settingsSchema.safeParse({ ...validData, whatsapp: '' })
  expect(result.success).toBe(false)
  if (!result.success) {
    const err = result.error.issues.find((i) => i.path[0] === 'whatsapp')
    expect(err?.message).toBe('WhatsApp e obrigatorio')
  }
})
```

**Playwright Locator Patterns:**
```typescript
// Prefer semantic locators
page.getByLabel('Email')
page.getByRole('button', { name: 'Entrar' })
page.getByRole('tab', { name: /Disponivel/ })

// Data attributes for toast
page.locator('[data-sonner-toast]', { hasText: 'Imovel atualizado' })

// Row-scoped actions
const row = page.locator('tr', { hasText: TEST_PROPERTY_TITLE })
const editLink = row.locator("a[href*='/editar']")
```

**Playwright Navigation Assertions:**
```typescript
await page.waitForURL('**/admin/imoveis', { timeout: 15000 })
await expect(page).toHaveURL(/\/admin\/imoveis/)
```

## Playwright Configuration Notes

- `fullyParallel: false` — tests run sequentially within a file
- `workers: 1` — single worker globally; no test isolation issues from parallel state
- `retries: 2` in CI, `0` locally
- `timeout: 60000` per test; `actionTimeout: 15000` per action; `navigationTimeout: 60000`
- Screenshots and video captured only on failure
- Traces captured on first retry
