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

**Stack:** Next.js 16 (App Router) · React 19 · Untitled UI React · Tailwind CSS v4 · TypeScript · no backend

No MUI, no Ant Design, no Emotion. All removed.

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

**Next.js 16 breaking change:** `params` in dynamic routes is a `Promise`. All dynamic pages use `use(params)` (client components) or `await params` (server components) — never destructure directly.

### Layouts

- `src/app/layout.tsx` — root, wraps in `<Providers>` (just Sonner `<Toaster />`)
- `src/app/(dashboard)/layout.tsx` — adds `<DemoRoleBar>` + `<Sidebar>` fixed at left; main content is `ml-20 pt-14`
- `src/app/(dashboard)/patients/[id]/layout.tsx` — patient header (avatar, name, email, location) + tab nav; TopBar breadcrumb set here

### Data

All data is mock — no API calls, no backend. Source of truth:

- **`src/lib/types.ts`** — all TypeScript interfaces (`Patient`, `Exercise`, `Program`, `ChartSession`, `Document`, `Notification`, `Physio`)
- **`src/lib/mock-data.ts`** — `mockPatients`, `mockExercises`, `mockPrograms`, `mockDocuments`, `mockChartSessions` (keyed by patient id), `mockNotifications`, `mockPhysio`

Adding a new feature means editing `mock-data.ts`; there is no persistence between sessions.

### Theme & styling

- **`src/styles/theme.css`** — design tokens in `@theme {}` blocks (Tailwind v4 CSS-based config)
- **`src/styles/typography.css`** — typography scale
- **`src/app/globals.css`** — Tailwind imports, global resets, utility classes
- Primary brand color: `brand-600` (`#6750A4`). Use `bg-brand-600`, `text-brand-700`, etc.
- Key tokens: `bg-primary` (white), `bg-secondary_alt` (neutral-50), `text-primary` (neutral-900), `text-secondary` (neutral-700), `text-tertiary` (neutral-600), `border-secondary` (neutral-200), `shadow-xs`
- `cx` utility: `import { cx } from '@/utils/cx'` (wraps tailwind-merge)

### Components

**Untitled UI base components** in `src/components/base/`:
- `buttons/button` — `Button` with `color`, `size`, `iconLeading`, `iconTrailing`, `isDisabled`, `onPress` props
  - Valid `color` values: `primary`, `secondary`, `tertiary`, `link-color`, `link-gray`, `primary-destructive`, `secondary-destructive`, `tertiary-destructive`, `link-destructive`
- `input/input` — `Input` with `label`, `hint`, `onChange` receives a string value directly (not an event)
- `avatar/avatar` — `Avatar` with `initials`, `size` (`xs`/`sm`/`md`/`lg`/`xl`/`2xl`)
- `badge/badge` — `Badge`
- `toggle/toggle` — `Toggle` (replaces Switch)
- `select/select` — `Select` (React Aria based); for simple cases prefer native `<select>`

**Untitled UI application components** in `src/components/application/`:
- `modals/modal` — `ModalOverlay`, `Modal`, `Dialog` (React Aria based)
  - Pattern: `<ModalOverlay isOpen={…} onOpenChange={…}><Modal><Dialog>{content}</Dialog></Modal></ModalOverlay>`

**Custom UI primitives** in `src/components/ui/`:
- `alert.tsx` — `Alert` with `type` (`info`/`success`/`warning`/`error`)
- `divider.tsx` — `Divider`
- `drawer.tsx` — `Drawer` slide-in from right (`open`, `onClose`, `width` props)
- `progress.tsx` — `Progress` with `value`, `color`, `size`, `label`

**Shared layout components** in `src/components/layout/`:
- `Sidebar.tsx` — nav rail, fixed left, active-state via `usePathname`
- `TopBar.tsx` — breadcrumbs + notification bell + account dropdown; receives `breadcrumbs: { label: string; href?: string }[]`
- `DemoRoleBar.tsx` — top demo mode bar

**Shared feature components:**
- `patients/AddPatientDialog.tsx` — 3-step dialog for creating a patient
- `exercises/ExercisePreviewDrawer.tsx` — right-side Drawer with video, instructions, audio stub
- `exercises/AudioRecordingDialog.tsx` — modal for recording audio cues
- `exercises/FilterMenu.tsx` — custom dropdown filter

### Toasts

Use `import { toast } from 'sonner'` everywhere. Never use `App.useApp()` or `messageApi`.

```ts
toast.success('Done!')
toast.error('Something went wrong')
toast.warning('Watch out')
```

### Key conventions

- All pages that use hooks or browser APIs are `'use client'` components.
- TopBar receives `breadcrumbs` — set this on every page.
- React Aria components use `onPress` not `onClick`, and `isDisabled` not `disabled`.
- Untitled UI `Input` `onChange` receives a `string` directly, not a React event object.
- For textareas: use native `<textarea className="w-full resize-none rounded-lg border border-secondary px-3 py-2 text-sm ...">` — no multiline Input.
- For simple dropdowns: use native `<select className="rounded-lg border border-secondary bg-primary px-3 py-2 text-sm text-primary shadow-xs outline-none focus:ring-2 focus:ring-brand-300">`.
- Favorites state is local (`useState`) — not persisted.
- AI features (dictation, SOAPIE auto-populate) are stubbed with hardcoded placeholder text.
- Chart tab: exactly one session per patient is `isIntakeSession: true` (always the oldest).
- The `(dashboard)` layout does NOT include a TopBar — each page imports its own `<TopBar>`.
