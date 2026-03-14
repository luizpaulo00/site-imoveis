# Phase 3: Image Pipeline - Research

**Researched:** 2026-03-13
**Domain:** Client-side image compression, drag-and-drop UI, Supabase Storage
**Confidence:** HIGH

## Summary

This phase adds photo upload and management to the admin property form. The core challenge is delivering a smooth upload experience (drag-and-drop, progress, preview) while keeping images small enough for the Supabase free tier (1GB storage). Client-side compression with `browser-image-compression` handles size reduction. Drag-and-drop reordering uses `@dnd-kit/sortable`. HEIC conversion requires a separate library (`heic2any`) since `browser-image-compression` only handles JPEG/PNG/WebP/BMP.

**Critical finding:** Supabase Storage Image Transformations are NOT free-tier friendly -- only 100 distinct images per project at no cost, then $5/1000. With ~300 photos, this would exceed the free allowance monthly. The decision already accounts for this: compress client-side, upload one optimized version, use CSS/next-image for display sizing. For OG images (1200x630), generate client-side as a separate upload.

**Primary recommendation:** Upload a single compressed JPEG per photo (~400KB, 800px max width). Use Next.js `<Image>` with `sizes` prop for responsive display. Generate OG variant (1200x630) client-side before upload as a separate file.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Inline section in property edit form (not modal) -- new "Fotos" section below existing fields
- Dropzone with drag-and-drop + "Selecionar fotos" button fallback
- Instant preview before upload starts (thumbnail grid)
- Per-image progress bars during upload
- Upload only available after property is saved (needs property_id)
- Visual counter "3/15 fotos" with warning near limit
- Accept JPEG, PNG, WebP -- convert HEIC to JPEG client-side
- 3-column grid desktop, 2-column mobile for management
- Reorder via drag-and-drop in grid
- Cover photo: star icon, click to set, highlighted border (primary color)
- Delete: X icon with AlertDialog confirmation (same pattern as property delete)
- Auto-save on reorder/cover change (no save button)
- Client-side compression with browser-image-compression: 800px max width, quality 0.8, JPEG output
- Single optimized version uploaded (no server-side variant generation)
- Use Supabase Storage Image Transformation via URL params OR CSS/next-image for different sizes
- Component: `<ImageManager propertyId={id} />` separate from property form
- Server Actions for image operations (independent from form submit)

### Claude's Discretion
- Exact compression library (browser-image-compression recommended, evaluate alternatives)
- DnD library (@dnd-kit vs @hello-pangea/dnd)
- Supabase Storage Transformation vs client-side resize strategy
- Thumbnail sizes in grid
- Upload/reorder animations
- Error handling (retry auto vs manual)
- Placeholder/skeleton during loading

### Deferred Ideas (OUT OF SCOPE)
- Public gallery with swipe/fullscreen -- Phase 4 (DETL-02, DETL-03)
- OG image with price/specs overlay -- v2 (VIS2-01)
- Crop/rotate in admin -- not needed for v1
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| IMG-01 | Upload multiple photos (up to 15) via drag-and-drop | Dropzone with input[type=file] + drag events; @dnd-kit not needed here (native HTML5 drag) |
| IMG-02 | Client-side compression before upload (target <400KB) | browser-image-compression with maxSizeMB:0.4, maxWidthOrHeight:800, fileType:image/jpeg |
| IMG-03 | Reorder photos via drag-and-drop | @dnd-kit/sortable with grid strategy; auto-save position via Server Action |
| IMG-04 | Set photo as cover (used in cards and OG) | Toggle is_cover in property_images table; Server Action updates with single-cover constraint |
| IMG-05 | Delete individual photos with confirmation | AlertDialog pattern from property delete; Server Action removes DB row + Storage object |
| IMG-06 | Upload progress indicator per image | browser-image-compression onProgress + Supabase Storage upload progress tracking |
| IMG-07 | Generate optimized variants (thumbnail, card, detail, OG) | Skip server-side generation; use CSS/next-image sizing; OG (1200x630) generated client-side |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| browser-image-compression | ^2.0 | Client-side JPEG compression | 1.5M+ weekly downloads, Web Worker support, onProgress callback |
| heic2any | ^0.0.4 | HEIC to JPEG conversion in browser | Most used client-side HEIC converter, works with browser-image-compression pipeline |
| @dnd-kit/core | ^6.3 | Drag-and-drop foundation | Modular, accessible, React 18/19 compatible |
| @dnd-kit/sortable | ^10.0 | Sortable grid preset | Built on @dnd-kit/core, grid strategy included |
| @dnd-kit/utilities | ^3.2 | CSS transform utilities | Required for sortable animations |

