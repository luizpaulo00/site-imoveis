# Phase 2: Property Management - Research

**Researched:** 2026-03-12
**Domain:** CRUD admin interface for real estate properties (Next.js 15 + Supabase + shadcn/ui)
**Confidence:** HIGH

## Summary

Phase 2 builds the property management CRUD in the admin panel. The existing codebase has strong patterns from Phase 1 (React Hook Form + Zod + Server Actions + shadcn cards) that extend directly to property forms. Two new technical domains enter: Brazilian Real (R$) currency input masking and interactive map for location picking (Leaflet + OpenStreetMap).

The database schema already has a `properties` table with most fields. Two columns must be added: `parking_spaces INT` and `condition TEXT CHECK (condition IN ('novo', 'usado'))`. RLS policies for properties already exist (public read, authenticated write/delete).

**Primary recommendation:** Follow the established settings-form.tsx pattern (single-page form with card sections, React Hook Form + Zod, Server Actions). Use `react-currency-input-field` for R$ masking and `react-leaflet` v5 + `leaflet` v1.9 for the map picker. Use a hand-rolled `formatCurrency` utility for display-only formatting (table, lists).

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Single-page form with card sections (same pattern as settings-form.tsx)
- Sections: Dados Basicos, Caracteristicas, Localizacao, Status
- Same form for create and edit (pre-filled on edit)
- Fields: titulo, descricao (textarea livre), preco com mascara R$, tipo (Casa/Apartamento), quartos, banheiros, vagas de garagem, area m2, condicao (Novo/Usado), endereco, bairro, latitude/longitude via mapa, status (Disponivel/Reservado/Vendido), destaque (boolean)
- New DB columns: `parking_spaces INT`, `condition TEXT CHECK (condition IN ('novo', 'usado'))`
- Price mask: auto-format as R$ 350.000,00
- Table list with columns: Titulo, Tipo, Preco (R$), Status (badge), Fotos (count), Acoes (editar/deletar)
- Button "+ Novo Imovel" at top
- Sort: created_at DESC
- Filter by status: tabs or dropdown
- Status badges: green Disponivel, yellow Reservado, red Vendido
- Delete confirmation dialog: "Tem certeza que deseja excluir [titulo]?"
- Status and featured managed inside edit form (no quick actions in list)
- Leaflet + OpenStreetMap for map (free, no API key)
- Map: click to place pin, drag to adjust, centered on Formosa-GO
- Location is optional
- Types: Casa, Apartamento only (sale only, no rental)
- Condition: Novo / Usado

### Claude's Discretion
- Currency mask library (research best free option)
- Map library (Leaflet recommended, can evaluate alternatives)
- Table responsiveness on smaller screens
- Field validation rules (required/optional, min/max)
- Toast feedback after create/edit/delete
- Empty state when no properties
- Map zoom level and initial center

