# Codebase Concerns

**Analysis Date:** 2026-03-25

## Tech Debt

**Weak TypeScript Typing in Server Actions:**
- Issue: `listProperties` and `getProperty` in `src/actions/properties.ts` return `Array<Record<string, unknown>>` and `Record<string, unknown> | null` instead of typed domain objects. The edit page (`src/app/admin/imoveis/[id]/editar/page.tsx`) compensates with a series of manual `as string`, `as number`, `as boolean` casts.
- Files: `src/actions/properties.ts` (lines 92, 120), `src/app/admin/imoveis/[id]/editar/page.tsx` (lines 31-47)
- Impact: Type errors are silenced at compile time. A schema column rename or type change will not be caught until runtime.
- Fix approach: Replace the return types with the `Property` type from `src/types/database.ts` and use the typed Supabase client with the `Database` generic. Use `getPropertyWithImages` (which already has a typed return) as the model.

**Zodiac Resolver Type Suppression:**
- Issue: `property-form.tsx` casts the Zod resolver with `as any` to silence a TypeScript compatibility error between `react-hook-form` and `@hookform/resolvers`.
- Files: `src/components/admin/property-form.tsx` (line 44)
- Impact: Breaks type inference for `useForm`, meaning form field type errors are not caught at compile time.
- Fix approach: Upgrade `@hookform/resolvers` and `react-hook-form` to aligned versions, or apply the version-specific workaround documented in `@hookform/resolvers` changelog.

**Image Manager Upload Refresh Gap:**
- Issue: After an image upload completes, the `ImageManager` component detects completed uploads in the queue but does nothing with them (lines 46-50 in `src/components/admin/image-manager/image-manager.tsx` have a comment block with an empty `if` body). New images only appear after page navigation.
- Files: `src/components/admin/image-manager/image-manager.tsx` (lines 42-50)
- Impact: After uploading, the admin sees the upload-queue preview but the actual persisted image (with real `id`, `storage_path`, `is_cover`) is not added to local state. Reorder/cover actions on a freshly uploaded image fail until the page is reloaded.
- Fix approach: On upload completion, trigger a `router.refresh()` call (Next.js App Router) or refetch property images from the server action to merge the new record into local state.

**Manual Settings Upsert Pattern:**
- Issue: `src/actions/settings.ts` implements a manual select-then-update/insert pattern instead of using Supabase's native `upsert`. This results in two round-trips per save.
- Files: `src/actions/settings.ts` (lines 40-68)
- Impact: Slightly slower settings saves; more code to maintain.
- Fix approach: Replace with `supabase.from('site_settings').upsert(settingsPayload, { onConflict: 'id' })`. The table is always seeded with exactly one row, so `onConflict: 'id'` is safe.

**Hardcoded Stats on Homepage:**
- Issue: The `StatsSection` at `src/components/public/stats-section.tsx` has hardcoded business statistics (`100+` properties negotiated, `200+` clients, `10+` years). These values do not come from the database.
- Files: `src/components/public/stats-section.tsx` (lines 7-11)
- Impact: Statistics must be manually updated in code. A developer deploy is needed to change them.
- Fix approach: Either expose a settings table for marketing stats, or at minimum derive the "properties negotiated" count from the real `properties` table.

**Hardcoded Broker Contact in Structured Data:**
- Issue: `src/app/layout.tsx` includes JSON-LD `RealEstateAgent` schema with hardcoded telephone (`+5561900000000`), address details, and logo URL (`https://imoveisformosa.com.br/logo.png`) that does not exist in the public folder.
- Files: `src/app/layout.tsx` (lines 43-62)
- Impact: Schema.org data is inaccurate. The missing logo URL will cause a 404 on every page load for social crawlers. The phone number is a placeholder.
- Fix approach: Read `broker_name` and `whatsapp` from `site_settings`. Create a real `/logo.png` in `public/`. Move the JSON-LD to a server component so it can receive dynamic data.

**`NEXT_PUBLIC_SITE_URL` Missing from `.env.local.example`:**
- Issue: `NEXT_PUBLIC_SITE_URL` is referenced in five different files (`sitemap.ts`, `robots.ts`, `layout.tsx`, `property-detail.tsx`, `imoveis/[id]/page.tsx`) but is absent from `.env.local.example`.
- Files: `.env.local.example`, `src/app/sitemap.ts` (line 6), `src/app/layout.tsx` (line 18)
- Impact: New developers who copy `.env.local.example` will silently fall back to `http://localhost:3000` or hardcoded production URLs. Sitemap and OG URLs will be wrong in non-production environments.
- Fix approach: Add `NEXT_PUBLIC_SITE_URL=https://your-domain.com` to `.env.local.example`.