### Supporting (already in project)
| Library | Purpose | When to Use |
|---------|---------|-------------|
| sonner | Toast notifications | Upload success/error feedback |
| lucide-react | Icons | Star (cover), X (delete), Upload, Image icons |
| shadcn/ui (Card, AlertDialog, Skeleton, Progress) | UI components | Photo card, delete confirm, loading, progress bar |
| zod | Validation | File type/size validation schema |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @dnd-kit/sortable | @hello-pangea/dnd | hello-pangea is heavier (fork of react-beautiful-dnd), less modular; @dnd-kit is lighter and more flexible for grid layouts |
| browser-image-compression | compressorjs | compressorjs has no HEIC mention either, smaller community; browser-image-compression has Web Worker + onProgress |
| heic2any | heic-convert | heic-convert is Node.js focused; heic2any is browser-native |

**Recommendation:** Use @dnd-kit/sortable -- it is lighter, more modular, and has better grid support than @hello-pangea/dnd. Use browser-image-compression as decided.

**Installation:**
```bash
npm install browser-image-compression heic2any @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

## Architecture Patterns

### Recommended Component Structure
```
src/
├── components/admin/
│   └── image-manager/
│       ├── image-manager.tsx       # Main container <ImageManager propertyId={id} />
│       ├── image-dropzone.tsx      # Upload dropzone with drag + click
│       ├── image-grid.tsx          # Sortable grid of uploaded photos
│       ├── image-thumbnail.tsx     # Individual photo card (cover star, delete X, progress)
│       └── use-image-upload.ts     # Custom hook: compression, upload, progress tracking
├── actions/
│   └── images.ts                  # Server Actions: uploadImage, deleteImage, reorderImages, setCover
├── lib/
│   └── validations/
│       └── image.ts               # Zod schema for file validation
```

### Pattern 1: Client-Side Compression Pipeline
**What:** Compress and convert images before uploading to Supabase Storage
**When to use:** Every image upload
```typescript
import imageCompression from 'browser-image-compression'
import heic2any from 'heic2any'

async function processImage(file: File): Promise<File> {
  let processedFile = file

  // Convert HEIC to JPEG first
  if (file.type === 'image/heic' || file.type === 'image/heif' || file.name.toLowerCase().endsWith('.heic')) {
    const blob = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.85 })
    processedFile = new File(
      [blob as Blob],
      file.name.replace(/\.heic$/i, '.jpg'),
      { type: 'image/jpeg' }
    )
  }

  // Compress
  const compressed = await imageCompression(processedFile, {
    maxSizeMB: 0.4,
    maxWidthOrHeight: 800,
    useWebWorker: true,
    fileType: 'image/jpeg',
    onProgress: (progress) => { /* update UI */ },
  })

  return compressed
}
```

### Pattern 2: Supabase Storage Upload with Progress
**What:** Upload compressed file to Supabase Storage bucket
```typescript
const { data, error } = await supabase.storage
  .from('property-images')
  .upload(`${propertyId}/${fileName}`, compressedFile, {
    cacheControl: '3600',
    upsert: false,
  })
