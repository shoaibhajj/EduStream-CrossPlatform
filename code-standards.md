# EduStream — Code Standards

Implementation rules for the entire project — both `apps/web` and `apps/mobile`. Follow these in every session without exception. These rules prevent pattern drift across the codebase and across AI agent sessions.

## Engineering Mindset

- Think before implementing — understand what is being built and why before writing a line
- Read `project-overview.md` and `architecture.md` before touching any feature — never assume, always verify
- Scope is sacred — build only what the current build-plan item requires
- Every feature must be testable immediately after implementation — if you can't verify it, it's not done
- Clean over clever — code a junior developer can read without explanation
- One thing at a time — finish one feature fully before starting the next
- Wrap every operation that can fail in try/catch — never let one failure crash the app

## TypeScript

- Strict mode enabled in both `tsconfig.json` files — no exceptions
- Never use `any` — use `unknown` and narrow the type
- Never use type assertions (`as SomeType`) unless unavoidable, and comment why
- All function parameters and return types explicitly typed
- Use `type` for object shapes and unions — use `interface` only for extendable component props
- Every async function has explicit error handling — never let a promise float unhandled
- Use `const` by default — `let` only when reassignment is required

## Next.js (apps/web)

- App Router only — no Pages Router
- All components are Server Components by default
- Add `"use client"` only when the component needs: `useState`/`useReducer`, `useEffect`, browser APIs, event listeners, or a client-only third-party library
- Never add `"use client"` to layout files unless absolutely required
- Data fetching happens in Server Components — never fetch directly inside Client Components
- Route handlers live in `app/api/` — business logic never lives directly in the handler, delegate to `lib/`
- Server Actions live in `actions/` — never defined inline inside components
- Always call `revalidatePath()` after a mutation that affects displayed data

## Expo / React Native (apps/mobile)

- Expo Router (file-based) for all navigation — no manual React Navigation stack setup
- Screens fetch their own data with Supabase client calls scoped to the current user, using hooks — no Server Actions available on mobile
- Shared business logic (e.g. `canWatch`) is imported from `packages/shared-utils`, never duplicated
- Use `expo-secure-store` for any sensitive local storage — never AsyncStorage for tokens
- Every screen must define a loading state and an empty state before it is considered complete

## File and Folder Naming

- Folders: kebab-case — `course-editor`, `payment-info`
- Component files: PascalCase — `CourseCard.tsx`, `LessonList.tsx`
- Utility files: camelCase — `supabaseClient.ts`, `cloudinary.ts`
- Type files: camelCase — `index.ts`
- API route files (web): always `route.ts`
- Server Action files (web): camelCase — `courses.ts`, `enrollments.ts`
- One component per file — never export multiple components from one file
- Index files only inside `components/ui/` — never barrel export elsewhere

## Component Structure

Every component follows this exact order:

```typescript
"use client"; // only if needed

// 1. External imports
import { useState } from "react";
import { Button } from "@/components/ui/button";

// 2. Internal imports
import { CourseCard } from "@/components/student/CourseCard";

// 3. Type definitions
type Props = {
  courseId: string;
  isEnrolled: boolean;
};

// 4. Component
export function ComponentName({ courseId, isEnrolled }: Props) {
  // state
  // derived values
  // handlers
  // return JSX
}
```

- Never use default exports for components — always named exports
- Props type defined directly above the component, not in a shared types file unless genuinely shared
- No inline styles — all styling via Tailwind classes (web) or NativeWind classes (mobile) using design tokens

## API Route Handlers (web)

```typescript
// app/api/video-url/route.ts
import { NextRequest, NextResponse } from "next/server";
import { canWatch } from "@/packages/shared-utils/access";

export async function POST(req: NextRequest) {
  try {
    const { userId, lessonId } = await req.json();
    const allowed = await canWatch(userId, lessonId);
    if (!allowed) {
      return NextResponse.json({ success: false, error: "Not enrolled" }, { status: 403 });
    }
    const signedUrl = await generateSignedUrl(lessonId);
    return NextResponse.json({ success: true, data: { url: signedUrl } });
  } catch (error) {
    console.error("[api/video-url]", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
```

- Every route handler has a try/catch
- Every route handler validates its input before processing
- Errors logged with the route path as prefix: `[api/video-url]`
- Always return `{ success: boolean, data?: T, error?: string }` — never raw data

## Server Actions (web)

