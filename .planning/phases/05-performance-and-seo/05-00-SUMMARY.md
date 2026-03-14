---
phase: 05-performance-and-seo
plan: 00
subsystem: testing
tags: [vitest, playwright, test-stubs, tdd, seo, performance]

# Dependency graph
requires:
  - phase: 04-public-site
    provides: "Public pages and components that tests will verify"
provides:
  - "Test stub files for skeleton loading components (PERF-02)"
  - "Test stub files for image lazy/eager loading (PERF-03)"
  - "Test stub files for JSON-LD structured data (SEO-01)"
  - "Test stub files for sitemap generation (SEO-02)"
  - "E2E test stubs for heading hierarchy and semantic HTML (SEO-03)"
affects: [05-01, 05-02, 05-03]

# Tech tracking
tech-stack:
  added: []
  patterns: [it.todo for vitest pending tests, test.skip for Playwright skipped tests]

key-files:
  created:
    - src/__tests__/skeletons.test.ts
    - src/__tests__/image-loading.test.ts
    - src/__tests__/json-ld.test.ts
    - src/__tests__/sitemap.test.ts
    - tests/e2e/seo.spec.ts
  modified: []

key-decisions:
  - "Used it.todo() for vitest stubs (reports as todo, not failure)"
  - "Used test.skip() for Playwright stubs (reports as skipped, not failure)"

patterns-established:
  - "Test stubs with it.todo(): describe expected behavior before implementation"
  - "E2E tests in tests/e2e/ directory separate from unit tests in src/__tests__/"

requirements-completed: [PERF-02, PERF-03, SEO-01, SEO-02, SEO-03]

# Metrics
duration: 1min
completed: 2026-03-14
---

# Phase 5 Plan 00: Test Stubs Summary

**5 test stub files with 21 pending test cases covering skeletons, image loading, JSON-LD, sitemap, and SEO semantics**

## Performance

- **Duration:** 1 min
- **Started:** 2026-03-14T14:32:01Z
- **Completed:** 2026-03-14T14:33:05Z
- **Tasks:** 1
- **Files modified:** 5

## Accomplishments
- Created 4 vitest test stub files with 17 todo test cases
- Created 1 Playwright E2E test stub file with 4 skipped test cases
- All stubs run without errors (vitest reports todos, Playwright file parses cleanly)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create all 5 test stub files for Phase 5** - `f7aecbb7` (test)

## Files Created/Modified
- `src/__tests__/skeletons.test.ts` - 5 todo tests for skeleton loading components
- `src/__tests__/image-loading.test.ts` - 3 todo tests for image lazy/eager loading
- `src/__tests__/json-ld.test.ts` - 5 todo tests for JSON-LD structured data
- `src/__tests__/sitemap.test.ts` - 4 todo tests for sitemap generation
- `tests/e2e/seo.spec.ts` - 4 skipped tests for heading hierarchy and semantic HTML

## Decisions Made
- Used `it.todo()` for vitest stubs -- reports as todo without failure, implementation plans will replace with real tests
- Used `test.skip()` for Playwright stubs -- reports as skipped, Playwright not installed yet so cannot run full suite
- Placed E2E tests in `tests/e2e/` directory to separate from vitest unit tests in `src/__tests__/`

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All test stub files in place for Phase 5 implementation plans (05-01, 05-02, 05-03)
- Implementation plans can reference these files in their verify blocks
- Wave 0 Nyquist compliance satisfied

---
*Phase: 05-performance-and-seo*
*Completed: 2026-03-14*
