# Phase 1: Foundation and Auth - Research

**Researched:** 2026-03-12
**Domain:** Next.js 15 + Supabase Auth + Admin scaffold
**Confidence:** HIGH

## Summary

Phase 1 is a greenfield setup: scaffold a Next.js 15 App Router project with TypeScript, Tailwind CSS, and shadcn/ui, wire Supabase for email/password authentication with cookie-based SSR sessions, protect all `/admin/*` routes via middleware, build a settings page (WhatsApp number, site name, broker name), and set up infrastructure guardrails (RLS policies, keep-alive cron).

The stack is well-documented and widely adopted. Supabase's `@supabase/ssr` package is the official way to handle auth in server-rendered Next.js apps -- it uses cookies (not localStorage) so sessions survive SSR and refresh. shadcn/ui provides a production-ready Sidebar component that matches the user's desired admin layout exactly.

**Primary recommendation:** Use `@supabase/ssr` with `middleware.ts` for session refresh + route protection, shadcn/ui Sidebar for admin layout, and a GitHub Actions cron for Supabase keep-alive. Keep all auth on the server side (Server Components + Server Actions) -- no client-side auth state management needed.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **Framework:** Next.js 15 com App Router -- SSR nativo para OG tags na Fase 4, deploy nativo no Vercel free tier
- **CSS:** Tailwind CSS -- utility-first, prototipagem rapida, responsivo sem boilerplate
- **Componentes UI:** shadcn/ui -- acessivel, customizavel, integra com Tailwind, nao adiciona bundle size (copia componentes ao inves de importar pacote)
- **Database/Auth/Storage:** Supabase -- auth com email/senha, PostgreSQL, Storage para fotos, RLS para seguranca
- **Linguagem:** TypeScript -- type safety no projeto inteiro
- **Validacao de forms:** React Hook Form + Zod -- validacao declarativa, boa DX, mensagens de erro em PT-BR
- **Layout do Admin:** Sidebar fixa a esquerda (colapsavel em telas menores) + area de conteudo principal a direita
- **Tela de Login:** Card centralizado, fundo neutro, campos email/senha, botao "Entrar", feedback de erros inline, redirect para /admin/imoveis
- **Pagina de Settings:** Formulario com secoes em cards, WhatsApp com mascara brasileira, nome do site, nome do corretor, toast de sucesso
- **PT-BR em todas as labels, mensagens de erro, e textos da interface**

### Claude's Discretion
- Esquema exato de cores (primary, accent)
- Estrutura de pastas do projeto (src/app, src/components, etc.)
- Configuracao de ESLint/Prettier
- Schema exato das tabelas no Supabase (colunas, tipos, constraints)
- Implementacao do cron keep-alive (Edge Function ou GitHub Action)
- Estrategia de RLS policies

