# Feature Research

**Domain:** Real estate showcase/catalog site for autonomous broker (Brazil)
**Researched:** 2026-03-11
**Confidence:** HIGH

## Feature Landscape

### Table Stakes (Users Expect These)

Features that clients receiving a WhatsApp link expect. Missing these = broker looks unprofessional.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Property cards with hero photo, price, key specs** | Users decide in 2 seconds whether to tap. Card must show: cover photo, price (R$ formatted), bedrooms, bathrooms, area (m2), neighborhood. Short summary, not every detail. | LOW | Use vertical card layout on mobile. Photo takes ~60% of card height. Price prominent. Specs as icon+number row (bed/bath/area). |
| **Property detail page with full info** | After tapping a card or WhatsApp link, user expects complete property information: all specs, full description, address/neighborhood, property status | LOW | Single scrollable page. Specs grid at top, description below, map below that. No tabs -- scroll is fine for mobile. |
| **Photo gallery with fullscreen/swipe** | Photos sell properties. Users expect to swipe through large photos on mobile with pinch-to-zoom. This is the single most important UX element. | MEDIUM | Use a lightbox library (PhotoSwipe or similar). Grid of thumbnails on detail page, tap any to enter fullscreen swipe mode. Support pinch-to-zoom. Show photo count indicator (3/12). |
| **WhatsApp contact button (sticky on mobile)** | The entire conversion action. User must be able to contact broker from anywhere on the detail page without scrolling back up. | LOW | Sticky bottom bar on mobile with WhatsApp button. Green, recognizable WhatsApp icon. Pre-filled message: "Oi, tenho interesse no imovel [nome] - [link]". Opens `wa.me/{number}?text={encoded}`. |
| **Open Graph meta tags per property** | When broker shares a property link on WhatsApp, the preview must show: property photo, title, price, neighborhood. This is the entry point for most users. | MEDIUM | Dynamic OG tags per property page. Image: 1200x630px (1.91:1 ratio), under 300KB, served via HTTPS with absolute URL. Title under 65 chars. Description 120-200 chars with price + key specs. Test with Facebook Debugger. |
| **Mobile-first responsive design** | 80%+ of traffic comes from WhatsApp links opened on phones. Desktop is secondary. | MEDIUM | Design mobile-first, then adapt for desktop. Touch targets minimum 44x44px. No hover-dependent interactions. Fast load on 3G/4G. |
| **Property status indicators** | Users need to know if a property is available, reserved, or sold. Seeing "vendido" prevents wasted inquiries. | LOW | Color-coded badges on cards and detail page. Available (green), Reserved (yellow), Sold (red/gray). Sold properties can remain visible but clearly marked. |
| **Basic filters** | With ~20 properties, users still need to narrow by type (casa/apartamento), price range, and bedrooms. Without filters, browsing feels random. | MEDIUM | For ~20 items, use a horizontal filter bar at the top (not a sidebar). Dropdown/chip selectors for: property type, min-max price, bedrooms. Instant client-side filtering -- no server round-trips needed. Show result count. |
| **Fast loading / performance** | Users on variable mobile connections in Brazil. Slow = abandoned. A WhatsApp link that takes 5+ seconds to show content will be closed. | MEDIUM | Lazy-load images below the fold. Use next/image or equivalent for responsive sizing and WebP. Skeleton loading states, never blank screens. Target LCP under 2.5s on 4G. |
| **Admin login (single user)** | Broker needs to manage properties. Simple email/password auth for one user. | LOW | Single user, no registration flow. Email + password. Session-based or JWT. Password reset via email. |
| **Property CRUD in admin** | Broker must create, edit, and delete properties with all fields: title, description, price, type, bedrooms, bathrooms, area, address, location, status. | MEDIUM | Form-based interface. Clear labels in Portuguese. Input validation with helpful error messages. Auto-save or explicit save with confirmation. |
| **Multi-image upload with management** | Broker uploads phone photos (often large). Needs drag-and-drop, reorder, set cover, delete individual photos. Up to 15 per property. | HIGH | Drag-and-drop upload zone. Progress indicators per image. Thumbnail grid after upload. Drag to reorder. Star/click to set cover photo. X to delete. Client-side compression before upload (browser-image-compression lib) to handle large phone photos and reduce upload time. |
| **Automatic image compression/optimization** | Broker uploads raw phone photos (3-8MB each). These must be compressed and resized for web delivery without manual intervention. | MEDIUM | Compress on upload (client-side for speed + server-side for consistency). Generate multiple sizes: thumbnail (~400px), card (~800px), detail (~1200px), fullscreen (~1920px). Convert to WebP where supported. |

