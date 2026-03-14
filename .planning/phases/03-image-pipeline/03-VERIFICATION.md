---
phase: 03-image-pipeline
verified: 2026-03-14T04:00:00Z
status: gaps_found
score: 3/4 must-haves verified
re_verification: false
gaps:
  - truth: "System automatically generates optimized variants (thumbnail, card, detail, OG at 1200x630) from each uploaded photo"
    status: partial
    reason: "Only OG (1200x630) variant is generated. No thumbnail, card, or detail variants are produced. IMG-07 and ROADMAP SC4 both list all four variants. The research document scoped delivery to one compressed JPEG + OG only due to Supabase free-tier Image Transformation limits, but this narrowing was never reflected back into the ROADMAP success criterion or IMG-07 description."
    artifacts:
      - path: "src/components/admin/image-manager/og-image.ts"
        issue: "Generates OG variant only. No thumbnail, card, or detail generation functions exist."
      - path: "src/actions/images.ts"
        issue: "uploadOGImage stores OG variant only. No uploadThumbnail, uploadCard, or uploadDetail actions exist."
    missing:
      - "Clarify whether IMG-07 and ROADMAP SC4 should be updated to reflect the approved architectural decision (single JPEG + OG only), OR implement thumbnail/card/detail variant generation"
      - "If the intent is one compressed JPEG + OG (as documented in research), update ROADMAP SC4 to read: 'System generates an OG variant (1200x630 JPEG, under 200KB) from the cover photo' and update IMG-07 to match"
      - "If full variants are required, implement thumbnail (~200px), card (~600px), and detail (~1200px) variants using canvas or browser-image-compression with different maxWidthOrHeight values"
human_verification:
  - test: "Upload 3 photos via drag-and-drop, observe progress bars"
    expected: "Each photo shows compressing then uploading state with percentage; toasts on success"
    why_human: "Progress overlay rendering and animation cannot be verified by grep"
  - test: "Drag thumbnails to reorder, refresh page"
    expected: "Order persists after page refresh (server-persisted positions)"
    why_human: "Requires live DnD interaction and navigation to confirm server persistence"
  - test: "Click star icon on a non-cover photo"
    expected: "That photo gets ring-2 ring-primary border, previous cover loses it, toast shows 'Foto de capa atualizada'"
    why_human: "Optimistic UI state transitions require visual inspection"
  - test: "Click X on a photo, observe AlertDialog, confirm deletion"
    expected: "AlertDialog shows 'Excluir esta foto?' / 'Esta acao nao pode ser desfeita', photo removed after confirm"
    why_human: "AlertDialog interaction requires browser"
  - test: "Create a new property and save"
    expected: "Toast says 'Imovel criado! Agora adicione as fotos.' and browser navigates to /admin/imoveis/{id}/editar with Fotos section visible"
    why_human: "Requires full form submission and navigation flow"
  - test: "Set a cover photo and check Supabase Storage"
    expected: "A file named og-cover.jpg appears at {propertyId}/og-cover.jpg in the property-images bucket"
    why_human: "OG generation is fire-and-forget and requires Supabase Storage inspection"
---

# Phase 3: Image Pipeline Verification Report