```
Note: Supabase JS client upload does NOT provide granular progress. Progress comes from the compression step. For upload progress on large files, use XMLHttpRequest or fetch with ReadableStream, but with 400KB files this is unnecessary -- show indeterminate progress during upload.

### Pattern 3: Sortable Grid with @dnd-kit
**What:** Drag-and-drop reordering of photo thumbnails
```typescript
import { DndContext, closestCenter } from '@dnd-kit/core'
import { SortableContext, rectSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// In grid component:
<DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
  <SortableContext items={images} strategy={rectSortingStrategy}>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {images.map(img => <SortableImageThumbnail key={img.id} image={img} />)}
    </div>
  </SortableContext>
</DndContext>

// In thumbnail component:
function SortableImageThumbnail({ image }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: image.id })
  const style = { transform: CSS.Transform.toString(transform), transition }
  return <div ref={setNodeRef} style={style} {...attributes} {...listeners}>...</div>
}
```

### Pattern 4: OG Image Generation (Client-Side)
**What:** Create 1200x630 variant for WhatsApp/social previews
```typescript
async function generateOGImage(file: File): Promise<File> {
  const img = await createImageBitmap(file)
  const canvas = document.createElement('canvas')
  canvas.width = 1200
  canvas.height = 630
  const ctx = canvas.getContext('2d')!
  // Cover-fit: crop to 1200x630 aspect ratio
  const scale = Math.max(1200 / img.width, 630 / img.height)
  const x = (1200 - img.width * scale) / 2
  const y = (630 - img.height * scale) / 2
  ctx.drawImage(img, x, y, img.width * scale, img.height * scale)
  const blob = await new Promise<Blob>(r => canvas.toBlob(r!, 'image/jpeg', 0.8))
  return new File([blob], `og-${file.name}`, { type: 'image/jpeg' })
}
```

### Anti-Patterns to Avoid
- **Uploading raw phone photos:** 5-10MB HEIC files will destroy free-tier storage. Always compress first.
- **Server-side image processing on Supabase free tier:** No Edge Functions with sharp/libvips. Do everything client-side.
- **Relying on Supabase Image Transformations for free:** Only 100 distinct images free, then $5/1000/month. Not viable for ~300 photos.
- **Using Supabase upload progress:** The JS client doesn't expose granular upload progress. Use compression progress instead.
- **Storing position as sequential integers without gaps:** Use float/midpoint positioning for reordering to avoid updating all rows on every drag.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Image compression | Custom canvas resize | browser-image-compression | Handles Web Workers, EXIF, quality optimization, edge cases |
| HEIC conversion | Manual HEIF decoder | heic2any | HEIC decoding is complex (HEVC codec), library handles browser differences |
| Drag-and-drop reorder | Custom pointer event tracking | @dnd-kit/sortable | Accessibility (keyboard), touch support, animation, collision detection |
| File type detection | Regex on extension | Check file.type + extension fallback | MIME types more reliable than extensions |
| Unique filenames | timestamp string | crypto.randomUUID() | Collision-free, no timestamp race conditions |

## Common Pitfalls

### Pitfall 1: HEIC Detection
**What goes wrong:** iOS photos have HEIC format but `file.type` may be empty or `image/heif`
**Why it happens:** Browser MIME type detection is inconsistent for HEIC
**How to avoid:** Check BOTH `file.type` (includes 'heic' or 'heif') AND `file.name` extension (.heic, .heif)
**Warning signs:** Upload silently fails or produces corrupt output on iOS photos

### Pitfall 2: Race Conditions in Concurrent Uploads
**What goes wrong:** Multiple files uploaded simultaneously cause state conflicts
**Why it happens:** setState calls interleave when processing multiple files
**How to avoid:** Use functional setState updates `setImages(prev => [...prev, newImage])` and track each upload independently with a Map or ref
**Warning signs:** Photo count jumps or photos disappear from UI during batch upload

### Pitfall 3: Cover Photo Constraint
**What goes wrong:** Multiple photos marked as cover, or no cover at all
**Why it happens:** Race condition between setting cover and deleting cover photo
**How to avoid:** Server Action should use a transaction: unset all is_cover, then set the chosen one. When cover is deleted, auto-promote position 0 photo to cover.
**Warning signs:** Property cards show wrong or no cover image

### Pitfall 4: Supabase Storage Path Conflicts
**What goes wrong:** Upload fails with "already exists" or overwrites wrong photo
**Why it happens:** Filename collision (two photos named "IMG_001.jpg")
**How to avoid:** Generate unique storage paths: `{propertyId}/{uuid}.jpg`
**Warning signs:** Photos appear to swap or duplicate

### Pitfall 5: Memory Issues with Large Batch
**What goes wrong:** Browser tab crashes when uploading 15 large photos at once
**Why it happens:** All files loaded into memory simultaneously
**How to avoid:** Process uploads sequentially or in small batches (3 at a time), revoke object URLs after use
**Warning signs:** Page becomes unresponsive during batch upload

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| Server-side sharp/imagemagick | Client-side compression + CDN resize | Zero server cost, works on free tier |
| react-beautiful-dnd | @dnd-kit/sortable | Active maintenance, React 19 compat, lighter |
| Base64 inline previews | URL.createObjectURL() | Less memory, faster rendering |
| Sequential integer positions | Float-based positioning | Fewer DB updates on reorder |

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest + Playwright |
| Config file | vitest.config.ts / playwright.config.ts |
| Quick run command | `npm run test` |
| Full suite command | `npm run test && npm run test:e2e` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| IMG-01 | Drag-and-drop upload of multiple photos | e2e | `npx playwright test tests/e2e/image-upload.spec.ts` | No - Wave 0 |
| IMG-02 | Client-side compression below 400KB | unit | `npx vitest run src/components/admin/image-manager/use-image-upload.test.ts` | No - Wave 0 |
| IMG-03 | Reorder photos via drag-and-drop | e2e | `npx playwright test tests/e2e/image-reorder.spec.ts` | No - Wave 0 |
| IMG-04 | Set cover photo | e2e | `npx playwright test tests/e2e/image-cover.spec.ts` | No - Wave 0 |
| IMG-05 | Delete photo with confirmation | e2e | `npx playwright test tests/e2e/image-delete.spec.ts` | No - Wave 0 |
| IMG-06 | Progress indicator per image | manual-only | Visual verification during upload | N/A |
| IMG-07 | Optimized variants generation | unit | `npx vitest run src/components/admin/image-manager/og-image.test.ts` | No - Wave 0 |

### Sampling Rate
- **Per task commit:** `npm run test`
- **Per wave merge:** `npm run test && npm run test:e2e`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/components/admin/image-manager/use-image-upload.test.ts` -- unit test for compression pipeline
- [ ] `src/components/admin/image-manager/og-image.test.ts` -- unit test for OG image generation
- [ ] `tests/e2e/image-upload.spec.ts` -- E2E upload flow
- [ ] `tests/e2e/image-reorder.spec.ts` -- E2E drag reorder
- [ ] `tests/e2e/image-cover.spec.ts` -- E2E cover photo toggle
- [ ] `tests/e2e/image-delete.spec.ts` -- E2E delete with confirmation