### Deferred Ideas (OUT OF SCOPE)
- Dashboard com contadores (total, disponiveis, vendidos) -- movido para v2 (ADM2-01)
- Personalizacao visual (logo, cores) -- v2 (VIS2-02)
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| AUTH-01 | User can log in with email and password (single admin user) | Supabase `signInWithPassword` via Server Action, cookie-based session |
| AUTH-02 | User session persists across browser refresh | `@supabase/ssr` stores tokens in HTTP-only cookies, middleware refreshes them |
| AUTH-03 | User can log out from any page in the admin | Supabase `signOut()` via Server Action, redirect to login |
| AUTH-04 | Unauthenticated users are redirected from /admin/* routes to login | `middleware.ts` checks session with `getUser()`, redirects if null |
| SETT-01 | Admin can configure WhatsApp number via settings page | `site_settings` table in Supabase, React Hook Form + Zod with Brazilian phone mask |
| SETT-02 | Admin can configure site name and broker name via settings | Same `site_settings` table, simple text fields with validation |
| INFR-01 | Supabase keep-alive cron job prevents free-tier project pausing | GitHub Actions workflow running every Monday/Thursday, queries the DB |
| INFR-02 | All property photos pre-optimized at upload | Phase 1 only sets up Supabase Storage bucket with RLS; actual optimization is Phase 3 |
| INFR-03 | Supabase RLS policies enforce public read / admin-only write | RLS enabled on all tables, anon SELECT policy, authenticated admin INSERT/UPDATE/DELETE |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 15.5.x | React framework with App Router, SSR | User decision; stable LTS, Vercel free-tier native |
| react / react-dom | 19.x | UI library | Ships with Next.js 15 |
| typescript | 5.x | Type safety | User decision |
| tailwindcss | 4.x | Utility-first CSS | User decision; ships with Next.js 15 create |
| @supabase/supabase-js | 2.x | Supabase client (DB, Auth, Storage) | Official client |
| @supabase/ssr | 0.5.x | Cookie-based auth for SSR frameworks | Official SSR package, replaces deprecated auth-helpers |
| shadcn/ui | latest | Accessible UI components (copied, not imported) | User decision; Sidebar component included |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-hook-form | 7.x | Form state management | All forms (login, settings) |
| @hookform/resolvers | 3.x | Zod integration for react-hook-form | Validation resolver |
| zod | 3.x | Schema validation (client + server) | Form validation, Server Action input validation |
| sonner | 1.x | Toast notifications | Settings save feedback ("Configuracoes salvas") |
| lucide-react | latest | Icons | Sidebar nav icons, form feedback icons |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Next.js 15 | Next.js 16 (current) | 16 renames middleware to proxy.ts; 15 is stable LTS, user chose it |
| @supabase/ssr | @supabase/auth-helpers-nextjs | auth-helpers is deprecated; ssr is the replacement |
| sonner | react-hot-toast | sonner integrates natively with shadcn/ui Toast component |

**Installation:**
```bash
npx create-next-app@15 jander --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd jander
npx shadcn@latest init
npx shadcn@latest add button card input label sidebar sheet separator toast dropdown-menu form
npm install @supabase/supabase-js @supabase/ssr react-hook-form @hookform/resolvers zod sonner lucide-react
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── (public)/           # Future public pages (Phase 4)
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx    # Login page
│   ├── admin/
│   │   ├── layout.tsx      # Admin layout with Sidebar
│   │   ├── imoveis/
│   │   │   └── page.tsx    # Property list (placeholder for Phase 2)
│   │   └── configuracoes/
│   │       └── page.tsx    # Settings page
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home redirect (or future public home)
├── components/
│   ├── ui/                 # shadcn/ui components (auto-generated)
│   ├── admin/
│   │   ├── app-sidebar.tsx # Sidebar configuration
│   │   └── admin-topbar.tsx
│   └── login-form.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts       # Browser client (createBrowserClient)
│   │   └── server.ts       # Server client (createServerClient)
│   ├── validations/
│   │   └── settings.ts     # Zod schemas
│   └── utils.ts            # cn() helper from shadcn
├── actions/
│   ├── auth.ts             # signIn, signOut Server Actions
│   └── settings.ts         # saveSettings Server Action
├── middleware.ts            # Auth token refresh + route protection
└── types/
    └── database.ts         # Supabase generated types
```

### Pattern 1: Cookie-Based Auth with Middleware
**What:** Supabase auth tokens stored in HTTP-only cookies, refreshed automatically by middleware on every request.
**When to use:** Always -- this is the only correct pattern for SSR auth with Supabase.
**Example:**

```typescript
// src/lib/supabase/server.ts
// Source: https://supabase.com/docs/guides/auth/server-side/creating-a-client
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // setAll called from Server Component -- ignored,
            // middleware handles refresh
          }
        },
      },
    }
  )
}
```

```typescript
// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### Pattern 2: Middleware for Session Refresh + Route Protection
**What:** middleware.ts refreshes auth tokens and redirects unauthenticated users away from /admin/*.
**When to use:** Every request. The middleware runs before Server Components render.
**Example:**

```typescript
// src/middleware.ts
// Source: https://supabase.com/docs/guides/auth/server-side/nextjs
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: use getUser() not getSession() for security
  const { data: { user } } = await supabase.auth.getUser()

  // Protect /admin/* routes
  if (!user && request.nextUrl.pathname.startsWith('/admin')) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users away from login
  if (user && request.nextUrl.pathname === '/login') {
    const url = request.nextUrl.clone()
    url.pathname = '/admin/imoveis'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### Pattern 3: Server Actions for Auth Operations
**What:** Sign-in and sign-out as Server Actions -- no API routes needed.
**When to use:** Login form submission, logout button click.
**Example:**

```typescript
// src/actions/auth.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Email invalido'),
  password: z.string().min(6, 'Senha deve ter no minimo 6 caracteres'),
})

export async function signIn(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    return { error: 'Email ou senha incorretos' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)

  if (error) {
    return { error: 'Email ou senha incorretos' }
  }

  redirect('/admin/imoveis')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
```

### Pattern 4: Settings with Server Actions + React Hook Form
**What:** Form validated client-side with Zod, submitted via Server Action, data stored in Supabase.
**When to use:** Settings page, any admin form.

```typescript
// src/lib/validations/settings.ts
import { z } from 'zod'

export const settingsSchema = z.object({
  whatsapp: z
    .string()
    .min(1, 'WhatsApp e obrigatorio')
    .regex(/^\(\d{2}\)\s\d{5}-\d{4}$/, 'Formato invalido. Use (XX) XXXXX-XXXX'),
  site_name: z.string().min(1, 'Nome do site e obrigatorio'),
  broker_name: z.string().min(1, 'Nome do corretor e obrigatorio'),
})

export type SettingsFormData = z.infer<typeof settingsSchema>
```

### Anti-Patterns to Avoid
- **Using getSession() in server code:** Always use `getUser()` which validates the token with the Supabase server. `getSession()` reads from local storage/cookies without validation and is NOT secure for server-side checks.
- **Client-side auth state management:** Do not create an AuthContext or useAuth hook. The middleware + Server Components pattern handles everything. Client components that need the user should call `getUser()` on the server and pass as props.
- **Using @supabase/auth-helpers-nextjs:** This package is deprecated. Use `@supabase/ssr` instead.
- **Storing auth tokens in localStorage:** `@supabase/ssr` uses cookies automatically. Never override this.
- **Individual cookie methods (get/set/remove):** Always use `getAll`/`setAll` -- the individual methods are deprecated.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Phone input mask | Regex-based onChange handler | Simple pattern with controlled input + format function | Brazilian phone format (XX) XXXXX-XXXX is predictable; a lightweight format/parse utility is sufficient |
| Toast notifications | Custom notification system | sonner (via shadcn/ui) | Handles stacking, animations, auto-dismiss, accessible |
| Sidebar with collapse/mobile drawer | Custom sidebar with state management | shadcn/ui Sidebar component | Handles collapsible, mobile sheet, keyboard shortcut (Cmd+B), accessible |
| Auth session management | Custom JWT parsing, cookie management | @supabase/ssr middleware pattern | Token refresh, cookie sync, security edge cases |
| Form validation | Manual validation logic | React Hook Form + Zod + zodResolver | Handles touched states, error display, revalidation |

**Key insight:** This phase is almost entirely "glue code" connecting well-documented libraries. The risk is not in building something novel -- it is in mis-wiring the auth cookie flow or skipping RLS.

## Common Pitfalls

### Pitfall 1: Forgetting to refresh tokens in middleware
**What goes wrong:** User stays logged in for a while, token expires, next page navigation fails silently or throws.
**Why it happens:** Developers create the Supabase client in Server Components but forget the middleware that refreshes tokens before they reach the component.
**How to avoid:** The middleware.ts file MUST call `supabase.auth.getUser()` on every matched request. This triggers token refresh via the `setAll` cookie callback.
**Warning signs:** Auth works initially but breaks after ~1 hour (default JWT expiry).

### Pitfall 2: Using getSession() instead of getUser() on the server
**What goes wrong:** Authentication appears to work but is insecure -- tokens are read from cookies without validation.
**Why it happens:** `getSession()` is easier to use and was the old pattern. Supabase docs now explicitly warn against it in server contexts.
**How to avoid:** Always use `supabase.auth.getUser()` in middleware and Server Components. It sends a request to the Supabase Auth server to validate the token.
**Warning signs:** No obvious signs -- this is a silent security vulnerability.

### Pitfall 3: Not enabling RLS on tables
**What goes wrong:** Anyone with the anon key can read/write all data via the Supabase REST API.
**Why it happens:** Tables created via SQL or migrations have RLS disabled by default.
**How to avoid:** Every CREATE TABLE statement must be followed by `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;` and at least one policy.
**Warning signs:** Data accessible without authentication when queried directly via the Supabase API URL.

### Pitfall 4: Supabase free tier pausing after 7 days
**What goes wrong:** The database goes offline, the entire site stops working.
**Why it happens:** Supabase pauses free-tier projects with no API activity for 7+ days.
**How to avoid:** Set up a GitHub Actions cron that runs every 3-4 days and performs a simple SELECT query.
**Warning signs:** Site returns errors after a week of low traffic.

### Pitfall 5: Creating the admin user via the app
**What goes wrong:** Developers build a registration flow for a single-admin system, adding unnecessary attack surface.
**Why it happens:** Habit from multi-user apps.
**How to avoid:** Create the admin user directly via the Supabase Dashboard (Authentication > Users > Add User) or via a one-time seed script. No registration endpoint in the app.
**Warning signs:** There is a /register route or signup Server Action in the codebase.

### Pitfall 6: Mutating supabaseResponse in middleware
**What goes wrong:** Cookies are not properly synced between the request and response, causing auth to silently break.
**Why it happens:** The middleware pattern requires recreating `NextResponse.next({ request })` inside the `setAll` callback. If you create a new response elsewhere and return it, the cookies set by Supabase are lost.
**How to avoid:** Follow the exact pattern from the Supabase docs. Never create a new NextResponse after the Supabase client is instantiated -- always return the `supabaseResponse` variable.
**Warning signs:** Auth works on first load but breaks on navigation, or session is lost randomly.

## Code Examples

### Supabase Database Schema (settings table)

```sql
-- Create settings table (key-value for simplicity)
CREATE TABLE public.site_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  whatsapp TEXT NOT NULL DEFAULT '',
  site_name TEXT NOT NULL DEFAULT '',
  broker_name TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Public can read settings (needed for WhatsApp button on public site)
CREATE POLICY "Anyone can read settings"
  ON public.site_settings FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only authenticated admin can update
CREATE POLICY "Authenticated users can update settings"
  ON public.site_settings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Only authenticated admin can insert (initial seed)
CREATE POLICY "Authenticated users can insert settings"
  ON public.site_settings FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Seed the single settings row
INSERT INTO public.site_settings (whatsapp, site_name, broker_name)
VALUES ('', '', '');
```

### Keep-Alive Table

```sql
-- Minimal table for keep-alive pings
CREATE TABLE public.keep_alive (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  pinged_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.keep_alive ENABLE ROW LEVEL SECURITY;

-- Allow anon to read (for the cron ping)
CREATE POLICY "Anyone can read keep_alive"
  ON public.keep_alive FOR SELECT
  TO anon, authenticated
  USING (true);
```

### GitHub Actions Keep-Alive Workflow

```yaml
# .github/workflows/keep-supabase-alive.yml
name: Keep Supabase Alive

on:
  schedule:
    - cron: '0 9 * * 1,4'  # Monday and Thursday at 9:00 UTC
  workflow_dispatch:         # Manual trigger

jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Ping Supabase
        run: |
          curl -s "${{ secrets.SUPABASE_URL }}/rest/v1/keep_alive?select=id&limit=1" \
            -H "apikey: ${{ secrets.SUPABASE_ANON_KEY }}" \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}"
```

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...

# Note: Supabase is migrating from ANON_KEY to PUBLISHABLE_KEY naming.
# New projects may use NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY instead.
# Both work. Use whichever your Supabase dashboard provides.
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| @supabase/auth-helpers-nextjs | @supabase/ssr | 2024 | auth-helpers is deprecated; ssr uses getAll/setAll cookie pattern |
| getSession() for server auth checks | getUser() for server auth checks | 2024 | getSession() does not validate tokens server-side; security risk |
| middleware.ts | proxy.ts (Next.js 16+) | 2025 (Next.js 16) | Renamed convention; Next.js 15 still uses middleware.ts |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY | 2025 | Supabase renaming keys; both work during transition |
| Individual cookie get/set/remove | getAll/setAll only | 2024 | Individual methods deprecated in @supabase/ssr |

**Deprecated/outdated:**
- `@supabase/auth-helpers-nextjs`: Replaced by `@supabase/ssr`. Do not install.
- `supabase.auth.getSession()` on server: Use `getUser()` instead for security.
- Next.js `pages/` directory: Project uses App Router exclusively.

## Open Questions

1. **Next.js 15.5 vs 16 decision**
   - What we know: User decided Next.js 15. Next.js 16 is now current (released late 2025). Next.js 15 is in maintenance LTS. The main breaking change relevant to us is middleware.ts renamed to proxy.ts.
   - What's unclear: Whether the user specifically wants 15 or just said "15" because it was current at decision time.
   - Recommendation: Stick with Next.js 15 as decided. It is stable LTS, Supabase docs support it, and middleware.ts works. Migration to 16 later is a simple codemod (`npx @next/codemod@canary middleware-to-proxy .`).

2. **Supabase environment variable naming**
   - What we know: Supabase is transitioning from ANON_KEY to PUBLISHABLE_KEY. Both work.
   - Recommendation: Use whatever the Supabase dashboard provides for the project. If it is a new project, it will likely use the new naming.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 2.x (recommended for Next.js + TypeScript) |
| Config file | None -- Wave 0 creates `vitest.config.ts` |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| AUTH-01 | Sign in with email/password returns session | integration | `npx vitest run src/__tests__/auth.test.ts -t "sign in"` | No -- Wave 0 |
| AUTH-02 | Session cookie persists (middleware refreshes token) | integration | `npx vitest run src/__tests__/middleware.test.ts -t "refresh"` | No -- Wave 0 |
| AUTH-03 | Sign out clears session and redirects | integration | `npx vitest run src/__tests__/auth.test.ts -t "sign out"` | No -- Wave 0 |
| AUTH-04 | Middleware redirects unauthenticated /admin/* to /login | unit | `npx vitest run src/__tests__/middleware.test.ts -t "redirect"` | No -- Wave 0 |
| SETT-01 | Settings form validates WhatsApp format | unit | `npx vitest run src/__tests__/settings.test.ts -t "whatsapp"` | No -- Wave 0 |
| SETT-02 | Settings form saves site_name and broker_name | unit | `npx vitest run src/__tests__/settings.test.ts -t "save"` | No -- Wave 0 |
| INFR-01 | Keep-alive endpoint responds | smoke | Manual -- verify GitHub Action runs on schedule | N/A |
| INFR-02 | Supabase Storage bucket exists with RLS | manual-only | Check via Supabase dashboard | N/A |
| INFR-03 | RLS policies block unauthorized writes | integration | `npx vitest run src/__tests__/rls.test.ts` | No -- Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run --reporter=verbose`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `vitest.config.ts` -- Framework configuration with Next.js + path aliases
- [ ] `src/__tests__/middleware.test.ts` -- Covers AUTH-02, AUTH-04
- [ ] `src/__tests__/auth.test.ts` -- Covers AUTH-01, AUTH-03
- [ ] `src/__tests__/settings.test.ts` -- Covers SETT-01, SETT-02
- [ ] `src/__tests__/validations.test.ts` -- Zod schema unit tests
- [ ] Framework install: `npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom`

## Sources

### Primary (HIGH confidence)
- [Supabase SSR Next.js setup](https://supabase.com/docs/guides/auth/server-side/nextjs) -- Middleware pattern, client utilities, getUser() vs getSession()
- [Supabase SSR client creation](https://supabase.com/docs/guides/auth/server-side/creating-a-client) -- createServerClient/createBrowserClient with getAll/setAll
- [Supabase AI prompt for Next.js auth](https://supabase.com/docs/guides/getting-started/ai-prompts/nextjs-supabase-auth) -- Complete code for server.ts, client.ts, middleware.ts
- [Next.js proxy.ts docs](https://nextjs.org/docs/app/api-reference/file-conventions/proxy) -- proxy.ts is Next.js 16+; Next.js 15 uses middleware.ts
- [shadcn/ui installation](https://ui.shadcn.com/docs/installation/next) -- Init and component add commands
- [shadcn/ui Sidebar](https://ui.shadcn.com/docs/components/radix/sidebar) -- SidebarProvider, composable sidebar components
- [Supabase RLS docs](https://supabase.com/docs/guides/database/postgres/row-level-security) -- Policy syntax and patterns

### Secondary (MEDIUM confidence)
- [Supabase API key migration](https://github.com/orgs/supabase/discussions/29260) -- ANON_KEY to PUBLISHABLE_KEY transition timeline
- [GitHub Actions keep-alive pattern](https://dev.to/jps27cse/how-to-prevent-your-supabase-project-database-from-being-paused-using-github-actions-3hel) -- Workflow YAML and approach
- [supabase-pause-prevention repo](https://github.com/travisvn/supabase-pause-prevention) -- Alternative Vercel cron approach

### Tertiary (LOW confidence)
- [Supabase pausing despite cron](https://shadhujan.medium.com/how-to-keep-supabase-free-tier-projects-active-d60fd4a17263) -- Some reports of pausing despite cron in late 2025; needs monitoring

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- All libraries are user decisions, well-documented, widely adopted
- Architecture: HIGH -- Supabase official docs provide exact patterns for Next.js SSR auth
- Pitfalls: HIGH -- Well-known issues documented in official Supabase and Next.js docs
- Validation: MEDIUM -- Vitest is standard for Next.js but testing Supabase middleware requires mocking

**Research date:** 2026-03-12
**Valid until:** 2026-04-12 (stable ecosystem, 30-day window)
