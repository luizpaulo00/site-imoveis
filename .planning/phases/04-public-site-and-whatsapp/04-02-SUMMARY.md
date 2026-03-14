---
phase: 04-public-site-and-whatsapp
plan: 02
subsystem: ui
tags: [nextjs, swiper, leaflet, property-detail, gallery, og-metadata]

requires:
  - phase: 04-public-site-and-whatsapp
    plan: 01
    provides: Public route group, getPublicSettings, getImageUrl, PropertyStatusBadge

provides:
  - Property detail page at /imoveis/[id] with full specs, gallery, map
  - getPropertyWithImages server query
  - PropertyGallery with fullscreen swipe and pinch-to-zoom
  - Read-only PropertyMap with Leaflet
  - Dynamic OG metadata via generateMetadata

affects: [04-03-whatsapp-integration, og-meta-tags]

tech-stack:
  added: [swiper]
  patterns: [swiper-gallery, dynamic-import-map, generateMetadata]

key-files:
  created:
    - src/lib/queries/property.ts
    - src/components/public/property-gallery.tsx
    - src/components/public/property-detail.tsx
    - src/components/public/property-map.tsx
    - src/components/public/property-map-inner.tsx
    - src/app/(public)/imoveis/[id]/page.tsx
  modified: []

key-decisions:
  - "Swiper 12 with Zoom+Navigation+Pagination modules for gallery with pinch-to-zoom"
  - "Separate map-inner component with dynamic import ssr:false (same pattern as admin)"
  - "generateMetadata for OG tags with formatOGDescription helper inline in page"
  - "Status banner at top of detail for sold/reserved, plus badge next to title"

patterns-established:
  - "PropertyGallery inline+fullscreen pattern with body scroll lock"
  - "Read-only map component with dragging disabled, zoom enabled"

requirements-completed: [DETL-01, DETL-02, DETL-03, DETL-04, DETL-07]

duration: 3min
completed: 2026-03-14
---

# Phase 4 Plan 02: Property Detail Page Summary

**Property detail page with Swiper fullscreen gallery (swipe + pinch-to-zoom + fraction counter), specs/description/price display, read-only Leaflet map, and sold/reserved status banners with OG metadata**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-14T13:52:38Z
- **Completed:** 2026-03-14T13:55:32Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Swiper-based photo gallery with inline preview (fraction pagination) and fullscreen modal (zoom, navigation, fraction count)
- Property detail component with all specs (bedrooms, bathrooms, parking, area), description, price in brand orange, details table
- Read-only Leaflet map showing property location (SSR-safe with dynamic import)
- Status banners for sold/reserved properties, remaining fully viewable
- Dynamic OG metadata via generateMetadata with title, description (price|specs|neighborhood), and OG image URL
- Server-side data fetching with getPropertyWithImages query

## Task Commits

Each task was committed atomically:

1. **Task 1: Install Swiper, create property query and gallery component** - `b3ee6414` (feat)
2. **Task 2: Property detail page with specs, map, and status display** - `8fb99ac3` (feat)

## Files Created/Modified
- `src/lib/queries/property.ts` - getPropertyWithImages with ordered images
- `src/components/public/property-gallery.tsx` - Swiper gallery with inline + fullscreen modes
- `src/components/public/property-detail.tsx` - Full detail layout with specs, description, map
- `src/components/public/property-map.tsx` - SSR-safe dynamic import wrapper
- `src/components/public/property-map-inner.tsx` - Read-only Leaflet MapContainer + Marker
- `src/app/(public)/imoveis/[id]/page.tsx` - Server page with generateMetadata for OG tags

## Decisions Made
- Used Swiper 12 with Zoom, Navigation, and Pagination modules for fullscreen gallery
- Created separate map-inner component with dynamic import (ssr: false) following admin pattern
- Placed formatOGDescription inline in page file (simple helper, not worth a separate module)
- Status banner displayed at top of page for reservado/vendido with distinct colors

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- WhatsApp integration (Plan 03) can use the detail page and settings data
- OG metadata already configured via generateMetadata for WhatsApp previews

## Self-Check: PASSED

All 6 files verified present. All 2 task commits verified in git log.

---
*Phase: 04-public-site-and-whatsapp*
*Completed: 2026-03-14*