### Differentiators (Competitive Advantage)

Features that make this site feel polished vs. generic broker sites from template platforms (Tecimob, ImobiBrasil, etc.).

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Instant WhatsApp link preview that looks great** | Most broker sites have broken or ugly OG previews. A beautiful, consistent preview with property photo + price + neighborhood makes the broker look professional when sharing links. | MEDIUM | Generate optimized OG images dynamically or use the cover photo cropped to 1200x630. Include price overlay on the preview image for maximum impact. |
| **Highlight/feature properties on homepage** | Broker can pin 3-5 featured properties to the top of the listing. Useful for new or priority listings. | LOW | Admin toggle "Destacar na home". Featured properties appear in a hero section or top row before the full listing. |
| **Configurable WhatsApp number via admin** | Broker can change their WhatsApp number without code changes. Simple but critical for autonomy. | LOW | Settings page in admin. Single field: WhatsApp number with country code. Validates format. |
| **Admin dashboard with quick stats** | Broker sees at a glance: total properties, available, reserved, sold. Feels professional and gives a sense of control. | LOW | Simple counter cards at top of admin. No complex analytics -- just counts by status. |
| **Property share button (copy link + WhatsApp forward)** | On the public detail page, a share button lets the client forward the property to someone else, extending the broker's reach organically. | LOW | "Compartilhar" button that copies the property URL or opens WhatsApp share with pre-filled message. Uses Web Share API on mobile (native share sheet) with WhatsApp/copy-link fallback. |
| **Smooth page transitions and skeleton loading** | No jarring white screens between pages. Skeleton loaders for images. Feels like an app, not a website. | LOW | Skeleton placeholders for cards and images. Fade-in transitions. Optimistic UI where possible. |
| **Map showing property location** | Visual context of where the property is. Neighborhood familiarity matters in Brazil. | MEDIUM | Embed a map on the detail page. Use Google Maps Embed (free, no API key required for simple embeds) or Leaflet + OpenStreetMap (fully free, no usage limits). Pin showing approximate location. Do NOT show exact address for privacy/security -- use neighborhood-level pin. |
| **SEO-friendly property pages** | Even though primary traffic is WhatsApp, Google indexing means properties can be found organically over time. Good SSR + semantic HTML + meta tags. | LOW | Comes naturally with SSR/SSG frameworks. Semantic HTML, proper heading hierarchy, structured data (JSON-LD for RealEstateListing). Sitemap generation. |

