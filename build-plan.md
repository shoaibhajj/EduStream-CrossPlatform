# EduStream — Build Plan

## Core Principle

Build the mobile student and teacher flow first, with mock data before real data, screen by screen. Every item must be visible and testable before moving to the next. The web app and admin panel come only after the mobile core works end to end. No invisible backend-only phases.

---

## Phase 1 — Foundation

### 01 Monorepo Setup
- Turborepo root with `apps/web`, `apps/mobile`, `packages/shared-types`, `packages/shared-utils`
- Shared `tsconfig.json` base, ESLint config
- **Verify:** both apps build/start independently from the monorepo root

### 02 Supabase Project
- Create all 7 tables: `profiles`, `academic_years`, `subjects`, `courses`, `lessons`, `enrollments`, `payment_info`
- Apply RLS policies exactly as defined in `architecture.md`
- Create storage buckets: `thumbnails` (public-read)
- **Verify:** manually insert one row per table via Supabase dashboard, confirm RLS blocks a second test user from reading another user's private rows

### 03 Clerk Setup
- Install `@clerk/nextjs` in web, `@clerk/expo` in mobile
- Build Clerk webhook handler (`app/api/webhooks/clerk/route.ts`) that inserts into `profiles` on `user.created`
- **Verify:** sign up a test user, confirm a matching `profiles` row appears with `role = null`

### 04 Shared Types
- Define `Profile`, `AcademicYear`, `Subject`, `Course`, `Lesson`, `Enrollment`, `PaymentInfo`, `UserRole` in `packages/shared-types/index.ts`
- **Verify:** both apps import and use these types with zero TypeScript errors

---

## Phase 2 — Mobile Core (APK Priority — Build This Before Anything Else Below)

### 05 Navigation Shell + Role Routing
- Expo Router file structure: `(auth)`, `(student)`, `(teacher)`
- Auth guard redirects unauthenticated users to sign-in
- After role selection, student → `(student)` home, teacher → `(teacher)` dashboard
- **Verify:** sign in as each role and confirm correct landing screen

### 06 Student Browse Screen (Mock Data First)
- Home screen renders Academic Years (mock: 2 years)
- Tapping a year renders Subjects with published courses (mock: 2 subjects)
- Tapping a subject renders Course cards (mock: 3 courses)
- Swap mock data for real Supabase queries once UI is verified — apply the "hide empty years/subjects" rule at the query level
- **Verify:** create one course in Supabase directly, confirm it appears; delete it, confirm its year/subject disappear if no other courses exist

### 07 Course Detail Screen
- Lesson list with free preview badge and lock icons
- Enroll button
- **Verify:** free preview lesson is tappable without enrollment; locked lessons show lock icon only

### 08 Payment Flow Screen
- Payment Info Card pulled from teacher's `payment_info` row
- "I've Paid" button creates `enrollments` row with `payment_status = 'pending'`
- **Verify:** after tapping, a pending row appears in Supabase tied to the correct student and course

### 09 Video Player Screen
- Cloudinary videos play via `expo-av` using a signed URL fetched at play time
- YouTube/Vimeo links play via `react-native-webview`
- **Verify:** both video types play correctly on a physical or emulated Android device

### 10 Teacher Dashboard Screen
- List of the teacher's own courses with enrollment counts
- Pending enrollments list with Confirm/Reject actions
- **Verify:** confirming an enrollment updates `payment_status` and the student's next fetch includes gated lessons

### 11 Course + Lesson Editor Screens
- Create course form: title, description, subject, year, price, thumbnail, publish toggle
- Add lesson form: title, order, free-preview toggle, and either file upload (Cloudinary) or paste link (YouTube/Vimeo)
- **Verify:** a newly created, published course with at least one lesson appears correctly in the student browse flow

### 12 First APK Build
- Run `eas build --platform android --profile preview`
- Install on a physical device, walk through the full student and teacher flow
- **Verify:** APK installs and every screen above works without a dev server running

---

## Phase 3 — Web Core

### 13 Next.js App Shell
- Clerk provider, Supabase client/server setup, middleware protecting `(student)`, `(teacher)`, `(admin)` routes
- **Verify:** unauthenticated visits redirect to sign-in; role-based routes reject the wrong role

### 14 Student Web Pages
- Mirrors mobile: years → subjects → courses → course detail → watch, using the same Supabase queries and the same empty-state rule
- **Verify:** side-by-side comparison with mobile shows identical data for the same test account

### 15 Teacher Web Dashboard
- Full course/lesson editor with drag-to-reorder lessons (mobile can defer reordering to simple up/down buttons if needed)
- **Verify:** a course edited on web is immediately reflected on mobile and vice versa

### 16 Admin Panel
- Manage Academic Years (create, rename, reorder)
- Manage Subjects (create, rename)
- View all teachers/courses, override any enrollment status
- **Verify:** admin can create a new Academic Year and it becomes selectable in the teacher's course creation form

---

## Phase 4 — Polish

### 17 Signed Cloudinary URLs
- Server-side signed URL generation with 1-hour expiry, wired into both the web API route and the mobile fetch call
- **Verify:** a signed URL stops working after expiry; a new request generates a fresh working URL

### 18 Video Protection (Web)
- `controlsList="nodownload"`, disabled right-click, `disablePictureInPicture`
- **Verify:** right-click on the player shows no context menu; no download button visible

### 19 Empty State Enforcement Audit
- Manually verify every list screen (years, subjects, courses, lessons, pending enrollments) shows a correct empty state with zero data
- **Verify:** delete all courses from a test year, confirm the year itself disappears from student browse

### 20 Loading States + Error Handling Pass
- Every screen has a defined loading skeleton and a human-readable error message
- **Verify:** simulate a network failure (airplane mode) and confirm no raw error or crash is shown to the user

---

## Feature Count

| Phase | Items |
|---|---|
| Phase 1 — Foundation | 4 |
| Phase 2 — Mobile Core (APK) | 8 |
| Phase 3 — Web Core | 4 |
| Phase 4 — Polish | 4 |
| **Total** | **20** |
