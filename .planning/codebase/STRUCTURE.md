# Codebase Structure

**Analysis Date:** 2026-03-25

## Directory Layout

```
site-imoveis/
├── src/
│   ├── app/                        # Next.js App Router — all routes live here
│   │   ├── (auth)/                 # Route group: unauthenticated-only pages
│   │   │   └── login/page.tsx
│   │   ├── (public)/               # Route group: public-facing site (ISR, Header/Footer)
│   │   │   ├── layout.tsx          # Shared public layout with Header, Footer, revalidate=60
│   │   │   ├── loading.tsx         # Suspense fallback for public root
│   │   │   ├── page.tsx            # Home page: hero + property listing
│   │   │   └── imoveis/[id]/       # Property detail route
│   │   │       ├── page.tsx        # generateMetadata + PropertyDetail
│   │   │       └── loading.tsx
│   │   ├── admin/                  # Protected dashboard (no route group parens)
│   │   │   ├── layout.tsx          # Server-side auth guard + Sidebar layout
│   │   │   ├── imoveis/
│   │   │   │   ├── page.tsx        # Property list
│   │   │   │   ├── novo/page.tsx   # Create new property
│   │   │   │   └── [id]/editar/page.tsx  # Edit existing property
│   │   │   └── configuracoes/page.tsx    # Site settings
│   │   ├── layout.tsx              # Root layout: global fonts, metadata, Toaster
│   │   ├── globals.css
│   │   ├── favicon.ico
│   │   ├── sitemap.ts              # Dynamic sitemap from Supabase
│   │   └── robots.ts
│   ├── actions/                    # Server Actions ('use server') — all mutations
│   │   ├── auth.ts                 # signIn, signOut
│   │   ├── images.ts               # uploadImage, deleteImage, reorderImages, setCoverImage, uploadOGImage
│   │   ├── properties.ts           # createProperty, updateProperty, deleteProperty, listProperties, getProperty
│   │   └── settings.ts             # updateSettings
│   ├── components/
│   │   ├── admin/                  # Admin dashboard components
│   │   │   ├── image-manager/      # Image upload/reorder feature (multiple files)
│   │   │   │   ├── image-manager.tsx
│   │   │   │   ├── image-dropzone.tsx
│   │   │   │   ├── image-grid.tsx
│   │   │   │   ├── image-thumbnail.tsx
│   │   │   │   ├── use-image-upload.ts  # Hook for upload queue logic
│   │   │   │   └── og-image.ts         # OG image generation/upload helper
│   │   │   ├── admin-topbar.tsx
│   │   │   ├── app-sidebar.tsx
│   │   │   ├── map-picker.tsx          # Dynamic-imported wrapper (SSR-safe)
│   │   │   ├── map-picker-inner.tsx    # Actual Leaflet map (client-only)
│   │   │   ├── property-form.tsx       # react-hook-form + zod + Server Actions
│   │   │   ├── property-list.tsx
│   │   │   ├── property-status-badge.tsx
│   │   │   └── settings-form.tsx
│   │   ├── public/                 # Public site components
│   │   │   ├── skeletons/          # Loading skeleton variants
│   │   │   │   ├── property-card-skeleton.tsx
│   │   │   │   ├── property-detail-skeleton.tsx
│   │   │   │   └── property-listing-skeleton.tsx
│   │   │   ├── animate-on-scroll.tsx
│   │   │   ├── cta-section.tsx
│   │   │   ├── differentials-section.tsx
│   │   │   ├── footer.tsx
│   │   │   ├── header.tsx
│   │   │   ├── property-card.tsx
│   │   │   ├── property-detail.tsx
│   │   │   ├── property-filters.tsx
│   │   │   ├── property-gallery.tsx
│   │   │   ├── property-listing.tsx
│   │   │   ├── property-map.tsx         # Dynamic-imported wrapper
│   │   │   ├── property-map-inner.tsx   # Leaflet map (client-only)
│   │   │   ├── share-button.tsx
│   │   │   ├── stats-section.tsx
│   │   │   ├── tilt-card.tsx
│   │   │   └── whatsapp-button.tsx
│   │   ├── ui/                     # shadcn/ui primitives (generated, do not hand-edit)
│   │   │   └── *.tsx               # button, card, input, select, sidebar, etc.
│   │   └── login-form.tsx
│   ├── hooks/
│   │   └── use-mobile.ts           # Breakpoint detection hook
│   ├── lib/
│   │   ├── queries/                # Read-only Supabase queries (server-side, React cache)
│   │   │   ├── properties.ts       # getPublicProperties — list with cover image
│   │   │   ├── property.ts         # getPropertyWithImages — single property with all images
│   │   │   └── settings.ts         # getPublicSettings — whatsapp, siteName, brokerName
│   │   ├── supabase/               # Supabase client factories
│   │   │   ├── server.ts           # createClient() — SSR, cookie-based
│   │   │   └── client.ts           # createClient() — browser
│   │   ├── utils/                  # Pure utility functions
│   │   │   ├── currency.ts         # formatCurrency (BRL)
│   │   │   ├── image-url.ts        # getImageUrl, getOGImageUrl
│   │   │   ├── og.ts               # formatOGDescription
│   │   │   ├── phone.ts            # Phone formatting
│   │   │   └── whatsapp.ts         # formatWhatsAppUrl
│   │   ├── validations/            # Zod schemas — shared client/server
│   │   │   ├── property.ts         # propertySchema + PropertyFormData type
│   │   │   ├── settings.ts         # settingsSchema
│   │   │   ├── image.ts            # imageFileSchema, MAX_IMAGES_PER_PROPERTY
│   │   │   └── uuid.ts             # uuidSchema
│   │   ├── structured-data.ts      # buildPropertyJsonLd — Schema.org RealEstateListing
│   │   └── utils.ts                # cn() — clsx + tailwind-merge helper
│   ├── types/
│   │   └── database.ts             # Supabase table types: Property, PropertyImage, SiteSettings, Database
│   ├── fonts/
│   │   └── tt-firs-neue-bold.ttf   # Local display font
│   ├── __tests__/                  # Vitest unit tests (co-located by domain, not by file)
│   │   ├── auth.test.ts
│   │   ├── currency.test.ts
│   │   ├── image-loading.test.ts
│   │   ├── json-ld.test.ts
│   │   ├── middleware.test.ts
│   │   ├── og-metadata.test.ts
│   │   ├── properties.test.ts
│   │   ├── property-validation.test.ts
│   │   ├── rls.test.ts
│   │   ├── settings.test.ts
│   │   ├── sitemap.test.ts
│   │   ├── skeletons.test.ts
│   │   └── validations.test.ts
│   └── middleware.ts               # Edge middleware — auth guard
├── e2e/                            # Playwright E2E tests
│   ├── fixtures/
│   └── *.spec.ts (when present)
├── tests/e2e/                      # Secondary E2E directory
├── supabase/                       # Supabase CLI project config
│   └── .temp/
├── public/
│   └── assets/                     # Static assets served from root
├── .planning/                      # GSD planning artifacts (not shipped)
│   ├── codebase/                   # Codebase analysis documents
│   └── phases/                     # Phase plans by feature
├── next.config.ts                  # Image domains, security headers, CSP
├── tsconfig.json                   # Strict TS, @/* alias → src/*
├── vitest.config.ts                # Unit test runner
├── playwright.config.ts            # E2E test runner
├── eslint.config.mjs               # ESLint config
├── postcss.config.mjs              # PostCSS / Tailwind
└── components.json                 # shadcn/ui component registry config
```