**Phase Goal:** The broker can upload and manage property photos that are automatically optimized to stay within free-tier storage limits and produce WhatsApp-ready images
**Verified:** 2026-03-14T04:00:00Z
**Status:** gaps_found — 3/4 success criteria verified; SC4 (optimized variants) is partial
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths (from ROADMAP Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Admin can drag-and-drop up to 15 photos per property and sees upload progress for each image | VERIFIED | `ImageDropzone` handles native drag events and `<input multiple>`. `useImageUpload` enforces `MAX_IMAGES_PER_PROPERTY = 15`. Progress tracked per item: compression 10-80%, upload 85-100%. `ImageThumbnail` renders `<Progress>` overlay with percentage display. |
| 2 | Photos are compressed client-side before upload (raw phone photos reduced to under 400KB) | VERIFIED | `useImageUpload` calls `browser-image-compression` with `maxSizeMB: 0.4`, `maxWidthOrHeight: 800`, `initialQuality: 0.8`, `fileType: 'image/jpeg'`. HEIC files dynamically converted via `heic2any` before compression. |
| 3 | Admin can reorder photos via drag-and-drop, set one as cover, and delete individual photos with confirmation | VERIFIED | `ImageGrid` uses `@dnd-kit` `DndContext` + `SortableContext` + `arrayMove` + `reorderImages` server action on drag end. `setCoverImage` server action called optimistically from `ImageManager.handleSetCover`. `ImageThumbnail` wraps delete in `AlertDialog` with PT-BR confirmation text. |
| 4 | System automatically generates optimized variants (thumbnail, card, detail, OG at 1200x630) from each uploaded photo | PARTIAL | OG (1200x630 JPEG under 200KB) is generated in `og-image.ts` using Canvas API, called from `ImageManager.handleSetCover` as fire-and-forget. **No thumbnail, card, or detail variants are generated.** Research doc explicitly chose "single optimized JPEG + OG only" to avoid Supabase paid Image Transformations, but this scoping was not reflected back into ROADMAP SC4 or IMG-07. |

**Score:** 3/4 truths verified

---

## Required Artifacts

### Plan 01 Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/lib/validations/image.ts` | Zod schema for image file validation | VERIFIED | Exports `imageFileSchema`, `MAX_IMAGES_PER_PROPERTY`, `MAX_FILE_SIZE_MB`, `MAX_FILE_SIZE_BYTES`, `ACCEPTED_IMAGE_TYPES`. File is 30 lines of substantive code. |
| `src/actions/images.ts` | Server Actions for image CRUD | VERIFIED | Exports `uploadImage`, `deleteImage`, `reorderImages`, `setCoverImage`, `uploadOGImage`. All use `createClient()` + `revalidatePath`. Substantive implementation with proper error handling. |
| `src/components/admin/image-manager/use-image-upload.ts` | Client hook for compression and upload orchestration | VERIFIED | Exports `useImageUpload` returning `{uploadFiles, uploadQueue, isUploading}`. Full compression pipeline: validation, HEIC conversion, browser-image-compression, sequential queue, per-file progress, limit enforcement, preview URL cleanup. |

### Plan 02 Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/components/admin/image-manager/image-manager.tsx` | Main container component | VERIFIED | Exports `ImageManager`. Orchestrates dropzone, grid, useImageUpload hook, cover/delete handlers, photo counter badge, OG fire-and-forget. 140 lines of substantive code. |
| `src/components/admin/image-manager/image-dropzone.tsx` | Drag-and-drop upload zone | VERIFIED | Exports `ImageDropzone`. Native HTML5 dragover/drop events, hidden file input with accept types, visual dragover feedback (border-primary), disabled state (pointer-events-none opacity-50). PT-BR labels. |
| `src/components/admin/image-manager/image-grid.tsx` | Sortable grid with @dnd-kit | VERIFIED | Exports `ImageGrid`. `DndContext` + `SortableContext` + `rectSortingStrategy`. `arrayMove` on drag end, `reorderImages` server action called, optimistic revert on error. Grid `grid-cols-2 md:grid-cols-3`. Queue items rendered non-sortable at end. |
| `src/components/admin/image-manager/image-thumbnail.tsx` | Individual photo card with actions | VERIFIED | Exports `ImageThumbnail` and `ImageRecord` type. Star icon (filled when `is_cover`), `ring-2 ring-primary` cover highlight, `AlertDialog` delete confirmation, progress overlay with `<Progress>` component, error overlay in red. |

### Plan 03 Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/components/admin/image-manager/og-image.ts` | Client-side OG image generation utility | VERIFIED | Exports `generateOGImage` and `generateAndUploadOG`. Canvas API with cover-fit scaling, JPEG quality 0.75 with 0.6 fallback if >200KB. Dynamic import of `uploadOGImage` to maintain server/client boundary. |

---

## Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `src/actions/images.ts` | supabase storage + property_images table | `supabase.storage.from('property-images')` | WIRED | Pattern verified at lines 24, 67, 203 of images.ts. DB inserts/queries at lines 36, 54 of images.ts. |
| `src/components/admin/image-manager/use-image-upload.ts` | browser-image-compression | dynamic `import('browser-image-compression')` | WIRED | Dynamic import at line 83. Result used to compress `processedFile`, returned blob passed to `uploadImage`. |
| `src/components/admin/image-manager/image-manager.tsx` | `use-image-upload.ts` | `useImageUpload(propertyId)` | WIRED | Line 27: `const { uploadFiles, uploadQueue, isUploading } = useImageUpload(propertyId)`. All three returns consumed. |
| `src/components/admin/image-manager/image-grid.tsx` | `src/actions/images.ts` | `reorderImages(propertyId, orderedIds)` | WIRED | Line 19: import. Line 108: called in `handleDragEnd` after `arrayMove`. Result checked for error; reverts on failure. |
| `src/app/admin/imoveis/[id]/editar/page.tsx` | `image-manager.tsx` | `<ImageManager>` rendered in edit page | WIRED | Line 4: import. Lines 56-60: `<ImageManager propertyId={id} initialImages={(images ?? []) as ImageRecord[]} supabaseUrl={supabaseUrl} />` below PropertyForm. Images fetched from `property_images` table on lines 24-28. |
| `src/components/admin/image-manager/image-manager.tsx` | `og-image.ts` | `generateAndUploadOG` called after setCoverImage | WIRED | Line 11: import. Lines 83-87: fire-and-forget call inside `handleSetCover` after successful `setCoverImage`, with error toast on failure. |
| `src/actions/images.ts` | supabase storage | `og-cover.jpg` path with upsert | WIRED | `uploadOGImage` at line 188. Path `${propertyId}/og-cover.jpg` (line 200), `upsert: true` (line 205). |
| `og-image.ts` | canvas API | `canvas.toBlob` | WIRED | `canvasToBlob` function at line 41 wraps `canvas.toBlob()` returning a Promise. Called at lines 32 and 35. |

---

## Requirements Coverage

All 7 Phase 3 requirements claimed across the three plans:

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| IMG-01 | Plan 02 | Admin can upload multiple photos (up to 15) via drag-and-drop | SATISFIED | `ImageDropzone` with `multiple` input, `MAX_IMAGES_PER_PROPERTY = 15` enforced in `useImageUpload.uploadFiles` |
| IMG-02 | Plans 01, 02 | Photos compressed client-side before upload (target <400KB) | SATISFIED | `browser-image-compression` with `maxSizeMB: 0.4` in `useImageUpload.processAndUploadFile` |
| IMG-03 | Plan 02 | Admin can reorder photos via drag-and-drop | SATISFIED | `@dnd-kit` sortable grid, `reorderImages` server action called on drag end with optimistic update |
| IMG-04 | Plan 02 | Admin can set a photo as cover | SATISFIED | Star icon in `ImageThumbnail`, `setCoverImage` server action, optimistic cover state in `ImageManager` |
| IMG-05 | Plan 02 | Admin can delete individual photos with confirmation | SATISFIED | `AlertDialog` in `ImageThumbnail` with PT-BR text, `deleteImage` server action with cover promotion |
| IMG-06 | Plans 01, 02 | Upload shows progress indicator per image | SATISFIED | `UploadQueueItem.progress` and `UploadQueueItem.status` drive `<Progress>` and text overlays in `ImageThumbnail` |
| IMG-07 | Plan 03 | System generates optimized variants (thumbnail, card, detail, OG) from uploaded photos | PARTIAL | Only OG (1200x630 JPEG) generated. No thumbnail, card, or detail variants. Research document acknowledged this trade-off but ROADMAP SC4 and IMG-07 still list all four variants. |

**Orphaned requirements:** None. All 7 IMG-* requirements appear in plan frontmatter and REQUIREMENTS.md traceability table.

---

## Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/actions/images.ts` | 42 | Dead variable `nextPosition` assigned (`existingImages && existingImages.length > 0 ? 1 : 0`) but never used — actual position computed from `count` on line 51 | Info | No functional impact; lint warning / code smell only |
| `src/components/admin/image-manager/image-grid.tsx` | 161-162 | `onSetCover={() => {}}` and `onDelete={() => {}}` for in-flight queue items | Info | Intentional by design — actions are unavailable while images are uploading. Not a stub. |

No blocker anti-patterns. No TODO/FIXME/placeholder comments found in image-manager directory.

---

## Human Verification Required

### 1. Drag-and-Drop Upload with Progress

**Test:** Navigate to a property edit page. Drag 2-3 JPEG photos onto the dropzone.
**Expected:** Instant thumbnail previews appear. Each shows a progress overlay cycling through "Comprimindo..." (with percentage) then "Enviando..." then the final image with action buttons.
**Why human:** Progress animation and overlay transitions cannot be verified by static analysis.

### 2. Photo Reorder Persistence

**Test:** Drag thumbnails to a different order. Refresh the page.
**Expected:** Photos appear in the reordered sequence after refresh (server-side positions persisted).
**Why human:** Requires live drag interaction and page navigation to verify server persistence.

### 3. Cover Photo Selection

**Test:** Click the star icon on a non-cover photo.
**Expected:** That photo immediately gets a visible primary-color ring border. The previous cover photo loses its ring. Toast "Foto de capa atualizada" appears.
**Why human:** Optimistic state rendering and CSS ring visibility require visual inspection.

### 4. Delete Confirmation Flow

**Test:** Click the X button on any uploaded photo.
**Expected:** AlertDialog appears with title "Excluir esta foto?" and body "Esta acao nao pode ser desfeita...". Clicking "Cancelar" dismisses without deleting. Clicking "Excluir" removes the photo and shows toast "Foto excluida".
**Why human:** AlertDialog interaction requires browser rendering.

### 5. Create-to-Edit Redirect

**Test:** Create a new property by filling out the form and clicking save.
**Expected:** Toast "Imovel criado! Agora adicione as fotos." appears and browser navigates to `/admin/imoveis/{new-id}/editar` where the Fotos section is visible below the property form.
**Why human:** Requires full form submission and navigation flow.

### 6. OG Image Generation on Cover Set

**Test:** Set a cover photo on a property, then check Supabase Storage dashboard.
**Expected:** A file `{propertyId}/og-cover.jpg` exists in the `property-images` bucket, sized under 200KB.
**Why human:** Fire-and-forget OG upload is asynchronous and requires Supabase Storage inspection.

---

## Gaps Summary

**One gap blocking full goal achievement:**

**Success Criterion 4 (partial):** The ROADMAP states "System automatically generates optimized variants (thumbnail, card, detail, OG at 1200x630)" but only the OG (1200x630) variant is generated. The research document (`03-RESEARCH.md`) explicitly documented the decision to upload "a single compressed JPEG per photo (~400KB, 800px max width)" and use "Next.js `<Image>` with `sizes` prop for responsive display" instead of generating multiple variants — specifically to avoid Supabase Storage Image Transformations that exceed the free tier after 100 images.

This is an alignment gap between the ROADMAP success criterion (which lists 4 variants) and the approved architectural decision (1 JPEG + 1 OG). The implementation correctly followed the research constraints. The resolution is either:

**Option A (preferred):** Update ROADMAP SC4 and IMG-07 to reflect the approved architecture: "System generates an OG image variant (1200x630 JPEG, under 200KB) from the cover photo for WhatsApp preview." This acknowledges that responsive display sizes are handled by CSS/Next.js `<Image>` sizing, not separate file uploads.

**Option B:** Implement thumbnail (~200px), card (~600px), and detail (~1200px) variant generation using `browser-image-compression` with different `maxWidthOrHeight` values, uploading to predictable paths like `{propertyId}/{imageId}-thumb.jpg`. This would satisfy IMG-07 and SC4 literally but was explicitly scoped out in research due to free-tier storage constraints.

The dead variable `nextPosition` in `src/actions/images.ts` (line 42) is a minor code smell with no functional impact.

---

*Verified: 2026-03-14T04:00:00Z*
*Verifier: Claude (gsd-verifier)*
