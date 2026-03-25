# Architecture

**Analysis Date:** 2026-03-25

## Pattern Overview

**Overall:** Next.js 15 App Router with Server Components as the primary rendering strategy, backed by Supabase as the sole backend.

**Key Characteristics:**
- Server Components fetch data directly from Supabase; no separate API layer exists
- Mutations run exclusively through Next.js Server Actions (`'use server'`) — no REST or GraphQL endpoints
- Route groups segment the app into three distinct contexts: `(public)`, `(auth)`, and `admin`
- Auth is enforced at two levels: Next.js Middleware (edge) and Server Component layout guards
- Client Components are isolated to interactive UI only (forms, image drag-and-drop, maps, gallery)

## Layers

**Middleware (Edge Auth Guard):**
- Purpose: Intercept every non-static request; redirect unauthenticated users away from `/admin/*` and authenticated users away from `/login`
- Location: `src/middleware.ts`
- Contains: Supabase SSR session check via `getUser()` (not `getSession()`)
- Depends on: `@supabase/ssr`, env vars `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Used by: Next.js runtime on every matched request

**Route Layouts (Segment Isolation):**
- Purpose: Define UI shells and apply per-segment auth, fonts, and settings
- Location: `src/app/layout.tsx` (root), `src/app/(public)/layout.tsx`, `src/app/admin/layout.tsx`
- Contains: Font loading, global metadata, Toaster, secondary auth redirect, Header/Footer injection, Sidebar setup
- Depends on: `src/lib/queries/settings.ts` (public layout), `src/lib/supabase/server.ts` (admin layout)
- Used by: All pages within the corresponding segment

**Pages (Server Components):**
- Purpose: Orchestrate data fetching and compose UI from components; never contain markup-heavy JSX
- Location: `src/app/(public)/page.tsx`, `src/app/(public)/imoveis/[id]/page.tsx`, `src/app/admin/imoveis/page.tsx`, `src/app/admin/imoveis/novo/page.tsx`, `src/app/admin/imoveis/[id]/editar/page.tsx`, `src/app/admin/configuracoes/page.tsx`
- Contains: `async` functions calling queries or actions, `generateMetadata` exports, JSON-LD injection
- Depends on: `src/lib/queries/`, `src/actions/`
- Used by: Next.js router

**Queries (Read-only, Server-side):**
- Purpose: Encapsulate SELECT queries for use by Server Components and pages; public queries use `React.cache()` for deduplication
- Location: `src/lib/queries/properties.ts`, `src/lib/queries/property.ts`, `src/lib/queries/settings.ts`
- Contains: Typed interfaces (`PublicProperty`, `PropertyWithImages`, `PublicSettings`) and async fetch functions
- Depends on: `src/lib/supabase/server.ts`
- Used by: Pages and layouts (never by Server Actions)

**Server Actions (Mutations):**
- Purpose: Handle all write operations with auth verification, input validation, and cache invalidation via `revalidatePath`
- Location: `src/actions/properties.ts`, `src/actions/images.ts`, `src/actions/settings.ts`, `src/actions/auth.ts`
- Contains: `'use server'` directive, Zod validation, `supabase.auth.getUser()` guard before every mutation, `revalidatePath` calls
- Depends on: `src/lib/supabase/server.ts`, `src/lib/validations/`
- Used by: Client Components (forms, image manager)

**Components:**
- Purpose: Render UI; split into `public/`, `admin/`, and `ui/` sub-namespaces
- Location: `src/components/public/`, `src/components/admin/`, `src/components/ui/`
- Contains: Server Components (read-only display) and Client Components (`'use client'` — forms, interactive widgets)
- Depends on: `src/actions/` (mutations), `src/lib/utils/`, shadcn/ui primitives
- Used by: Pages and layouts

**Supabase Clients:**
- Purpose: Provide correctly scoped Supabase clients for server vs. browser contexts
- Location: `src/lib/supabase/server.ts` (SSR cookie-based), `src/lib/supabase/client.ts` (browser)
- Contains: `createServerClient` (used by Server Components, Actions, Middleware) and `createBrowserClient` (used by Client Components needing real-time or direct queries)
- Depends on: `@supabase/ssr`

**Validations:**
- Purpose: Single source of truth for input shapes; used by both forms (client-side) and Server Actions (server-side)
- Location: `src/lib/validations/property.ts`, `src/lib/validations/settings.ts`, `src/lib/validations/image.ts`, `src/lib/validations/uuid.ts`
- Contains: Zod schemas and inferred TypeScript types

**Types:**
- Purpose: Centralized Supabase database type definitions shared across the app
- Location: `src/types/database.ts`
- Contains: `Property`, `PropertyImage`, `SiteSettings`, `KeepAlive`, and the `Database` generic type for Supabase client inference

## Data Flow

**Public Property Listing:**

1. User requests `/` (public route)
2. `(public)/layout.tsx` calls `getPublicSettings()` (cached) to inject WhatsApp/broker name into Header and Footer
3. `(public)/page.tsx` calls `getPublicProperties()` (cached) — a single Supabase SELECT with related `property_images`
4. `<PropertyListing>` renders the property grid; client-side filter state via `<PropertyFilters>` (Client Component)
5. Response cached by Next.js ISR with `export const revalidate = 60` on the layout

**Admin Property Mutation:**

1. Admin submits `<PropertyForm>` (Client Component)
2. Form calls Server Action `createProperty(data)` or `updateProperty(id, data)`
3. Server Action validates with Zod → checks `supabase.auth.getUser()` → executes INSERT/UPDATE
4. `revalidatePath('/admin/imoveis')` purges the cached list
5. Server Action returns `{ success: true, id }` or `{ error: string }`; form toasts and redirects

**Image Upload Flow:**

1. `<ImageManager>` (Client Component) receives files via `<ImageDropzone>`
2. `useImageUpload` hook calls Server Action `uploadImage(propertyId, formData)` per file
3. Server Action validates auth → checks count limit → uploads file to Supabase Storage bucket `property-images` → inserts `property_images` row
4. If first image, `is_cover: true` is set automatically
5. On cover deletion, next-lowest-position image is promoted

**Auth Flow:**

1. Middleware runs on every non-static request; calls `supabase.auth.getUser()` from edge
2. `/admin/*` without session → redirect to `/login`
3. `admin/layout.tsx` performs a second server-side check and calls `redirect('/login')` as defense-in-depth
4. Login page submits to Server Action `signIn(formData)` → `supabase.auth.signInWithPassword` → redirect to `/admin/imoveis`

**State Management:**
- No global client-side state manager (no Redux, Zustand, or Context)
- Server state is the source of truth; mutations invalidate via `revalidatePath`
- Client Components hold only ephemeral UI state (form values, upload queue, filter selections, modal open/close)

## Key Abstractions

**Server Action Pattern:**
- Every mutation file declares `'use server'` at the top
- Every exported function starts with auth verification: `const { data: { user }, error: authError } = await supabase.auth.getUser()`
- Returns discriminated union: `{ success: true } | { error: string }`
- Examples: `src/actions/properties.ts`, `src/actions/images.ts`

**React Cache Queries:**
- Public read queries use `cache()` from React to deduplicate calls within a single request
- Examples: `getPublicProperties` in `src/lib/queries/properties.ts`, `getPublicSettings` in `src/lib/queries/settings.ts`

**Route Group Isolation:**
- `(auth)` — unauthenticated-only pages (login)
- `(public)` — public marketing/listing pages with shared Header/Footer; ISR enabled
- `admin` — authenticated dashboard; Sidebar-based layout

**Dual Supabase Client:**
- `src/lib/supabase/server.ts` — async factory using `next/headers` cookies; used in all server contexts
- `src/lib/supabase/client.ts` — synchronous factory using browser cookies; used only in Client Components

## Entry Points

**Root Layout:**
- Location: `src/app/layout.tsx`
- Triggers: Every page request
- Responsibilities: Global fonts (Playfair Display, Outfit), global metadata, Toaster, JSON-LD for RealEstateAgent and FAQPage schemas

**Middleware:**
- Location: `src/middleware.ts`
- Triggers: All non-static requests
- Responsibilities: Session refresh, admin route protection, login redirect

**Public Home:**
- Location: `src/app/(public)/page.tsx`
- Triggers: GET `/`
- Responsibilities: Parallel data fetch (properties + settings), hero section, property listing, CTA section

**Property Detail:**
- Location: `src/app/(public)/imoveis/[id]/page.tsx`
- Triggers: GET `/imoveis/:id`
- Responsibilities: `generateMetadata` with OG image and description, JSON-LD for `RealEstateListing`, render `<PropertyDetail>`

**Admin Dashboard:**
- Location: `src/app/admin/imoveis/page.tsx`
- Triggers: GET `/admin/imoveis`
- Responsibilities: Fetch property list with image counts, render `<PropertyList>`

**Sitemap:**
- Location: `src/app/sitemap.ts`
- Triggers: GET `/sitemap.xml`
- Responsibilities: Fetches all property IDs and `updated_at` from Supabase; generates dynamic sitemap entries

## Error Handling

**Strategy:** Defensive — every Server Action and query returns an explicit `{ error: string }` union rather than throwing. Components check the union and display toast notifications.

**Patterns:**
- Server Actions: `if (error || !data) { console.error(...); return { error: 'message' } }`
- Queries: Return empty arrays or null on failure; no thrown exceptions
- Pages: Use `notFound()` from `next/navigation` when a required resource is missing (e.g., `src/app/(public)/imoveis/[id]/page.tsx`)
- Image upload: Rolls back storage upload if DB insert fails

## Cross-Cutting Concerns

**Logging:** `console.error` only in Server Actions and queries on Supabase error. No structured logging library.

**Validation:** Zod schemas defined in `src/lib/validations/`; shared between client form resolvers (`zodResolver`) and Server Action `safeParse` calls.

**Authentication:** Double-enforced — Middleware (edge) + layout server-side `getUser()` check. Server Actions independently re-verify auth before every write.

**SEO:** Open Graph metadata via `generateMetadata`, JSON-LD via inline `<script type="application/ld+json">`, dynamic sitemap at `src/app/sitemap.ts`, robots config at `src/app/robots.ts`.

**Security Headers:** Configured globally in `next.config.ts` — CSP, HSTS, X-Frame-Options DENY, X-Content-Type-Options, Referrer-Policy, Permissions-Policy.

---

*Architecture analysis: 2026-03-25*
