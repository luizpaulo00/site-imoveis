# Phase 4: Public Site and WhatsApp - Research

**Researched:** 2026-03-14
**Domain:** Next.js 15 public pages, mobile-first UI, photo gallery, Open Graph, WhatsApp integration
**Confidence:** HIGH

## Summary

Phase 4 transforms the existing admin-only app into the public-facing product. The codebase already has a solid foundation: Supabase queries for properties/images, currency formatting, Leaflet for maps, and OG image generation/upload in the image pipeline. The public site needs new route groups (listing page at `/`, detail page at `/imoveis/[id]`), a swipeable photo gallery with pinch-to-zoom, client-side property filters, dynamic Open Graph meta tags via `generateMetadata`, and a sticky WhatsApp button.

The existing `src/app/page.tsx` currently redirects to `/admin/imoveis` -- this must be replaced with the public listing page. The admin routes stay under `/admin/*` protected by middleware. Public routes use the anonymous Supabase client (RLS already grants public read access per INFR-03).

**Primary recommendation:** Use Swiper 12 for the photo gallery (zoom + navigation + pagination modules), Next.js `generateMetadata` for dynamic OG tags, and keep all filtering client-side since the catalog is small (~20 properties).

## Standard Stack

### Core (already installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 15.5.12 | Framework | Already in project |
| React | 19.1.0 | UI | Already in project |
| Supabase | 2.99.1 | Database + Storage | Already in project |
| Leaflet + react-leaflet | 1.9.4 / 5.0.0 | Map display | Already used in admin |
| Tailwind CSS | 4.x | Styling | Already in project |
| lucide-react | 0.577.0 | Icons | Already in project |

### New Dependencies
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| swiper | ^12.1.2 | Photo gallery with swipe + zoom | De facto standard for touch-enabled carousels, 40M+ weekly npm downloads, built-in Zoom module with pinch-to-zoom, React components included |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Swiper | embla-carousel | Embla is lighter but lacks built-in pinch-to-zoom -- would need a separate zoom library |
| Swiper | Custom CSS scroll-snap | No pinch-to-zoom, no photo counter, no fullscreen mode |
| Client-side filters | Server-side filters | Unnecessary for ~20 properties, adds latency |

**Installation:**
```bash
npm install swiper
```

## Architecture Patterns

### Recommended Project Structure
```
src/
  app/
    (public)/              # Public route group (no layout chrome)
      layout.tsx           # Public layout with brand fonts, footer
      page.tsx             # Property listing (replaces redirect)
      imoveis/
        [id]/
          page.tsx         # Property detail with generateMetadata
    (auth)/                # Existing auth group
    admin/                 # Existing admin group
  components/
    public/                # Public-facing components
      property-card.tsx    # Card for listing grid
      property-filters.tsx # Client-side filter controls
      property-gallery.tsx # Swiper fullscreen gallery
      property-map.tsx     # Leaflet map (read-only, no picker)
      whatsapp-button.tsx  # Sticky WhatsApp FAB
      share-button.tsx     # Web Share API + copy fallback
      header.tsx           # Site header with logo
      footer.tsx           # Simple footer
    admin/                 # Existing admin components
  lib/
    queries/               # Public data fetching (server-side)
      properties.ts        # Fetch all properties with images for listing
      property.ts          # Fetch single property with all relations
      settings.ts          # Fetch WhatsApp number + site settings
```

### Pattern 1: Route Group Separation
**What:** Use `(public)` route group for public pages with its own layout, separate from `(auth)` and `admin` groups.
**When to use:** Always -- keeps public layout (header, footer, brand styling) separate from admin layout (sidebar, topbar).
**Example:**
```typescript
// src/app/(public)/layout.tsx
import { Poppins } from 'next/font/google'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
})

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${poppins.variable} font-sans`}>
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  )
}
```

### Pattern 2: Server Component Data Fetching + Client Filtering
**What:** Fetch all properties server-side (RSC), pass to a client component for instant filtering.
**When to use:** Small datasets (~20 items) where latency matters more than data volume.
**Example:**
```typescript
// src/app/(public)/page.tsx (Server Component)
export default async function ListingPage() {
  const properties = await getPublicProperties()
  const settings = await getPublicSettings()
  return <PropertyListing properties={properties} settings={settings} />
}