### Deferred Ideas (OUT OF SCOPE)
- Dashboard with counters (ADM2-01)
- Text search in admin list (unnecessary for ~20 properties)
- Quick status actions in list (all via form)
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PROP-01 | Admin can create property with all fields | Form with card sections, Zod validation, Server Action for INSERT |
| PROP-02 | Admin can set property location on map | react-leaflet v5 + Leaflet v1.9, dynamic import with ssr:false |
| PROP-03 | Admin can edit all property fields | Same form pre-filled, Server Action for UPDATE by ID |
| PROP-04 | Admin can delete property with confirmation | AlertDialog from shadcn/ui, Server Action for DELETE |
| PROP-05 | Admin can set status (disponivel/reservado/vendido) | Select component in form, Zod enum validation |
| PROP-06 | Admin can mark property as featured | Switch/toggle in form, boolean field |
| PROP-07 | Admin sees property list with status, title, photo count, actions | Table component, status badges, Server Action for list query |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-hook-form | ^7.71.2 | Form state management | Already in project, proven pattern from settings-form |
| zod | ^4.3.6 | Schema validation | Already in project, used with @hookform/resolvers |
| react-currency-input-field | ^4.0.3 | R$ currency input mask | Zero deps, 3.1kB gzipped, native intlConfig for pt-BR/BRL, supports React 19 |
| react-leaflet | ^5.0.0 | React wrapper for Leaflet maps | Requires React 19 (matches project), standard for React map integration |
| leaflet | ^1.9.4 | Map rendering engine | Required by react-leaflet, 100% free with OpenStreetMap tiles |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @types/leaflet | ^1.9.21 | TypeScript types for Leaflet | Dev dependency, needed for marker icon fix and map events |
| shadcn/ui (select) | latest | Select dropdowns | Property type, status, condition selects |
| shadcn/ui (textarea) | latest | Multi-line text input | Property description |
| shadcn/ui (switch) | latest | Toggle control | Featured property toggle |
| shadcn/ui (alert-dialog) | latest | Confirmation modal | Delete property confirmation |
| shadcn/ui (table) | latest | Data table | Property listing |
| shadcn/ui (badge) | latest | Status indicators | Colored status badges in table |
| shadcn/ui (tabs) | latest | Tab navigation | Status filter tabs |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| react-currency-input-field | Hand-rolled formatCurrency (like phone mask) | Phone mask is simple (11 digits). Currency needs decimal handling, grouping, cursor position — library handles edge cases better |
| react-leaflet | Plain Leaflet API | react-leaflet provides React component model, but plain Leaflet is simpler for a single picker. react-leaflet chosen for consistency with React patterns |

**Installation:**
```bash
npm install react-currency-input-field react-leaflet leaflet
npm install -D @types/leaflet
npx shadcn@latest add select textarea switch alert-dialog table badge tabs
```

## Architecture Patterns

### Recommended Project Structure
```
src/
  app/admin/imoveis/
    page.tsx              # Property list (server component)
    novo/
      page.tsx            # New property page (server component shell)
    [id]/
      editar/
        page.tsx          # Edit property page (server component shell, loads data)
  components/admin/
    property-form.tsx     # Shared create/edit form (client component)
    property-list.tsx     # Property table (client component for interactivity)
    property-status-badge.tsx  # Colored status badge
    map-picker.tsx        # Leaflet map click-to-pin (client component)
  actions/
    properties.ts         # Server actions: create, update, delete, list
  lib/
    validations/
      property.ts         # Zod schema for property
    utils/
      currency.ts         # formatCurrency for display (table, non-input contexts)
```

### Pattern 1: Shared Create/Edit Form
**What:** Single PropertyForm component used for both create and edit
**When to use:** When create and edit share identical fields
**Example:**
```typescript
// src/components/admin/property-form.tsx
'use client'

interface PropertyFormProps {
  property?: PropertyFormData  // undefined = create, defined = edit
  propertyId?: string
}

export function PropertyForm({ property, propertyId }: PropertyFormProps) {
  const { register, handleSubmit, setValue, control, formState: { errors } } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: property ?? defaultPropertyValues,
  })

  async function onSubmit(data: PropertyFormData) {
    const result = propertyId
      ? await updateProperty(propertyId, data)
      : await createProperty(data)
    // handle result...
  }
}
```

### Pattern 2: Dynamic Map Import (SSR-safe)
**What:** Leaflet cannot run on the server. Must use next/dynamic with ssr:false
**When to use:** Any component importing leaflet or react-leaflet
**Example:**
```typescript
// src/components/admin/map-picker.tsx
'use client'

import dynamic from 'next/dynamic'

const MapPickerInner = dynamic(() => import('./map-picker-inner'), {
  ssr: false,
  loading: () => <div className="h-[400px] bg-muted animate-pulse rounded-lg" />,
})

export function MapPicker(props: MapPickerProps) {
  return <MapPickerInner {...props} />
}

// src/components/admin/map-picker-inner.tsx
'use client'

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix default marker icon (webpack breaks Leaflet's icon detection)
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x.src,
  iconUrl: markerIcon.src,
  shadowUrl: markerShadow.src,
})
```