## Open Questions

1. **Supabase Storage upload progress granularity**
   - What we know: JS client `upload()` returns a promise, no progress events. Files are ~400KB (fast upload).
   - What's unclear: Whether the newer `@supabase/storage-js` versions expose upload progress.
   - Recommendation: Use compression progress (0-100%) as the main indicator, then switch to an indeterminate spinner for the brief upload step. For 400KB files on any connection, upload is <2s.

2. **heic2any bundle size**
   - What we know: heic2any is ~200KB+ minified due to HEVC decoder.
   - What's unclear: Exact impact on bundle with tree-shaking.
   - Recommendation: Dynamic import `heic2any` only when HEIC file detected. This avoids loading the decoder for the majority case (JPEG/PNG uploads).

3. **Float-based reordering vs integer reordering**
   - What we know: Float positioning (e.g., midpoint between neighbors) avoids updating all rows on reorder.
   - What's unclear: With max 15 photos, is this optimization worth the complexity?
   - Recommendation: Use simple integer positions (1-15) and update all positions on reorder. With max 15 rows per property, a batch update is trivial and simpler to reason about.

## Sources

### Primary (HIGH confidence)
- [browser-image-compression npm](https://www.npmjs.com/package/browser-image-compression) - API, options, format support
- [heic2any GitHub](https://github.com/alexcorvi/heic2any) - HEIC browser conversion
- [@dnd-kit/sortable docs](https://docs.dndkit.com/presets/sortable) - Sortable grid patterns
- [Supabase Storage Image Transformations](https://supabase.com/docs/guides/storage/serving/image-transformations) - Free tier limits
- [Supabase Storage pricing](https://supabase.com/docs/guides/storage/pricing) - 100 images free, then $5/1000

### Secondary (MEDIUM confidence)
- [@dnd-kit/react March 2026 article](https://medium.com/@ysuwansiri/drag-drop-sorting-with-dnd-kit-react-using-initialindex-and-index-9a80356e6649) - React 19 compatibility confirmed
- [Supabase pricing breakdown](https://uibakery.io/blog/supabase-pricing) - Free tier storage limits

### Tertiary (LOW confidence)
- Supabase JS client upload progress -- could not confirm if newer versions expose this; assume they don't

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - browser-image-compression and @dnd-kit are well-established with active maintenance
- Architecture: HIGH - patterns follow existing project conventions (Server Actions, shadcn/ui, component composition)
- Pitfalls: HIGH - based on common real-world issues with file upload UIs
- Supabase Storage Transformations: HIGH - pricing docs clearly state 100 free images limit

**Research date:** 2026-03-13
**Valid until:** 2026-04-13 (stable libraries, unlikely to change)
