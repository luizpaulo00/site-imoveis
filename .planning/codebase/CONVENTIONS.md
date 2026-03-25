# Coding Conventions

**Analysis Date:** 2026-03-25

## Naming Patterns

**Files:**
- React components: kebab-case matching the exported component name (`property-card.tsx`, `property-form.tsx`)
- Hook files: `use-{name}.ts` (e.g., `use-mobile.ts`, `use-image-upload.ts`)
- Utility files: kebab-case noun or verb-noun (`currency.ts`, `image-url.ts`, `whatsapp.ts`)
- Next.js App Router conventions: `page.tsx`, `layout.tsx`, `loading.tsx`, `sitemap.ts`, `robots.ts`
- Test files: `{subject}.test.ts` inside `src/__tests__/`
- E2E spec files: `{subject}.spec.ts` inside `e2e/`

**Functions and Components:**
- React components: PascalCase named exports (`PropertyCard`, `PropertyForm`, `AdminTopbar`)
- Utility functions: camelCase named exports (`formatCurrency`, `getImageUrl`, `buildPropertyJsonLd`)
- Server actions: camelCase async named exports (`createProperty`, `updateProperty`, `deleteProperty`)
- Hooks: camelCase prefixed with `use` (`useIsMobile`, `useImageUpload`)
- Next.js page components: default export PascalCase (`HomePage`, `AdminLayout`)
- Event handlers: `handle{Event}` pattern (`handleLocationChange`, `handleSubmit`)

**Variables:**
- camelCase throughout (`isSoldOrReserved`, `propertyId`, `mockRedirect`)
- Database column names remain snake_case when used directly (`storage_path`, `is_cover`, `created_at`)
- Boolean variables use `is`/`has` prefix (`isMobile`, `isEdit`, `isSoldOrReserved`)

**Types and Interfaces:**
- Interfaces: PascalCase with `Props` suffix for component props (`PropertyCardProps`, `PropertyFormProps`)
- Exported types: PascalCase (`PropertyFormData`, `PublicProperty`, `PropertyWithImages`)
- Zod schemas: camelCase with `Schema` suffix (`propertySchema`, `settingsSchema`, `uuidSchema`)
- Type exports from Zod: `z.infer<typeof schema>` aliased to a named type

**Directories:**
- Lowercase, kebab-case: `image-manager/`, `skeletons/`
- Next.js route groups with parentheses: `(auth)/`, `(public)/`
- Feature-scoped under `admin/` or `public/`

## Code Style

**Formatting:**
- No Prettier config detected; uses ESLint with Next.js defaults
- Single quotes for string literals in `.ts`/`.tsx` files (consistent across codebase)
- Double quotes in some component files (`.tsx`) — not strictly enforced
- 2-space indentation throughout

**Linting:**
- ESLint flat config at `eslint.config.mjs`
- Extends `next/core-web-vitals` and `next/typescript`
- `@typescript-eslint/no-explicit-any` rule active; suppressed with inline comment when needed
- `// eslint-disable-next-line` used sparingly, with rule name always specified

## Import Organization

**Order (observed pattern):**
1. Next.js and React core imports (`next/link`, `next/image`, `react`)
2. Third-party libraries (`lucide-react`, `sonner`, `react-hook-form`)
3. Internal `@/components/...` imports
4. Internal `@/lib/...` imports (utils, queries, validations)
5. Internal `@/actions/...` imports
6. Relative imports (`./tilt-card`)
7. Type-only imports last when co-located (`type { PublicProperty }`)

**Path Aliases:**
- `@/` maps to `./src/` (configured in `tsconfig.json` and `vitest.config.ts`)
- All internal imports use `@/` — no relative `../` traversal across feature boundaries

## Directive Usage

**Server / Client boundaries:**
- `'use server'` at top of all action files (`src/actions/*.ts`)
- `'use client'` at top of client components (`property-form.tsx`, `property-listing.tsx`)
- Server components (pages, layouts) have no directive — default in App Router

## Error Handling

**Server Actions pattern:**
- Return discriminated union: `{ success: true; id?: string } | { error: string }`
- Always validate input with Zod `safeParse` before any DB call
- Auth check inside every mutating action before DB operation:
  ```typescript
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: 'Nao autorizado' }
  ```
- Database errors logged with `console.error()` then re-surfaced as user-facing Portuguese string
- Queries (read-only) return empty array or null on error — never throw

**Client-side error display:**
- `toast.error(result.error)` from `sonner` for action failures
- `toast.success(...)` for successful mutations
- React Hook Form `formState.errors` for inline field validation messages
- Zod errors surfaced via `zodResolver` — no manual field error wiring

**Null handling:**
- Optional/nullable fields use `?? 0` or `?? ''` for safe defaults
- Nullish coalescing preferred over `||` for optional values
- UI guards with `{value != null && value > 0 && (...)}` for conditional rendering

## Logging

**Framework:** `console.error()` — no structured logging library

**Pattern:**
- Only used in server actions on DB error path
- Format: `console.error('Supabase {Operation} Error:', error?.message)`
- No debug/info/warn logging present

## Comments

**When to Comment:**
- Security-critical logic is always commented: `// IMPORTANT: use getUser() not getSession() for security`
- Inline comments for non-obvious UI sections using JSX comments: `{/* Hero section */}`
- TODOs/stubs marked with `it.todo(...)` in test files — not `// TODO` in source

**JSDoc/TSDoc:**
- Not used anywhere in the codebase — no JSDoc annotations on exported functions

## Function Design

**Size:** Functions are small and single-purpose; server actions average 20-30 lines including validation, auth check, and DB call

**Parameters:** Server action mutators take typed data params; queries take optional filter strings

**Return Values:**
- Async server actions always return a typed result object, never `void`
- Utility functions return primitives or strings; never throw for expected null/undefined inputs
- React components always return JSX

## Component Design

**Exports:** Named exports for all components — no default exports except Next.js page/layout files

**Props interface:** Always defined inline above the component:
```typescript
interface PropertyCardProps {
  property: PublicProperty
}

export function PropertyCard({ property }: PropertyCardProps) {
```

**Barrel files:** Not used — all imports reference the exact file path

## Module Design

**Exports:** Named exports exclusively (except Next.js-required defaults)

**No barrel files:** Each module exports from its own file directly
