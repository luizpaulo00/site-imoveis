---
phase: 03-image-pipeline
plan: 03
subsystem: images
tags: [canvas-api, og-image, jpeg, whatsapp-preview, supabase-storage]

requires:
  - phase: 03-image-pipeline
    provides: Server Actions pattern for image storage, property_images bucket
provides:
  - OG image generator (1200x630 JPEG, cover-fit, <200KB)
  - uploadOGImage server action with upsert to predictable path
  - generateAndUploadOG helper for ImageManager integration
affects: [04-public-site]

tech-stack:
  added: []
  patterns: [canvas-og-generation, quality-fallback-strategy]

key-files:
  created:
    - src/components/admin/image-manager/og-image.ts
  modified:
    - src/actions/images.ts

key-decisions:
  - "Canvas API with cover-fit for OG generation instead of server-side library (no extra dependency)"
  - "Quality fallback from 0.75 to 0.6 if blob exceeds 200KB for WhatsApp compatibility"
  - "Fixed path {propertyId}/og-cover.jpg with upsert for OG images (no DB row needed)"
  - "Decoupled generateAndUploadOG helper for parallel plan development with Plan 02"

patterns-established:
  - "OG image as derived artifact: stored in storage only, no DB row, predictable path"
  - "Dynamic import of server action from client utility to maintain use-server boundary"

requirements-completed: [IMG-07]

duration: 2min
completed: 2026-03-14
---

# Phase 3 Plan 3: OG Image Generation Summary

**Client-side 1200x630 JPEG OG generator using Canvas API with cover-fit and quality fallback, plus uploadOGImage server action at predictable storage path**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-14T02:26:38Z
- **Completed:** 2026-03-14T02:28:38Z
- **Tasks:** 1
- **Files modified:** 2

## Accomplishments
- OG image generator using createImageBitmap + canvas with cover-fit cropping at 1200x630
- Quality fallback strategy: tries JPEG at 0.75 quality, drops to 0.6 if over 200KB
- uploadOGImage server action stores at {propertyId}/og-cover.jpg with upsert (overwrites on cover change)
- Decoupled generateAndUploadOG helper function for ImageManager to call after setting cover

## Task Commits

Each task was committed atomically:

1. **Task 1: Create OG image generator and integrate with cover photo flow** - `4dfdfe10` (feat)

## Files Created/Modified
- `src/components/admin/image-manager/og-image.ts` - OG image generator (generateOGImage, generateAndUploadOG)
- `src/actions/images.ts` - Added uploadOGImage server action for OG variant storage

## Decisions Made
- Used Canvas API for client-side OG generation instead of adding a server-side image processing library (zero new dependencies)
- Cover-fit algorithm with Math.max scaling and center offset for consistent crop behavior
- JPEG quality 0.75 default with 0.6 fallback to stay under 200KB WhatsApp limit
- Fixed storage path {propertyId}/og-cover.jpg with upsert:true so each cover change overwrites the previous OG
- No DB row for OG images -- they are derived artifacts at predictable paths
- Dynamic import of uploadOGImage in generateAndUploadOG to maintain server/client boundary
- 1-year cache control (31536000s) for OG images since path includes upsert overwrite

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- OG images stored at predictable URLs for Phase 4 OG meta tags
- generateAndUploadOG ready for Plan 02's ImageManager to call on cover photo change
- Phase 4 can construct OG image URL as: {SUPABASE_URL}/storage/v1/object/public/property-images/{propertyId}/og-cover.jpg

## Self-Check: PASSED

---
*Phase: 03-image-pipeline*
*Completed: 2026-03-14*
