---
phase: 4
slug: public-site-and-whatsapp
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-14
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.0 (unit) + Playwright 1.58.2 (E2E) |
| **Config file** | vitest.config.ts, playwright.config.ts |
| **Quick run command** | `npm run test` |
| **Full suite command** | `npm run test && npm run test:e2e` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run test`
- **After every plan wave:** Run `npm run test && npm run test:e2e`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 1 | LIST-01 | E2E | `npx playwright test e2e/listing.spec.ts` | ❌ W0 | ⬜ pending |
| 04-01-02 | 01 | 1 | LIST-02,03,04,05 | E2E | `npx playwright test e2e/listing.spec.ts` | ❌ W0 | ⬜ pending |
| 04-01-03 | 01 | 1 | LIST-06 | E2E | `npx playwright test e2e/listing.spec.ts` | ❌ W0 | ⬜ pending |
| 04-01-04 | 01 | 1 | LIST-07,08 | E2E | `npx playwright test e2e/listing.spec.ts` | ❌ W0 | ⬜ pending |
| 04-02-01 | 02 | 1 | DETL-01 | E2E | `npx playwright test e2e/detail.spec.ts` | ❌ W0 | ⬜ pending |
| 04-02-02 | 02 | 1 | DETL-02,03 | manual | Manual: swipe/pinch on mobile | N/A | ⬜ pending |
| 04-02-03 | 02 | 1 | DETL-04 | E2E | `npx playwright test e2e/detail.spec.ts` | ❌ W0 | ⬜ pending |
| 04-02-04 | 02 | 1 | DETL-05,07 | E2E | `npx playwright test e2e/detail.spec.ts` | ❌ W0 | ⬜ pending |
| 04-02-05 | 02 | 1 | DETL-06 | manual | Manual: test native share on mobile | N/A | ⬜ pending |
| 04-03-01 | 03 | 2 | WAPP-01,03 | unit | `npx vitest run src/__tests__/og-metadata.test.ts` | ❌ W0 | ⬜ pending |
| 04-03-02 | 03 | 2 | WAPP-02,05 | unit | `npx vitest run src/__tests__/og-metadata.test.ts` | ❌ W0 | ⬜ pending |
| 04-03-03 | 03 | 2 | WAPP-04 | manual | Manual: share link on WhatsApp, verify preview | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `e2e/listing.spec.ts` — stubs for LIST-01 through LIST-08
- [ ] `e2e/detail.spec.ts` — stubs for DETL-01 through DETL-07
- [ ] `src/__tests__/og-metadata.test.ts` — stubs for WAPP-01, WAPP-02, WAPP-03, WAPP-05
- [ ] Test seed data: properties with images in Supabase for E2E tests

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Fullscreen swipeable gallery with pinch-to-zoom | DETL-02 | Touch gestures cannot be reliably automated | Open on mobile device, swipe left/right, pinch to zoom |
| Web Share API / copy link | DETL-06 | navigator.share requires transient user activation | On mobile: tap share, verify native sheet. On desktop: verify copy to clipboard |
| WhatsApp preview rendering | WAPP-04 | WhatsApp's OG scraper behavior is external | Share link in WhatsApp, verify cover photo, title, and price appear in preview |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
