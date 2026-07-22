# EduStream — Progress Tracker

Update this file after every completed or meaningfully advanced work item. Any AI agent reading this file should immediately know what is done, what is in progress, what is next, and why past decisions were made — without needing anything else from the user.

---

## Current Status

**Phase:** Not started
**Current Goal:** Phase 1 — Foundation setup (monorepo, Supabase schema, Clerk webhook, shared types)
**Last completed:** None yet
**Next up:** `01` Monorepo Setup

---

## Progress

### Phase 1 — Foundation
- [ ] `01` Monorepo Setup
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

## In Progress

- None yet.

## Open Questions

Add unresolved product or technical decisions here. Resolve before building anything that depends on them.

- What happens to existing `confirmed` enrollments if a teacher unpublishes or deletes a course? (Default assumption until decided: enrollments remain in DB but lessons become inaccessible since the course is no longer published — revisit if this feels wrong in practice.)
- Should a student be able to request enrollment in more than one course from the same teacher simultaneously? (Default assumption: yes, no restriction — one enrollment per course per student.)
- Country/currency format for `courses.price` — plain numeric assumed, no currency symbol stored. Confirm with target market (Damascus/Syria) before building the payment info UI copy.

## Architecture Decisions

Add decisions here as they are made during implementation, including why.

- _Example format:_ **[Date] — Decision:** Use `maybeSingle()` instead of `single()` for enrollment lookup in `canWatch()`. **Why:** a student may have zero enrollment rows for a course, which is a valid non-error state, not a query failure.

## Session Notes

Add context here at the end of every session so the next session (human or AI) can resume immediately without re-reading everything.

- _Nothing recorded yet — this project has not started implementation._

---

## How to Use This File

1. Before starting work, read **Current Status** and **Next Up** to know exactly what to build next
2. Move the item you're working on from its Phase checklist into **In Progress**
3. When finished and verified against the "Verify" criteria in `build-plan.md`, check it off in the Phase list and update **Current Status**
4. If you hit an ambiguous decision, log it in **Open Questions** before proceeding with a reasonable default
5. If you make a structural decision (schema change, new library, new folder), log it in **Architecture Decisions** and update `architecture.md` or `code-standards.md` if it changes those specs
6. Before ending a session, always write a **Session Notes** entry — one or two sentences is enough, but never leave it blank