// src/components/public/property-listing.tsx (Client Component)
'use client'
export function PropertyListing({ properties, settings }) {
  const [filters, setFilters] = useState({ type: null, priceRange: null, bedrooms: null })
  const filtered = useMemo(() => applyFilters(properties, filters), [properties, filters])
  // ...render filter controls + grid
}
```

### Pattern 3: generateMetadata for Dynamic OG Tags
**What:** Use Next.js `generateMetadata` in the property detail page to set OG tags server-side.
**When to use:** Every dynamic page that needs social sharing previews.
**Example:**
```typescript
// src/app/(public)/imoveis/[id]/page.tsx
import type { Metadata } from 'next'

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const property = await getPropertyWithCover(id)
  if (!property) return { title: 'Imovel nao encontrado' }

  const ogImageUrl = getOGImageUrl(property.id, property.updated_at)
  const description = formatOGDescription(property)

  return {
    title: property.title,
    description,
    openGraph: {
      title: property.title,
      description,
      images: [{
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: property.title,
      }],
      type: 'website',
      locale: 'pt_BR',
    },
  }
}
```

### Pattern 4: Swiper Gallery with Fullscreen + Zoom
**What:** Inline thumbnail gallery that opens fullscreen with swipe navigation and pinch-to-zoom.
**When to use:** Property detail page photo gallery.
**Example:**
```typescript
'use client'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Zoom, Navigation, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/zoom'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

