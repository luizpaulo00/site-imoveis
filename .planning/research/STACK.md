# Stack Research

**Domain:** Real estate showcase/catalog site (Brazilian autonomous broker)
**Researched:** 2026-03-11
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js | 16.x (LTS) | Full-stack framework (SSR/SSG, API routes, App Router) | Only viable free option for dynamic OG tags with Vercel hosting. App Router with Server Components gives SSR for WhatsApp link previews. Turbopack stable in v16, React Compiler built-in. Deploys to Vercel free tier with zero config. |
| React | 19.x | UI library | Ships with Next.js 16. Server Components reduce client bundle. |
| TypeScript | 5.x | Type safety | Next.js 16 has first-class TS support. Prevents bugs in a solo-dev project where there is no code review. |
| Tailwind CSS | 4.2.x | Utility-first CSS | Mobile-first by default (`sm:` breakpoints go up, not down). CSS-native config in v4, no `tailwind.config.js` needed. 5x faster builds than v3. |
| shadcn/ui | latest (CLI v4) | Component library | Not an npm dependency -- copies components into your project. Built on Radix UI primitives (accessible). Tailwind v4 + React 19 supported. Perfect for admin panel: pre-built form inputs, dialogs, dropdowns, tables. |

### Database & Auth

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Supabase (PostgreSQL) | Free tier | Database + Auth + Realtime | 500 MB database (more than enough for ~20 properties). Built-in Auth with email/password -- no need for a separate auth library. Row Level Security for admin-only writes. JS client works in both server and client components. Free tier is perpetual (no 12-month limit like AWS). |
| @supabase/supabase-js | latest | Supabase client SDK | Official SDK. Works with Next.js App Router via `@supabase/ssr` for server-side auth. |
| @supabase/ssr | latest | Server-side auth helpers | Handles cookie-based sessions in Next.js App Router. Creates server/client Supabase instances correctly. |

### Image Storage & Optimization

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Cloudinary | Free tier | Image storage, CDN, transformation | 25 monthly credits (~10 GB storage + 10 GB bandwidth + 5K transformations). Auto-format (WebP/AVIF), auto-quality, responsive resize via URL params. Free tier image transformations -- Supabase Storage does NOT offer image transformations on free tier (Pro only). CDN delivery globally. |
| next-cloudinary | latest | Next.js Cloudinary integration | CldImage component wraps next/image with Cloudinary transformations. CldUploadWidget for admin uploads with drag-and-drop. CldOgImage for dynamic social media cards (critical for WhatsApp previews). |

### Maps

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Leaflet | 1.9.x | Map rendering | 100% free, no API key, no usage limits. OpenStreetMap tiles are free. Good enough for "show property on map" with a pin. 50 KB (vs Google Maps 111 KB). |
| react-leaflet | 5.x | React bindings for Leaflet | Official React wrapper. Declarative API with `<MapContainer>`, `<Marker>`, `<Popup>`. |

### Image Gallery & Carousel

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| embla-carousel-react | 8.6.x | Property card carousel + gallery carousel | Lightweight (dependency-free), 6M+ weekly npm downloads. Fluid mobile swipe with snap points. shadcn/ui Carousel component is built on Embla -- consistent ecosystem. Extensible via plugins (autoplay, auto-height). |
| yet-another-react-lightbox | 3.29.x | Fullscreen photo viewer | 300K+ weekly downloads, actively maintained. Plugin architecture: thumbnails, zoom, slideshow, fullscreen, counter. Touch/swipe gestures built-in. Works with React 19. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-hook-form | latest | Form handling (admin CRUD) | All admin forms: property create/edit, settings, login. Uncontrolled components = performant with many fields. |
| zod | latest | Schema validation | Validate property data on client and server. Integrates with react-hook-form via @hookform/resolvers. |
| lucide-react | latest | Icons | Default icon set for shadcn/ui. Bed, bath, area, map-pin, phone, WhatsApp icons. |
| sonner | latest | Toast notifications | shadcn/ui default toast solution (replaced previous toast component). "Property saved", "Image uploaded" feedback. |
| nuqs | latest | URL search params state | Type-safe URL state for property filters (type, price range, bedrooms). Keeps filter state shareable via URL. |
| sharp | latest | Server-side image processing | Compress/resize images on upload before sending to Cloudinary. Runs in Next.js API routes. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| ESLint | Linting | Ships with Next.js. Use `next/core-web-vitals` preset. |
| Prettier | Formatting | With `prettier-plugin-tailwindcss` for class sorting. |
| Turbopack | Dev server bundler | Default in Next.js 16. No config needed. |

## Installation

