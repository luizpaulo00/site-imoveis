---
phase: 1
slug: foundation-and-auth
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-12
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 2.x |
| **Config file** | none — Wave 0 creates `vitest.config.ts` |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | AUTH-01 | integration | `npx vitest run src/__tests__/auth.test.ts -t "sign in"` | ❌ W0 | ⬜ pending |
| 01-01-02 | 01 | 1 | AUTH-02 | integration | `npx vitest run src/__tests__/middleware.test.ts -t "refresh"` | ❌ W0 | ⬜ pending |
| 01-01-03 | 01 | 1 | AUTH-03 | integration | `npx vitest run src/__tests__/auth.test.ts -t "sign out"` | ❌ W0 | ⬜ pending |
| 01-01-04 | 01 | 1 | AUTH-04 | unit | `npx vitest run src/__tests__/middleware.test.ts -t "redirect"` | ❌ W0 | ⬜ pending |
| 01-02-01 | 02 | 1 | SETT-01 | unit | `npx vitest run src/__tests__/settings.test.ts -t "whatsapp"` | ❌ W0 | ⬜ pending |
| 01-02-02 | 02 | 1 | SETT-02 | unit | `npx vitest run src/__tests__/settings.test.ts -t "save"` | ❌ W0 | ⬜ pending |
| 01-03-01 | 03 | 1 | INFR-01 | smoke | Manual — verify GitHub Action runs | N/A | ⬜ pending |
| 01-03-02 | 03 | 1 | INFR-02 | manual-only | Check via Supabase dashboard | N/A | ⬜ pending |
| 01-03-03 | 03 | 1 | INFR-03 | integration | `npx vitest run src/__tests__/rls.test.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `vitest.config.ts` — Framework configuration with Next.js + path aliases
- [ ] `src/__tests__/middleware.test.ts` — Covers AUTH-02, AUTH-04
- [ ] `src/__tests__/auth.test.ts` — Covers AUTH-01, AUTH-03
- [ ] `src/__tests__/settings.test.ts` — Covers SETT-01, SETT-02
- [ ] `src/__tests__/validations.test.ts` — Zod schema unit tests
- [ ] Framework install: `npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom`

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Keep-alive cron runs on schedule | INFR-01 | GitHub Actions scheduled workflow | Check Actions tab after 4 days |
| Storage bucket exists with RLS | INFR-02 | Supabase dashboard config | Verify bucket and policies in dashboard |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