### Pattern 3: Server Action with Revalidation
**What:** Server actions that mutate data and revalidate the list page
**When to use:** Create, update, delete operations
**Example:**
```typescript
// src/actions/properties.ts
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function createProperty(data: PropertyFormData) {
  const parsed = propertySchema.safeParse(data)
  if (!parsed.success) return { error: 'Dados invalidos' }

  const supabase = await createClient()
  const { error } = await supabase.from('properties').insert({
    title: parsed.data.title,
    // ... map all fields
  })

  if (error) return { error: 'Erro ao criar imovel' }

  revalidatePath('/admin/imoveis')
  return { success: true }
}
```

### Pattern 4: Currency Input with react-currency-input-field
**What:** Controlled currency input integrated with React Hook Form
**When to use:** Price field in property form
**Example:**
```typescript
import CurrencyInput from 'react-currency-input-field'
import { Controller } from 'react-hook-form'

<Controller
  name="price"
  control={control}
  render={({ field }) => (
    <CurrencyInput
      intlConfig={{ locale: 'pt-BR', currency: 'BRL' }}
      value={field.value}
      onValueChange={(value) => field.onChange(value ? parseFloat(value) : undefined)}
      className="..." // match shadcn Input styling
      placeholder="R$ 0,00"
    />
  )}
/>
```

### Anti-Patterns to Avoid
- **Importing leaflet at module level in a server component:** Leaflet accesses `window` and `document` on import. Always use dynamic import with ssr:false.
- **Storing formatted price in DB:** Store as NUMERIC(12,2) raw number (e.g., 350000.00). Format only for display.
- **Using register() for currency input:** react-currency-input-field is a controlled component. Use Controller from react-hook-form instead.
- **Multiple API calls for form load:** Fetch property data in the server component page.tsx and pass as props to the client form component.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Currency input masking | Custom mask with regex/keydown handlers | react-currency-input-field | Cursor positioning, paste handling, decimal grouping, locale-aware separators are deceptively complex |
| Map with click-to-pin | Raw Leaflet DOM manipulation | react-leaflet MapContainer + useMapEvents | React lifecycle integration, cleanup, re-renders handled |
| Confirmation dialog | Custom modal with portals | shadcn AlertDialog | Accessibility (focus trap, escape key, screen readers) handled |
| Data table | Manual HTML table | shadcn Table components | Consistent styling, responsive patterns |

**Key insight:** The phone mask in this project works because it is a fixed-format 11-digit input. Currency masking is fundamentally harder (variable length, decimal separator, grouping, cursor jumps). Use a library.

## Common Pitfalls

### Pitfall 1: Leaflet CSS Not Loaded
**What goes wrong:** Map renders but tiles are misaligned, controls overlap, markers invisible
**Why it happens:** Leaflet requires its CSS (`leaflet/dist/leaflet.css`) and it is not loaded by default
**How to avoid:** Import `leaflet/dist/leaflet.css` in the map component (the dynamically imported one)
**Warning signs:** Map container shows but tiles are in wrong positions

### Pitfall 2: Leaflet Marker Icon Missing
**What goes wrong:** Map renders, clicks register, but no pin/marker appears
**Why it happens:** Webpack/Turbopack breaks Leaflet's default icon URL detection. The bundler rewrites image paths.
**How to avoid:** Explicitly import marker icon PNGs and call `L.Icon.Default.mergeOptions()` — see code example above
**Warning signs:** Console errors about missing marker-icon.png

### Pitfall 3: "Map container is already initialized" Error
**What goes wrong:** Error on hot reload or navigation in development
**Why it happens:** React 19 strict mode double-mounts components. Leaflet's MapContainer does not cleanly unmount.
**How to avoid:** Use a key prop on MapContainer that changes only when needed. In development, this error is benign and does not appear in production.
**Warning signs:** Error only in dev, works fine in production build

