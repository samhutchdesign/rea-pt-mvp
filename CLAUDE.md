# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # start dev server (may use port 3001 if 3000 is taken)
npm run build    # production build + TypeScript check
npm run lint     # ESLint
```

No tests are configured yet.

## Architecture

**Stack:** Next.js 16 (App Router) · React 19 · MUI v5 · TypeScript · no backend

**MUI is pinned to v5.** Do not upgrade. v9 removed `fontWeight` and other system props as direct Typography props, which breaks the existing component patterns. All MUI imports use `@mui/material` and `@mui/icons-material` at v5.

### Routing

All authenticated app routes live under `src/app/(dashboard)/`. The `(dashboard)` route group adds the `Sidebar` but does not appear in the URL. Route tree:

```
/                          → dashboard home
/patients                  → patient list
/patients/[id]/overview    → (and details, program, chart, documents, contact)
/patients/[id]/program/edit
/patients/[id]/program/send
/patients/[id]/chart/new
/patients/[id]/chart/[sessionId]
/exercises  /exercises/[id]  /exercises/new
/programs   /programs/[id]   /programs/new
/documents  /documents/[id]  /documents/new
/notifications
/account/profile  /account/settings  /account/email  /account/password
```

**Next.js 16 breaking change:** `params` in dynamic routes is a `Promise`. All dynamic pages use `use(params)` (client components) or `await params` (server components) — never destructure directly. See existing pages under `patients/[id]/` for the correct pattern.

### Layouts

- `src/app/layout.tsx` — root, wraps in `<Providers>` (MUI ThemeProvider + CssBaseline)
- `src/app/(dashboard)/layout.tsx` — adds `<Sidebar>` fixed at left; main content offset by 72px
- `src/app/(dashboard)/patients/[id]/layout.tsx` — patient header (avatar, name, email, location) + tab nav (Overview → Contact); TopBar breadcrumb is set here

### Data

All data is mock — no API calls, no backend. Source of truth:

- **`src/lib/types.ts`** — all TypeScript interfaces (`Patient`, `Exercise`, `Program`, `ChartSession`, `Document`, `Notification`, `Physio`)
- **`src/lib/mock-data.ts`** — `mockPatients`, `mockExercises`, `mockPrograms`, `mockDocuments`, `mockChartSessions` (keyed by patient id), `mockNotifications`, `mockPhysio`

Adding a new feature means editing `mock-data.ts`; there is no persistence between sessions.

### Theme & styling

`src/theme/theme.ts` defines the MUI theme. Primary color `#6750A4`. All styling uses MUI's `sx` prop — no CSS modules, no Tailwind. System props like `mb`, `mt`, `px` work directly on MUI components. `fontWeight` must go in `sx={{ fontWeight: ... }}` on Typography (v5 behaviour).

### Components

Shared components in `src/components/`:
- `layout/Sidebar.tsx` — nav rail with active-state detection via `usePathname`
- `layout/TopBar.tsx` — breadcrumbs + notification bell (reads `mockNotifications`) + account menu
- `patients/AddPatientDialog.tsx` — 3-step MUI Stepper dialog for creating a patient
- `exercises/ExercisePreviewDrawer.tsx` — right-side Drawer with video placeholder, instructions, common mistakes, audio stub; used in exercise list, exercise detail, and program builder

### Key conventions

- All pages that use hooks or browser APIs are `'use client'` components.
- TopBar receives `breadcrumbs: { label: string; href?: string }[]` — set this on every page.
- Favorites state is local (`useState` with a `Set<string>`) — not persisted.
- AI features (dictation, SOAPIE auto-populate) are stubbed: the buttons work visually but write hardcoded placeholder text.
- Chart tab: exactly one session per patient is `isIntakeSession: true` (always the oldest). All others render as "Session – [Date]".
- The `(dashboard)` layout does NOT include a TopBar — each individual page imports and renders its own `<TopBar>` with appropriate breadcrumbs.
