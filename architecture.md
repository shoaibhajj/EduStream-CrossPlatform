# EduStream — Architecture

## Stack

| Layer | Technology | Role |
|---|---|---|
| Framework (web) | Next.js 15, App Router | Website — student browse, teacher dashboard, admin panel |
| Framework (mobile) | Expo SDK + Expo Router | Android APK — primary deliverable |
| Auth | Clerk (`@clerk/nextjs`, `@clerk/expo`) | Shared identity across both apps |
| Database | Supabase (Postgres) | All persistent data, Row Level Security enforced |
| File storage | Supabase Storage (thumbnails) + Cloudinary (videos) | Media hosting |
| Video player (web) | `react-player` | Universal player for Cloudinary/YouTube/Vimeo |
| Video player (mobile) | `expo-av` + `react-native-webview` | Native playback + embedded fallback |
| Styling (web) | Tailwind v4 + shadcn/ui | Token-based design system |
| Styling (mobile) | NativeWind | Tailwind syntax on RN components |
| Validation | Zod | Every API and Server Action boundary |
| Monorepo | Turborepo | Shared types/logic between both apps |
| Language | TypeScript strict | Both apps, no `any` |

## Folder Structure

```
/
├── apps/
│   ├── web/
│   │   ├── app/
│   │   │   ├── (auth)/                  → Clerk sign-in, sign-up, role selection
│   │   │   ├── (student)/               → browse, course detail, watch
│   │   │   ├── (teacher)/               → dashboard, course editor, lesson editor
│   │   │   ├── (admin)/                 → admin panel
│   │   │   └── api/
│   │   │       └── video-url/route.ts   → generates signed Cloudinary URLs server-side
│   │   ├── components/
│   │   │   ├── ui/                      → shadcn/ui primitives only — never modify directly
│   │   │   ├── layout/
│   │   │   ├── student/
│   │   │   ├── teacher/
│   │   │   └── admin/
│   │   ├── actions/                     → Server Actions — all DB mutations for web
│   │   │   ├── courses.ts
│   │   │   ├── lessons.ts
│   │   │   ├── enrollments.ts
│   │   │   └── payment-info.ts
│   │   └── lib/
│   │       ├── supabase-client.ts       → browser Supabase client
│   │       ├── supabase-server.ts       → server Supabase client
│   │       ├── cloudinary.ts            → upload + signed URL helpers
│   │       └── utils.ts
│   └── mobile/
│       ├── app/
│       │   ├── (auth)/                  → sign-in, sign-up, role selection
│       │   ├── (student)/               → home, year, subject, course, watch
│       │   └── (teacher)/               → dashboard, course editor, confirm payments
│       ├── components/
│       └── lib/
│           ├── supabase.ts              → Supabase client, shared env vars with web
│           └── clerk.ts                 → Clerk Expo setup
└── packages/
    ├── shared-types/
    │   └── index.ts                     → Course, Lesson, Enrollment, UserRole, Profile
    └── shared-utils/
        └── access.ts                    → canWatch(userId, lessonId) → boolean
```

## System Boundaries

- `app/` (web) and `app/` (mobile) — routes and screens only. No business logic, no direct DB writes outside Server Actions or scoped Supabase calls.
- `actions/` (web) — all Server Actions for DB mutations. Never called from mobile.
- `components/` — UI only. No data fetching, no direct Supabase calls.
- `lib/` — third-party client initialization and shared helpers only.
- `packages/shared-types/` — types used identically by both apps. Never duplicate a type across `apps/web` and `apps/mobile`.
- `packages/shared-utils/` — pure business logic with no framework dependency (e.g. access control checks). Importable by both apps.

## Storage Model

- **Database (Supabase Postgres)**: all structured data — profiles, academic years, subjects, courses, lessons, enrollments, payment info. Source of truth for who can access what.
- **Supabase Storage**: course and lesson thumbnails only. Small, public-read assets.
- **Cloudinary**: all uploaded lesson videos. Never public — always served through signed, expiring URLs generated server-side.
- **External links**: YouTube/Vimeo URLs stored as plain text in `lessons.video_url` — these are inherently public and need no signing.

## Auth and Access Model

- Every user signs in via Clerk. Clerk is the single identity provider for both web and mobile.
- On user creation, a Clerk webhook (`/api/webhooks/clerk`) creates a matching row in `profiles` with `role = null` until the user completes role selection.
- Role is one of `admin | teacher | student`, stored in `profiles.role`. Admin rows are created manually in Supabase — never through the app.
- Ownership: a course belongs to exactly one teacher (`courses.teacher_id`). A lesson belongs to exactly one course.
- Access control for lesson video content:
  - Public: `lessons.is_free_preview = true`
  - Gated: requires an `enrollments` row for that student and course with `payment_status = 'confirmed'`
  - This rule is enforced twice: once in Postgres Row Level Security, and once again in `packages/shared-utils/access.ts` before any signed URL is issued.

## Data Flow

### Student watches a free preview lesson
```
Student opens course detail screen
        ↓
Query lessons where course_id = X (RLS allows is_free_preview = true rows for anyone)
        ↓
Student taps preview lesson
        ↓
If video_type = cloudinary → call signed URL endpoint/action
If video_type = youtube/vimeo → play video_url directly
```

### Student enrollment request
```
Student taps Enroll on course detail screen
        ↓
Fetch teacher's payment_info row for that course's teacher_id
        ↓
Student pays externally, taps "I've Paid"
        ↓
Insert enrollments row { student_id, course_id, payment_status: 'pending' }
        ↓
Teacher dashboard shows this row under Pending Enrollments
        ↓
Teacher confirms → update payment_status = 'confirmed', confirmed_by = teacher_id
        ↓
Student's next fetch of that course's lessons now includes gated lessons
```

### Teacher adds a lesson
```
Teacher fills lesson form (title, order, free preview toggle)
        ↓
If uploading a file → upload buffer to Cloudinary via lib/cloudinary.ts → get public_id
If pasting a link → validate URL is YouTube or Vimeo format
        ↓
Insert lessons row scoped to teacher's own course_id (RLS enforces ownership)
        ↓
revalidatePath (web) or refetch (mobile)
```

### Signed video URL generation
```
Client requests to play a Cloudinary-hosted lesson
        ↓
Server checks canWatch(userId, lessonId) from shared-utils
        ↓
If false → reject with 403
If true → generate Cloudinary signed URL, 1-hour expiry
        ↓
Return signed URL to client — never the raw Cloudinary asset URL
```

## Invariants

Rules the codebase must never violate:

1. A student can only receive a playable video URL for a lesson if `canWatch()` returns true — checked server-side, never trusted from client input.
2. Cloudinary video URLs are never stored or returned unsigned to the client — signing happens server-side, per request, with 1-hour expiry.
3. A teacher can only mutate courses and lessons where `teacher_id` matches their own Clerk user id — enforced by Supabase RLS, not just application code.
4. Academic years and subjects with zero published courses are excluded at the query level (`WHERE EXISTS published course`) — never filtered client-side after fetching everything.
5. Every Supabase query is scoped to the current authenticated user where relevant — no unscoped reads of another user's private data.
6. Mobile (`apps/mobile`) never calls Next.js Server Actions — it talks to Supabase directly with the same RLS policies.
7. Business logic in `packages/shared-utils` has zero framework imports — no React, no Next.js, no Expo-specific APIs.
8. `npm run build` (web) and `eas build` (mobile) must both succeed before any feature is marked complete.