## Known Bugs

**OG Cover Image Not Regenerated on First Upload:**
- Symptoms: The OG image (`og-cover.jpg`) is only generated when a cover image is explicitly set via the star button in `ImageManager`. After the first image upload, where `is_cover` is set automatically by the server, no OG image generation is triggered.
- Files: `src/components/admin/image-manager/image-manager.tsx` (handleSetCover generates OG), `src/actions/images.ts` (lines 58-78, auto-sets first image as cover but does not trigger OG generation)
- Trigger: Upload the first image to a new property. Navigate to the public property detail page and inspect the `og:image` meta tag - it will 404 until the admin explicitly clicks "set as cover" on any image.
- Workaround: Admin must click the cover star on an image after upload to force OG generation.

**Image Count Race Condition on Concurrent Uploads:**
- Symptoms: The upload limit check (`MAX_IMAGES_PER_PROPERTY`) queries the DB count before upload begins, but since uploads are sequential within a session, a new browser tab could allow exceeding the limit.
- Files: `src/actions/images.ts` (lines 32-39)
- Trigger: Two admin sessions simultaneously uploading to the same property.
- Workaround: The DB does not have a constraint enforcing the limit, so overages are possible. Low risk for a single-admin site.

**`getPublicProperties` Fetches All Properties Without Status Filter:**
- Symptoms: The public homepage query in `src/lib/queries/properties.ts` (line 26) does not filter by `status`. Properties marked as `vendido` (sold) and `reservado` (reserved) are returned and displayed on the public site alongside available ones.
- Files: `src/lib/queries/properties.ts`
- Impact: Sold/reserved properties occupy the listing and filtering space on the public site, potentially confusing buyers. Filtering in the UI hides them visually but they are still counted in the total shown in the hero (`{properties.length} Disponíveis`).
- Fix approach: Add `.eq('status', 'disponivel')` or change the hero label to reflect the actual count per status. Alternatively keep all statuses but update the hero copy.

## Security Considerations

**E2E Test Credentials Committed in Source:**
- Risk: The Playwright test file `e2e/full-flow.spec.ts` (lines 8-9) contains hardcoded admin credentials (`admin@janderimoveis.com` / `Jander@2026`).
- Files: `e2e/full-flow.spec.ts`
- Current mitigation: None. The file is tracked in git.
- Recommendations: Move credentials to `process.env.TEST_ADMIN_EMAIL` and `process.env.TEST_ADMIN_PASSWORD` read via Playwright's `process.env`. Add these to `.env.local.example` and ensure they are in `.gitignore` for CI secrets.

**RLS Policies Are Role-Wide, Not User-Scoped:**
- Risk: The Supabase RLS policies for `properties`, `property_images`, and `site_settings` allow any `authenticated` Supabase user to create, update, and delete data. If Supabase Auth is accidentally opened for public sign-up (e.g., during a configuration change), any user who creates an account could modify listings.
- Files: `supabase/schema.sql` (lines 92-151)
- Current mitigation: Supabase project is presumably configured to disable public sign-up, but this is not enforced at the SQL level.
- Recommendations: Add a `WITH CHECK (auth.email() = 'admin@janderimoveis.com')` or custom claim to the RLS policies to ensure only the known admin email can mutate data. Alternatively, check `auth.role() = 'service_role'` is not the gate.

**Storage RLS Policies Do Not Scope by Property Ownership:**
- Risk: The storage policies allow any authenticated user to upload, update, or delete any file in the `property-images` bucket (`supabase/schema.sql`, lines 169-187). The path-based ownership (files under `{propertyId}/`) is not enforced at the storage policy level.
- Files: `supabase/schema.sql` (lines 169-187)
- Current mitigation: Only one admin user exists; risk is theoretical.
- Recommendations: Tighten the storage INSERT policy with `WITH CHECK (bucket_id = 'property-images' AND (storage.foldername(name))[1] IS NOT NULL)`.

