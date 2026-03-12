# Pitfalls Research

**Domain:** Real estate showcase/catalog site (Brazilian market, Next.js + Supabase, free tier hosting)
**Researched:** 2026-03-11
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: WhatsApp OG Image Not Rendering (>300KB or Wrong Format)

**What goes wrong:**
The core value of this product is WhatsApp link sharing with beautiful previews. WhatsApp silently drops OG images larger than 300KB. Since property photos are typically 2-5MB originals, and `next/og` generates PNG images that often exceed 1MB at 1200x630, the most important feature of the product simply does not work -- links show up with no image preview.

**Why it happens:**
Developers test OG tags using browser dev tools or the Facebook Debugger, which have higher size limits. WhatsApp's 300KB limit is undocumented in any official spec and only discovered through trial and error. Additionally, Next.js `@vercel/og` generates PNG by default, not compressed JPEG.

**How to avoid:**
- Generate OG images as static pre-compressed JPEGs (quality 70-80), not dynamically via `@vercel/og` runtime generation
- Use a dedicated OG image per property: resize the cover photo to exactly 1200x630, compress to under 200KB, store as a separate file in Supabase Storage
- Generate the OG image at property creation/update time in the admin, not at request time
- Always use absolute URLs for `og:image` with the full domain (including `https://`)
- Set `metadataBase` in Next.js layout to ensure correct URL resolution

**Warning signs:**
- Links shared in WhatsApp show title/description but no image
- OG image works on Twitter/Facebook but not WhatsApp
- OG image file size exceeds 200KB

**Phase to address:**
Phase 1 (Core infrastructure) -- OG image generation pipeline must be baked into the image upload flow from day one. Retrofitting is painful because every existing property needs reprocessing.

---

### Pitfall 2: WhatsApp Aggressive Cache Prevents OG Updates

**What goes wrong:**
After sharing a property link, the realtor updates the price, cover photo, or title. They share the same link again and WhatsApp shows the OLD preview. WhatsApp caches OG data for 24-48 hours minimum with no official cache-busting mechanism. The realtor thinks the site is broken.

**Why it happens:**
WhatsApp's crawler caches aggressively and there is no API to invalidate. Unlike Facebook (which has a Sharing Debugger), WhatsApp offers no cache-clearing tool.

**How to avoid:**
- Accept this as a platform limitation and document it for the admin user ("previews may take up to 48 hours to update")
- Use a versioned URL strategy: append `?v={timestamp}` to property URLs when major changes are made, so WhatsApp treats it as a new URL
- Implement this automatically in the admin: when cover photo or title changes, increment a version parameter in the canonical URL
- Store the shareable URL (with version param) and display it prominently in admin for copy/paste

**Warning signs:**
- Admin complains that "the preview is wrong" after editing a property
- Multiple test shares in WhatsApp all show stale data

**Phase to address:**
Phase 2 (Admin panel) -- the share URL versioning logic should be built into the property edit flow.

---

### Pitfall 3: Supabase Free Tier Project Pausing Kills Production Site

**What goes wrong:**
Supabase free tier projects pause after 7 days of inactivity. If the realtor goes on vacation or simply does not edit properties for a week, the entire database becomes unavailable. The public site shows errors or empty content. Visitors from WhatsApp links see a broken page.

**Why it happens:**
Supabase pauses free projects to save resources. A showcase site with ~20 properties might have low admin activity, but the public site still needs the database to serve content. The pausing logic only considers database queries, not whether the project "should" be active.

**How to avoid:**
- Set up a Vercel Cron Job (free tier includes cron) that pings the Supabase database daily via an API route (e.g., `GET /api/health` that runs `SELECT 1` on Supabase)
- Alternative: GitHub Actions scheduled workflow that hits the database every 3 days
- Display a health-check indicator in the admin dashboard so the realtor can see if the DB is active
- Consider aggressively caching property data using Next.js ISR (Incremental Static Regeneration) so the public site works even during brief DB outages

**Warning signs:**
- Site works fine during active development, breaks weeks after launch
- Supabase dashboard shows project as "Paused"
- Error logs show connection refused to Supabase

**Phase to address:**
Phase 1 (Core infrastructure) -- the keep-alive cron must be deployed alongside the initial site. This is not optional polish; it is required for the site to function.

