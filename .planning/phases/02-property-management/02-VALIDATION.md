---
phase: 2
slug: property-management
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-12
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1 (unit) + Playwright 1.58 (e2e) |
| **Config file** | vitest.config.ts, playwright.config.ts |
| **Quick run command** | `npm test` |
| **Full suite command** | `npm test && npm run test:e2e` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test`
- **After every plan wave:** Run `npm test && npm run test:e2e`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | PROP-01 | unit | `npx vitest run src/__tests__/properties.test.ts -t "create"` | ❌ W0 | ⬜ pending |
| 02-01-02 | 01 | 1 | PROP-02 | manual | Manual verification with playwright-cli | ❌ | ⬜ pending |
| 02-01-03 | 01 | 1 | PROP-03 | unit | `npx vitest run src/__tests__/properties.test.ts -t "update"` | ❌ W0 | ⬜ pending |
| 02-01-04 | 01 | 1 | PROP-04 | unit | `npx vitest run src/__tests__/properties.test.ts -t "delete"` | ❌ W0 | ⬜ pending |
| 02-02-01 | 02 | 1 | PROP-05 | unit | `npx vitest run src/__tests__/properties.test.ts -t "status"` | ❌ W0 | ⬜ pending |
| 02-02-02 | 02 | 1 | PROP-06 | unit | `npx vitest run src/__tests__/properties.test.ts -t "featured"` | ❌ W0 | ⬜ pending |
| 02-03-01 | 03 | 1 | PROP-07 | unit + e2e | `npx vitest run src/__tests__/properties.test.ts -t "list"` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/__tests__/properties.test.ts` — stubs for PROP-01 through PROP-07 (server action unit tests)
- [ ] `src/__tests__/property-validation.test.ts` — covers Zod schema validation
- [ ] `src/__tests__/currency.test.ts` — covers formatCurrency utility

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Map pin placement | PROP-02 | Leaflet map interaction cannot be unit-tested | Open property form → click map → verify pin appears and lat/lng fields update |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
