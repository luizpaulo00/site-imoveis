# Phase 5: Performance and SEO - Research

**Researched:** 2026-03-14
**Domain:** Next.js 15 performance optimization, structured data, sitemap generation
**Confidence:** HIGH

## Summary

Phase 5 enhances the existing Next.js 15 / React 19 public site with skeleton loading states, image lazy-loading, JSON-LD structured data, and auto-generated sitemap. The codebase already uses Server Components for data fetching (pages are async RSCs that call Supabase), a Skeleton UI component from shadcn exists, and images already use `loading="lazy"` on property cards. The main work is: (1) wrapping async pages with Suspense boundaries and skeleton fallbacks, (2) ensuring the first visible image (LCP candidate) is NOT lazy-loaded, (3) adding JSON-LD script tags to property detail pages, (4) creating a dynamic `sitemap.ts`, and (5) auditing HTML semantics.

The site is small (~20 properties) so no complex sitemap splitting is needed. RealEstateListing schema is well-documented on schema.org. Next.js App Router has built-in `loading.tsx` convention and `sitemap.ts` convention that handle the hard parts. No new dependencies are needed.

**Primary recommendation:** Use Next.js built-in conventions (`loading.tsx` for skeletons, `sitemap.ts` for sitemap generation) and inline `<script type="application/ld+json">` for JSON-LD. Zero new dependencies required.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PERF-01 | Mobile-first responsive design (optimized for 80%+ mobile traffic) | Audit existing Tailwind classes for mobile-first patterns; ensure touch targets >= 44px; review viewport meta |
| PERF-02 | Skeleton loading states on all pages (no blank screens) | Next.js `loading.tsx` convention + React Suspense boundaries with Skeleton component (already exists in codebase) |
| PERF-03 | Lazy-load images below the fold | Property cards already use `loading="lazy"`; ensure cover/hero images use `loading="eager"` or `priority` for LCP |
| PERF-04 | LCP under 2.5s on 4G connection | Preload LCP image, avoid lazy-loading above-fold images, font `display: swap` already set, minimize render-blocking resources |
| SEO-01 | JSON-LD structured data (RealEstateListing schema) on property pages | Use schema.org/RealEstateListing with nested Offer, PostalAddress, and property details |
| SEO-02 | Auto-generated sitemap.xml with all property pages | Next.js `app/sitemap.ts` convention fetches properties from Supabase and returns MetadataRoute.Sitemap |
| SEO-03 | Proper heading hierarchy and semantic HTML | Audit all pages for h1->h2->h3 order, replace divs with semantic elements (main, article, section, nav, footer) |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 15.5.12 | App Router with `loading.tsx`, `sitemap.ts` conventions | Already installed; built-in support for all requirements |
| React | 19.1.0 | Suspense boundaries for streaming | Already installed; native Suspense support |
| shadcn Skeleton | installed | Pulse-animated placeholder component | Already exists at `src/components/ui/skeleton.tsx` |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| (none needed) | - | - | All requirements met by existing stack |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Inline JSON-LD | next-seo or schema-dts | Overkill for a single schema type; inline is simpler and has zero bundle cost |
| Manual sitemap.ts | next-sitemap package | next-sitemap is for Pages Router or complex multi-sitemap setups; App Router convention is sufficient for ~20 properties |

**Installation:**
```bash
# No new dependencies needed
```

## Architecture Patterns

### Recommended Changes to Existing Structure
```
src/
├── app/
│   ├── (public)/
│   │   ├── loading.tsx           # NEW: Home page skeleton
│   │   ├── imoveis/
│   │   │   └── [id]/
│   │   │       └── loading.tsx   # NEW: Detail page skeleton
│   │   └── page.tsx              # EXISTING
│   ├── admin/
│   │   ├── loading.tsx           # NEW: Admin skeleton (optional)
│   │   └── ...
│   └── sitemap.ts                # NEW: Dynamic sitemap generator
├── components/
│   ├── public/
│   │   ├── skeletons/
│   │   │   ├── property-card-skeleton.tsx   # NEW
│   │   │   ├── property-listing-skeleton.tsx # NEW
│   │   │   └── property-detail-skeleton.tsx  # NEW
│   │   └── json-ld.tsx           # NEW: JSON-LD script component
│   └── ui/
│       └── skeleton.tsx          # EXISTING
└── lib/
    └── structured-data.ts        # NEW: JSON-LD data builders
```

