---
phase: 03
slug: image-pipeline
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-13
---

# Phase 03 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest (already configured) |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run --reporter=verbose` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run --reporter=verbose`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | IMG-02 | unit | `npx vitest run src/__tests__/image-compression.test.ts` | ❌ W0 | ⬜ pending |
| 03-01-02 | 01 | 1 | IMG-01, IMG-06 | unit | `npx vitest run src/__tests__/image-upload.test.ts` | ❌ W0 | ⬜ pending |
| 03-02-01 | 02 | 2 | IMG-03, IMG-04 | unit | `npx vitest run src/__tests__/image-manager.test.ts` | ❌ W0 | ⬜ pending |
| 03-02-02 | 02 | 2 | IMG-05 | unit | `npx vitest run src/__tests__/image-delete.test.ts` | ❌ W0 | ⬜ pending |
| 03-03-01 | 03 | 2 | IMG-07 | unit | `npx vitest run src/__tests__/image-variants.test.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Test stubs for image compression, upload, manager, delete, variants
- [ ] Existing vitest infrastructure covers framework needs

*Existing infrastructure covers framework requirements. Test files created during execution.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Drag-and-drop upload UX | IMG-01 | Browser DnD API requires real browser | Open edit page, drag photos onto dropzone, verify preview grid |
| Drag-and-drop reorder | IMG-03 | @dnd-kit requires pointer events | Drag thumbnails in grid, verify order updates |
| Upload progress indicator | IMG-06 | Visual feedback timing | Upload large photo, verify progress bar animates |
| HEIC conversion | IMG-02 | Requires real iPhone photo | Upload .heic file, verify conversion to JPEG |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
