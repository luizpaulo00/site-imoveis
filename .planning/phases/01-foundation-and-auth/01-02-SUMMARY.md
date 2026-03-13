---
phase: 01-foundation-and-auth
plan: 02
subsystem: auth-ui
tags: [login, auth, sidebar, admin-layout, server-actions, react-hook-form, zod]

# Dependency graph
requires: [01-01]
provides:
  - "Login page with centered card, email/password form, Entrar button"
  - "signIn/signOut Server Actions using Supabase signInWithPassword"
  - "Admin layout with dark sidebar (Imoveis, Configuracoes, Sair)"
  - "AdminTopbar component with page title and mobile sidebar trigger"
  - "Placeholder /admin/imoveis page"
  - "6 auth unit tests covering signIn/signOut/validation"
affects: [01-03, 02-property-crud]

# Tech tracking
tech-stack:
  added: []
  patterns: [server-actions-auth, react-hook-form-with-zod, sidebar-css-variables-dark-theme, admin-layout-with-getUser-guard]

key-files:
  created:
    - src/actions/auth.ts
    - src/components/login-form.tsx
    - src/app/(auth)/login/page.tsx
    - src/__tests__/auth.test.ts
    - src/components/admin/app-sidebar.tsx
    - src/components/admin/admin-topbar.tsx
    - src/app/admin/layout.tsx
    - src/app/admin/imoveis/page.tsx
  modified:
    - src/app/globals.css

key-decisions:
  - "Used CSS variables (--sidebar-*) for dark sidebar theme instead of inline Tailwind classes, ensuring inner sidebar components render correctly"
  - "Login form uses useTransition for non-blocking server action calls"
  - "Generic error message 'Email ou senha incorretos' for all auth failures (security)"

patterns-established:
  - "Server Actions in src/actions/ with Zod validation"
  - "Admin pages use AdminTopbar for consistent page titles"
  - "Sidebar navigation via SidebarMenuButton with render prop for Next.js Link"

requirements-completed: [AUTH-01, AUTH-03]

# Metrics
duration: 3min
completed: 2026-03-13
---

# Phase 1 Plan 2: Auth UI and Admin Layout Summary

**Login page with signIn/signOut server actions, admin sidebar with dark theme, and 6 auth tests**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-13T01:18:53Z
- **Completed:** 2026-03-13T01:21:53Z
- **Tasks:** 2
- **Files created/modified:** 9

## Accomplishments
- Login page at /login with centered card, email/password fields, "Entrar" button with loading spinner
- signIn Server Action validates with Zod, authenticates via signInWithPassword, redirects to /admin/imoveis
- signOut Server Action clears session and redirects to /login
- Admin layout with auth guard (getUser check) and SidebarProvider
- AppSidebar with dark zinc-900 theme via CSS variables, Imoveis and Configuracoes nav items, Sair (logout) button
- AdminTopbar with page title and mobile hamburger trigger
- Placeholder /admin/imoveis page confirming layout works
- 6 new auth tests (18 total), build passes

## Task Commits

Each task was committed atomically:

1. **Task 1: Create login page with auth Server Actions** - `cfdac370` (feat)
2. **Task 2: Create admin layout with sidebar navigation and topbar** - `f2a0f672` (feat)

## Files Created/Modified
- `src/actions/auth.ts` - signIn and signOut Server Actions with Zod validation
- `src/components/login-form.tsx` - Client component with React Hook Form + zodResolver
- `src/app/(auth)/login/page.tsx` - Login page with centered Card layout
- `src/__tests__/auth.test.ts` - 6 auth tests (credentials, validation, redirect, signOut)
- `src/components/admin/app-sidebar.tsx` - Sidebar with nav items and logout button
- `src/components/admin/admin-topbar.tsx` - Topbar with title and mobile trigger
- `src/app/admin/layout.tsx` - Admin shell with auth guard and SidebarProvider
- `src/app/admin/imoveis/page.tsx` - Placeholder imoveis page
- `src/app/globals.css` - Updated sidebar CSS variables for dark theme

## Decisions Made
- Used CSS variables for sidebar dark theme instead of inline Tailwind classes -- the sidebar inner container uses `bg-sidebar` CSS variable, so inline classes on the outer wrapper would be overridden
- LoginForm uses `useTransition` + `startTransition` for server action calls to keep the form interactive during submission
- Generic error message "Email ou senha incorretos" for all auth failures (invalid email format, short password, wrong credentials) per security decision

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed sidebar dark theme not applying**
- **Found during:** Post-Task 2 verification
- **Issue:** Sidebar inner container uses `bg-sidebar` CSS variable which was set to a light color, overriding the inline `bg-zinc-900` class
- **Fix:** Updated sidebar CSS variables in globals.css to zinc-900 equivalent dark oklch values; removed hardcoded classes from AppSidebar
- **Files modified:** src/app/globals.css, src/components/admin/app-sidebar.tsx
- **Commit:** d178de35

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Necessary for correct dark sidebar appearance. No scope creep.

## Issues Encountered
- None beyond the sidebar CSS variable fix noted above.

## Next Phase Readiness
- Auth flow complete (login/logout), ready for Plan 03 (Settings page)
- Admin layout established as foundation for all admin pages
- AdminTopbar pattern ready for reuse in settings and property pages

---
*Phase: 01-foundation-and-auth*
*Completed: 2026-03-13*

## Self-Check: PASSED
- All 8 key files exist on disk
- All 3 task commits (cfdac370, f2a0f672, d178de35) found in git history
- Build passes, 18 tests pass
