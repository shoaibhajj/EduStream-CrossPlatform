# EduStream — UI Tokens & Rules

Design tokens and UI rules for both `apps/web` (Tailwind v4) and `apps/mobile` (NativeWind). Use these exact values everywhere — never hardcode colors or use raw Tailwind color classes.

## How to Use (Web)

Tailwind CSS v4 — tokens defined via `@theme` in `app/globals.css`. No `tailwind.config.ts` needed for colors.

```css
@import "tailwindcss";

@theme {
  --font-sans: "Inter", sans-serif;

  --color-background: #F6F7FB;
  --color-surface: #FFFFFF;
  --color-surface-secondary: #F9FAFB;
  --color-border: #E7EAF3;

  --color-text-primary: #101828;
  --color-text-secondary: #6A7282;
  --color-text-muted: #99A1AF;

  --color-accent: #7C5CFC;
  --color-accent-dark: #5E4CFF;
  --color-accent-light: #F3E8FF;
  --color-accent-foreground: #FFFFFF;

  --color-success: #10B981;
  --color-success-light: #D0FAE5;
  --color-success-foreground: #007A55;

  --color-warning: #FF8904;
  --color-error: #EF4444;

  /* EduStream-specific */
  --color-enrolled: #10B981;      /* confirmed enrollment badge */
  --color-pending: #FF8904;       /* pending enrollment badge */
  --color-locked: #99A1AF;        /* locked lesson icon/text */
  --color-preview: #7C5CFC;       /* free preview badge */
  --color-year-badge-bg: #DBEAFE; /* academic year tag background */
  --color-year-badge-fg: #155DFC; /* academic year tag text */

  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;
}
```

```tsx
// Correct
className="bg-surface text-text-primary border-border"

// Never
className="bg-purple-500 text-gray-600"
className="bg-[#7C5CFC]"
```

## How to Use (Mobile — NativeWind)

Same token names/values, defined in `tailwind.config.js` under `theme.extend.colors` so NativeWind generates matching utility classes. Never hardcode hex in a `style={{}}` prop — always use the NativeWind class.

## Font

Import Inter via `next/font/google` in the web root layout. Import via `expo-font` or Expo Google Fonts package on mobile. Never fall back to a system font.

## Layout

- Page/screen max-width (web): 1440px, centered
- Content padding: 24px on mobile, 32px on web
- Gap between sections: 24px
- Web uses a top navbar only — no sidebar
- Mobile uses a bottom tab bar for primary navigation (Home, My Courses, Profile for students; Dashboard, Courses, Payments for teachers)

## Cards

Every content block lives in a card.

```
background: bg-surface
border: 1px solid border-border
border-radius: 16px
padding: 24px (web) / 16px (mobile)
box-shadow: 0px 1px 3px rgba(0,0,0,0.1), 0px 1px 2px -1px rgba(0,0,0,0.1)
```

Never use colored card backgrounds — color goes inside via badges and text only.

## Typography Hierarchy

| Level | Size | Weight | Color token |
|---|---|---|---|
| Section heading | 16px | 600 | `text-text-primary` |
| Body / primary text | 14px | 500 | `text-text-primary` |
| Secondary / muted text | 12px | 400 | `text-text-muted` |
| Course title (card) | 16px | 600 | `text-text-primary` |
| Price | 18px | 700 | `text-accent` |

## Badges

All badges pill-shaped (`rounded-full`) unless stated otherwise.

| Badge | Background | Text |
|---|---|---|
| Free Preview | `bg-accent-light` | `text-accent` |
| Enrolled / Confirmed | `bg-success-light` | `text-success-foreground` |
| Pending Payment | `#FFF3E0` | `text-warning` |
| Locked Lesson | `bg-surface-secondary` | `text-locked` |
| Academic Year tag | `bg-year-badge-bg` | `text-year-badge-fg` |

## Buttons

**Primary:**
```
background: bg-accent
color: text-accent-foreground
border-radius: 8px
padding: 8px 16px
font-weight: 500
```

**Secondary:**
```
background: bg-surface
border: 1px solid border-border
color: text-text-primary
border-radius: 8px
```

**Destructive (reject enrollment, delete lesson):**
```
background: bg-error
color: #FFFFFF
border-radius: 8px
```

## Lesson List Item

- Free preview lesson: play icon in `text-accent`, title in `text-text-primary`
- Locked lesson: lock icon in `text-locked`, title in `text-text-muted`
- Row height: 56px, separated by `border-b border-border`
- Hover/press state: `bg-surface-secondary`

## Course Card

```
thumbnail: 16:9 ratio, rounded-t-16px
padding: 16px
title: 16px / 600 / text-text-primary, max 2 lines truncate
subject + year badges: inline row below title
price: bottom right, text-accent, 18px/700
```

## Empty States

Every list that can be empty must show one. Keep minimal:
- Short descriptive text in `text-text-muted`
- Optional icon above text
- CTA button only if there is a logical next action (e.g. teacher: "Create your first course")

Applies specifically to:
- Academic Year list with no published courses anywhere → show "No courses published yet"
- Course lesson list with zero lessons → teacher sees "Add your first lesson", student never sees this state (course shouldn't be published without lessons)
- Pending enrollments list with none → "No pending payments"

## Video Player

- 16:9 aspect ratio container, `rounded-lg` on web, edge-to-edge on mobile fullscreen
- Locked overlay state: dark semi-transparent overlay + lock icon + "Enroll to unlock" text, shown when `canWatch` returns false client-side (defense in depth, real enforcement is server-side)

## Do Nots

- Never use Tailwind/NativeWind built-in color classes (`bg-purple-500`, `text-gray-600`) — tokens only
- Never define colors in `tailwind.config.ts` (web) — use `@theme` in globals.css
- Never hardcode hex values in JSX or `style={{}}` props
- Never add gradients to card backgrounds
- Never use more than one font weight inside a single UI element
- Never show a raw Supabase/Cloudinary error string to the user
- Never use `position: fixed` on web — use normal flow layout
- Never let the video player expose the raw unsigned Cloudinary URL in the DOM or dev tools network tab beyond its 1-hour signed window
