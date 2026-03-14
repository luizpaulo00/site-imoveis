---
phase: 04-public-site-and-whatsapp
plan: 01
subsystem: ui
tags: [nextjs, poppins, supabase, property-listing, client-filters, route-groups]

requires:
  - phase: 02-property-crud
    provides: Property CRUD with images, property schema, formatCurrency
  - phase: 03-image-pipeline
    provides: Image upload/management, cover photos, OG generation

provides:
  - Public route group with Poppins/TT Firs Neue branded layout
  - Property listing page with cards, filters, and featured section
  - getPublicProperties/getPublicSettings server-side queries
  - getImageUrl/getOGImageUrl helpers for Supabase storage
  - Brand logo in public/assets/logo.svg

affects: [04-02-property-detail, 04-03-whatsapp-integration, og-meta-tags]

tech-stack:
  added: [poppins-font, tt-firs-neue-local-font]
  patterns: [public-route-group, server-component-data-fetching, client-side-filtering]

key-files:
  created:
    - src/lib/queries/properties.ts
    - src/lib/queries/settings.ts
    - src/lib/utils/image-url.ts
    - src/app/(public)/layout.tsx
    - src/app/(public)/page.tsx
    - src/components/public/header.tsx
    - src/components/public/footer.tsx
    - src/components/public/property-card.tsx
    - src/components/public/property-listing.tsx
    - src/components/public/property-filters.tsx
    - public/assets/logo.svg
  modified:
    - src/app/layout.tsx

key-decisions:
  - "Used img tag for property cover photos (Supabase external URLs, no Next.js image optimization needed)"
  - "Local font via src/fonts/ directory with relative path from route group layout"
  - "Client-side filtering with useMemo for instant results without server round-trips"
  - "Reused PropertyStatusBadge from admin components for consistency"

patterns-established:
  - "Public route group (public) pattern: layout fetches settings, components are in src/components/public/"
  - "Server queries in src/lib/queries/ separate from server actions"
  - "Image URL construction via getImageUrl helper, not inline string building"

requirements-completed: [LIST-01, LIST-02, LIST-03, LIST-04, LIST-05, LIST-06, LIST-07, LIST-08]

duration: 5min
completed: 2026-03-14
---

# Phase 4 Plan 01: Public Listing Page Summary

**Public listing page with Poppins-branded layout, property cards with cover photos/prices/specs, client-side filters (type/price/bedrooms), featured highlights, and status badges**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-14T13:44:34Z
- **Completed:** 2026-03-14T13:49:33Z
- **Tasks:** 3
- **Files modified:** 12

## Accomplishments
- Public route group with branded header (logo), footer (broker info, WhatsApp link), Poppins + TT Firs Neue fonts
- Property listing with cover photo cards, formatted R$ prices, bedroom/bathroom/area specs, status badges
- Client-side filters for type, price range, bedrooms with instant result count
- Featured properties section with orange highlight ring
- Server-side data queries for properties (with cover image resolution) and settings

## Task Commits

Each task was committed atomically:

1. **Task 1: Public data queries, image URL helper, and brand assets** - `8ea56f9b` (feat)
2. **Task 2: Public layout with header, footer, and Poppins font** - `61d72114` (feat)
3. **Task 3: Property listing with cards, filters, and featured section** - `f636371e` (feat)

## Files Created/Modified
- `src/lib/queries/properties.ts` - getPublicProperties with cover image resolution
- `src/lib/queries/settings.ts` - getPublicSettings for WhatsApp/site name/broker
- `src/lib/utils/image-url.ts` - getImageUrl and getOGImageUrl helpers
- `public/assets/logo.svg` - Brand logo from identity assets
- `src/app/(public)/layout.tsx` - Public layout with Poppins, header, footer
- `src/app/(public)/page.tsx` - Server component fetching and rendering listing
- `src/components/public/header.tsx` - Logo-based header
- `src/components/public/footer.tsx` - Dark teal footer with broker info and WhatsApp
- `src/components/public/property-card.tsx` - Card with photo, price, specs, badge, link
- `src/components/public/property-listing.tsx` - Client component with filters and grid
- `src/components/public/property-filters.tsx` - Type, price, bedrooms filter controls
- `src/app/layout.tsx` - Added metadataBase for OG URL resolution

## Decisions Made
- Used img tag for property cover photos instead of Next.js Image (external Supabase URLs)
- Stored TT Firs Neue font in src/fonts/ for Next.js local font import
- Client-side filtering with useMemo for instant results without server calls
- Reused PropertyStatusBadge from admin components
- Deleted root page.tsx, public route group handles `/` directly

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed local font path resolution**
- **Found during:** Task 2 (Public layout)
- **Issue:** Font path `../fonts/tt-firs-neue-bold.ttf` was incorrect from `(public)/layout.tsx` -- needed `../../fonts/`
- **Fix:** Updated relative path to `../../fonts/tt-firs-neue-bold.ttf`
- **Files modified:** src/app/(public)/layout.tsx
- **Verification:** Build passes successfully
- **Committed in:** 61d72114 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Path fix necessary for build. No scope creep.

## Issues Encountered
None beyond the font path fix documented above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Property detail page (Plan 02) can use getPublicProperties pattern and image URL helpers
- WhatsApp integration (Plan 03) can use getPublicSettings and footer WhatsApp link pattern
- OG meta tags ready via metadataBase and getOGImageUrl helper

## Self-Check: PASSED

All 12 files verified present. All 3 task commits verified in git log.

---
*Phase: 04-public-site-and-whatsapp*
*Completed: 2026-03-14*