## Directory Purposes

**`src/app/`:**
- Purpose: All Next.js routes using App Router conventions
- Contains: `page.tsx`, `layout.tsx`, `loading.tsx`, `sitemap.ts`, `robots.ts`
- Key files: `src/app/layout.tsx` (root), `src/app/(public)/layout.tsx`, `src/app/admin/layout.tsx`

**`src/actions/`:**
- Purpose: All server-side mutations — the only place where data is written
- Contains: `'use server'` modules; each exported function validates input, checks auth, writes to Supabase, calls `revalidatePath`
- Key files: `src/actions/properties.ts`, `src/actions/images.ts`

**`src/components/admin/`:**
- Purpose: Admin dashboard UI — forms, lists, image manager, sidebar, map picker
- Contains: Mostly Client Components; some Server Components for static display elements
- Key files: `src/components/admin/property-form.tsx`, `src/components/admin/image-manager/image-manager.tsx`

**`src/components/public/`:**
- Purpose: Public marketing site UI — property cards, gallery, maps, hero sections
- Contains: Mix of Server and Client Components; interactive ones marked `'use client'`
- Key files: `src/components/public/property-listing.tsx`, `src/components/public/property-detail.tsx`

**`src/components/ui/`:**
- Purpose: shadcn/ui primitive components — never hand-edited; add new ones with `npx shadcn@latest add`
- Contains: Radix UI wrappers with Tailwind styling
- Generated: Yes — do not manually edit

**`src/lib/queries/`:**
- Purpose: Read-only data access for Server Components; uses `React.cache()` for per-request deduplication
- Contains: Typed interfaces and async fetch functions
- Key files: `src/lib/queries/properties.ts`, `src/lib/queries/property.ts`, `src/lib/queries/settings.ts`

**`src/lib/supabase/`:**
- Purpose: Scoped Supabase client factories
- Contains: `server.ts` (for server contexts), `client.ts` (for browser contexts)

**`src/lib/validations/`:**
- Purpose: Zod schemas that serve as the canonical contract for form data; imported by both Client Components (for `zodResolver`) and Server Actions (for `safeParse`)
- Contains: Schemas and inferred TypeScript types