**Non-Bang Operator Usage on `NEXT_PUBLIC_SUPABASE_URL`:**
- Risk: `src/lib/utils/image-url.ts` (line 1) reads `process.env.NEXT_PUBLIC_SUPABASE_URL!` with a non-null assertion. If the env var is missing in a build or test environment, the function returns a malformed URL silently (`undefined/storage/v1/...`).
- Files: `src/lib/utils/image-url.ts`, `src/lib/supabase/server.ts` (line 8), `src/middleware.ts` (lines 8-9)
- Current mitigation: Deployment checklist presumably checks env vars.
- Recommendations: Add a startup assertion or use `next.config.js` `env` validation to fail-fast on missing required env vars.

## Performance Bottlenecks

**`getPublicProperties` Fetches All Images for All Properties:**
- Problem: The main listing query in `src/lib/queries/properties.ts` fetches all `property_images` columns for every property (id, storage_path, is_cover, position) even though only the cover image is needed per property card.
- Files: `src/lib/queries/properties.ts` (line 32)
- Cause: No filter is applied on the `property_images` join. For a property with 15 images, 15 rows are returned and 14 are discarded.
- Improvement path: Add `.eq('property_images.is_cover', true)` as a filter on the nested select, or use a DB view/function that returns one cover image per property. This reduces data transfer proportionally to image count.

**Image Reorder Fires N Individual UPDATE Queries:**
- Problem: `reorderImages` in `src/actions/images.ts` (lines 175-183) issues one `UPDATE` per image via `Promise.all`. For 15 images, this fires 15 independent queries.
- Files: `src/actions/images.ts` (lines 175-191)
- Cause: Supabase JS client does not support bulk UPDATE with different values per row via the standard API.
- Improvement path: Use a Postgres `unnest` update via a raw RPC call, or accept the current limitation given the 15-image cap and async nature of the operation.

**Sitemap Fetches All Properties Without Limit:**
- Problem: `src/app/sitemap.ts` queries `properties` with no `limit`. As the property count grows, sitemap generation time increases linearly with a cold-start penalty on each crawler visit.
- Files: `src/app/sitemap.ts`
- Cause: No caching or limit applied.
- Improvement path: The sitemap function currently has no Next.js `revalidate` export. Adding `export const revalidate = 86400` would ISR-cache it for 24 hours and eliminate repeated DB calls from crawlers.

## Fragile Areas

**`ImageManager` Optimistic Delete Reverts to Stale Closure:**
- Files: `src/components/admin/image-manager/image-manager.tsx` (line 102)
- Why fragile: `handleDelete` reverts to `images` (captured in closure at callback creation time), not `prev` from `setImages`. If multiple deletes happen in quick succession, the revert restores a stale snapshot rather than the current state.
- Safe modification: Change `setImages(images)` to `setImages((prev) => [...initialImages.filter(img => prev.some(p => p.id === img.id))])` or restructure the optimistic update to track per-item state.
- Test coverage: No unit test covers the delete-then-fail scenario.

**`reorderImages` Does Not Verify Ownership Before Update:**
- Files: `src/actions/images.ts` (lines 174-183)
- Why fragile: The `.eq('property_id', propertyId)` constraint on each update is the only ownership check. If an imageId from a different property is passed in the array, the update silently skips it (no rows matched). There is no validation that all passed imageIds actually belong to the target property.
- Safe modification: Add a pre-check that fetches all image IDs for the property and confirms the passed array is a subset before issuing updates.
- Test coverage: Tests mock the Supabase client and do not test cross-property contamination.

**`PropertyDetail` Uses `process.env.NEXT_PUBLIC_SITE_URL` on the Client:**
- Files: `src/components/public/property-detail.tsx` (line 42)
- Why fragile: This is a `'use client'` component. `NEXT_PUBLIC_*` env vars are embedded at build time, so the value is correct in production but requires a rebuild to change. More importantly, the property URL is constructed before mounting, so SSR-rendered HTML and client-hydrated HTML should match, but if `NEXT_PUBLIC_SITE_URL` is empty the URL is malformed (starts with pathname directly).
- Safe modification: Derive the URL from `window.location.href` on the client, or pass it as a prop from the server component.

