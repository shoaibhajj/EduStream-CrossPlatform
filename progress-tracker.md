# EduStream — Progress Tracker

Update this file after every completed or meaningfully advanced work item. Any AI agent reading this file should immediately know what is done, what is in progress, what is next, and why past decisions were made — without needing anything else from the user.

---

## Current Status

**Phase:** Phase 1 — Foundation (in progress)
**Current Goal:** Phase 1 — `02` Supabase Project (tables + RLS + storage buckets)
**Last completed:** `01` Monorepo Setup
**Next up:** `02` Supabase Project

---

## Progress

### Phase 1 — Foundation
- [x] `01` Monorepo Setup
- [ ] `02` Supabase Project (tables + RLS + storage buckets)
- [ ] `03` Clerk Setup (auth + webhook → profiles sync)
- [ ] `04` Shared Types (`packages/shared-types`)

### Phase 2 — Mobile Core (APK Priority)
- [ ] `05` Navigation Shell + Role Routing
- [ ] `06` Student Browse Screen (mock → real data)
- [ ] `07` Course Detail Screen
- [ ] `08` Payment Flow Screen
- [ ] `09` Video Player Screen
- [ ] `10` Teacher Dashboard Screen
- [ ] `11` Course + Lesson Editor Screens
- [ ] `12` First APK Build

### Phase 3 — Web Core
- [ ] `13` Next.js App Shell
- [ ] `14` Student Web Pages
- [ ] `15` Teacher Web Dashboard
- [ ] `16` Admin Panel

### Phase 4 — Polish
- [ ] `17` Signed Cloudinary URLs
- [ ] `18` Video Protection (Web)
- [ ] `19` Empty State Enforcement Audit
- [ ] `20` Loading States + Error Handling Pass

---

## Completed

### `01` Monorepo Setup — ✅ 2026-07-22

Scaffolded the full Turborepo monorepo with:
- Root: `package.json` (npm workspaces), `turbo.json`, `tsconfig.base.json`, `eslint.config.mjs`, `.gitignore`
- `packages/shared-types/` — `index.ts` with all 8 core types: `Profile`, `AcademicYear`, `Subject`, `Course`, `Lesson`, `Enrollment`, `PaymentInfo`, `UserRole`
- `packages/shared-utils/` — `access.ts` with `canWatch()` (pure TS, no framework imports)
- `apps/web/` — Next.js 15 App Router scaffold: `package.json`, `tsconfig.json`, `next.config.ts`, ESLint config, `app/globals.css` (Tailwind v4 @theme tokens), `app/layout.tsx`, `app/page.tsx`, `lib/supabase-client.ts`, `lib/supabase-server.ts`, `lib/cloudinary.ts`, `lib/utils.ts`, `.env.local.example`
- `apps/mobile/` — Expo SDK 52 scaffold: `package.json`, `tsconfig.json`, `app.json`, `babel.config.js`, `tailwind.config.js` (NativeWind tokens mirroring web), `metro.config.js` (monorepo-aware), `global.css`, `lib/supabase.ts` (SecureStore adapter), `lib/clerk.ts`, `app/_layout.tsx` (ClerkProvider), `app/index.tsx`, `.env.local.example`

---

## In Progress

- None currently. Waiting for confirmation of `01` before starting `02`.

## Open Questions

- What happens to existing `confirmed` enrollments if a teacher unpublishes or deletes a course? (Default assumption until decided: enrollments remain in DB but lessons become inaccessible since the course is no longer published — revisit if this feels wrong in practice.)
- Should a student be able to request enrollment in more than one course from the same teacher simultaneously? (Default assumption: yes, no restriction — one enrollment per course per student.)
- Country/currency format for `courses.price` — plain numeric assumed, no currency symbol stored. Confirm with target market (Damascus/Syria) before building the payment info UI copy.

## Architecture Decisions

- **[2026-07-22] — Decision:** `apps/web/lib/supabase-server.ts` uses `@supabase/ssr` `createServerClient` with cookie adapter (Next.js 15 async cookies). **Why:** Next.js 15 `cookies()` is async; the SSR package handles cookie-based session persistence correctly in App Router Server Components and Route Handlers.
- **[2026-07-22] — Decision:** `apps/mobile/lib/supabase.ts` uses `expo-secure-store` as the Supabase auth storage adapter instead of default localStorage. **Why:** `code-standards.md` mandates `expo-secure-store` for all sensitive local storage — tokens must never go into AsyncStorage.
- **[2026-07-22] — Decision:** `apps/mobile/metro.config.js` sets `watchFolders` and `resolver.nodeModulesPaths` to include monorepo root. **Why:** Metro does not traverse symlinks by default; this ensures `@edustream/shared-types` and `@edustream/shared-utils` resolve correctly without ejecting from Expo.
- **[2026-07-22] — Decision:** `packages/shared-types/index.ts` already created in this step (build-plan item `04` only asks for types, but the types are needed as a dependency by both `apps/web` and `apps/mobile` package.json from step `01`). Types file is minimal and matches the data model in `architecture.md` exactly. Item `04` will be checked off as part of this step's verification or as a fast follow if the user prefers a dedicated commit.

## Session Notes

- **2026-07-22:** Completed `01` Monorepo Setup. All scaffold files pushed in a single commit to `main`. Both apps reference `@edustream/shared-types` and `@edustream/shared-utils` as workspace dependencies. Design tokens from `ui-context.md` are wired into both `apps/web/app/globals.css` (Tailwind v4 `@theme`) and `apps/mobile/tailwind.config.js` (NativeWind `theme.extend`). Awaiting local verification from user before starting `02`.
