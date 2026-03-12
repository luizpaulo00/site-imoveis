# Architecture Research

**Domain:** Real estate showcase/catalog site (single broker, image-heavy, mobile-first)
**Researched:** 2026-03-11
**Confidence:** HIGH

## System Overview

```
                         WhatsApp Link Share
                               |
                               v
┌──────────────────────────────────────────────────────────────────┐
│                      VERCEL (Free Tier)                          │
│                                                                  │
│  ┌──────────────┐  ┌───────────────┐  ┌───────────────────────┐  │
│  │  Public Site  │  │  Admin Panel  │  │  OG Image Generator   │  │
│  │  (SSR/SSG)   │  │  (Client +    │  │  (Edge Runtime)       │  │
│  │              │  │   Server      │  │  next/og ImageResponse │  │
│  │  - Home      │  │   Actions)    │  │                       │  │
│  │  - Listing   │  │              │  └───────────────────────┘  │
│  │  - Property  │  │  - CRUD      │                             │
│  │    Detail    │  │  - Upload    │                             │
│  │  - Filters   │  │  - Settings  │                             │
│  └──────┬───────┘  └──────┬───────┘                             │
│         │                 │                                      │
│         │    Server Actions / Supabase Client                    │
├─────────┴─────────────────┴──────────────────────────────────────┤
│                                                                  │
│                    MIDDLEWARE (Auth Guard)                        │
│                    Protects /admin/* routes                      │
│                                                                  │
└──────────────────────┬───────────────────────────────────────────┘
                       │
                       v
┌──────────────────────────────────────────────────────────────────┐
│                     SUPABASE (Free Tier)                         │
│                                                                  │
│  ┌──────────────┐  ┌───────────────┐  ┌───────────────────────┐  │
│  │  PostgreSQL   │  │  Auth         │  │  Storage              │  │
│  │              │  │  (Email/Pass) │  │  (Property Images)    │  │
│  │  - properties │  │  Single admin │  │  Public bucket        │  │
│  │  - images    │  │  user only    │  │  1 GB free            │  │
│  │  - settings  │  │              │  │  CDN-served URLs      │  │
│  └──────────────┘  └───────────────┘  └───────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  Row Level Security (RLS)                                    │ │
│  │  - Public: SELECT on properties (status = available/reserved)│ │
│  │  - Admin: ALL on properties, images, settings (auth.uid())  │ │
│  └──────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Implementation |
|-----------|----------------|----------------|
| Public Site | Display property listings to visitors, SEO/OG metadata | Next.js App Router, Server Components, SSR |
| Admin Panel | CRUD properties, upload images, manage settings | Next.js client components + Server Actions |
| OG Image Generator | Dynamic social preview images per property | `next/og` ImageResponse at edge |
| Middleware | Protect admin routes, refresh auth tokens | Next.js middleware.ts with Supabase SSR |
| PostgreSQL | Structured data storage (properties, settings) | Supabase managed Postgres |
| Auth | Single admin user authentication | Supabase Auth (email/password) |
| Storage | Property image files | Supabase Storage (public bucket, CDN URLs) |
| RLS | Data access control at database level | Supabase Row Level Security policies |

## Recommended Project Structure

```
src/
├── app/
│   ├── (public)/                # Route group: public pages
│   │   ├── page.tsx             # Home - property cards grid
│   │   ├── imoveis/
│   │   │   ├── page.tsx         # Listings with filters
│   │   │   └── [slug]/
│   │   │       ├── page.tsx     # Property detail page
│   │   │       └── opengraph-image.tsx  # Dynamic OG image
│   │   └── layout.tsx           # Public layout (header, footer, WhatsApp FAB)
│   ├── admin/
│   │   ├── layout.tsx           # Admin layout (sidebar, nav)
│   │   ├── page.tsx             # Dashboard (counters)
│   │   ├── imoveis/
│   │   │   ├── page.tsx         # Property list table
│   │   │   ├── novo/
│   │   │   │   └── page.tsx     # Create property form
│   │   │   └── [id]/
│   │   │       └── editar/
│   │   │           └── page.tsx # Edit property form
│   │   └── configuracoes/
│   │       └── page.tsx         # Settings (WhatsApp number, etc.)
│   ├── auth/
│   │   ├── login/
│   │   │   └── page.tsx         # Login page
│   │   └── callback/
│   │       └── route.ts         # Auth callback handler
│   ├── layout.tsx               # Root layout (fonts, metadata)
│   └── not-found.tsx            # 404 page
├── actions/                     # Server Actions
│   ├── properties.ts            # CRUD for properties
│   ├── images.ts                # Upload, reorder, delete images
│   └── settings.ts              # Update site settings
├── lib/
│   ├── supabase/
│   │   ├── client.ts            # Browser Supabase client
│   │   ├── server.ts            # Server Component Supabase client
│   │   ├── middleware.ts        # Middleware Supabase client
│   │   └── admin.ts             # Service role client (if needed)
│   ├── types/
│   │   └── database.ts          # Generated Supabase types
│   ├── constants.ts             # App constants, config
│   └── utils.ts                 # Formatting (price, area, slug)
├── components/
│   ├── ui/                      # Generic UI primitives (Button, Input, Card, etc.)
│   ├── property/
│   │   ├── property-card.tsx    # Card for listings grid
│   │   ├── property-gallery.tsx # Fullscreen image gallery
│   │   ├── property-specs.tsx   # Bedrooms, bathrooms, area badges
│   │   ├── property-form.tsx    # Admin create/edit form
│   │   └── property-filters.tsx # Filter bar (type, price, rooms)
│   ├── admin/
│   │   ├── image-uploader.tsx   # Drag-and-drop multi-image upload
│   │   ├── image-sorter.tsx     # Drag-to-reorder images
│   │   └── dashboard-stats.tsx  # Counter cards
│   └── layout/
│       ├── header.tsx           # Site header
│       ├── footer.tsx           # Site footer
│       ├── whatsapp-fab.tsx     # Sticky WhatsApp button
│       └── admin-sidebar.tsx    # Admin navigation
├── hooks/
│   └── use-image-upload.ts      # Client-side compression + upload logic
├── middleware.ts                 # Auth guard for /admin/* routes
└── styles/
    └── globals.css              # Tailwind + custom styles