### Anti-Features (Deliberately NOT Building)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **Advanced search with full-text, autocomplete, saved searches** | Seems "professional". Large portals have this. | For ~20 properties, this is absurd over-engineering. Full-text search adds complexity with zero value at this scale. Users can scan 20 items in seconds. | Simple dropdown filters (type, price range, bedrooms). Client-side filtering. That's it. |
| **User registration / favorites / saved properties** | Portal sites have "save to favorites". | Creates auth complexity, privacy concerns (LGPD), maintenance burden. For a personal broker site where clients are sent specific links via WhatsApp, no one is browsing and saving favorites. | The broker IS the recommendation engine. Broker sends relevant links directly. |
| **Virtual tour / 360 photos / video hosting** | "Immersive experience", competitors mention it. | Massive complexity: specialized cameras, hosting costs for video, complex viewers. Completely overkill for a solo broker with ~20 properties. | High-quality regular photos in a good gallery. Broker can share video via WhatsApp directly if needed. |
| **Chat widget / real-time messaging** | "Be available to clients". | Adds real-time infrastructure, notification systems, read receipts. The broker already uses WhatsApp -- adding another chat channel fragments communication. | WhatsApp button. One channel, one conversation, the tool the broker already uses. |
| **Visit scheduling / calendar integration** | "Let clients book viewings". | Calendar sync, availability management, timezone handling, no-show handling. For a solo broker who communicates via WhatsApp, this adds complexity without solving a real problem. | Client messages on WhatsApp, broker responds and schedules manually. Works fine at this scale. |
| **Integration with property portals (ZAP, OLX, VivaReal)** | "Post once, publish everywhere". | Complex APIs, different data formats, sync issues, authentication per portal. Major engineering effort. | Broker manages their own site. Portal listings are done separately (as they already do). |
| **Multi-language support** | "Reach international buyers". | i18n infrastructure, translation management, content duplication. The broker operates in one Brazilian city -- 100% PT-BR audience. | PT-BR only. Hardcode all UI strings. |
| **Price history / market analytics** | "Data-driven decisions". | Requires historical data collection, charting, data pipeline. No value for a small showcase site. | Broker knows the market. Site shows current price. |
| **Mortgage calculator** | Seems helpful for buyers. | Financial calculations carry liability risk if wrong. Maintenance burden to keep rates current. Most buyers in Brazil use bank simulators or the broker helps directly. | Link to a bank simulator or omit entirely. Broker discusses financing via WhatsApp. |
| **Complex role-based admin (multi-user, permissions)** | "Future-proofing". | Massive overhead for a single-user system. Auth complexity, permission matrices, audit trails. YAGNI. | Single admin user. If multi-user is ever needed, add it then. |

## Feature Dependencies

```
[Image Upload + Compression]
    └──requires──> [Property CRUD]
                       └──requires──> [Admin Auth]

[Photo Gallery (public)]
    └──requires──> [Image Upload (admin)]
                       └──requires──> [Image Optimization Pipeline]

[WhatsApp Button]
    └──requires──> [Configurable WhatsApp Number (admin)]

[Open Graph Previews]
    └──requires──> [Property Detail Page]
    └──requires──> [Image Optimization Pipeline] (for OG image)

[Property Cards / Listing Page]
    └──requires──> [Property CRUD] (data must exist)
    └──requires──> [Image Optimization Pipeline] (for thumbnails)

[Filters]
    └──enhances──> [Property Cards / Listing Page]

[Map Display]
    └──requires──> [Property CRUD] (location data)

[Featured Properties]
    └──enhances──> [Property Cards / Listing Page]
    └──requires──> [Property CRUD] (featured flag)

[Share Button]
    └──enhances──> [Property Detail Page]

[Admin Dashboard]
    └──requires──> [Property CRUD] (counts by status)
```

### Dependency Notes

- **Image Upload requires Property CRUD:** Photos belong to a property; property must exist first (or be created simultaneously in a single form).
- **Open Graph Previews require Image Optimization:** OG images need to be the right size (1200x630) and under 300KB. The optimization pipeline must produce OG-ready versions.
- **Filters enhance Listing Page:** Filters are purely additive -- the listing page works without them, but they make it better. Can be added in the same phase or later.
- **Photo Gallery requires Image Upload:** Public gallery displays what admin uploaded. Both sides need the image optimization pipeline.
- **Everything public requires Property CRUD:** No public features work without property data in the database.

## MVP Definition

### Launch With (v1)

Minimum viable product -- the broker can share property links on WhatsApp with a professional-looking experience.