---

### Pitfall 4: Uploading Raw Phone Photos Blows Through 1GB Storage Limit

**What goes wrong:**
Modern phone cameras produce 5-15MB photos. With 20 properties x 15 photos = 300 photos, raw uploads consume 1.5-4.5GB -- far exceeding the 1GB Supabase free storage limit. The admin gets a cryptic upload error, or worse, the storage silently fills up and old images become inaccessible.

**Why it happens:**
Non-technical users take photos on their phone and upload them directly. They do not know about image compression. Supabase free tier has a 1GB storage limit and 50MB max file size. Supabase image transformations (server-side resize) are Pro plan only -- not available on free tier.

**How to avoid:**
- Implement mandatory client-side compression BEFORE upload using browser-image-compression or compressorjs
- Target: resize to max 1920px width, JPEG quality 80%, which typically produces 200-400KB files
- Generate a separate thumbnail (400px width, quality 70%) for card listings
- Generate the OG image (1200x630, quality 75%, under 200KB) at upload time
- Show the user a preview with file size before confirming upload
- Display storage usage in the admin dashboard (query Supabase storage usage API)
- With compression: 300 photos x 300KB = ~90MB for originals + ~30MB thumbnails + ~15MB OG images = ~135MB total, well within 1GB

**Warning signs:**
- Upload times are very slow (large files)
- Storage usage approaching 500MB
- Admin complaints about slow uploads on mobile

**Phase to address:**
Phase 1 (Image pipeline) -- client-side compression is foundational. Every image that enters the system must go through this pipeline. Adding it later means reprocessing all existing images.

---

### Pitfall 5: Vercel Hobby Plan Image Optimization Limit (1,000 Source Images)

**What goes wrong:**
Vercel's free Hobby plan allows only 1,000 source image optimizations per month. With 20 properties x 15 photos = 300 source images, each served in multiple sizes/formats by `next/image`, you hit the limit fast -- especially with moderate traffic. Once exceeded, images return 402 errors and the site shows broken images.

**Why it happens:**
Developers use `next/image` for everything (it is the default), unaware of the tight free-tier quota. Each unique source image counts, and Vercel counts optimizations per billing period.

**How to avoid:**
- Do NOT rely on Vercel/Next.js runtime image optimization for property photos
- Pre-optimize images at upload time (client-side compression + generate multiple sizes) and serve them directly from Supabase Storage public URLs using standard `<img>` tags or `next/image` with `unoptimized` prop
- Only use `next/image` optimization for static site assets (logo, icons, UI elements) -- these are few and stable
- Serve property photos from Supabase Storage CDN with proper Cache-Control headers
- This also improves performance: pre-optimized images load faster than on-demand optimization

**Warning signs:**
- 402 errors in browser console on image loads
- Images suddenly stop loading mid-month
- Vercel dashboard shows image optimization usage climbing

**Phase to address:**
Phase 1 (Image pipeline) -- the decision to pre-optimize vs. runtime-optimize must be made before any image infrastructure is built.

---

### Pitfall 6: OG Tags Rendered Client-Side (WhatsApp Crawler Cannot See Them)

**What goes wrong:**
Property pages use client-side data fetching (e.g., `useEffect` + Supabase client query) to load property details, then set OG meta tags dynamically. WhatsApp's crawler does not execute JavaScript -- it only reads the initial HTML response. Result: every property link preview shows the same generic site title/image, or nothing at all.

**Why it happens:**
Developers build the page using client-side React patterns (SPA-style), or use `"use client"` components for everything. The OG tags must be in the server-rendered HTML response. Next.js App Router's `generateMetadata` function handles this correctly, but only if the data fetching happens server-side.