```bash
# Core framework
npx create-next-app@latest jander-imoveis --typescript --tailwind --app --turbopack

# Supabase
npm install @supabase/supabase-js @supabase/ssr

# Cloudinary
npm install next-cloudinary

# UI components (shadcn/ui -- run init, then add components as needed)
npx shadcn@latest init
npx shadcn@latest add button card input label select dialog dropdown-menu table badge separator carousel sheet

# Maps
npm install leaflet react-leaflet
npm install -D @types/leaflet

# Image gallery
npm install embla-carousel-react yet-another-react-lightbox

# Forms & validation
npm install react-hook-form zod @hookform/resolvers

# Supporting
npm install lucide-react sonner nuqs sharp
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Next.js | Astro | If OG tags were static-only (no dynamic per-property previews). Astro is faster for pure static sites but has weaker API route / dynamic SSR story. |
| Next.js | Remix | If hosting on non-Vercel platform. Remix has better non-Vercel deployment but loses Vercel's free tier optimizations. |
| Supabase | SQLite + Turso | If worried about Supabase free tier pausing. Turso has a generous free tier and no pausing, but lacks built-in auth and storage. More DIY. |
| Supabase Auth | NextAuth.js | If needing multiple OAuth providers. Overkill for single email/password user. Supabase Auth is already included -- no extra dependency. |
| Cloudinary | Supabase Storage | If no image transformations needed. Supabase Storage free tier has 1 GB but NO image transformations (resize, format conversion, quality optimization) -- that is Pro-only ($5/1K images). Cloudinary free tier includes transformations. |
| Cloudinary | Uploadthing | If Cloudinary free tier gets too restrictive. Uploadthing has 2 GB free but no built-in image transformations or CDN optimization. |
| Leaflet | Google Maps Embed | If needing Street View or routing. Google Maps Embed API is free but requires API key and has usage limits. For a simple pin on a map, Leaflet + OSM is simpler and truly free. |
| Leaflet | Google Maps Static API | If needing zero JavaScript maps. Static image embeds are free up to 25K/month but less interactive. |
| embla-carousel | Swiper.js | If needing very complex carousel layouts (3D effects, parallax). Swiper is heavier (~50 KB vs Embla ~7 KB) and has its own CSS. Since shadcn/ui uses Embla internally, using Embla keeps the ecosystem consistent. |
| yet-another-react-lightbox | PhotoSwipe | If needing animated thumbnails and gestures similar to native photo apps. PhotoSwipe is excellent but has a different API style. YARL has better React integration and plugin system. |
| shadcn/ui | Material UI (MUI) | Never for this project. MUI is heavy (~100 KB+), opinionated design system, fights Tailwind. |
| Tailwind CSS | Chakra UI | If wanting styled-system approach. Chakra has runtime CSS-in-JS overhead. Tailwind is zero-runtime, better for mobile performance. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| WordPress / Wix / Squarespace | No free tier for custom domain + dynamic OG tags. Lock-in. Can't customize WhatsApp integration properly. | Next.js + Supabase + Vercel |
| Firebase (Firestore) | Firestore's querying is limited for property filters. Firebase Auth is fine but Supabase bundles everything. Firebase free tier (Spark) has tighter limits on functions. | Supabase (PostgreSQL + Auth + Storage) |
| Prisma ORM | Adds complexity for ~3 database tables. Supabase JS client is simpler for this scale. Prisma's connection pooling is unnecessary for ~20 properties. | @supabase/supabase-js direct queries |
| NextAuth.js (Auth.js) | Massive overkill for single-user email/password auth. Supabase Auth is already included, zero extra config. | Supabase Auth |
| AWS S3 for images | No built-in image transformations. Need CloudFront for CDN. Free tier expires after 12 months. Complex IAM setup. | Cloudinary |
| react-slick | Depends on jQuery-era slick-carousel. Not maintained for React 19. Accessibility issues. | embla-carousel-react |
| CSS Modules / styled-components | Runtime overhead (styled-components). CSS Modules work but lose Tailwind's utility-first speed and shadcn/ui compatibility. | Tailwind CSS |
| MongoDB Atlas | NoSQL is wrong fit. Property data is relational (property -> images, property -> filters). PostgreSQL queries are simpler for range filters (price, bedrooms). | Supabase (PostgreSQL) |
| Vercel Blob Storage | 250 MB free, no image transformations, no CDN optimization. Less than Cloudinary's offering. | Cloudinary |

## Stack Patterns

**For WhatsApp OG tags (critical path):**
- Use Next.js dynamic `generateMetadata()` in property page `[slug]/page.tsx`
- Fetch property data server-side, return OG meta with photo URL, title, price
- Cloudinary URL with transformations for OG image (1200x630 auto-crop)
- WhatsApp caches OG tags aggressively -- include cache-busting params if property updates

**For image upload flow (admin):**
- Client: sharp compresses image in API route -> upload to Cloudinary -> store Cloudinary URL in Supabase
- Alternative: Use CldUploadWidget (uploads directly to Cloudinary from browser, returns URL to store in Supabase)
- Store Cloudinary public_id in Supabase, construct URLs with transformations at render time

**For Supabase free tier pausing mitigation:**
- Set up a Vercel Cron Job (vercel.json) to ping Supabase every 5 days
- Simple API route: `SELECT 1` from Supabase to register activity
- Vercel free tier includes cron jobs (daily frequency available)

**For mobile-first image loading:**
- Use Cloudinary responsive breakpoints: serve 400px on mobile, 800px on tablet, 1200px on desktop
- next-cloudinary CldImage handles this via `sizes` prop
- Lazy-load below-fold images, eager-load hero/cover image
- Use LQIP (Low Quality Image Placeholder) via Cloudinary's blur transformation

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| Next.js 16.x | React 19.x | React 19 is required for Next.js 16 |
| shadcn/ui CLI v4 | Tailwind CSS 4.x + React 19 | Must use CLI v4 for Tailwind v4 support |
| react-leaflet 5.x | Leaflet 1.9.x + React 18/19 | Leaflet CSS must be imported manually |
| embla-carousel-react 8.x | React 18/19 | shadcn/ui Carousel uses this internally |
| yet-another-react-lightbox 3.x | React 16.8+ through 19 | Broad React compat |
| @supabase/ssr | Next.js App Router | Replaces older @supabase/auth-helpers-nextjs |
| Tailwind CSS 4.x | PostCSS not required | v4 uses its own CSS engine, no PostCSS config needed |

## Deployment

| Service | Tier | Purpose | Key Limits |
|---------|------|---------|------------|
| Vercel | Hobby (free) | Hosting, SSR, Cron Jobs | 100 GB bandwidth, 150K function invocations, 100 MB source limit |
| Supabase | Free | Database, Auth | 500 MB DB, 1 GB file storage, 50K MAUs, pauses after 7 days inactivity |
| Cloudinary | Free | Image CDN, storage, transforms | 25 credits/month (~10 GB storage, 10 GB bandwidth, 5K transforms) |

**Total monthly cost: $0**

For ~20 properties with ~15 photos each (300 images), assuming 500 KB average per original image:
- Cloudinary storage: ~150 MB (well within 10 GB)
- Supabase DB: <10 MB (text data only, URLs to Cloudinary)
- Vercel bandwidth: depends on traffic, 100 GB handles ~100K visits/month

## Sources

- [Next.js 16 Blog Post](https://nextjs.org/blog/next-16) -- Next.js 16 features, Turbopack stable, React Compiler
- [Next.js Support Policy](https://nextjs.org/support-policy) -- LTS version information
- [Supabase Pricing](https://supabase.com/pricing) -- Free tier limits (500 MB DB, 1 GB storage, 50K MAU)
- [Supabase Storage Image Transformations](https://supabase.com/docs/guides/storage/serving/image-transformations) -- Pro plan only, not free tier
- [Supabase Auth Next.js Quickstart](https://supabase.com/docs/guides/auth/quickstarts/nextjs) -- SSR auth setup
- [Cloudinary Free Plan FAQ](https://cloudinary.com/documentation/developer_onboarding_faq_free_plan) -- 25 credits, 10 GB storage
- [Cloudinary Pricing](https://cloudinary.com/pricing) -- Credit system breakdown
- [Next Cloudinary Docs](https://next.cloudinary.dev/) -- CldImage, CldUploadWidget, CldOgImage
- [Vercel Hobby Plan](https://vercel.com/docs/plans/hobby) -- 100 GB bandwidth, cron jobs
- [Tailwind CSS v4.0 Blog](https://tailwindcss.com/blog/tailwindcss-v4) -- CSS-native config, performance
- [shadcn/ui Tailwind v4](https://ui.shadcn.com/docs/tailwind-v4) -- CLI v4, component updates
- [react-leaflet npm](https://www.npmjs.com/package/react-leaflet) -- v5.0.0 latest
- [Embla Carousel](https://www.embla-carousel.com/) -- Lightweight, React hooks API
- [yet-another-react-lightbox](https://yet-another-react-lightbox.com/) -- v3.29.x, plugin architecture
- [Supabase Pause Prevention](https://github.com/travisvn/supabase-pause-prevention) -- Cron-based workaround

---
*Stack research for: Jander Imoveis -- Real estate showcase site*
*Researched: 2026-03-11*