- [ ] **Admin auth (single user login)** -- gate to all admin functionality
- [ ] **Property CRUD with all fields** -- broker can add/edit/delete properties with full details
- [ ] **Multi-image upload with drag-drop, reorder, cover selection** -- photos are the product
- [ ] **Client-side image compression + server-side optimization** -- handle raw phone photos
- [ ] **Public property listing page with cards** -- browsable catalog
- [ ] **Public property detail page** -- full info, photo gallery, specs, description
- [ ] **Photo gallery with fullscreen swipe** -- the hero UX element
- [ ] **Sticky WhatsApp button with pre-filled message** -- the conversion action
- [ ] **Dynamic Open Graph tags per property** -- beautiful WhatsApp link previews
- [ ] **Basic filters (type, price, bedrooms)** -- minimum navigation for ~20 items
- [ ] **Property status (available/reserved/sold)** -- prevents wasted inquiries
- [ ] **Responsive mobile-first design** -- 80%+ of traffic is mobile
- [ ] **Configurable WhatsApp number** -- broker autonomy

### Add After Validation (v1.x)

Features to add once the core is working and broker is using the site daily.

- [ ] **Featured/highlighted properties** -- add when broker requests priority ordering
- [ ] **Admin dashboard with counters** -- add when broker wants quick overview
- [ ] **Map display on detail page** -- add when broker confirms location data is available for properties
- [ ] **Share button (Web Share API)** -- add when broker reports clients forwarding links
- [ ] **SEO optimizations (JSON-LD, sitemap)** -- add when organic traffic becomes a goal

### Future Consideration (v2+)

- [ ] **OG image generation with price/specs overlay** -- requires image generation service, defer until basic OG works
- [ ] **Bulk property operations in admin** -- defer until broker manages 20+ properties regularly
- [ ] **Property archive/history** -- defer until there's a need to track past listings
- [ ] **Custom branding/theme settings** -- defer until broker wants personalization

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Property detail page + photo gallery | HIGH | MEDIUM | P1 |
| WhatsApp sticky button + pre-filled msg | HIGH | LOW | P1 |
| Dynamic Open Graph tags | HIGH | MEDIUM | P1 |
| Property cards / listing page | HIGH | LOW | P1 |
| Multi-image upload + compression | HIGH | HIGH | P1 |
| Property CRUD (admin) | HIGH | MEDIUM | P1 |
| Admin auth | HIGH | LOW | P1 |
| Mobile-first responsive design | HIGH | MEDIUM | P1 |
| Basic filters | MEDIUM | MEDIUM | P1 |
| Property status indicators | MEDIUM | LOW | P1 |
| Configurable WhatsApp number | MEDIUM | LOW | P1 |
| Featured properties | MEDIUM | LOW | P2 |
| Admin dashboard counters | LOW | LOW | P2 |
| Map display | MEDIUM | MEDIUM | P2 |
| Share button | MEDIUM | LOW | P2 |
| SEO (JSON-LD, sitemap) | LOW | LOW | P2 |
| OG image with overlay | MEDIUM | HIGH | P3 |
| Bulk admin operations | LOW | MEDIUM | P3 |

**Priority key:**
- P1: Must have for launch -- broker cannot effectively share properties without these
- P2: Should have, add shortly after launch when validated
- P3: Nice to have, future consideration

## Competitor Feature Analysis

| Feature | Brazilian Template Platforms (Tecimob, ImobiBrasil) | Custom-built broker sites | Our Approach |
|---------|-----------------------------------------------------|--------------------------|--------------|
| Photo gallery | Basic lightbox, often slow, no swipe optimization | Varies widely | Fullscreen swipe with pinch-to-zoom, optimized images, fast load |
| WhatsApp integration | Generic button, rarely pre-filled message | Often missing or basic | Sticky button, pre-filled with property name + link, configurable number |
| OG previews | Often broken or generic site preview | Rarely implemented properly | Dynamic per-property with optimized image, price, neighborhood |
| Admin UX | Complex dashboards designed for agencies, overwhelming for solo broker | Often no admin (code changes required) | Minimal, intuitive, PT-BR, designed for non-technical single user |
| Mobile experience | Responsive but desktop-first design adapted to mobile | Varies | Mobile-first from the ground up |
| Pricing | R$42-130/month recurring | One-time development cost | Zero recurring cost (free tier hosting) |
| Filters | Complex multi-faceted search (overkill for small catalogs) | Often none | Simple, appropriate for ~20 properties |
| Image management | Basic upload, limited reorder | Manual file management | Drag-drop, reorder, cover selection, auto-compression |