**`getPublicSettings` Returns Empty Strings on Error:**
- Files: `src/lib/queries/settings.ts` (lines 18-20)
- Why fragile: When the `site_settings` table is empty or the query fails, the function silently returns `{ whatsapp: '', siteName: '', brokerName: '' }`. Consumer components check for truthiness (e.g., `settings.whatsapp && ...` in the hero), so an empty string hides WhatsApp CTAs entirely without any error indication.
- Safe modification: This is an acceptable UX tradeoff for a small site, but monitoring/alerting on empty settings in production would prevent silent omission of contact features.

## Scaling Limits

**Supabase Free-Tier Pausing:**
- Current capacity: GitHub Actions workflow (`keep-supabase-alive.yml`) pings the DB on Monday and Thursday to prevent free-tier pausing.
- Limit: If the project moves to production with real traffic, the free-tier's compute and storage quotas (500MB DB, 1GB storage) will be hit as the property image library grows.
- Scaling path: Upgrade to Supabase Pro. The keep-alive workflow can be removed once on a paid plan.

**All Properties Loaded into Memory on Homepage:**
- Current capacity: The public homepage loads all properties into a single React component (`PropertyListing`) and filters client-side. This works for a small portfolio (<50 properties).
- Limit: With 100+ properties, the initial data transfer and client-side filtering become noticeable. Each property includes image metadata for up to 15 images.
- Scaling path: Implement server-side filtering via URL search params, paginate the query, or add a search API route.

## Dependencies at Risk

**`heic2any` (HEIC Conversion):**
- Risk: This library is dynamically imported in `use-image-upload.ts` and relies on browser-level APIs. It has no TypeScript types package and limited maintenance activity.
- Impact: HEIC uploads fail if the dynamic import fails in certain bundler configurations.
- Migration plan: Consider using `libheif-js` or delegating HEIC conversion to a server-side route to remove browser dependency.

**Swiper (Gallery):**
- Risk: Swiper 11 introduced breaking changes from v8-10. The current usage in `property-gallery.tsx` uses both `Zoom`, `Navigation`, and `Pagination` modules which add non-trivial bundle weight to the public detail page.
- Impact: ~80KB additional JS on property detail pages.
- Migration plan: If bundle size becomes a concern, replace the gallery with a lighter custom lightbox or use the native `<dialog>` element with CSS scroll snapping.

## Missing Critical Features

**No `city` or `state` Field in `PublicProperty` Interface:**
- Problem: `src/lib/queries/properties.ts` `PublicProperty` interface does not include `city` or `state` fields. The listing card shows only `neighborhood`. The full address is only visible on the property detail page.
- Blocks: Cannot display city-level grouping or search on the public listing page without a query change and interface update.

**No Error Boundary on Public Pages:**
- Problem: If `getPublicProperties` or `getPublicSettings` throws (e.g., network partition to Supabase), Next.js will render a generic error page. There is no `error.tsx` in the `(public)` route group.
- Files: `src/app/(public)/` directory - no `error.tsx` present
- Risk: Any Supabase outage produces a full-page crash rather than a graceful degraded experience.

## Test Coverage Gaps

**Image Loading Attributes:**
- What's not tested: `src/__tests__/image-loading.test.ts` contains only `it.todo` stubs. The actual `loading="eager"` on first gallery image and `loading="lazy"` on subsequent images are untested.
- Files: `src/__tests__/image-loading.test.ts`, `src/components/public/property-gallery.tsx` (line 65)
- Risk: A refactor of the gallery could silently remove eager loading on the LCP image, degrading Core Web Vitals.
- Priority: Medium

**Server Actions - Error Path Coverage:**
- What's not tested: Tests in `src/__tests__/properties.test.ts` and `src/__tests__/settings.test.ts` mock the Supabase client but do not test storage cleanup on DB failure (e.g., `uploadImage` calls `storage.remove` when `insert` fails at line 84 of `src/actions/images.ts`).
- Files: `src/__tests__/properties.test.ts`, `src/actions/images.ts` (lines 82-86)
- Risk: A regression in the cleanup path would cause orphaned files in storage.
- Priority: Medium

**Admin UI Components:**
- What's not tested: No unit or integration tests cover `PropertyForm`, `ImageManager`, `ImageGrid`, or `PropertyList` components.
- Files: `src/components/admin/`
- Risk: Form validation UX, optimistic update logic, and drag-and-drop reorder are all tested only through the E2E suite, which requires a live environment.
- Priority: Low (E2E covers the happy path)

---

*Concerns audit: 2026-03-25*
