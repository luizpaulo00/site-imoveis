# Project Research Summary

**Project:** Jander Imoveis -- Site Vitrine de Imoveis
**Domain:** Real estate showcase/catalog site (Brazilian autonomous broker)
**Researched:** 2026-03-11
**Confidence:** HIGH

## Executive Summary

Jander Imoveis is an image-heavy, mobile-first property showcase site for a solo Brazilian real estate broker whose primary distribution channel is WhatsApp link sharing. The product lives or dies on three things: beautiful WhatsApp link previews (Open Graph), fast-loading photo galleries on mobile, and a one-tap WhatsApp contact flow. Experts build this type of site with a server-rendered framework (for OG tag generation), a managed database with auth (for single-user admin), and a pre-optimization image pipeline (to stay within free-tier storage and bandwidth limits). The entire stack runs at zero monthly cost using Vercel Hobby, Supabase Free, and client-side image compression.

The recommended approach is Next.js 16 (App Router, Server Components) on Vercel, Supabase (PostgreSQL + Auth + Storage) for the backend, and Tailwind CSS 4 with shadcn/ui for the interface. The architecture is deliberately simple: three database tables (properties, images, settings), Row Level Security for access control, Server Actions for mutations, and a client-side image compression pipeline that eliminates the need for paid image transformation services. The public site is server-rendered for OG tags; only interactive elements (gallery, filters, forms) hydrate on the client.

The dominant risks are all related to the zero-cost constraint and WhatsApp integration. WhatsApp silently drops OG images over 300KB, which means the image pipeline must produce correctly-sized OG images from day one -- retrofitting this is expensive. Supabase free tier pauses after 7 days of inactivity, requiring a keep-alive cron job deployed alongside the initial site. Vercel Hobby limits image optimizations to 1,000/month, so property photos must be pre-optimized at upload time rather than relying on runtime optimization. These are not edge cases; they are guaranteed to break the product if not addressed in the foundation phase.

## Key Findings

### Recommended Stack

The stack is built entirely on free tiers with no expiring trials. Next.js 16 with App Router provides server-side rendering critical for WhatsApp OG tag crawling. Supabase bundles PostgreSQL, Auth, and Storage in a single free service, eliminating the need for separate auth libraries or databases. Tailwind CSS 4 with shadcn/ui provides accessible, mobile-first components with zero runtime overhead.

**Core technologies:**
- **Next.js 16 (App Router):** Full-stack framework -- only viable free option for dynamic OG tags with Vercel hosting; Server Components reduce client JS
- **Supabase (PostgreSQL + Auth + Storage):** All-in-one backend -- 500MB database, built-in email/password auth, 1GB file storage, Row Level Security
- **Tailwind CSS 4 + shadcn/ui:** UI layer -- mobile-first utilities, accessible component primitives, zero runtime CSS
- **Leaflet + OpenStreetMap:** Maps -- 100% free, no API key, no usage limits
- **embla-carousel + yet-another-react-lightbox:** Image gallery -- lightweight carousel (7KB) and fullscreen viewer with touch/swipe
- **browser-image-compression:** Client-side image optimization -- eliminates need for paid server-side transformations
- **nuqs:** URL search param state -- type-safe shareable filter URLs

**Critical version requirements:** Next.js 16 requires React 19. shadcn/ui CLI v4 required for Tailwind v4 support. @supabase/ssr replaces the deprecated @supabase/auth-helpers-nextjs.

### Expected Features

**Must have (table stakes):**
- Property cards with hero photo, price (R$ formatted), bedrooms, bathrooms, area, neighborhood
- Property detail page with full specs, description, photo gallery with fullscreen swipe and pinch-to-zoom
- Dynamic Open Graph meta tags per property (photo + title + price in WhatsApp preview)
- Sticky WhatsApp contact button with pre-filled message including property name and link
- Admin auth (single user email/password) with property CRUD for all fields
- Multi-image upload with drag-drop, reorder, cover selection, auto-compression
- Basic filters (property type, price range, bedrooms) with instant client-side filtering
- Property status indicators (disponivel, reservado, vendido) with color-coded badges
- Mobile-first responsive design (80%+ traffic is mobile from WhatsApp)
- Configurable WhatsApp number via admin settings

