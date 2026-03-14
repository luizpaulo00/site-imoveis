---
phase: 05-performance-and-seo
plan: 02
subsystem: seo
tags: [json-ld, structured-data, sitemap, robots, schema-org, seo]

requires:
  - phase: 02-property-crud
    provides: property data model and queries
  - phase: 04-public-site
    provides: public property detail pages
provides:
  - JSON-LD RealEstateListing structured data on property pages
  - Dynamic sitemap.xml with all property URLs
  - robots.txt with sitemap reference
affects: []

tech-stack:
  added: []
  patterns: [schema.org JSON-LD injection via Next.js script tag, Next.js metadata route conventions for sitemap/robots]

key-files:
  created:
    - src/lib/structured-data.ts
    - src/app/sitemap.ts
    - src/app/robots.ts
  modified:
    - src/app/(public)/imoveis/[id]/page.tsx
    - src/__tests__/json-ld.test.ts
    - src/__tests__/sitemap.test.ts

key-decisions:
  - "JSON-LD price as raw number string (Google requirement) via String(property.price)"
  - "Sitemap includes all properties regardless of status (sold/reserved still viewable)"
  - "Used Next.js metadata route conventions (sitemap.ts, robots.ts) for auto-generation"

patterns-established:
  - "Structured data builder pattern: separate module builds JSON-LD object, page injects as script tag"
  - "Next.js metadata routes: sitemap.ts and robots.ts in app root for auto-generated XML/txt"

requirements-completed: [SEO-01, SEO-02, SEO-03]

duration: 2min
completed: 2026-03-14
---

# Phase 5 Plan 2: SEO Structured Data & Sitemap Summary

**JSON-LD RealEstateListing schema on property pages with auto-generated sitemap.xml and robots.txt**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-14T14:35:25Z
- **Completed:** 2026-03-14T14:37:31Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Property detail pages render JSON-LD structured data with RealEstateListing schema (price as raw number, absolute image URLs, geo coordinates)
- Dynamic sitemap.xml auto-generated with home page and all property URLs (absolute)
- robots.txt references sitemap.xml for crawler discoverability
- 13 unit tests covering JSON-LD output, sitemap entries, and robots configuration

## Task Commits

Each task was committed atomically:

1. **Task 1: Create JSON-LD builder and add to property detail page** - `800170e8` (feat)
2. **Task 2: Create dynamic sitemap.ts and robots.ts** - `71ac9b01` (feat)

## Files Created/Modified
- `src/lib/structured-data.ts` - buildPropertyJsonLd function for RealEstateListing schema
- `src/app/(public)/imoveis/[id]/page.tsx` - Added JSON-LD script tag injection
- `src/app/sitemap.ts` - Dynamic sitemap generator querying all properties
- `src/app/robots.ts` - Robots.txt with sitemap reference
- `src/__tests__/json-ld.test.ts` - 7 tests for JSON-LD builder
- `src/__tests__/sitemap.test.ts` - 6 tests for sitemap and robots

## Decisions Made
- JSON-LD price as raw number string via String(property.price) -- Google requires plain number, not formatted currency
- Sitemap includes all properties regardless of status (sold/reserved pages are viewable and should be indexed)
- Used Next.js metadata route conventions (sitemap.ts, robots.ts) for framework-native auto-generation

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Pre-existing TSC error in property-card.tsx (unrelated to plan changes, out of scope)

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- SEO structured data complete, ready for performance optimization plan
- Property pages are now rich-result eligible for Google search

## Self-Check: PASSED

- All 6 created/modified files verified on disk
- Commits 800170e8 and 71ac9b01 verified in git log
- 13/13 tests passing

---
*Phase: 05-performance-and-seo*
*Completed: 2026-03-14*