```typescript
// actions/enrollments.ts
"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServer } from "@/lib/supabase-server";

export async function requestEnrollment(courseId: string) {
  try {
    const supabase = await createSupabaseServer();
    const { error } = await supabase
      .from("enrollments")
      .insert({ course_id: courseId, payment_status: "pending" });
    if (error) throw error;
    revalidatePath(`/courses/${courseId}`);
    return { success: true };
  } catch (error) {
    console.error("[actions/enrollments]", error);
    return { success: false, error: "Failed to request enrollment" };
  }
}
```

- Every Server Action has a try/catch
- Every Server Action returns `{ success: boolean, error?: string }`
- Always call `revalidatePath()` after a mutation affecting page data
- Never throw from a Server Action — always return the error

## Shared Utils (packages/shared-utils)

- No React, no Next.js, no Expo imports — pure TypeScript functions only
- Every function returns `{ success: boolean, data?: T, error?: string }` when it can fail
- Fully unit-testable in isolation from both apps

```typescript
// packages/shared-utils/access.ts
export async function canWatch(
  supabase: SupabaseClient,
  studentId: string,
  lessonId: string,
): Promise<boolean> {
  const { data: lesson } = await supabase
    .from("lessons")
    .select("is_free_preview, course_id")
    .eq("id", lessonId)
    .single();
  if (!lesson) return false;
  if (lesson.is_free_preview) return true;

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("payment_status")
    .eq("student_id", studentId)
    .eq("course_id", lesson.course_id)
    .eq("payment_status", "confirmed")
    .maybeSingle();

  return !!enrollment;
}
```

## Supabase Client Usage

```typescript
// Browser context (web Client Components, mobile)
import { supabase } from "@/lib/supabase-client";

// Server context (web Server Components, Route Handlers, Server Actions)
import { createSupabaseServer } from "@/lib/supabase-server";
const supabase = await createSupabaseServer();
```

- Never use the browser client in a server context
- Never use the server client in a browser context
- Always scope queries with `.eq("student_id", userId)` or equivalent — never query without a user filter where RLS expects one
- Always handle the `error` return — never assume success
- Use `.single()` when exactly one row is expected, `.maybeSingle()` when zero or one is expected

## Error Handling

- Never leave an empty catch block — always log or handle
- Console errors always include a context prefix: `[folder/file]`
- User-facing errors must be human-readable — never expose raw Postgres or Cloudinary error messages
- API errors return `status: 500` with a generic message — never leak internals

## Environment Variables

All environment variables live in `.env.local` for each app. Never hardcode a key, URL, or secret anywhere in the codebase.

| Variable | Used In |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `lib/supabase-client.ts` (web) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `lib/supabase-client.ts` (web) |
| `SUPABASE_SERVICE_ROLE_KEY` | `lib/supabase-server.ts` (web only, never exposed to client) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk provider (web) |
| `CLERK_SECRET_KEY` | Clerk webhook handler (web) |
| `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | `lib/cloudinary.ts` (web only) |
| `EXPO_PUBLIC_SUPABASE_URL` | `lib/supabase.ts` (mobile) |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | `lib/supabase.ts` (mobile) |
| `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk provider (mobile) |

`NEXT_PUBLIC_` / `EXPO_PUBLIC_` prefixes mean the variable is exposed to the client bundle. Never prefix a secret key with these.

## Import Aliases

Always use the `@/` alias in each app — never relative imports going up more than one level.

```typescript
// Correct
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase-client";

// Never
import { Button } from "../../../components/ui/button";
```

## Comments

- No comments explaining what the code does — code must be self-explanatory
- Comments only explain why — a non-obvious decision or constraint
- Never leave TODO comments in committed code — add them to `progress-tracker.md` instead

## Dependencies

Never install a new package without a clear reason. Check first:

1. Does shadcn/ui already provide this (web)?
2. Does Expo already provide this (mobile)?
3. Is there a simpler native/built-in solution?

Approved dependencies:

- `@clerk/nextjs`, `@clerk/expo` — auth
- `@supabase/supabase-js` — database, storage, RLS-aware queries
- `cloudinary` — server-side upload and signed URL generation
- `react-player` — web video playback
- `expo-av` — mobile native video playback
- `react-native-webview` — mobile fallback for embed-only sources
- `nativewind` — mobile styling
- `zod` — schema validation
- `lucide-react` / `lucide-react-native` — icons
- `tailwindcss`, `shadcn/ui` — web UI primitives

Do not install any other package without updating this list first.