```

### Structure Rationale

- **`app/(public)/`:** Route group keeps public pages organized without adding a URL segment. Visitors see `/` and `/imoveis/[slug]`, not `/public/...`.
- **`app/admin/`:** All admin routes under one path, easy to protect with middleware matcher `["/admin/:path*"]`.
- **`actions/`:** Server Actions in a dedicated folder (not co-located in pages) because multiple pages reuse the same actions (e.g., property CRUD from both list and edit pages).
- **`lib/supabase/`:** Three separate Supabase client factories (browser, server, middleware) as required by `@supabase/ssr` -- each context needs different cookie handling.
- **`components/`:** Feature-grouped (property, admin, layout) rather than atomic design. Simpler mental model for a small project.

## Architectural Patterns

### Pattern 1: Server Components as Default, Client Islands for Interactivity

**What:** All pages render as Server Components. Only interactive pieces (gallery swipe, filters, image upload, forms) use `"use client"`.
**When to use:** Every page in this project.
**Trade-offs:** Maximizes performance and reduces JS bundle. Requires careful boundary placement -- a `"use client"` at a layout level would cascade to all children.

**Example:**
```typescript
// app/(public)/imoveis/[slug]/page.tsx -- Server Component
// Fetches data on server, zero client JS for static content
import { PropertyGallery } from "@/components/property/property-gallery";
import { WhatsAppFab } from "@/components/layout/whatsapp-fab";