**Should have (differentiators over template platforms like Tecimob):**
- Featured/highlighted properties on homepage (admin toggle)
- Admin dashboard with property count by status
- Map on detail page showing approximate property location
- Share button using Web Share API for organic forwarding
- SEO optimizations (JSON-LD structured data, sitemap)
- Skeleton loading states and smooth transitions

**Defer (v2+):**
- OG image generation with price/specs overlay text
- Bulk property operations in admin
- Property archive/history
- Custom branding/theme settings

**Anti-features (deliberately excluded):**
- User registration, favorites, saved searches (the broker IS the recommendation engine)
- Virtual tours, 360 photos, video hosting (regular photos in a good gallery suffice)
- Chat widget (WhatsApp is the single communication channel)
- Visit scheduling, calendar integration (handled via WhatsApp conversation)
- Portal integrations, multi-language, mortgage calculator

### Architecture Approach

The system is a two-surface application: a server-rendered public site for visitors and a hybrid admin panel for the broker. Server Components are the default; client-side JavaScript is limited to interactive islands (gallery, filters, forms, image uploader). All mutations flow through Server Actions, not API route handlers. Auth is enforced at two levels: Next.js middleware redirects unauthenticated users from /admin/*, and Supabase RLS policies enforce access at the database level.

**Major components:**
1. **Public Site (SSR)** -- property listing, detail pages, OG metadata; Server Components fetching directly from Supabase
2. **Admin Panel (Server + Client islands)** -- property CRUD forms, image upload/reorder, settings management via Server Actions
3. **Image Pipeline** -- client-side compression (browser-image-compression) before upload to Supabase Storage; pre-generates web-optimized and OG-sized variants
4. **Auth Guard (Middleware)** -- single middleware.ts protecting /admin/* routes using supabase.auth.getUser() (server-validated, not getSession())
5. **OG Image Generator** -- dynamic opengraph-image.tsx per property using pre-compressed cover photos (under 200KB), cached by Vercel CDN
6. **Keep-Alive Cron** -- Vercel cron job pinging Supabase daily to prevent free-tier project pausing

**Database schema:** Three tables -- `properties` (all property fields + denormalized cover_image_url), `property_images` (storage paths + display order), `site_settings` (key-value for WhatsApp number, site title, broker name). RLS policies allow public SELECT on available/reserved properties and admin-only writes.

### Critical Pitfalls

1. **WhatsApp OG images over 300KB are silently dropped** -- Pre-compress OG images to under 200KB JPEG at upload time, not dynamically via next/og which generates heavy PNGs. This must be part of the image upload pipeline from day one.
2. **Supabase free tier pauses after 7 days of inactivity** -- Deploy a Vercel cron job (daily `SELECT 1`) alongside the initial site. Not optional polish; required for production uptime.
3. **Vercel Hobby plan limits image optimization to 1,000 source images/month** -- Do NOT use next/image runtime optimization for property photos. Pre-optimize at upload time and serve directly from Supabase Storage CDN. Reserve Vercel optimization for static site assets only.
4. **Raw phone photos (5-15MB each) will blow through 1GB Supabase Storage** -- Mandatory client-side compression before upload. Target 200-400KB per image. With compression, 300 photos fit in ~135MB (13% of limit).
5. **OG tags rendered client-side are invisible to WhatsApp's crawler** -- Property pages must use generateMetadata() in Server Components. Test by curling the URL and checking raw HTML, not browser DevTools.
6. **WhatsApp caches OG data for 24-48 hours with no invalidation mechanism** -- Implement URL versioning (?v=timestamp) on property edit. Document the delay for the broker in the admin UI.

## Implications for Roadmap

Based on research, the project should follow a 4-phase structure driven by data dependencies: admin must exist before public pages (you need data to display), and the image pipeline must be built into the foundation (retrofitting is expensive).

### Phase 1: Foundation and Database
**Rationale:** Every other phase depends on the database schema, auth, Supabase client setup, and the keep-alive mechanism. The image pipeline decisions (client-side compression, no Vercel image optimization) are architectural constraints that must be established before any images enter the system.
**Delivers:** Working Next.js project on Vercel, Supabase project with schema + RLS + Storage bucket, auth flow (login/logout/middleware guard), Supabase client factories (browser/server/middleware), keep-alive cron job, utility functions (price formatting with R$ Brazilian format, slug generation).
**Addresses features:** Admin login, configurable WhatsApp number (settings table), database schema for all property fields.
**Avoids pitfalls:** Supabase project pausing (cron deployed immediately), no RLS (policies created with schema), wrong auth pattern (getUser not getSession from the start).

### Phase 2: Admin Panel and Image Pipeline
**Rationale:** The broker must be able to create properties and upload photos before any public page can be built or tested with real data. The image pipeline (compression, multiple sizes, OG image generation) is the most complex and most critical component.
**Delivers:** Admin layout with sidebar navigation, property CRUD with react-hook-form + zod validation, multi-image upload with drag-drop, client-side compression, reorder, cover selection, settings page for WhatsApp number.
**Addresses features:** Property CRUD, multi-image upload with management, automatic image compression, property status management, admin dashboard counters, featured property toggle.
**Avoids pitfalls:** Raw photos exceeding storage (compression mandatory), OG images over 300KB (OG variant generated at upload), Vercel image optimization limit (pre-optimized images), admin UX issues (Portuguese labels, progress indicators, confirmation dialogs).

### Phase 3: Public Site and WhatsApp Integration
**Rationale:** With properties and images in the database, the public site can be built and tested against real data. OG tags are the culmination of the image pipeline and server rendering -- they depend on property data, cover images, and correct server-side metadata generation.
**Delivers:** Property listing page with cards, property detail page with gallery (embla-carousel + lightbox), client-side filters (type, price, bedrooms via nuqs), sticky WhatsApp button with pre-filled message, dynamic OG meta tags per property, map display with Leaflet.
**Addresses features:** All public-facing table stakes -- property cards, detail pages, photo gallery with fullscreen swipe, WhatsApp contact button, OG previews, basic filters, property status badges, mobile-first responsive layout.
**Avoids pitfalls:** Client-side OG rendering (generateMetadata in Server Components), WhatsApp cache staleness (URL versioning), gallery crashes on low-end phones (lazy loading, virtualized slides).

### Phase 4: Polish, Performance, and SEO
**Rationale:** With core functionality working, this phase addresses perceived quality: loading states, error handling, mobile performance optimization, and discoverability.
**Delivers:** Skeleton loading states for all pages, error boundaries, mobile optimization pass (touch targets, sticky button padding), Lighthouse/Core Web Vitals audit and fixes, SEO (JSON-LD RealEstateListing, sitemap.xml, robots.txt), share button with Web Share API.
**Addresses features:** Fast loading/performance, smooth transitions, SEO-friendly pages, share button, featured properties hero section.
**Avoids pitfalls:** Gallery memory issues on budget Android phones (performance testing), layout shift from images without dimensions (aspect-ratio containers).

### Phase Ordering Rationale

- **Admin before public** is driven by data dependency: public pages need real properties with real images to build and test. Building public pages with mock data leads to integration surprises.
- **Image pipeline in Phase 2 (not Phase 3)** because every image that enters the system must go through compression. Adding compression later requires reprocessing all existing images and potentially migrating storage paths.
- **OG tags in Phase 3 (not Phase 4)** because WhatsApp link previews are the core product feature, not polish. The entire user journey starts with an OG preview in a WhatsApp chat.
- **Filters grouped with public site** because they are client-side only (nuqs + client filtering) and require no additional backend work. They enhance the listing page naturally.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 2 (Image Pipeline):** The client-side compression + multiple variant generation + OG image creation workflow has many moving parts. Needs research on browser-image-compression configuration, Supabase Storage upload patterns, and exact OG image size/quality settings that pass WhatsApp's undocumented limits.
- **Phase 3 (OG Tags):** WhatsApp's crawler behavior is poorly documented. Needs testing-focused research on generateMetadata patterns, opengraph-image.tsx with Edge Runtime, and cache-busting strategies.

Phases with standard patterns (skip deep research):
- **Phase 1 (Foundation):** Next.js App Router setup, Supabase project configuration, middleware auth guard -- all have extensive official documentation and established patterns.
- **Phase 4 (Polish):** Skeleton loading, error boundaries, Lighthouse optimization, sitemap generation -- well-documented, no novel patterns.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All technologies have official docs, active maintenance, and proven compatibility. Free tier limits verified against official pricing pages. Version compatibility confirmed (Next.js 16 + React 19 + Tailwind 4 + shadcn/ui v4). |
| Features | HIGH | Feature set derived from competitor analysis (Tecimob, ImobiBrasil), Brazilian real estate market patterns, and WhatsApp-centric user journey. Anti-features well-justified for scale (~20 properties, single broker). |
| Architecture | HIGH | Architecture follows official Next.js App Router patterns and Supabase SSR documentation. Database schema is minimal (3 tables) and appropriate for scale. Build order reflects genuine data dependencies. |
| Pitfalls | HIGH | Critical pitfalls sourced from Next.js GitHub discussions, Supabase community reports, and Vercel documentation. WhatsApp OG issues confirmed across multiple independent sources. Free tier limits verified against official pricing. |

**Overall confidence:** HIGH

All four research areas drew from official documentation, recent community reports (2025-2026), and verified free-tier specifications. The stack is conservative (no bleeding-edge choices), the feature set is appropriate for scale, and the pitfalls are well-documented with concrete prevention strategies.

### Gaps to Address

- **WhatsApp OG image size threshold:** The 300KB limit is community-reported, not officially documented by Meta. Exact threshold may vary. Mitigation: target well under the limit (200KB) and test extensively with real WhatsApp shares during Phase 3.
- **Supabase Storage egress under real traffic:** The 2GB/month egress limit could be tight if a property goes viral on WhatsApp. Vercel CDN caching should absorb most repeat requests, but actual egress behavior under load is unverified. Mitigation: monitor Supabase dashboard, implement aggressive Cache-Control headers.
- **browser-image-compression quality on HEIC photos:** Brazilian users increasingly take HEIC photos (iPhone default). Client-side conversion from HEIC to WebP/JPEG may have quality or compatibility issues on older Android browsers. Mitigation: test with real HEIC files from various devices during Phase 2.
- **Brazilian currency input masking:** The R$ format (period for thousands, comma for decimals) is the opposite of US format. Exact library choice for masked currency input not yet validated. Mitigation: evaluate react-number-format or custom masking during Phase 2 planning.

## Sources

### Primary (HIGH confidence)
- [Next.js 16 Blog Post](https://nextjs.org/blog/next-16) -- framework features, Turbopack, React Compiler
- [Next.js App Router Docs](https://nextjs.org/docs/app/getting-started/project-structure) -- project structure, metadata, OG images
- [Supabase Pricing](https://supabase.com/pricing) -- free tier limits (500MB DB, 1GB storage, 50K MAU)
- [Supabase Auth + Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs) -- SSR auth setup with @supabase/ssr
- [Supabase Storage Image Transformations](https://supabase.com/docs/guides/storage/serving/image-transformations) -- confirmed Pro plan only
- [Vercel Hobby Plan](https://vercel.com/docs/plans/hobby) -- bandwidth, cron jobs, image optimization limits
- [Vercel Image Optimization Limits](https://vercel.com/docs/image-optimization/limits-and-pricing) -- 1,000 source images/month
- [Cloudinary Free Plan](https://cloudinary.com/documentation/developer_onboarding_faq_free_plan) -- 25 credits/month
- [Tailwind CSS v4](https://tailwindcss.com/blog/tailwindcss-v4) -- CSS-native config, performance

### Secondary (MEDIUM confidence)
- [Next.js GitHub Discussion #84537](https://github.com/vercel/next.js/discussions/84537) -- OG image not displaying on WhatsApp
- [Next.js GitHub Discussion #60366](https://github.com/vercel/next.js/discussions/60366) -- next/og generates heavy PNG images
- [WhatsApp OG Preview Guide (OpenGraphPlus)](https://opengraphplus.com/consumers/whatsapp) -- WhatsApp crawler behavior, size limits
- [Supabase Pause Prevention (GitHub)](https://github.com/travisvn/supabase-pause-prevention) -- cron-based workaround
- [Supabase Pricing Analysis (UIBakery)](https://uibakery.io/blog/supabase-pricing) -- free tier limits 2026

### Tertiary (LOW confidence)
- WhatsApp 300KB OG image limit -- community-reported across multiple sources but not in any official Meta documentation. Treat as reliable but test empirically.

---
*Research completed: 2026-03-11*
*Ready for roadmap: yes*
