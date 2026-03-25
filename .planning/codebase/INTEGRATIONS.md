# External Integrations

**Analysis Date:** 2026-03-25

## APIs & External Services

**Mapping:**
- OpenStreetMap (via Leaflet/react-leaflet) - Interactive maps on property detail pages
  - SDK/Client: `leaflet` ^1.9.4 + `react-leaflet` ^5.0.0
  - Auth: None required (public tile service)
  - CSP configured in `next.config.ts`: `img-src` allows `https://*.tile.openstreetmap.org`

**Messaging:**
- WhatsApp (wa.me deep link) - Contact broker button on public property pages
  - SDK/Client: No SDK; URL constructed in `src/lib/utils/whatsapp.ts`
  - Pattern: `https://wa.me/{countryCode}{phone}?text={encodedMessage}`
  - Phone number stored in `site_settings` table (configurable by admin)

**Typography:**
- Google Fonts - Fonts loaded via Next.js `next/font/google`
  - Fonts used: `Playfair_Display` (serif, CSS var `--font-serif`), `Outfit` (sans-serif, CSS var `--font-sans`)
  - Loaded in `src/app/layout.tsx`
  - CSP allows `fonts.googleapis.com` (stylesheets) and `fonts.gstatic.com` (font files)

## Data Storage

**Databases:**
- Supabase PostgreSQL - Primary database for all application data
  - Connection: `NEXT_PUBLIC_SUPABASE_URL` (env var)
  - Client: `@supabase/supabase-js` ^2.99.1 via `@supabase/ssr` ^0.9.0
  - Browser client: `src/lib/supabase/client.ts` (uses `createBrowserClient`)
  - Server client: `src/lib/supabase/server.ts` (uses `createServerClient` with Next.js cookies)
  - Tables: `properties`, `property_images`, `site_settings`, `keep_alive`
  - Row Level Security: Enabled on all tables; anon read, authenticated write

**File Storage:**
- Supabase Storage - Property images stored in cloud
  - Bucket: `property-images` (public bucket)
  - Path pattern: `{propertyId}/{imageId}.jpg` for gallery images
  - Path pattern: `{propertyId}/og-cover.jpg` for Open Graph cover images
  - Upload handled in `src/actions/images.ts`
  - Public URLs served via Supabase CDN; configured as Next.js remote image pattern in `next.config.ts`
  - File constraints: max 5MB, MIME types: `image/jpeg`, `image/png`, `image/webp`
  - RLS: Public SELECT, authenticated INSERT/UPDATE/DELETE

**Caching:**
- Next.js built-in cache - `revalidatePath('/admin/imoveis')` called after mutations in `src/actions/`
- No external cache layer (Redis, etc.)

## Authentication & Identity

**Auth Provider:**
- Supabase Auth - Email/password authentication for admin panel
  - Implementation: `supabase.auth.signInWithPassword()` in `src/actions/auth.ts`
  - Session management: Cookie-based via `@supabase/ssr`; middleware refreshes sessions at `src/middleware.ts`
  - Protected routes: All `/admin/*` paths; enforced in `src/middleware.ts` using `supabase.auth.getUser()` (not `getSession()` for security)
  - On auth failure: Redirect to `/login`
  - On auth success from login: Redirect to `/admin/imoveis`
  - Single-admin model: No role system; any authenticated Supabase user has admin access

## Monitoring & Observability

**Error Tracking:**
- None detected (no Sentry, Datadog, or similar SDK)

**Logs:**
- Console logging only (no structured logging framework)

## CI/CD & Deployment

**Hosting:**
- Not explicitly configured; Vercel assumed (Next.js + Supabase is the standard pairing)

**CI Pipeline:**
- GitHub Actions - Single workflow at `.github/workflows/keep-supabase-alive.yml`
  - Purpose: Prevent Supabase free-tier project from pausing due to inactivity
  - Schedule: Twice weekly (Monday and Thursday at 09:00 UTC)
  - Mechanism: `curl` ping to `keep_alive` table via Supabase REST API
  - Secrets used: `SUPABASE_URL`, `SUPABASE_ANON_KEY` (stored in GitHub repository secrets)
  - No build, test, or deploy pipeline in CI

## SEO & Structured Data

**Schema.org (JSON-LD):**
- `RealEstateAgent` / `LocalBusiness` schema - Injected in `src/app/layout.tsx` (global)
- `FAQPage` schema - Injected in `src/app/layout.tsx` (global)
- `Product`/property listing schema - Built per-property in `src/lib/structured-data.ts`, injected in `src/app/(public)/imoveis/[id]/page.tsx`

**Sitemap & Robots:**
- Dynamic sitemap: `src/app/sitemap.ts` (queries all properties from Supabase, generates XML)
- Robots: `src/app/robots.ts` (allows all, points to sitemap)

**Open Graph:**
- Per-property OG images stored at `{propertyId}/og-cover.jpg` in Supabase Storage
- Metadata generated dynamically in `src/app/(public)/imoveis/[id]/page.tsx`

## Environment Configuration

**Required env vars:**
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL (e.g., `https://xxxxx.supabase.co`)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon/public key (JWT)

**Optional env vars:**
- `NEXT_PUBLIC_SITE_URL` - Production site URL; defaults to `https://imoveisformosa.com.br`

**GitHub Actions secrets:**
- `SUPABASE_URL` - Same as `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_ANON_KEY` - Same as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Secrets location:**
- `.env.local` (not committed); template at `.env.local.example`

## Webhooks & Callbacks

**Incoming:**
- None detected

**Outgoing:**
- WhatsApp deep link (`wa.me`) - Opened client-side via anchor tag; not a server-side webhook

---

*Integration audit: 2026-03-25*