### Pitfall 4: Price Value Type Mismatch
**What goes wrong:** Price saved as string or with formatting characters in DB
**Why it happens:** react-currency-input-field returns string values; developer forgets to parse
**How to avoid:** In `onValueChange`, parse to number: `parseFloat(value)`. Zod schema should validate as `z.number()` or `z.coerce.number()`.
**Warning signs:** DB has values like "350.000,00" instead of 350000.00

### Pitfall 5: Server Component vs Client Component Boundary
**What goes wrong:** Form tries to use server-only features or page tries to use hooks
**Why it happens:** Mixing server and client concerns in same file
**How to avoid:** Page.tsx (server) fetches data and renders client form component. Form component is 'use client' and receives data as props.
**Warning signs:** "useState can only be used in Client Components" or similar errors

### Pitfall 6: Missing revalidatePath After Mutation
**What goes wrong:** After creating/editing a property, the list page shows stale data
**Why it happens:** Next.js caches server component renders. Mutations don't auto-invalidate.
**How to avoid:** Call `revalidatePath('/admin/imoveis')` in every mutation server action
**Warning signs:** Need to refresh browser to see changes

## Code Examples

### Zod Property Schema
```typescript
// src/lib/validations/property.ts
import { z } from 'zod'

export const propertySchema = z.object({
  title: z.string().min(1, 'Titulo e obrigatorio').max(200),
  description: z.string().optional().default(''),
  price: z.coerce.number().positive('Preco deve ser maior que zero').optional(),
  property_type: z.enum(['casa', 'apartamento'], { required_error: 'Selecione o tipo' }),
  bedrooms: z.coerce.number().int().min(0).max(20).optional(),
  bathrooms: z.coerce.number().int().min(0).max(20).optional(),
  parking_spaces: z.coerce.number().int().min(0).max(20).optional(),
  area: z.coerce.number().positive().optional(),
  condition: z.enum(['novo', 'usado']).optional(),
  address: z.string().optional().default(''),
  neighborhood: z.string().optional().default(''),
  latitude: z.coerce.number().min(-90).max(90).optional().nullable(),
  longitude: z.coerce.number().min(-180).max(180).optional().nullable(),
  status: z.enum(['disponivel', 'reservado', 'vendido']).default('disponivel'),
  featured: z.boolean().default(false),
})

export type PropertyFormData = z.infer<typeof propertySchema>
```

### Display-Only Currency Formatter
```typescript
// src/lib/utils/currency.ts
export function formatCurrency(value: number | null | undefined): string {
  if (value == null) return '-'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}
```

### Map Click Handler (react-leaflet)
```typescript
// Inside map-picker-inner.tsx
function ClickHandler({ onLocationChange }: { onLocationChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationChange(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

// Formosa-GO coordinates: -15.4472, -47.3340
const FORMOSA_CENTER: [number, number] = [-15.4472, -47.3340]
const DEFAULT_ZOOM = 13
```