export default async function PropertyPage({ params }: { params: { slug: string } }) {
  const property = await getPropertyBySlug(params.slug);  // Server-side fetch

  return (
    <article>
      <h1>{property.title}</h1>
      <PropertyGallery images={property.images} />  {/* Client component */}
      <p>{property.description}</p>
      <WhatsAppFab phone={settings.whatsapp} property={property.title} />
    </article>
  );
}
```

### Pattern 2: Server Actions for All Mutations

**What:** Use Server Actions (not API Route Handlers) for all CRUD operations. Server Actions are type-safe, colocated with form logic, and Next.js optimizes their request cycle.
**When to use:** All admin operations -- create/update/delete properties, upload images, update settings.
**Trade-offs:** Cannot be called from external clients (not relevant here -- no mobile app, no third-party integration). Progressive enhancement works with forms.

**Example:**
```typescript
// actions/properties.ts
"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createProperty(formData: FormData) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase.from("properties").insert({
    title: formData.get("title") as string,
    slug: generateSlug(formData.get("title") as string),
    price: Number(formData.get("price")),
    // ...
  });

  if (error) throw error;
  revalidatePath("/admin/imoveis");
  revalidatePath("/");
}
```

### Pattern 3: Middleware Auth Guard with Supabase SSR

**What:** A single `middleware.ts` intercepts all `/admin/*` requests, refreshes the auth token cookie, and redirects unauthenticated users to `/auth/login`.
**When to use:** Protecting all admin routes.
**Trade-offs:** Simple and centralized. Uses `supabase.auth.getUser()` (server-validated) not `getSession()` (client-only, spoofable).

**Example:**
```typescript
// middleware.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { /* cookie get/set/remove on response */ } }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user && request.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
```

## Database Schema

### Properties Table

```sql
create table properties (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text not null unique,
  description text,
  price numeric(12, 2) not null,
  property_type text not null check (property_type in (
    'casa', 'apartamento', 'terreno', 'comercial', 'rural'
  )),
  status text not null default 'disponivel' check (status in (
    'disponivel', 'reservado', 'vendido'
  )),
  bedrooms smallint,
  bathrooms smallint,
  area_m2 numeric(10, 2),
  address text,
  neighborhood text,
  latitude numeric(10, 7),
  longitude numeric(10, 7),
  featured boolean default false,
  cover_image_url text,          -- denormalized for fast listing queries
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_properties_status on properties(status);
create index idx_properties_featured on properties(featured) where featured = true;
create index idx_properties_slug on properties(slug);
```

### Images Table

```sql
create table property_images (
  id uuid default gen_random_uuid() primary key,
  property_id uuid not null references properties(id) on delete cascade,
  storage_path text not null,      -- path in Supabase Storage bucket
  url text not null,               -- public CDN URL
  display_order smallint not null default 0,
  created_at timestamptz default now()
);

create index idx_images_property on property_images(property_id);
```

### Settings Table

```sql
create table site_settings (
  id uuid default gen_random_uuid() primary key,
  key text not null unique,
  value text not null,
  updated_at timestamptz default now()
);

-- Seed initial settings
insert into site_settings (key, value) values
  ('whatsapp_number', '5511999999999'),
  ('site_title', 'Jander Imoveis'),
  ('broker_name', 'Jander');
```

### RLS Policies

```sql
-- Properties: anyone can read available/reserved, only admin can mutate
alter table properties enable row level security;

create policy "Public read available properties"
  on properties for select
  using (status in ('disponivel', 'reservado'));

create policy "Admin full access to properties"
  on properties for all
  using (auth.uid() is not null);

-- Images: anyone can read, only admin can mutate
alter table property_images enable row level security;

create policy "Public read images"
  on property_images for select
  using (true);

create policy "Admin full access to images"
  on property_images for all
  using (auth.uid() is not null);

-- Settings: anyone can read, only admin can update
alter table site_settings enable row level security;

create policy "Public read settings"
  on site_settings for select
  using (true);

create policy "Admin update settings"
  on site_settings for update
  using (auth.uid() is not null);
```

## Data Flow

### Flow 1: Visitor Opens Property Link from WhatsApp

```
WhatsApp tap on link
    |
    v
Vercel Edge Network (CDN)
    |
    v
Next.js Middleware (no auth check -- public route, passthrough)
    |
    v
app/(public)/imoveis/[slug]/page.tsx (Server Component)
    |
    ├── Supabase Server Client: SELECT property WHERE slug = :slug
    ├── Supabase Server Client: SELECT images WHERE property_id = :id ORDER BY display_order
    ├── Supabase Server Client: SELECT value FROM settings WHERE key = 'whatsapp_number'
    |
    v
Full HTML response with:
    - <meta property="og:image"> pointing to /imoveis/[slug]/opengraph-image
    - <meta property="og:title"> = "3 quartos em Centro - R$ 350.000"
    - Server-rendered property detail page
    - Client JS hydrates: gallery swipe, WhatsApp FAB
```

### Flow 2: Dynamic OG Image Generation

```
WhatsApp crawler requests: /imoveis/[slug]/opengraph-image
    |
    v
app/(public)/imoveis/[slug]/opengraph-image.tsx (Edge Runtime)
    |
    ├── Fetch property data (title, price, cover_image_url)
    |
    v
next/og ImageResponse generates PNG:
    - Property photo as background
    - Title + price overlay text
    - Broker branding
    |
    v
1200x630 PNG returned
    - Cached by Vercel CDN (cache-control headers)
    - WhatsApp displays as link preview
```

### Flow 3: Admin Uploads Property Images

```
Admin in browser (property edit form)
    |
    v
<ImageUploader /> client component
    |
    ├── User drops/selects images (up to 15)
    ├── Client-side compression (browser-image-compression library)
    │   - Resize to max 1920px wide
    │   - Compress to ~80% quality WebP
    │   - Target: < 200KB per image
    |
    v
For each compressed image:
    ├── Supabase Storage upload: bucket/properties/{propertyId}/{uuid}.webp
    ├── Get public URL from Supabase Storage
    ├── Server Action: INSERT into property_images (url, storage_path, display_order)
    |
    v
revalidatePath() triggers ISR revalidation
    - Public pages serve updated content on next request
```

### Flow 4: Admin Authentication

```
Admin navigates to /admin
    |
    v
middleware.ts intercepts
    ├── Creates Supabase SSR client
    ├── Calls supabase.auth.getUser() (server-validated)
    ├── No user? Redirect to /auth/login
    |
    v
/auth/login page
    ├── Email + password form
    ├── supabase.auth.signInWithPassword()
    ├── On success: redirect to /admin
    |
    v
All subsequent /admin/* requests:
    ├── middleware.ts refreshes token cookie
    ├── Server Actions verify auth via supabase.auth.getUser()
```

## Image Pipeline Architecture

This is the most architecturally critical component given the image-heavy nature of the site and the zero-cost constraint.

### Why Client-Side Compression (Not Server-Side)

Supabase Storage Image Transformations are **not available on the free tier** (Pro plan required). Sharp on Vercel serverless has cold start penalties and memory constraints. Client-side compression before upload solves both problems at zero cost.

### Pipeline

```
Camera/Phone Photo (3-8 MB JPEG)
    |
    v
Browser: browser-image-compression library
    ├── Resize: max 1920px width (preserves aspect ratio)
    ├── Convert: WebP format (30-50% smaller than JPEG)
    ├── Quality: 0.8 (good visual quality, small size)
    ├── Output: ~100-200KB per image
    |
    v
Upload to Supabase Storage
    ├── Bucket: "property-images" (public)
    ├── Path: properties/{propertyId}/{uuid}.webp
    ├── Max file size policy: 500KB (safety net)
    |
    v
Supabase Storage CDN serves images
    ├── URL: https://{project}.supabase.co/storage/v1/object/public/property-images/...
    ├── Cache-Control headers for CDN caching
    |
    v
Next.js Image component on frontend
    ├── next/image with Supabase URL in remotePatterns
    ├── Automatic srcSet generation (responsive sizes)
    ├── Lazy loading below the fold
    ├── Priority loading for above-the-fold hero/cover
```

### Storage Budget (Free Tier: 1 GB storage, 2 GB egress/month)

| Metric | Calculation | Result |
|--------|-------------|--------|
| Images per property | ~10 avg, 15 max | 10-15 |
| Image size after compression | ~150 KB avg | 150 KB |
| Total for 20 properties | 20 x 10 x 150 KB | ~30 MB |
| Storage utilization | 30 MB / 1024 MB | ~3% of free tier |
| Page views to hit egress limit | 2 GB / (5 images x 150 KB avg per view) | ~2,700 property views/month |

The egress limit (2 GB/month) is the real constraint, not storage. With Vercel's CDN caching and Next.js Image optimization, actual Supabase egress will be much lower since repeat views are served from Vercel's edge cache.

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-20 properties (current) | Everything on free tiers. Client-side compression. No caching layer needed beyond Vercel CDN. |
| 20-100 properties | Same architecture holds. Consider Supabase Pro ($25/mo) for image transformations and more egress. Add pagination to listings. |
| 100+ properties | Add full-text search (Supabase pg_trgm or external). Consider dedicated image CDN (Cloudinary free tier: 25K transformations/mo). |

### First Bottleneck: Supabase Storage Egress

If the site gets significant traffic (viral listing shared on WhatsApp), Supabase's 2 GB/month egress will be hit. Mitigation: aggressive cache-control headers, Vercel Image Optimization caches images at the edge, and client-side compression keeps source images small.

### Second Bottleneck: Supabase Project Pausing

Free tier projects pause after 7 days of inactivity. For a real estate site that should always be online, this is a real risk during slow periods. Mitigation: Vercel Cron Job that pings the database daily via an API route. This uses Vercel's free cron (1 per day minimum on free tier) and prevents pausing.

```typescript
// app/api/keep-alive/route.ts
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { count } = await supabase
    .from("properties")
    .select("id", { count: "exact", head: true });
  return NextResponse.json({ ok: true, properties: count });
}
```

```json
// vercel.json
{
  "crons": [{
    "path": "/api/keep-alive",
    "schedule": "0 8 * * *"
  }]
}
```

## Anti-Patterns

### Anti-Pattern 1: Using Supabase Image Transformations on Free Tier

**What people do:** Rely on Supabase's `?width=400&height=300` transform URL parameters for responsive images.
**Why it is wrong:** Image Transformations are not available on the free tier. The request will return the original unresized image, wasting bandwidth and degrading mobile performance.
**Do this instead:** Compress on the client before upload (browser-image-compression). Use Next.js Image component for responsive srcSet generation from the single uploaded size.

### Anti-Pattern 2: Using `getSession()` Instead of `getUser()` in Server Code

**What people do:** Call `supabase.auth.getSession()` in middleware or Server Actions to check authentication.
**Why it is wrong:** `getSession()` reads from the local cookie without validating against the Supabase Auth server. The JWT could be expired or tampered with. Official Supabase docs explicitly warn against this.
**Do this instead:** Always use `supabase.auth.getUser()` in server contexts. It makes a round-trip to Supabase Auth to validate the token.

### Anti-Pattern 3: Storing Image URLs as Absolute Supabase URLs Everywhere

**What people do:** Store the full `https://{project}.supabase.co/storage/v1/object/public/...` URL in the database and use it directly in `<img>` tags.
**Why it is wrong:** If you ever migrate storage providers (e.g., to Cloudinary, S3), every URL in the database is broken. Also makes it hard to switch between environments.
**Do this instead:** Store the relative `storage_path` in the database. Construct the full URL at query time or in a utility function. The `url` column is a convenience cache that can be regenerated.

### Anti-Pattern 4: Making All Admin Components Client Components

**What people do:** Add `"use client"` to the admin layout, making every admin page a client component.
**Why it is wrong:** Loses Server Component benefits -- larger JS bundles, slower initial loads, and data fetching moves to client (extra round trips). Admin pages for listing/viewing data do not need client interactivity.
**Do this instead:** Keep admin pages as Server Components. Only the interactive pieces (forms, image uploader, drag-to-reorder) should be `"use client"` islands within Server Component pages.

### Anti-Pattern 5: Generating OG Images at Build Time

**What people do:** Use `generateStaticParams` + static OG images, expecting them to update when property data changes.
**Why it is wrong:** With ~20 properties that change frequently (price updates, status changes), statically generated OG images become stale. WhatsApp caches aggressively, and serving stale previews with wrong prices is worse than dynamic generation.
**Do this instead:** Generate OG images dynamically via `opengraph-image.tsx` with the Edge Runtime. Add `revalidate` to control caching. Vercel CDN caches the result, so it is only generated once until data changes.

## Integration Points

### External Services

| Service | Integration Pattern | Gotchas |
|---------|---------------------|---------|
| Supabase Auth | `@supabase/ssr` with cookie-based sessions | Three separate client factories needed (browser, server, middleware). Each handles cookies differently. |
| Supabase Database | `@supabase/supabase-js` via typed client | Always generate types with `supabase gen types typescript`. RLS policies enforce access -- never bypass with service role key from client. |
| Supabase Storage | `supabase.storage.from("bucket").upload()` | Public bucket for property images. Set file size limits in bucket config. Use `upsert: false` to prevent accidental overwrites. |
| Vercel CDN | Automatic for static assets and cached responses | Set `revalidate` on pages. OG images should cache for hours, property pages for minutes. |
| WhatsApp | URL scheme `https://wa.me/{number}?text={message}` | Pre-fill message with property name and link. URL-encode the message text. No API integration needed. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Public pages <-> Database | Server Components call Supabase directly | No API layer needed. Supabase client in Server Components is the "API." |
| Admin forms <-> Database | Server Actions | Forms submit to Server Actions. Actions validate, mutate, and call `revalidatePath`. |
| Image upload <-> Storage | Client component uploads directly to Supabase Storage | Browser-image-compression runs first. Then direct upload to Supabase Storage (not through our server). Server Action records metadata in DB. |
| OG route <-> Database | Edge Runtime fetches property data | Lightweight query (title, price, cover_image). Cached by Vercel CDN. |

## Build Order (Dependencies)

The following build order reflects actual component dependencies:

```
Phase 1: Foundation
├── Supabase project setup (DB schema, RLS, Storage bucket)
├── Next.js project scaffold (App Router, Tailwind, TypeScript)
├── Supabase client factories (browser, server, middleware)
├── Auth flow (login page, middleware guard, logout)
└── Keep-alive cron job

Phase 2: Admin Core
├── Admin layout (sidebar, nav)
├── Property CRUD (Server Actions + forms)  -- depends on Phase 1 schema
├── Image upload pipeline (client compression + Storage upload)  -- depends on Storage bucket
└── Settings management (WhatsApp number)

Phase 3: Public Site
├── Property listing page with cards  -- depends on Phase 2 having data
├── Property detail page with gallery  -- depends on images existing
├── Filters (type, price, bedrooms)
├── WhatsApp contact button (sticky FAB)
└── Dynamic OG image generation  -- depends on property data + cover images

Phase 4: Polish
├── Loading states and skeletons
├── Error boundaries
├── Mobile optimization pass
├── Performance audit (Lighthouse, Core Web Vitals)
└── SEO (sitemap, robots.txt, structured data)
```

**Rationale:** Admin must exist before the public site because the public site needs real data (properties with images) to build and test against. OG images come last in Phase 3 because they depend on both property data and cover images being in place.

## Sources

- [Next.js App Router Project Structure](https://nextjs.org/docs/app/getting-started/project-structure) -- Official docs
- [Next.js Metadata and OG Images](https://nextjs.org/docs/app/getting-started/metadata-and-og-images) -- Official docs
- [Vercel OG Image Generation](https://vercel.com/docs/og-image-generation) -- Official docs
- [Supabase Server-Side Auth for Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs) -- Official docs
- [Supabase Storage Image Transformations](https://supabase.com/docs/guides/storage/serving/image-transformations) -- Official docs (Pro+ only)
- [Supabase Storage Pricing](https://supabase.com/docs/guides/storage/pricing) -- Official docs
- [Supabase Free Tier Limits 2026](https://uibakery.io/blog/supabase-pricing) -- Third party analysis
- [Prevent Supabase Free Tier Pausing](https://dev.to/jps27cse/how-to-prevent-your-supabase-project-database-from-being-paused-using-github-actions-3hel) -- Community solution
- [Server Actions vs Route Handlers](https://makerkit.dev/blog/tutorials/server-actions-vs-route-handlers) -- Pattern guidance
- [Client-Side Image Compression](https://www.sitelint.com/blog/how-to-compress-the-image-on-the-client-side-before-uploading) -- Technique reference

---
*Architecture research for: Jander Imoveis - Real Estate Showcase Site*
*Researched: 2026-03-11*