### Pattern 1: loading.tsx for Page-Level Skeletons
**What:** Next.js automatically wraps a route segment with a Suspense boundary when a `loading.tsx` file exists in the same directory.
**When to use:** Every public-facing route that fetches data server-side.
**Example:**
```typescript
// Source: Next.js official docs - loading.js convention
// app/(public)/loading.tsx
import { PropertyListingSkeleton } from '@/components/public/skeletons/property-listing-skeleton'

export default function Loading() {
  return (
    <div>
      <div className="mb-6 h-9 w-48 animate-pulse rounded bg-gray-200" />
      <PropertyListingSkeleton />
    </div>
  )
}
```

### Pattern 2: JSON-LD as Server Component Script Tag
**What:** Render JSON-LD structured data as a `<script type="application/ld+json">` inside the page server component.
**When to use:** Property detail pages.
**Example:**
```typescript
// Source: schema.org/RealEstateListing
function PropertyJsonLd({ property }: { property: PropertyWithImages }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: property.title,
    description: property.description,
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/imoveis/${property.id}`,
    datePosted: property.created_at,
    image: property.property_images
      .map(img => getImageUrl(img.storage_path)),
    offers: {
      '@type': 'Offer',
      priceCurrency: 'BRL',
      price: String(property.price),
      businessFunction: 'http://purl.org/goodrelations/v1#Sell',
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: property.address,
      addressLocality: property.neighborhood || property.city,
      addressRegion: property.state,
      addressCountry: 'BR',
    },
    numberOfRooms: property.bedrooms,
    floorSize: property.area ? {
      '@type': 'QuantitativeValue',
      value: String(property.area),
      unitCode: 'MTK', // square meters
    } : undefined,
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
```

### Pattern 3: Dynamic Sitemap with Supabase
**What:** `app/sitemap.ts` exports an async function that queries all properties and returns sitemap entries.
**When to use:** Once, at the app root level.
**Example:**
```typescript
// Source: Next.js docs - sitemap.ts convention
import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()
  const { data: properties } = await supabase
    .from('properties')
    .select('id, updated_at')

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const propertyUrls = (properties ?? []).map((p) => ({
    url: `${baseUrl}/imoveis/${p.id}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...propertyUrls,
  ]
}
```

### Pattern 4: LCP-Aware Image Loading
**What:** The first visible image (hero/cover) must NOT be lazy-loaded. Use `loading="eager"` or omit the attribute entirely (default is eager). Below-fold images use `loading="lazy"`.
**When to use:** Property detail gallery (first image eager), property cards on listing page (first row eager via priority prop or removing lazy on first N cards).

### Anti-Patterns to Avoid
- **Lazy-loading the LCP image:** The hero image on the detail page or the first card's cover photo should NOT have `loading="lazy"`. This directly hurts LCP.
- **Using next/image for external Supabase URLs without configuration:** The project intentionally uses `<img>` tags for Supabase storage URLs (see decision [Phase 04]). Do not switch to `next/image` as it would require Vercel image optimization quota (conflicts with zero-cost constraint).
- **Fat skeleton components:** Skeletons should be simple divs with animate-pulse, not complex components that import heavy dependencies.
- **Blocking JSON-LD generation on external APIs:** Generate JSON-LD from existing database data only, never call external validation APIs at render time.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Sitemap XML generation | Custom XML string builder | Next.js `app/sitemap.ts` convention | Handles XML escaping, content-type headers, caching automatically |
| Loading states infrastructure | Custom loading state management | Next.js `loading.tsx` + React Suspense | Built into the framework, zero config, handles streaming |
| Schema.org types | Custom type definitions | Inline JSON-LD objects | Only one schema type needed (RealEstateListing); type libraries are overkill |
| Lighthouse CI automation | Custom perf testing pipeline | Manual `npx lighthouse` or Chrome DevTools | For ~20 properties, automated CI perf testing is premature |

**Key insight:** This phase is 100% achievable with zero new dependencies. Next.js App Router conventions handle sitemap and loading states, and JSON-LD is just a script tag with a JSON string.

## Common Pitfalls

### Pitfall 1: Lazy-Loading the LCP Element
**What goes wrong:** LCP score balloons to 4+ seconds because the hero image waits for scroll detection.
**Why it happens:** Developers add `loading="lazy"` globally to all images without thinking about which image is above the fold.
**How to avoid:** On the detail page, the first gallery image (cover) must use `loading="eager"`. On the listing page, consider eagerly loading the first row of property card images.
**Warning signs:** Lighthouse flags "Largest Contentful Paint image was lazily loaded."

### Pitfall 2: Skeleton That Doesn't Match Real Layout
**What goes wrong:** Content "jumps" when real data replaces skeleton, causing Cumulative Layout Shift (CLS).
**Why it happens:** Skeleton dimensions don't match actual content dimensions.
**How to avoid:** Match skeleton block heights/widths to the real component's approximate layout. Use the same container widths, padding, and grid structure.
**Warning signs:** CLS score > 0.1 in Lighthouse.

### Pitfall 3: Sitemap Returning Relative URLs
**What goes wrong:** Search engines reject the sitemap because URLs must be absolute.
**Why it happens:** Forgetting to prepend the base URL to paths.
**How to avoid:** Always use `${process.env.NEXT_PUBLIC_SITE_URL}/path`.
**Warning signs:** Google Search Console reports sitemap errors.

### Pitfall 4: JSON-LD Price Formatting
**What goes wrong:** Google's Rich Results Test fails because price contains formatting characters.
**Why it happens:** Using formatted price string like "R$ 350.000,00" instead of raw number "350000".
**How to avoid:** Use the raw `property.price` number, not `formatCurrency()`. Price in schema must be a plain number string.
**Warning signs:** Google Rich Results Test shows "Invalid price" error.

### Pitfall 5: Multiple h1 Tags on a Page
**What goes wrong:** Search engines get confused about the page's primary topic.
**Why it happens:** Both the layout header and the page content have an h1.
**How to avoid:** Ensure exactly one h1 per page. The home page h1 is the site/section title. The detail page h1 is the property title. Header logo should NOT be wrapped in h1.
**Warning signs:** Lighthouse accessibility audit flags "multiple h1 elements."

## Code Examples

### Skeleton Component for Property Card
```typescript
// src/components/public/skeletons/property-card-skeleton.tsx
import { Skeleton } from '@/components/ui/skeleton'

export function PropertyCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-24" />
        <div className="flex gap-4 pt-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  )
}
```

### Skeleton for Property Listing Page
```typescript
// src/components/public/skeletons/property-listing-skeleton.tsx
import { PropertyCardSkeleton } from './property-card-skeleton'

export function PropertyListingSkeleton() {
  return (
    <div>
      {/* Filter bar skeleton */}
      <div className="mb-6 flex gap-3">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>
      {/* Card grid skeleton */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <PropertyCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
```

### Semantic HTML Improvements
```typescript
// Current: <div> wrappers -> Replace with semantic elements
// Property listing page: wrap in <main> (already in layout), use <article> per card
// Property detail page: wrap in <article>, use <section> for each content block

// Example property card with semantic HTML:
<article className="group block overflow-hidden rounded-xl ...">
  <figure className="relative aspect-[4/3] overflow-hidden bg-gray-100">
    <img ... />
  </figure>
  <div className="p-4">
    <p className="text-xl font-bold text-[#FF6A15]">{formatCurrency(property.price)}</p>
    <h3 className="mt-1 truncate text-sm font-medium">{property.title}</h3>
    ...
  </div>
</article>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| getInitialProps loading spinners | loading.tsx + Suspense streaming | Next.js 13+ (2023) | No blank screens, instant skeleton display |
| next-sitemap package | App Router `sitemap.ts` convention | Next.js 13.3+ (2023) | Zero dependency, native support |
| React Helmet for JSON-LD | Inline `<script>` in Server Components | Next.js 13+ (2023) | No client-side hydration cost |
| next/image for all images | Native `<img>` for external CDN URLs | Project decision | Avoids Vercel image optimization quota |

**Current codebase status:**
- Images on property cards already use `loading="lazy"` -- good baseline
- Gallery images do NOT have lazy loading on non-visible slides -- need to add
- Font display is already set to `swap` -- good for LCP
- Pages are Server Components with async data fetching -- perfect for streaming with Suspense
- No `loading.tsx` files exist yet -- must create
- No sitemap exists -- must create
- No JSON-LD exists -- must create
- Heading hierarchy needs audit (home page has h1, detail page has h1, need to verify no duplicates or skipped levels)

## Open Questions

1. **robots.txt**
   - What we know: No robots.txt exists yet; sitemap URL should be declared in robots.txt
   - What's unclear: Whether to add robots.txt in this phase or defer
   - Recommendation: Add a simple `app/robots.ts` alongside sitemap.ts -- it is trivial (5 lines) and complements the sitemap

2. **LCP measurement target environment**
   - What we know: Requirement says "simulated 4G connection" for LCP < 2.5s
   - What's unclear: Whether Lighthouse CLI in CI is required or manual Chrome DevTools check is sufficient
   - Recommendation: Manual Lighthouse audit in Chrome DevTools with "Slow 4G" throttling is sufficient for verification; no CI pipeline needed for ~20 properties

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.0 + jsdom |
| Config file | `vitest.config.ts` |
| Quick run command | `npx vitest run` |
| Full suite command | `npx vitest run && npx playwright test` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PERF-01 | Mobile-first responsive | manual-only | Lighthouse mobile audit in Chrome DevTools | N/A |
| PERF-02 | Skeleton loading states | unit | `npx vitest run src/__tests__/skeletons.test.ts -t "skeleton"` | Wave 0 |
| PERF-03 | Lazy-load below fold | unit | `npx vitest run src/__tests__/image-loading.test.ts -t "lazy"` | Wave 0 |
| PERF-04 | LCP under 2.5s | manual-only | Lighthouse audit with 4G throttling (manual verification) | N/A |
| SEO-01 | JSON-LD structured data | unit | `npx vitest run src/__tests__/json-ld.test.ts -t "json-ld"` | Wave 0 |
| SEO-02 | Auto-generated sitemap | unit | `npx vitest run src/__tests__/sitemap.test.ts -t "sitemap"` | Wave 0 |
| SEO-03 | Heading hierarchy | e2e | `npx playwright test tests/e2e/seo.spec.ts` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run`
- **Per wave merge:** `npx vitest run && npx playwright test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/__tests__/json-ld.test.ts` -- covers SEO-01 (validates JSON-LD output structure)
- [ ] `src/__tests__/sitemap.test.ts` -- covers SEO-02 (validates sitemap includes property URLs)
- [ ] `src/__tests__/skeletons.test.ts` -- covers PERF-02 (skeleton components render correctly)
- [ ] `tests/e2e/seo.spec.ts` -- covers SEO-03 (heading hierarchy, semantic HTML)

## Sources

### Primary (HIGH confidence)
- [Next.js sitemap.ts docs](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap) - Complete API reference for dynamic sitemap generation
- [Next.js loading.js docs](https://nextjs.org/docs/app/api-reference/file-conventions/loading) - loading.tsx convention for Suspense boundaries
- [schema.org/RealEstateListing](https://schema.org/RealEstateListing) - Official schema type definition
- [Schemantra RealEstateListing generator](https://schemantra.com/schema_list/RealEstateListing) - Complete JSON-LD example with all properties

### Secondary (MEDIUM confidence)
- [freeCodeCamp Next.js 15 Streaming Handbook](https://www.freecodecamp.org/news/the-nextjs-15-streaming-handbook/) - Patterns for loading.tsx + Suspense
- [seoClarity real estate schema guide](https://www.seoclarity.net/blog/structured-data-for-real-estate-listings) - Best practices for real estate structured data

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - No new dependencies; all built-in Next.js features verified against official docs
- Architecture: HIGH - Patterns are well-documented Next.js conventions (loading.tsx, sitemap.ts)
- Pitfalls: HIGH - LCP lazy-loading trap is widely documented; JSON-LD price formatting is a known issue
- JSON-LD schema: MEDIUM - RealEstateListing is standard schema.org but Google does not have a specific rich result type for it (it helps general SEO, not guaranteed rich snippets)

**Research date:** 2026-03-14
**Valid until:** 2026-04-14 (stable -- no fast-moving dependencies)
