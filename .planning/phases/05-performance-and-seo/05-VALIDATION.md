---
phase: 5
slug: performance-and-seo
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-14
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.0 + jsdom (unit) + Playwright (E2E) |
| **Config file** | vitest.config.ts, playwright.config.ts |
| **Quick run command** | `npx vitest run` |
| **Full suite command** | `npx vitest run && npx playwright test` |
| **Estimated runtime** | ~20 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run`
- **After every plan wave:** Run `npx vitest run && npx playwright test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 20 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 05-01-01 | 01 | 1 | PERF-02 | unit | `npx vitest run src/__tests__/skeletons.test.ts` | ❌ W0 | ⬜ pending |
| 05-01-02 | 01 | 1 | PERF-03 | unit | `npx vitest run src/__tests__/image-loading.test.ts` | ❌ W0 | ⬜ pending |
| 05-01-03 | 01 | 1 | PERF-04 | manual | Lighthouse audit with 4G throttling | N/A | ⬜ pending |
| 05-02-01 | 02 | 2 | SEO-01 | unit | `npx vitest run src/__tests__/json-ld.test.ts` | ❌ W0 | ⬜ pending |
| 05-02-02 | 02 | 2 | SEO-02 | unit | `npx vitest run src/__tests__/sitemap.test.ts` | ❌ W0 | ⬜ pending |
| 05-02-03 | 02 | 2 | SEO-03 | E2E | `npx playwright test tests/e2e/seo.spec.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/__tests__/skeletons.test.ts` — stubs for PERF-02
- [ ] `src/__tests__/image-loading.test.ts` — stubs for PERF-03
- [ ] `src/__tests__/json-ld.test.ts` — stubs for SEO-01
- [ ] `src/__tests__/sitemap.test.ts` — stubs for SEO-02
- [ ] `tests/e2e/seo.spec.ts` — stubs for SEO-03

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Mobile-first responsive layout | PERF-01 | Visual verification across breakpoints | Open site on mobile, tablet, desktop — check no horizontal scroll, touch targets adequate |
| LCP under 2.5s on 4G | PERF-04 | Requires Lighthouse with throttling | Chrome DevTools > Lighthouse > Mobile > Simulated 4G — verify LCP < 2.5s |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 20s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
