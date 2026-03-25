# Technology Stack

**Analysis Date:** 2026-03-25

## Languages

**Primary:**
- TypeScript 5.x - All application code in `src/`
- SQL - Database schema at `supabase/schema.sql`

**Secondary:**
- CSS - Global styles at `src/app/globals.css` (Tailwind CSS v4 utility classes)

## Runtime

**Environment:**
- Node.js 24.x (detected from active runtime)

**Package Manager:**
- npm
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- Next.js ^16.1.7 (App Router) - Full-stack React framework; all routes under `src/app/`
- React 19.1.0 - UI rendering; RSC (React Server Components) enabled throughout
- Tailwind CSS 4.x - Utility-first CSS via PostCSS plugin (`postcss.config.mjs`)

**Build/Dev:**
- Turbopack - Used for both `next dev` and `next build` (via `--turbopack` flag in `package.json`)
- TypeScript compiler - `tsconfig.json` configured with strict mode, `ES2017` target, `bundler` module resolution

## Key Dependencies

**UI Components:**
- `shadcn` ^4.0.5 - Component generation CLI; config at `components.json` (style: `base-nova`, baseColor: `neutral`)
- `@base-ui/react` ^1.3.0 - Headless UI primitives backing shadcn components
- `lucide-react` ^0.577.0 - Icon library (configured as icon library in `components.json`)
- `class-variance-authority` ^0.7.1 - Variant-based component styling
- `clsx` ^2.1.1 + `tailwind-merge` ^3.5.0 - Class merging utilities in `src/lib/utils.ts`

**Forms & Validation:**
- `react-hook-form` ^7.71.2 - Form state management
- `@hookform/resolvers` ^5.2.2 - Connects Zod schemas to react-hook-form
- `zod` ^4.3.6 - Schema validation for forms and server action inputs

**Media & Maps:**
- `swiper` ^12.1.2 - Image carousel/slider on property detail pages
- `leaflet` ^1.9.4 + `react-leaflet` ^5.0.0 - Interactive property maps; types at `@types/leaflet`
- `browser-image-compression` ^2.0.2 - Client-side image compression before upload
- `heic2any` ^0.0.4 - HEIC/HEIF image format conversion (iOS photos support)

**Drag & Drop:**
- `@dnd-kit/core` ^6.3.1 + `@dnd-kit/sortable` ^10.0.0 + `@dnd-kit/utilities` ^3.2.2 - Drag-to-reorder image management in admin (`src/components/admin/image-manager/`)

**Notifications:**
- `sonner` ^2.0.7 - Toast notifications; `<Toaster>` mounted in `src/app/layout.tsx`

**Theming:**
- `next-themes` ^0.4.6 - Dark/light mode support
- `tw-animate-css` ^1.4.0 - CSS animation utilities for Tailwind

**Supabase:**
- `@supabase/supabase-js` ^2.99.1 - Core Supabase client
- `@supabase/ssr` ^0.9.0 - SSR-compatible Supabase client (browser at `src/lib/supabase/client.ts`, server at `src/lib/supabase/server.ts`)

**Utilities:**
- `react-currency-input-field` ^4.0.3 - Formatted currency input for property prices

## Testing Frameworks

**Unit/Integration:**
- `vitest` ^4.1.0 - Test runner; config at `vitest.config.ts` (jsdom environment, globals enabled)
- `@testing-library/react` ^16.3.2 - React component testing utilities
- `@testing-library/jest-dom` ^6.9.1 - Custom DOM matchers
- `@vitejs/plugin-react` ^6.0.0 - React plugin for Vitest
- `jsdom` ^28.1.0 - Browser environment simulation

**E2E:**
- `@playwright/test` ^1.58.2 - End-to-end testing; config at `playwright.config.ts` (Chromium only, baseURL `http://localhost:3000`, tests at `e2e/`)

## Configuration

**Environment:**
- `.env.local` - Local secrets (not committed); `.env.local.example` provides template
- Required variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Optional: `NEXT_PUBLIC_SITE_URL` (defaults to `https://imoveisformosa.com.br`)

**Build:**
- `next.config.ts` - Next.js config; configures image remote patterns for Supabase storage and strict security headers (CSP, HSTS, X-Frame-Options, etc.)
- `tsconfig.json` - Path alias `@/*` maps to `./src/*`
- `postcss.config.mjs` - Uses `@tailwindcss/postcss` plugin
- `eslint.config.mjs` - Flat config extending `next/core-web-vitals` and `next/typescript`

## Platform Requirements

**Development:**
- Node.js 24.x
- npm for package management
- Supabase project (cloud or local) with env vars configured

**Production:**
- Deployment target: Not explicitly configured (Vercel assumed from Next.js/Supabase stack)
- Supabase cloud project for database, auth, and file storage
- GitHub Actions for scheduled keep-alive pings (`.github/workflows/keep-supabase-alive.yml`)

---

*Stack analysis: 2026-03-25*