### Delete Confirmation Pattern
```typescript
// Using shadcn AlertDialog
<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive" size="sm">Excluir</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Excluir imovel</AlertDialogTitle>
      <AlertDialogDescription>
        Tem certeza que deseja excluir "{property.title}"? Esta acao nao pode ser desfeita.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancelar</AlertDialogCancel>
      <AlertDialogAction onClick={() => handleDelete(property.id)} className="bg-destructive">
        Excluir
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| react-leaflet v4 (React 18) | react-leaflet v5 (React 19 required) | 2024 | Must use v5 for this project (React 19) |
| Custom currency mask with regex | react-currency-input-field v4 with intlConfig | 2024 | Native Intl API integration, zero-dep |
| shadcn/ui v0 (radix primitives) | shadcn v4 (base-ui migration) | 2025 | Component CLI changed, but API similar |

**Deprecated/outdated:**
- `react-currency-input` (different package): unmaintained, does not support React 19
- `react-leaflet` v3/v4: requires React 16-18, incompatible with this project

## Open Questions

1. **Leaflet icon imports with Turbopack**
   - What we know: Webpack icon fix is well-documented. Turbopack (used in this project's `next dev --turbopack`) may handle image imports differently.
   - What's unclear: Whether the `require()` or static import approach works with Turbopack
   - Recommendation: Test with static imports (`import markerIcon from 'leaflet/dist/images/marker-icon.png'`) first. If broken, use public directory fallback (`/marker-icon.png`).

2. **react-currency-input-field styling with shadcn Input**
   - What we know: The library renders its own `<input>`, not shadcn's Input component
   - What's unclear: Exact className needed to match shadcn Input styling
   - Recommendation: Apply the same Tailwind classes used by shadcn Input component (inspect the generated component). The library accepts `className` prop.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1 (unit) + Playwright 1.58 (e2e) |
| Config file | vitest.config.ts, playwright.config.ts |
| Quick run command | `npm test` |
| Full suite command | `npm test && npm run test:e2e` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PROP-01 | Create property with all fields | unit + e2e | `npx vitest run src/__tests__/properties.test.ts -t "create"` | No - Wave 0 |
| PROP-02 | Set location on map | e2e (manual-only for map interaction) | Manual verification with playwright-cli | No |
| PROP-03 | Edit all property fields | unit + e2e | `npx vitest run src/__tests__/properties.test.ts -t "update"` | No - Wave 0 |
| PROP-04 | Delete with confirmation | unit + e2e | `npx vitest run src/__tests__/properties.test.ts -t "delete"` | No - Wave 0 |
| PROP-05 | Set status | unit | `npx vitest run src/__tests__/properties.test.ts -t "status"` | No - Wave 0 |
| PROP-06 | Mark as featured | unit | `npx vitest run src/__tests__/properties.test.ts -t "featured"` | No - Wave 0 |
| PROP-07 | Property list with status, title, photo count | unit + e2e | `npx vitest run src/__tests__/properties.test.ts -t "list"` | No - Wave 0 |

### Sampling Rate
- **Per task commit:** `npm test`
- **Per wave merge:** `npm test`
- **Phase gate:** `npm test` green before verification

### Wave 0 Gaps
- [ ] `src/__tests__/properties.test.ts` -- covers PROP-01 through PROP-07 (server action unit tests)
- [ ] `src/__tests__/property-validation.test.ts` -- covers Zod schema validation
- [ ] `src/__tests__/currency.test.ts` -- covers formatCurrency utility

## Sources

### Primary (HIGH confidence)
- npm registry (direct query) -- react-currency-input-field v4.0.3 peerDeps: React ^16-19
- npm registry (direct query) -- react-leaflet v5.0.0 peerDeps: React ^19, Leaflet ^1.9
- npm registry (direct query) -- leaflet v1.9.4
- Existing codebase -- settings-form.tsx pattern, server actions pattern, Zod validation pattern

### Secondary (MEDIUM confidence)
- WebSearch: react-leaflet + Next.js dynamic import pattern (multiple blog posts and GitHub issues confirm approach)
- WebSearch: Leaflet marker icon fix (well-documented across GitHub issues #808, #753, #1081)
- WebSearch: react-currency-input-field intlConfig for pt-BR/BRL (official examples site)

### Tertiary (LOW confidence)
- Turbopack compatibility with Leaflet image imports (untested, needs validation during implementation)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries verified via npm, peer deps confirmed compatible with React 19
- Architecture: HIGH -- extends proven patterns from Phase 1 codebase
- Pitfalls: HIGH -- Leaflet SSR and icon issues are extensively documented across multiple sources
- Currency masking: MEDIUM -- library API verified, but shadcn styling integration untested
- Map Turbopack compat: LOW -- not verified, may need fallback approach

**Research date:** 2026-03-12
**Valid until:** 2026-04-12 (stable libraries, 30-day validity)