**`src/lib/utils/`:**
- Purpose: Pure, side-effect-free utility functions
- Contains: Currency formatting, image URL construction, WhatsApp URL generation, OG description formatting, phone formatting

**`src/types/`:**
- Purpose: Centralized TypeScript type definitions for Supabase database tables
- Contains: `database.ts` with `Property`, `PropertyImage`, `SiteSettings`, `Database` types

**`src/__tests__/`:**
- Purpose: Vitest unit tests for logic, validation, utilities, and component behavior
- Contains: Domain-named test files (not mirroring directory structure)

**`e2e/` and `tests/e2e/`:**
- Purpose: Playwright E2E tests for browser-level flows
- Generated: No
- Committed: Yes

**`supabase/`:**
- Purpose: Supabase CLI project configuration and migration tracking
- Generated: Partially (`.temp/` is generated)
- Committed: Yes (except `.temp/`)

## Key File Locations

**Entry Points:**
- `src/app/layout.tsx`: Root HTML shell, global fonts, Toaster
- `src/middleware.ts`: Edge auth guard
- `src/app/(public)/page.tsx`: Home page
- `src/app/(public)/imoveis/[id]/page.tsx`: Property detail with metadata

**Configuration:**
- `next.config.ts`: Image remote patterns (Supabase storage), security headers
- `tsconfig.json`: TypeScript strict mode, `@/*` path alias
- `components.json`: shadcn/ui registry settings
- `vitest.config.ts`: Unit test configuration
- `playwright.config.ts`: E2E test configuration

**Core Logic:**
- `src/actions/properties.ts`: Property CRUD mutations
- `src/actions/images.ts`: Image upload/delete/reorder/cover mutations
- `src/lib/queries/properties.ts`: Public property list query
- `src/lib/queries/property.ts`: Single property with images query
- `src/lib/queries/settings.ts`: Site settings query
- `src/lib/validations/property.ts`: Canonical property schema
- `src/types/database.ts`: All Supabase table types

**Testing:**
- `src/__tests__/`: All unit tests
- `e2e/`: Playwright E2E tests

## Naming Conventions

**Files:**
- Kebab-case for all files: `property-form.tsx`, `image-manager.tsx`, `use-image-upload.ts`
- Pages follow Next.js convention: `page.tsx`, `layout.tsx`, `loading.tsx`
- Test files: `<domain>.test.ts` in `src/__tests__/`
- E2E files: `<flow>.spec.ts`

**Directories:**
- Route groups use parentheses: `(auth)`, `(public)`
- Feature directories in kebab-case: `image-manager/`, `lib/queries/`, `lib/utils/`

**Exports:**
- Named exports for components: `export function PropertyForm`
- Named exports for actions: `export async function createProperty`
- Named exports for queries: `export const getPublicProperties = cache(...)`
- Default export reserved for Next.js pages and layouts only

**TypeScript:**
- Interfaces for object shapes: `interface PublicProperty`, `interface PropertyWithImages`
- Zod-inferred types with `type` keyword: `export type PropertyFormData = z.infer<typeof propertySchema>`
- Discriminated unions for action returns: `{ success: true; id: string } | { error: string }`

## Where to Add New Code

**New Admin Feature (CRUD):**
- Route: `src/app/admin/<feature>/page.tsx`
- Server Action: `src/actions/<feature>.ts`
- Query: `src/lib/queries/<feature>.ts`
- Validation schema: `src/lib/validations/<feature>.ts`
- UI components: `src/components/admin/<feature-component>.tsx`
- Tests: `src/__tests__/<feature>.test.ts`

**New Public Page:**
- Route: `src/app/(public)/<route>/page.tsx`
- If data needed: add query to `src/lib/queries/`
- UI components: `src/components/public/<component>.tsx`

**New Utility Function:**
- Pure logic: `src/lib/utils/<domain>.ts`
- Add test: `src/__tests__/<domain>.test.ts`

**New UI Primitive (shadcn/ui):**
- Run: `npx shadcn@latest add <component>`
- Output lands in `src/components/ui/` — do not hand-edit

**New Validation Schema:**
- Add to `src/lib/validations/<domain>.ts`
- Export both the Zod schema and the inferred `type`

## Special Directories

**`.planning/`:**
- Purpose: GSD planning artifacts — phase plans, codebase analysis, research notes
- Generated: No
- Committed: Yes (source of truth for planning)

**`.next/`:**
- Purpose: Next.js build output
- Generated: Yes
- Committed: No

**`node_modules/`:**
- Purpose: npm dependencies
- Generated: Yes
- Committed: No

**`supabase/.temp/`:**
- Purpose: Supabase CLI temporary files
- Generated: Yes
- Committed: No

---

*Structure analysis: 2026-03-25*
