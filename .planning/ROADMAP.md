# Roadmap: Jander Imoveis

## Overview

This roadmap delivers a mobile-first property showcase site for a solo Brazilian real estate broker. The build order follows data dependencies: foundation and auth first (everything depends on the database), then admin property management (the broker needs to enter data), then the image pipeline (photos must be optimized before any enter the system), then the public site with WhatsApp integration (the core product experience), and finally performance and SEO polish. The entire stack runs on free tiers.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation and Auth** - Project scaffolding, database schema, Supabase auth, admin route protection, settings, and infrastructure guardrails
- [ ] **Phase 2: Property Management** - Admin CRUD for properties with all fields, status management, featured toggle, and property list view
- [ ] **Phase 3: Image Pipeline** - Multi-image upload with drag-and-drop, client-side compression, reorder, cover selection, and optimized variant generation
- [ ] **Phase 4: Public Site and WhatsApp** - Property listing with filters, detail page with gallery and map, dynamic OG tags, sticky WhatsApp button, and share functionality
- [ ] **Phase 5: Performance and SEO** - Skeleton loading states, lazy loading, Core Web Vitals optimization, JSON-LD structured data, and sitemap

## Phase Details

### Phase 1: Foundation and Auth
**Goal**: The broker can log in to a protected admin area, configure basic site settings, and the infrastructure is reliable on free tiers
**Depends on**: Nothing (first phase)
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, SETT-01, SETT-02, INFR-01, INFR-02, INFR-03
**Success Criteria** (what must be TRUE):
  1. Admin can log in with email/password and stays logged in after refreshing the browser
  2. Visiting any /admin/* URL without being logged in redirects to the login page
  3. Admin can log out from any admin page and is returned to login
  4. Admin can set the WhatsApp number and site/broker name in a settings page
  5. Supabase project does not pause due to inactivity (keep-alive cron is running)
**Plans:** 2/3 plans executed

Plans:
- [ ] 01-01-PLAN.md — Scaffold Next.js 15 project with Supabase clients, auth middleware, DB schema, and test infra
- [ ] 01-02-PLAN.md — Login page, auth Server Actions, admin layout with sidebar and logout
- [ ] 01-03-PLAN.md — Settings page (WhatsApp, site name, broker name), keep-alive cron, storage bucket

### Phase 2: Property Management
**Goal**: The broker can create, edit, and manage all property information through an intuitive admin interface
**Depends on**: Phase 1
**Requirements**: PROP-01, PROP-02, PROP-03, PROP-04, PROP-05, PROP-06, PROP-07
**Success Criteria** (what must be TRUE):
  1. Admin can create a property with all fields (title, description, price in R$, type, bedrooms, bathrooms, area, address, neighborhood) and pick its location on a map
  2. Admin can edit any property field and delete a property with a confirmation step
  3. Admin can set property status (disponivel, reservado, vendido) and mark properties as featured
  4. Admin sees a property list showing each property's status, title, photo count, and action buttons
**Plans:** 1/3 plans executed

Plans:
- [ ] 02-01-PLAN.md — Schema migration, Zod validation, CRUD server actions, currency utility, and dependency installation
- [ ] 02-02-PLAN.md — Property form with currency mask, Leaflet map picker, create and edit pages
- [ ] 02-03-PLAN.md — Property list table with status badges, filter tabs, delete confirmation, and empty state

### Phase 3: Image Pipeline
**Goal**: The broker can upload and manage property photos that are automatically optimized to stay within free-tier storage limits and produce WhatsApp-ready images
**Depends on**: Phase 2
**Requirements**: IMG-01, IMG-02, IMG-03, IMG-04, IMG-05, IMG-06, IMG-07
**Success Criteria** (what must be TRUE):
  1. Admin can drag-and-drop up to 15 photos per property and sees upload progress for each image
  2. Photos are compressed client-side before upload (raw phone photos reduced to under 400KB)
  3. Admin can reorder photos via drag-and-drop, set one as cover, and delete individual photos with confirmation
  4. System automatically generates optimized variants (thumbnail, card, detail, OG at 1200x630) from each uploaded photo
**Plans**: TBD

Plans:
- [ ] 03-01: TBD
- [ ] 03-02: TBD
- [ ] 03-03: TBD

### Phase 4: Public Site and WhatsApp
**Goal**: Visitors who receive a property link on WhatsApp see a beautiful preview, land on a fast mobile page with large photos, and contact the broker in one tap
**Depends on**: Phase 3
**Requirements**: LIST-01, LIST-02, LIST-03, LIST-04, LIST-05, LIST-06, LIST-07, LIST-08, DETL-01, DETL-02, DETL-03, DETL-04, DETL-05, DETL-06, DETL-07, WAPP-01, WAPP-02, WAPP-03, WAPP-04, WAPP-05
**Success Criteria** (what must be TRUE):
  1. Visitor sees property cards with cover photo, formatted R$ price, specs (bedrooms, bathrooms, area), and neighborhood -- featured properties appear in a highlighted section at the top
  2. Visitor can filter properties by type, price range, and bedrooms with instant client-side filtering and visible result count
  3. Visitor can tap a card to see the full detail page with all specs, description, fullscreen swipeable photo gallery with pinch-to-zoom and photo count indicator, and a map showing the property location
  4. Visitor sees a sticky WhatsApp button on mobile that opens WhatsApp with a pre-filled message including the property name and link
  5. Sharing a property link on WhatsApp shows a preview with the cover photo, title, and price (OG tags rendered server-side, OG image under 200KB, URL versioning for cache busting)
**Plans**: TBD

Plans:
- [ ] 04-01: TBD
- [ ] 04-02: TBD
- [ ] 04-03: TBD
- [ ] 04-04: TBD

### Phase 5: Performance and SEO
**Goal**: The site loads fast on variable mobile connections with no blank screens, and property pages are discoverable by search engines
**Depends on**: Phase 4
**Requirements**: PERF-01, PERF-02, PERF-03, PERF-04, SEO-01, SEO-02, SEO-03
**Success Criteria** (what must be TRUE):
  1. All pages show skeleton loading states instead of blank screens while data loads
  2. Images below the fold are lazy-loaded and the site achieves LCP under 2.5s on a simulated 4G connection
  3. Property pages include JSON-LD structured data using RealEstateListing schema
  4. A sitemap.xml is auto-generated with all property page URLs and the site uses semantic HTML with proper heading hierarchy
**Plans**: TBD

Plans:
- [ ] 05-01: TBD
- [ ] 05-02: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation and Auth | 2/3 | In Progress|  |
| 2. Property Management | 1/3 | In Progress|  |
| 3. Image Pipeline | 0/3 | Not started | - |
| 4. Public Site and WhatsApp | 0/4 | Not started | - |
| 5. Performance and SEO | 0/2 | Not started | - |
