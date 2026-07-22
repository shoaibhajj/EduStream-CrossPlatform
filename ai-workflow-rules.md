# EduStream — AI Workflow Rules

## Approach

Build this project incrementally using a spec-driven workflow. The six context files in this project (`project-overview.md`, `architecture.md`, `code-standards.md`, `ui-context.md`, `build-plan.md`, `progress-tracker.md`) define what to build, how to build it, and the current state of progress. Always implement against these specs — do not infer or invent product behavior from scratch. If something is unclear, resolve it in the relevant context file before writing code.

## Scoping Rules

- Work on exactly one build-plan item at a time — never combine multiple numbered items into one implementation pass
- Prefer small, verifiable increments over large speculative changes
- Do not touch mobile (`apps/mobile`) and web (`apps/web`) in the same implementation step unless the item explicitly requires both
- Never build a feature marked "optional" or listed in "Out of Scope" in `project-overview.md` without it first being added to scope

## When to Split Work

Split an implementation step if it combines:

- UI changes and database/schema changes in a way that can't be verified independently
- Multiple unrelated screens or routes
- A web change and a mobile change that don't share the exact same data shape
- Any behavior not clearly defined in `project-overview.md` or `build-plan.md`

If a change cannot be verified end to end within a few minutes, the scope is too broad — split it further.

## Handling Missing Requirements

- Do not invent product behavior not defined in the context files
- If a requirement is ambiguous (e.g. "what happens if a teacher deletes a course with active enrollments?"), resolve it by adding a decision to `progress-tracker.md` under Open Questions, then propose a default and continue
- If a requirement is genuinely missing, stop and add it as an open question in `progress-tracker.md` before writing code that depends on it

## Protected Files

Do not modify the following unless explicitly instructed:

- `apps/web/components/ui/*` — shadcn/ui generated primitives
- `packages/shared-types/index.ts` — only extend, never remove or rename existing fields without updating both apps
- Any Supabase migration file that has already been applied — create a new migration instead of editing an old one
- `.env.local` files — never commit real values, never overwrite existing local secrets

## Before Writing Any Code That Touches Access Control

Always re-read the Invariants section of `architecture.md` before implementing anything related to:
- Video URL generation or signing
- Enrollment status changes
- Row Level Security policies
- Course/lesson ownership checks

These are the highest-risk areas in the project. A mistake here leaks paid content for free.

## Keeping Docs in Sync

Update the relevant context file immediately whenever implementation changes:

- New table, column, or relationship → update `architecture.md` Data Model section
- New folder or moved file → update `architecture.md` Folder Structure
- New coding convention or exception → update `code-standards.md`
- New design token or component pattern → update `ui-context.md`
- Any completed, in-progress, or newly discovered work → update `progress-tracker.md`

Never let `progress-tracker.md` go stale — update it after every meaningful change, not just at the end of a session.

## Before Moving to the Next Build-Plan Item

1. The current item works end to end within its defined scope, on the platform(s) it targets
2. No invariant defined in `architecture.md` was violated
3. `progress-tracker.md` is updated to reflect the completed work, moving the item from "In Progress" to "Completed"
4. `npm run build` (web) or `npx expo-doctor` / successful Metro bundle (mobile) passes
5. If the item touched RLS or access logic, manually verify with two test accounts (one enrolled, one not) that access is correctly gated

## Session Handoff

At the end of every working session, `progress-tracker.md` must contain enough detail — Current Goal, Completed, In Progress, Next Up, Session Notes — that a different AI agent could resume work with zero additional context from the user.