export function PropertyGallery({ images }: { images: PropertyImage[] }) {
  const [fullscreen, setFullscreen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  return (
    <>
      {/* Inline preview */}
      <div onClick={() => setFullscreen(true)} className="cursor-pointer">
        <Swiper
          modules={[Pagination]}
          pagination={{ type: 'fraction' }}
          onSlideChange={(s) => setActiveIndex(s.activeIndex)}
        >
          {images.map((img) => (
            <SwiperSlide key={img.id}>
              <img src={getImageUrl(img, 'detail')} alt="" />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Fullscreen modal */}
      {fullscreen && (
        <div className="fixed inset-0 z-50 bg-black">
          <Swiper
            modules={[Zoom, Navigation, Pagination]}
            zoom
            navigation
            pagination={{ type: 'fraction' }}
            initialSlide={activeIndex}
          >
            {images.map((img) => (
              <SwiperSlide key={img.id}>
                <div className="swiper-zoom-container">
                  <img src={getImageUrl(img, 'detail')} alt="" />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          <button onClick={() => setFullscreen(false)} className="absolute top-4 right-4 z-10">
            <X className="text-white" />
          </button>
        </div>
      )}
    </>
  )
}
```

### Pattern 5: WhatsApp Deep Link
**What:** Sticky floating button that opens WhatsApp with pre-filled message.
**When to use:** Property detail page (and optionally listing page).
**Example:**
```typescript
export function WhatsAppButton({ phone, propertyTitle, propertyUrl }: Props) {
  const message = encodeURIComponent(
    `Oi! Tenho interesse no imovel: ${propertyTitle} - ${propertyUrl}`
  )
  // Use wa.me for universal deep link (works on mobile + desktop WhatsApp)
  const href = `https://wa.me/${phone}?text=${message}`

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-green-500 px-5 py-3 text-white shadow-lg"
    >
      <MessageCircle className="h-6 w-6" />
      <span className="hidden sm:inline">WhatsApp</span>
    </a>
  )
}
```

### Anti-Patterns to Avoid
- **Client-side OG tags:** Never set OG meta tags from client components -- WhatsApp and social crawlers do not execute JavaScript. Always use `generateMetadata` (server-side).
- **Loading all image variants:** Only load the variant needed for the context (card variant for listing, detail variant for gallery). Never load the original upload on public pages.
- **Server-side filtering for small datasets:** Adds unnecessary latency. Fetch all ~20 properties once, filter in the browser.
- **Relative OG image URLs:** WhatsApp requires absolute URLs for `og:image`. Use `metadataBase` in root layout or construct full URLs.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Photo gallery with swipe + zoom | Custom touch event handlers | Swiper 12 with Zoom module | Touch gesture handling is extremely complex (pinch, pan, momentum, edge cases) |
| OG meta tags | Manual `<meta>` tags in JSX | Next.js `generateMetadata` | Handles server-side rendering, streaming, merging, WhatsApp bot detection |
| WhatsApp deep link | Custom protocol handler | `wa.me` URL format | Universal format that works on iOS, Android, WhatsApp Web |
| Currency formatting | Manual string manipulation | Existing `formatCurrency` utility | Already handles pt-BR locale, non-breaking space normalization |
| Map display | Custom map implementation | react-leaflet (already installed) | Same library used in admin, just read-only mode |

**Key insight:** The public site reuses nearly all existing infrastructure (Supabase queries, image storage URLs, currency formatting, Leaflet). The new work is primarily UI components and routing.

## Common Pitfalls

### Pitfall 1: WhatsApp OG Image Caching
**What goes wrong:** WhatsApp aggressively caches OG previews. After updating a property's cover photo, the old preview continues to show.
**Why it happens:** WhatsApp caches link previews for days/weeks. It does not re-fetch on every share.
**How to avoid:** Append a version query parameter to the OG image URL: `?v={updated_at_timestamp}`. This makes WhatsApp treat it as a new URL. The `updated_at` field on properties already tracks changes.
**Warning signs:** Old cover photos appearing in WhatsApp link previews after updates.

### Pitfall 2: OG Image Must Be Absolute URL
**What goes wrong:** WhatsApp shows no image preview -- just text.
**Why it happens:** Relative URLs in `og:image` are ignored by crawlers. WhatsApp's crawler (`facebookexternalhit`) needs a fully qualified URL.
**How to avoid:** Set `metadataBase` in root layout to the production URL. Use Supabase storage public URLs (already absolute) for OG images.
**Warning signs:** OG debugger tools show no image.

### Pitfall 3: Swiper CSS Not Loading
**What goes wrong:** Gallery renders but has no styling -- slides stack vertically.
**Why it happens:** Swiper 12 requires explicit CSS imports. Missing `swiper/css` or module-specific CSS.
**How to avoid:** Import all needed CSS in the gallery component: `swiper/css`, `swiper/css/zoom`, `swiper/css/navigation`, `swiper/css/pagination`.
**Warning signs:** Slides not horizontally arranged, no pagination dots, zoom not working.

### Pitfall 4: Swiper Must Be Client Component
**What goes wrong:** Hydration errors or "window is not defined" errors.
**Why it happens:** Swiper uses browser APIs (touch events, DOM manipulation). Cannot run in RSC.
**How to avoid:** Mark gallery component with `'use client'`. Use dynamic import with `ssr: false` if needed.
**Warning signs:** Build errors or hydration mismatches.

### Pitfall 5: Leaflet Map on Public Pages
**What goes wrong:** Map crashes on server render or shows grey tiles.
**Why it happens:** Leaflet depends on `window` object. The admin already solved this with dynamic imports.
**How to avoid:** Reuse the same dynamic import pattern from admin (`map-picker-inner.tsx`), but create a simpler read-only version without the picker functionality.
**Warning signs:** Grey map area, "window is not defined" error.

### Pitfall 6: Next.js 15 params Are Promises
**What goes wrong:** TypeScript errors or runtime crashes when accessing `params.id`.
**Why it happens:** In Next.js 15, `params` in `generateMetadata` and page components are Promises that must be awaited.
**How to avoid:** Always `const { id } = await params` before using route parameters.
**Warning signs:** Type errors about `Promise<{ id: string }>`.

### Pitfall 7: Web Share API Availability
**What goes wrong:** Share button does nothing on desktop browsers.
**Why it happens:** `navigator.share` is not available on all browsers (notably Firefox desktop, older browsers).
**How to avoid:** Check `navigator.share` availability. Fall back to "copy link to clipboard" with toast notification.
**Warning signs:** Share button broken on desktop or older mobile browsers.

## Code Examples

### Public Property Query (Server-side)
```typescript
// src/lib/queries/properties.ts
import { createClient } from '@/lib/supabase/server'

export async function getPublicProperties() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('properties')
    .select(`
      id, title, price, property_type, bedrooms, bathrooms, area,
      neighborhood, status, featured, updated_at,
      property_images!inner(id, storage_path, is_cover)
    `)
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false })

  if (error || !data) return []

  return data.map((p) => ({
    ...p,
    cover: p.property_images.find((img) => img.is_cover) ?? p.property_images[0] ?? null,
  }))
}
```

### Image URL Helper
```typescript
// src/lib/utils/image-url.ts
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const BUCKET = 'property-images'

export function getImageUrl(storagePath: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${storagePath}`
}

export function getOGImageUrl(propertyId: string, updatedAt: string): string {
  const path = `${propertyId}/og-cover.jpg`
  const version = new Date(updatedAt).getTime()
  return `${getImageUrl(path)}?v=${version}`
}
```

### OG Description Formatter
```typescript
export function formatOGDescription(property: {
  price: number | null
  bedrooms: number | null
  bathrooms: number | null
  area: number | null
  neighborhood: string | null
}): string {
  const parts: string[] = []
  if (property.price) parts.push(formatCurrency(property.price))
  if (property.bedrooms) parts.push(`${property.bedrooms} quartos`)
  if (property.bathrooms) parts.push(`${property.bathrooms} banheiros`)
  if (property.area) parts.push(`${property.area}m2`)
  if (property.neighborhood) parts.push(property.neighborhood)
  return parts.join(' | ')
}
```

### WhatsApp Phone Number Formatting
```typescript
// Phone stored as "11999887766" -- wa.me needs country code
export function formatWhatsAppUrl(phone: string, message: string): string {
  // Ensure country code (Brazil = 55)
  const cleanPhone = phone.replace(/\D/g, '')
  const fullPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`
  return `https://wa.me/${fullPhone}?text=${encodeURIComponent(message)}`
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `getStaticProps` + `getServerSideProps` | `generateMetadata` + RSC | Next.js 13+ (App Router) | OG tags generated server-side in same file as page component |
| `next-seo` library | Built-in `Metadata` API | Next.js 13.2+ | No external dependency needed for SEO/OG tags |
| Swiper 9-10 (separate react package) | Swiper 12 (unified package) | Swiper 11+ | Single `swiper` npm package, import from `swiper/react` |
| `next/head` for meta tags | `generateMetadata` function | Next.js 13+ | Server-side only, streaming support, type-safe |
| Manual WhatsApp URL scheme | `wa.me` universal links | Current standard | Works across platforms without platform detection |

**Deprecated/outdated:**
- `next-seo`: Not needed with Next.js built-in Metadata API
- `react-id-swiper`: Abandoned wrapper, use official Swiper React components
- `next/head`: Replaced by `generateMetadata` in App Router

## Open Questions

1. **TT Firs Neue Font Loading**
   - What we know: Brand identity specifies TT Firs Neue for headlines. It is a commercial font (not on Google Fonts).
   - What's unclear: Are the font files available in the brand assets directory? Can they be self-hosted?
   - Recommendation: Check brand assets folder for .woff2 files. If available, use `next/font/local`. If not, use Poppins for everything (already specified as body font in brand guidelines, available on Google Fonts).

2. **WhatsApp OG Image Cache Busting Effectiveness**
   - What we know: `?v=timestamp` query parameter should make WhatsApp treat URLs as new
   - What's unclear: Some reports suggest WhatsApp may strip query params or cache by domain. The 200KB limit is community-reported.
   - Recommendation: Implement `?v=timestamp` approach. Test empirically with real WhatsApp shares after deployment. The OG image generation already targets <200KB.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.0 (unit) + Playwright 1.58.2 (E2E) |
| Config file | vitest.config.ts, playwright.config.ts |
| Quick run command | `npm run test` |
| Full suite command | `npm run test && npm run test:e2e` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| LIST-01 | Property cards with cover, price, specs, neighborhood | E2E | `npx playwright test e2e/listing.spec.ts` | No - Wave 0 |
| LIST-02 | Filter by property type | E2E | `npx playwright test e2e/listing.spec.ts` | No - Wave 0 |
| LIST-03 | Filter by price range | E2E | `npx playwright test e2e/listing.spec.ts` | No - Wave 0 |
| LIST-04 | Filter by bedrooms | E2E | `npx playwright test e2e/listing.spec.ts` | No - Wave 0 |
| LIST-05 | Client-side filtering with result count | E2E | `npx playwright test e2e/listing.spec.ts` | No - Wave 0 |
| LIST-06 | Featured properties highlighted section | E2E | `npx playwright test e2e/listing.spec.ts` | No - Wave 0 |
| LIST-07 | Status badge on cards | E2E | `npx playwright test e2e/listing.spec.ts` | No - Wave 0 |
| LIST-08 | Tappable card navigates to detail | E2E | `npx playwright test e2e/listing.spec.ts` | No - Wave 0 |
| DETL-01 | Full property info displayed | E2E | `npx playwright test e2e/detail.spec.ts` | No - Wave 0 |
| DETL-02 | Fullscreen swipeable gallery with pinch-zoom | manual-only | Manual: open on mobile, swipe and pinch | N/A |
| DETL-03 | Photo count indicator in gallery | E2E | `npx playwright test e2e/detail.spec.ts` | No - Wave 0 |
| DETL-04 | Map showing property location | E2E | `npx playwright test e2e/detail.spec.ts` | No - Wave 0 |
| DETL-05 | Sticky WhatsApp button with pre-filled message | E2E | `npx playwright test e2e/detail.spec.ts` | No - Wave 0 |
| DETL-06 | Share via Web Share API or copy link | manual-only | Manual: test on mobile for native share, desktop for copy | N/A |
| DETL-07 | Sold/reserved properties remain viewable with status | E2E | `npx playwright test e2e/detail.spec.ts` | No - Wave 0 |
| WAPP-01 | Dynamic OG meta tags per property | unit | `npx vitest run src/__tests__/og-metadata.test.ts` | No - Wave 0 |
| WAPP-02 | OG image under 200KB at 1200x630 | unit | `npx vitest run src/__tests__/og-metadata.test.ts` | No - Wave 0 |
| WAPP-03 | OG description includes price and specs | unit | `npx vitest run src/__tests__/og-metadata.test.ts` | No - Wave 0 |
| WAPP-04 | WhatsApp preview shows photo, title, price | manual-only | Manual: share link on WhatsApp, verify preview | N/A |
| WAPP-05 | URL versioning for cache busting | unit | `npx vitest run src/__tests__/og-metadata.test.ts` | No - Wave 0 |

### Sampling Rate
- **Per task commit:** `npm run test`
- **Per wave merge:** `npm run test && npm run test:e2e`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `e2e/listing.spec.ts` -- covers LIST-01 through LIST-08
- [ ] `e2e/detail.spec.ts` -- covers DETL-01 through DETL-07
- [ ] `src/__tests__/og-metadata.test.ts` -- covers WAPP-01, WAPP-02, WAPP-03, WAPP-05
- [ ] Test seed data: properties with images in Supabase for E2E tests

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| LIST-01 | Property cards with cover photo, price, specs, neighborhood | PropertyCard component using existing formatCurrency, getImageUrl helper, Supabase query with property_images join |
| LIST-02 | Filter by property type (casa, apartamento) | Client-side filter on property_type enum from existing schema |
| LIST-03 | Filter by price range | Client-side filter with min/max range on price field |
| LIST-04 | Filter by bedrooms | Client-side filter on bedrooms field |
| LIST-05 | Instant client-side filtering with result count | useMemo pattern with all properties fetched server-side, count display |
| LIST-06 | Featured properties highlighted section | Sort by featured flag (already in schema), render separate section |
| LIST-07 | Status badge on property cards | Reuse existing PropertyStatusBadge component from admin |
| LIST-08 | Tappable card navigates to detail | Next.js Link wrapping entire card component |
| DETL-01 | Full property info: all specs, description, address | Server-side fetch of single property with all fields |
| DETL-02 | Fullscreen swipeable gallery with pinch-to-zoom | Swiper 12 with Zoom + Navigation + Pagination modules |
| DETL-03 | Photo count indicator in gallery | Swiper Pagination module with `type: 'fraction'` |
| DETL-04 | Property location on map | react-leaflet read-only map (reuse admin pattern with dynamic import) |
| DETL-05 | Sticky WhatsApp button with pre-filled message | wa.me deep link, phone from site_settings, sticky positioned button |
| DETL-06 | Share via Web Share API or copy link | navigator.share with navigator.clipboard.writeText fallback |
| DETL-07 | Sold/reserved properties viewable with status display | PropertyStatusBadge on detail page, no access restriction |
| WAPP-01 | Dynamic OG meta tags per property | generateMetadata with openGraph fields in detail page |
| WAPP-02 | OG image optimized to <200KB at 1200x630 | Already handled by Phase 3 OG image generation pipeline |
| WAPP-03 | OG description includes price and specs | formatOGDescription helper composing price + specs string |
| WAPP-04 | WhatsApp preview shows photo, title, price correctly | Combination of WAPP-01 + WAPP-02 + WAPP-03, manual verification |
| WAPP-05 | URL versioning for cache busting | Append ?v=timestamp to OG image URL using property.updated_at |
</phase_requirements>

## Sources

### Primary (HIGH confidence)
- Next.js official docs: generateMetadata API reference (https://nextjs.org/docs/app/api-reference/functions/generate-metadata) -- openGraph fields, metadataBase, streaming metadata, dynamic routes
- Swiper official React docs (https://swiperjs.com/react) -- v12.1.2, Zoom/Navigation/Pagination modules, React component API
- MDN Web Share API (https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share) -- browser support, HTTPS requirement, transient activation

### Secondary (MEDIUM confidence)
- WhatsApp OG requirements (community-verified): 1200x630px, JPEG format, absolute URLs, <300KB for reliable large preview
- Facebook developer docs on link previews (https://developers.facebook.com/documentation/business-messaging/whatsapp/link-previews/) -- confirms og:title, og:description, og:image requirements

### Tertiary (LOW confidence)
- WhatsApp cache busting via query parameters -- community-reported, needs empirical testing
- 200KB OG image limit for WhatsApp -- community-reported, official docs say <600KB for large preview

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in project or well-established (Swiper)
- Architecture: HIGH - Next.js App Router patterns well-documented, existing codebase provides clear patterns
- Pitfalls: HIGH - All pitfalls verified through official docs or existing project experience
- OG/WhatsApp specifics: MEDIUM - WhatsApp caching behavior is not fully documented officially

**Research date:** 2026-03-14
**Valid until:** 2026-04-14 (stable domain, 30 days)