## UX Pattern Recommendations

### Property Cards
- Vertical layout on mobile (image on top, info below)
- Photo takes ~60% of card height
- Price in bold, large font (R$ 350.000)
- Icon row: bed count, bath count, area m2
- Neighborhood name
- Status badge (if reserved/sold)
- Entire card is tappable (not just a "see more" link)

### Photo Gallery
- Detail page shows 1 hero image + thumbnail strip (or grid of 4-6 with "+N more")
- Tap any photo to enter fullscreen lightbox
- Swipe left/right to navigate, pinch to zoom
- Photo counter (3/12) visible in fullscreen
- Close button (X) or swipe down to dismiss
- Lazy-load thumbnails, eager-load first 2-3 photos

### Filters (for ~20 items)
- Horizontal bar at top of listing page
- 3 filter controls: Type (dropdown), Price range (min-max or preset ranges), Bedrooms (chip selector: 1, 2, 3, 4+)
- Instant client-side filtering (no page reload)
- Show count of results: "8 imoveis encontrados"
- "Limpar filtros" button when any filter is active

### WhatsApp Button
- Fixed bottom bar on mobile (above browser chrome)
- Full-width green button with WhatsApp icon
- Text: "Falar com o corretor" or "Tenho interesse"
- Pre-filled message: "Oi! Tenho interesse no imovel: [Property Title] - [Property URL]"
- Extra bottom padding to avoid browser bar overlap (known mobile sticky issue)

### Admin Image Upload
- Large drop zone: "Arraste fotos aqui ou clique para selecionar"
- Accept multiple files at once
- Show upload progress per image
- After upload: thumbnail grid
- Drag to reorder
- Click star icon to set as cover (cover used for cards + OG)
- Click X to delete (with confirmation)
- Show file size warning if image is very large before compression
- Maximum 15 photos per property

## Sources

- [WPResidence - Property Card Design](https://wpresidence.net/how-to-design-effective-property-unit-cards-on-wordpress-real-estate-sites/)
- [PhotoSwipe - React Image Gallery](https://photoswipe.com/react-image-gallery/)
- [lightGallery](https://www.lightgalleryjs.com/)
- [AltaStreet - Real Estate Web Design Features 2025](https://www.altastreet.com/15-real-estate-web-design-features-that-actually-drive-sales-in-2025/)
- [InMotion Real Estate - Essential Property Website Features](https://inmotionrealestate.com/resources/10-essential-features-of-a-highly-effective-property-website/)
- [Medium - WhatsApp Open Graph Preview with Next.js](https://medium.com/@eduardojs999/how-to-use-whatsapp-open-graph-preview-with-next-js-avoiding-common-pitfalls-88fea4b7c949)
- [OpenGraphPlus - WhatsApp OG Guide](https://opengraphplus.com/consumers/whatsapp)
- [MetaTagPreview - WhatsApp Link Preview Optimization](https://metatagpreview.com/blog/whatsapp-link-preview-optimization)
- [UX Movement - Mobile CTA Placement](https://uxmovement.com/mobile/optimal-placement-for-mobile-call-to-action-buttons/)
- [LogRocket - Filtering UX Patterns](https://blog.logrocket.com/ux-design/filtering-ux-ui-design-patterns-best-practices/)
- [Insaim - Filter UI Design](https://www.insaim.design/blog/filter-ui-design-best-ux-practices-and-examples)
- [browser-image-compression (npm)](https://www.npmjs.com/package/browser-image-compression)
- [Portal Loft - Sites de Corretores Autonomos](https://portal.loft.com.br/site-de-corretores-de-imoveis-autonomos-quais-os-melhores/)
- [Tecimob](https://tecimob.com.br/)
- [ImobiBrasil](https://www.imobibrasil.com.br/)
- [Respond.io - WhatsApp for Real Estate Guide](https://respond.io/blog/whatsapp-for-real-estate)

---
*Feature research for: Real estate showcase/catalog site (Brazilian autonomous broker)*
*Researched: 2026-03-11*