**How to avoid:**
- Use Next.js App Router with `generateMetadata()` in the property page's `page.tsx` -- this runs server-side and injects OG tags into the initial HTML
- Fetch property data server-side (using Supabase server client) in the page component and `generateMetadata`
- Test OG tags by viewing page source (`curl` or "View Source"), not by inspecting the rendered DOM
- Validate with Facebook Sharing Debugger (https://developers.facebook.com/tools/debug/) which behaves similarly to WhatsApp's crawler

**Warning signs:**
- "View Source" on the property page does not show the `og:title`, `og:image` meta tags
- Facebook Debugger shows generic or missing OG data
- All property links show the same preview in WhatsApp

**Phase to address:**
Phase 1 (Property pages) -- server-side rendering for property pages is an architectural decision that must be correct from the start.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Skip client-side image compression, upload raw photos | Faster to implement admin upload | Blows through 1GB storage in weeks, slow page loads | Never -- 1GB limit is too tight |
| Use `next/image` for all property photos | Automatic optimization, less code | Hits 1,000 Vercel image limit, 402 errors | Never on free tier -- pre-optimize instead |
| Store only original images, no thumbnails | Less upload complexity | Every page load serves oversized images, terrible mobile performance | Never -- thumbnails are essential for card listings |
| Skip OG image generation, use original photo as og:image | Less code | WhatsApp drops images >300KB, broken previews | Never -- OG preview is the core product feature |
| Disable RLS on Supabase tables for simplicity | Faster development | Anyone with the anon key can modify/delete all data | Never -- RLS is mandatory even for single-user apps |
| Hardcode WhatsApp number in frontend | Quick setup | Requires code deploy to change number, defeats admin configurability | Only in earliest prototype, replace immediately |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Supabase Auth | Exposing the `service_role` key in client-side code | Use `service_role` only in server-side API routes/Server Actions. Use `anon` key on client with RLS policies. |
| Supabase Storage | Creating a public bucket without RLS, allowing anyone to upload/delete | Public bucket for READ (serving images), but WRITE operations require authenticated admin via RLS policy on the storage bucket. |
| Supabase Storage | Using `getPublicUrl()` and expecting image transformations on free tier | Image transformations require Pro plan. Pre-optimize on client before upload. Use `getPublicUrl()` to get direct CDN URL. |
| WhatsApp Deep Link | Using `https://wa.me/` with wrong phone format | Use international format without + or spaces: `https://wa.me/5511999998888`. Include country code (55 for Brazil). |
| WhatsApp Message | Not URL-encoding the pre-filled message text | Use `encodeURIComponent()` for the `text` parameter: `https://wa.me/5511999998888?text=${encodeURIComponent(message)}` |
| Google Maps Embed | Using Maps JavaScript API (requires billing account) | Use Maps Embed API (free, no billing required) or static map image. Alternatively, use OpenStreetMap/Leaflet (fully free, no API key). |
| Vercel Cron | Assuming cron runs reliably every minute on free tier | Vercel Hobby cron minimum interval is 1 day. Sufficient for DB keep-alive but not for real-time tasks. |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Loading all 15 property images at once on mobile | 3-5 second load time on 3G, high data usage, users bounce | Lazy load all images except the first/cover. Use `loading="lazy"` on non-critical images. Prioritize cover image with `priority` prop. | Immediately on slow connections (common in Brazil) |
| No image `width`/`height` causing layout shift | Page jumps around as images load, poor CLS score, disorienting UX | Always specify dimensions. Use aspect-ratio CSS with fixed containers. Reserve space with skeleton placeholders. | First page load on any connection |
| Full-screen gallery loading all images into DOM | Memory issues on low-end Android phones (common in Brazil), browser crashes | Use a virtualized gallery that only renders visible slides + 1 ahead/behind. Libraries like Swiper handle this well. | Devices with <2GB RAM viewing properties with 10+ photos |
| Serving desktop-sized images to mobile | 1920px image on a 375px screen wastes 80% of bandwidth | Generate multiple sizes at upload time (400px thumb, 800px mobile, 1200px desktop). Use `srcset` or serve appropriate size based on context. | Every mobile page load |
| No Supabase connection pooling | Database connections exhaust quickly under concurrent requests | Use Supabase connection pooling URL (port 6543) for serverless environments. Configure in environment variables. | 10+ concurrent users (ISR revalidation + live requests) |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| No RLS on properties/images tables | Anyone can call Supabase REST API with anon key to insert, update, or delete properties and images | Enable RLS on ALL tables. Public read: `SELECT` for everyone. Write operations: require `auth.uid()` matching admin user ID. |
| Storing admin credentials in client-side code or `.env` without `.local` | Credentials exposed in browser bundle or git repository | Use `.env.local` (gitignored) for secrets. Only `NEXT_PUBLIC_*` vars are client-safe. Server actions/API routes for sensitive operations. |
| Not validating file types on upload | Malicious users could upload scripts or non-image files to public storage bucket | Validate MIME type both client-side and server-side. Accept only `image/jpeg`, `image/png`, `image/webp`. Check file headers, not just extension. |
| Using `service_role` key in middleware or client components | Full database access bypassing all RLS -- equivalent to root access | `service_role` only in Server Actions or API routes. Never in middleware, client components, or anywhere the code runs in the browser. |
| Single admin account with no rate limiting on login | Brute force attack on admin login endpoint | Use Supabase Auth rate limiting (built-in). Consider adding a login attempt counter. Use a strong password. |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Admin image upload with no progress indicator | Non-technical user thinks upload failed, clicks again, creates duplicates | Show upload progress bar per image. Disable submit until all uploads complete. Show "Uploading 3/15..." status. |
| Technical jargon in admin interface ("slug", "SEO", "OG tags") | Realtor does not understand what fields mean, leaves them blank or fills incorrectly | Use plain Portuguese labels: "Link do imovel", "Titulo para compartilhamento". Auto-generate technical fields from user-friendly inputs. |
| No image reordering after upload | Realtor cannot control which photo appears first (cover), has to delete and re-upload in correct order | Implement drag-and-drop reordering. Clearly mark which image is the "Foto de capa" (cover photo). |
| Showing "Delete" button without confirmation | One accidental tap deletes a property with all its photos | Always show confirmation dialog: "Tem certeza que deseja excluir este imovel? Esta acao nao pode ser desfeita." |
| Currency input requiring manual R$ and decimal formatting | Realtor types "250000" and it is stored as R$ 2.500,00 or R$ 250.000,00 -- ambiguous | Use a masked currency input that formats as-you-type: typing "250000" shows "R$ 2.500,00". Use integer storage (centavos) to avoid floating-point issues. |
| No preview before publish | Realtor publishes property and it looks wrong on mobile, has to fix publicly | Add "Visualizar" (Preview) button that shows exactly how the property page will appear on mobile, including OG preview simulation. |

## "Looks Done But Isn't" Checklist

- [ ] **OG Tags:** Test by sharing actual URLs in WhatsApp, not just checking HTML source -- verify image actually renders in the chat bubble
- [ ] **Mobile gallery:** Test on a real low-end Android phone on 3G, not just Chrome DevTools throttling -- real devices handle memory differently
- [ ] **Image upload:** Test with actual phone camera photos (5-15MB HEIC/JPEG), not stock photos downloaded from the web
- [ ] **Currency display:** Verify R$ 1.000,00 format (period for thousands, comma for decimals) -- the opposite of US format. Test with values like R$ 1.250.000,00
- [ ] **WhatsApp link:** Test the `wa.me` deep link on both iOS and Android -- behavior differs. Test with the pre-filled message containing special characters and accented Portuguese text (acentos)
- [ ] **Admin on mobile:** Test the entire admin flow on a phone -- the realtor will likely manage properties from their phone, not a desktop
- [ ] **Address fields:** Verify CEP format (XXXXX-XXX, 8 digits), state abbreviation (SP, RJ, MG), and that the full Brazilian address format is supported (Rua, Numero, Complemento, Bairro, Cidade-UF)
- [ ] **Supabase keep-alive:** Wait 8+ days after deployment without touching admin, then verify the public site still loads
- [ ] **Storage limits:** Check actual Supabase Storage usage after uploading 10 properties with 15 photos each -- verify compression is working
- [ ] **Property status transitions:** Verify that changing status to "Vendido" actually hides/deprioritizes the property correctly on the public site and that the listing count updates

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Supabase project paused | LOW | Unpause from Supabase dashboard (takes 1-2 minutes). Then immediately deploy the keep-alive cron job. Data is preserved for 90 days. |
| Storage limit exceeded | MEDIUM | Cannot upload new images. Must delete old images or compress existing ones. Write a migration script to re-compress all images. Consider cleaning up unused images from deleted properties. |
| OG images all too large for WhatsApp | MEDIUM | Write a batch script to regenerate OG images for all properties. Update the upload pipeline. Re-share links with `?v=2` parameter to bust WhatsApp cache. |
| Vercel image optimization limit hit | LOW | Switch property images to `unoptimized` prop or direct `<img>` tags pointing to Supabase CDN. Only affects current billing period. |
| No RLS enabled, data tampered | HIGH | Enable RLS immediately. Audit database for unauthorized changes. Restore from Supabase daily backup (free tier gets daily backups, retained 7 days). Rotate API keys. |
| Client-side only OG tags (all pages wrong) | HIGH | Requires architectural change to server-side rendering. Rewrite property pages to use `generateMetadata` and server-side data fetching. Significant refactor if the app was built SPA-style. |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| WhatsApp OG image >300KB | Phase 1: Image Pipeline | Share a property link in WhatsApp and verify image renders in preview |
| WhatsApp cache preventing OG updates | Phase 2: Admin Panel | Edit a property, share with `?v=2`, verify new preview appears |
| Supabase project pausing | Phase 1: Infrastructure | Deploy keep-alive cron, wait 8 days, verify site still works |
| Raw photo uploads exceeding storage | Phase 1: Image Pipeline | Upload a 10MB phone photo, verify stored file is <400KB |
| Vercel image optimization limit | Phase 1: Image Pipeline | Verify property photos use direct Supabase URLs, not Vercel optimization |
| OG tags rendered client-side only | Phase 1: Property Pages | `curl` a property URL, verify OG meta tags in raw HTML response |
| No RLS on tables | Phase 1: Database Setup | Attempt to INSERT via Supabase REST API with anon key, verify rejection |
| Currency format wrong | Phase 1: Property Display | Display R$ 1.250.000,00 correctly (not $1,250,000.00) |
| Admin UX too technical | Phase 2: Admin Panel | Have a non-technical person try to add a property without instructions |
| Gallery crashes on low-end phones | Phase 2: Public Pages Polish | Test 15-image gallery on budget Android phone |
| No upload progress indicator | Phase 2: Admin Panel | Upload 15 photos on 4G, verify progress feedback is shown |
| Missing Brazilian address format | Phase 1: Data Model | Verify CEP (XXXXX-XXX), Bairro, Cidade-UF fields exist in schema |

## Sources

- [Next.js OG image not displaying on WhatsApp (Next.js 15 + Vercel)](https://github.com/vercel/next.js/discussions/84537)
- [Next/og generated images are horribly heavy (PNG) and unusable in WhatsApp](https://github.com/vercel/next.js/discussions/60366)
- [WhatsApp Open Graph Preview with Next.js - Avoiding Common Pitfalls](https://medium.com/@eduardojs999/how-to-use-whatsapp-open-graph-preview-with-next-js-avoiding-common-pitfalls-88fea4b7c949)
- [WhatsApp Link Preview & Open Graph Tags Guide (2026)](https://opengraphplus.com/consumers/whatsapp)
- [Fix WhatsApp not showing Open Graph image](https://fabian-rosenthal.com/blog/fix-whatsapp-is-not-showing-the-open-graph-image)
- [Supabase Pricing in 2026: Free Tier Limits](https://uibakery.io/blog/supabase-pricing)
- [Supabase Storage Image Transformations (Pro plan only)](https://supabase.com/docs/guides/storage/serving/image-transformations)
- [Supabase Free Tier Pausing Prevention](https://github.com/travisvn/supabase-pause-prevention)
- [Prevent Supabase Free Tier Pausing Guide (2026)](https://shadhujan.medium.com/how-to-keep-supabase-free-tier-projects-active-d60fd4a17263)
- [Vercel Image Optimization Limits and Pricing](https://vercel.com/docs/image-optimization/limits-and-pricing)
- [Client-side image compression with Supabase Storage](https://mikeesto.com/posts/supabaseimagecompression/)
- [Supabase RLS Security Hidden Dangers](https://dev.to/fabio_a26a4e58d4163919a53/supabase-security-the-hidden-dangers-of-rls-and-how-to-audit-your-api-29e9)
- [Brazil Address Format](https://www.postgrid.com/global-address-format/brazil-address-format/)
- [Brazilian Formatting Standards](https://www.freeformatter.com/brazil-standards-code-snippets.html)
- [Lazy Loading Performance Effects (web.dev)](https://web.dev/articles/lcp-lazy-loading)

---
*Pitfalls research for: Real estate showcase/catalog site (Jander Imoveis)*
*Researched: 2026-03-11*
