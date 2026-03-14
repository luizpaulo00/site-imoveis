# Requirements: Jander Imoveis

**Defined:** 2026-03-11
**Core Value:** Quando o cliente recebe um link de imovel no WhatsApp, ele ve um preview bonito, abre num site rapido e mobile-first com fotos grandes, e fala com o corretor em um toque.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Authentication

- [x] **AUTH-01**: User can log in with email and password (single admin user)
- [x] **AUTH-02**: User session persists across browser refresh
- [x] **AUTH-03**: User can log out from any page in the admin
- [x] **AUTH-04**: Unauthenticated users are redirected from /admin/* routes to login

### Settings

- [x] **SETT-01**: Admin can configure WhatsApp number via settings page
- [x] **SETT-02**: Admin can configure site name and broker name via settings

### Property Management

- [x] **PROP-01**: Admin can create property with title, description, price (R$), type, bedrooms, bathrooms, area (m2), address, neighborhood
- [x] **PROP-02**: Admin can set property location on a map (latitude/longitude picker)
- [x] **PROP-03**: Admin can edit all property fields
- [x] **PROP-04**: Admin can delete a property (with confirmation)
- [x] **PROP-05**: Admin can set property status: disponivel, reservado, vendido
- [x] **PROP-06**: Admin can mark a property as featured (destacado na home)
- [ ] **PROP-07**: Admin sees property list with status, title, photo count, and actions

### Image Management

- [ ] **IMG-01**: Admin can upload multiple photos (up to 15 per property) via drag-and-drop
- [ ] **IMG-02**: Photos are automatically compressed client-side before upload (target <400KB)
- [ ] **IMG-03**: Admin can reorder photos via drag-and-drop
- [ ] **IMG-04**: Admin can set a photo as cover (used in cards and OG preview)
- [ ] **IMG-05**: Admin can delete individual photos with confirmation
- [ ] **IMG-06**: Upload shows progress indicator per image
- [ ] **IMG-07**: System generates optimized variants (thumbnail, card, detail, OG) from uploaded photos

### Public Listing

- [ ] **LIST-01**: Visitor sees property cards with cover photo, price (R$ formatted), bedrooms, bathrooms, area, neighborhood
- [ ] **LIST-02**: Visitor can filter by property type (casa, apartamento, etc.)
- [ ] **LIST-03**: Visitor can filter by price range
- [ ] **LIST-04**: Visitor can filter by number of bedrooms
- [ ] **LIST-05**: Filters are instant (client-side) with result count displayed
- [ ] **LIST-06**: Featured properties appear in a highlighted section at the top of the listing
- [ ] **LIST-07**: Property cards show status badge (disponivel/reservado/vendido)
- [ ] **LIST-08**: Entire card is tappable to navigate to property detail

### Property Detail

- [ ] **DETL-01**: Visitor sees full property info: all specs, description, address/neighborhood
- [ ] **DETL-02**: Visitor can browse photo gallery with fullscreen swipe and pinch-to-zoom
- [ ] **DETL-03**: Gallery shows photo count indicator (e.g., 3/12) in fullscreen
- [ ] **DETL-04**: Visitor sees property location on a map (Leaflet + OpenStreetMap)
- [ ] **DETL-05**: Visitor sees sticky WhatsApp button on mobile with pre-filled message ("Oi! Tenho interesse no imovel: [titulo] - [link]")
- [ ] **DETL-06**: Visitor can share property via Web Share API or copy link
- [ ] **DETL-07**: Sold/reserved properties display status clearly but remain viewable

### WhatsApp & Open Graph

- [ ] **WAPP-01**: Each property page has dynamic Open Graph meta tags (og:title, og:description, og:image)
- [ ] **WAPP-02**: OG image is the cover photo, optimized to <200KB and 1200x630px ratio
- [ ] **WAPP-03**: OG description includes price and key specs
- [ ] **WAPP-04**: WhatsApp link preview shows property photo, title, and price correctly
- [ ] **WAPP-05**: URL versioning (?v=timestamp) ensures updated properties get fresh previews

### SEO & Performance

- [ ] **PERF-01**: Mobile-first responsive design (optimized for 80%+ mobile traffic)
- [ ] **PERF-02**: Skeleton loading states on all pages (no blank screens)
- [ ] **PERF-03**: Lazy-load images below the fold
- [ ] **PERF-04**: LCP under 2.5s on 4G connection
- [ ] **SEO-01**: JSON-LD structured data (RealEstateListing schema) on property pages
- [ ] **SEO-02**: Auto-generated sitemap.xml with all property pages
- [ ] **SEO-03**: Proper heading hierarchy and semantic HTML

### Infrastructure

- [x] **INFR-01**: Supabase keep-alive cron job prevents free-tier project pausing
- [x] **INFR-02**: All property photos pre-optimized at upload (no reliance on Vercel image optimization quota)
- [x] **INFR-03**: Supabase RLS policies enforce public read / admin-only write

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Admin Enhancements

- **ADM2-01**: Dashboard with property counters (total, disponiveis, reservados, vendidos)
- **ADM2-02**: Bulk property operations (multi-select, bulk status change)
- **ADM2-03**: Property archive/history

### Visual Enhancements

- **VIS2-01**: OG image generation with price/specs overlay text
- **VIS2-02**: Custom branding/theme settings (logo, cores)

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| User registration / favorites / saved searches | The broker IS the recommendation engine -- sends links directly |
| Virtual tours / 360 photos / video hosting | Overkill for ~20 properties; regular photos suffice |
| Chat widget / real-time messaging | WhatsApp is the single communication channel |
| Visit scheduling / calendar integration | Handled via WhatsApp conversation |
| Portal integrations (ZAP, OLX, VivaReal) | Separate workflow, massive API complexity |
| Multi-language (i18n) | 100% Brazilian audience, PT-BR only |
| Mortgage calculator | Liability risk, banks have their own simulators |
| Multi-user / role-based admin | Single broker, YAGNI |
| Advanced search / full-text / autocomplete | ~20 properties -- simple filters are sufficient |
| Mobile app nativo | Responsive web is sufficient |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Complete |
| AUTH-02 | Phase 1 | Complete |
| AUTH-03 | Phase 1 | Complete |
| AUTH-04 | Phase 1 | Complete |
| SETT-01 | Phase 1 | Complete |
| SETT-02 | Phase 1 | Complete |
| PROP-01 | Phase 2 | Complete |
| PROP-02 | Phase 2 | Complete |
| PROP-03 | Phase 2 | Complete |
| PROP-04 | Phase 2 | Complete |
| PROP-05 | Phase 2 | Complete |
| PROP-06 | Phase 2 | Complete |
| PROP-07 | Phase 2 | Pending |
| IMG-01 | Phase 3 | Pending |
| IMG-02 | Phase 3 | Pending |
| IMG-03 | Phase 3 | Pending |
| IMG-04 | Phase 3 | Pending |
| IMG-05 | Phase 3 | Pending |
| IMG-06 | Phase 3 | Pending |
| IMG-07 | Phase 3 | Pending |
| LIST-01 | Phase 4 | Pending |
| LIST-02 | Phase 4 | Pending |
| LIST-03 | Phase 4 | Pending |
| LIST-04 | Phase 4 | Pending |
| LIST-05 | Phase 4 | Pending |
| LIST-06 | Phase 4 | Pending |
| LIST-07 | Phase 4 | Pending |
| LIST-08 | Phase 4 | Pending |
| DETL-01 | Phase 4 | Pending |
| DETL-02 | Phase 4 | Pending |
| DETL-03 | Phase 4 | Pending |
| DETL-04 | Phase 4 | Pending |
| DETL-05 | Phase 4 | Pending |
| DETL-06 | Phase 4 | Pending |
| DETL-07 | Phase 4 | Pending |
| WAPP-01 | Phase 4 | Pending |
| WAPP-02 | Phase 4 | Pending |
| WAPP-03 | Phase 4 | Pending |
| WAPP-04 | Phase 4 | Pending |
| WAPP-05 | Phase 4 | Pending |
| PERF-01 | Phase 5 | Pending |
| PERF-02 | Phase 5 | Pending |
| PERF-03 | Phase 5 | Pending |
| PERF-04 | Phase 5 | Pending |
| SEO-01 | Phase 5 | Pending |
| SEO-02 | Phase 5 | Pending |
| SEO-03 | Phase 5 | Pending |
| INFR-01 | Phase 1 | Complete |
| INFR-02 | Phase 1 | Complete |
| INFR-03 | Phase 1 | Complete |

**Coverage:**
- v1 requirements: 50 total
- Mapped to phases: 50
- Unmapped: 0

---
*Requirements defined: 2026-03-11*
*Last updated: 2026-03-11 after roadmap creation*
