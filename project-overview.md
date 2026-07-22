# EduStream — Project Overview

## Overview

EduStream is a cross-platform school application consisting of an Android APK (React Native / Expo) and a companion website (Next.js). Teachers upload or link course videos, organize them by academic year and subject, and manage student payments manually. Students browse courses, preview one free lesson per course, pay externally, and get manual access confirmation from the teacher. The mobile APK is the primary deliverable — the website is secondary and mirrors the same core flow.

## Goals

1. Ship a working, installable Android APK that lets a student sign up, browse courses, watch a free preview, and request enrollment
2. Ship a teacher flow that lets a teacher create a course, add lessons (upload or link), and confirm student payments
3. Keep the codebase clean, typed, and scoped tightly enough that a single developer can extend it without re-reading the whole codebase
4. Avoid building anything not explicitly required — no payment gateway, no chat, no notifications, no certificates

## Core User Flow

### Student
1. Student signs up / signs in via Clerk, selects role "student"
2. Student sees Academic Years that contain at least one published course
3. Student taps a Year → sees Subjects with published courses in that year
4. Student taps a Subject → sees Course cards
5. Student opens a Course → sees lesson list, one lesson marked free preview
6. Student watches the free preview lesson without enrolling
7. Student taps Enroll → sees teacher's Payment Info Card → pays externally → taps "I've Paid"
8. Enrollment status becomes `pending`
9. Teacher confirms payment → enrollment becomes `confirmed`
10. Student can now watch every lesson in the course

### Teacher
1. Teacher signs up / signs in via Clerk, selects role "teacher"
2. Teacher opens dashboard → sees list of their courses and pending enrollments
3. Teacher creates a course: title, description, subject, year, price, thumbnail
4. Teacher adds lessons to the course: uploads a video file (Cloudinary) or pastes a YouTube/Vimeo link
5. Teacher marks exactly one lesson as free preview (optional but recommended)
6. Teacher publishes the course — it now becomes visible to students
7. Teacher reviews pending enrollments and confirms or rejects each one

### Admin
1. Admin signs in — account created manually via Supabase dashboard, never via app signup
2. Admin manages the master list of Academic Years and Subjects
3. Admin can view all teachers, all courses, and override any enrollment status

## Features

### Authentication & Roles
- Clerk-based sign up / sign in (email + Google OAuth)
- Role selection screen on first login: student or teacher (admin assigned manually)
- Clerk webhook syncs every new user into the `profiles` table with their role
- Role-aware redirect after login

### Content Browsing
- Three-level browse hierarchy: Academic Year → Subject → Course
- Any Academic Year or Subject with zero published courses is invisible to students — enforced at the query layer
- Course cards show thumbnail, title, price, and teacher name

### Video & Lessons
- A course has an ordered list of lessons
- Each lesson is a Cloudinary upload or a YouTube/Vimeo link
- Exactly one lesson per course can be flagged as a free preview, viewable without enrollment
- Lessons can be toggled published/draft without deleting them

### Payments (Manual)
- No payment gateway integration
- Each teacher maintains one Payment Info record: method, instructions, contact
- Student marks "I've Paid" after paying externally, creating a pending enrollment
- Teacher manually confirms or rejects enrollment

### Video Protection
- Cloudinary videos are served via signed URLs with a 1-hour expiry, generated server-side
- Web player disables right-click, download button, and picture-in-picture
- These protections are implemented from the first working version, not deferred

## Scope

### In Scope
- Android APK (Expo/React Native) — primary deliverable
- Companion Next.js website mirroring the mobile student and teacher flow
- Admin panel (web only) for managing years, subjects, and enrollment overrides
- Clerk authentication shared across both apps
- Supabase database, storage, and Row Level Security
- Cloudinary video hosting with signed URLs, plus YouTube/Vimeo link support
- Manual, contact-based payment confirmation flow

### Out of Scope
- Payment gateway integration (Stripe, PayPal, etc.)
- Live classes, video calls, or real-time chat
- Push notifications or email notifications
- Certificates or granular progress/completion tracking
- Multi-school / multi-tenant support
- iOS build

## Success Criteria

1. A student can sign up, browse to a course, and watch its free preview lesson without any payment step, within the APK
2. A student can request enrollment, and a teacher can confirm it, and the student then gains access to every lesson in that course
3. A teacher can create a course and add a lesson (both upload and link paths) in under 5 minutes
4. An Academic Year or Subject with zero published courses never appears anywhere in the student-facing UI
5. No Cloudinary video URL is ever visible in client-side network requests unsigned
6. The Android APK builds successfully via `eas build` and installs on a physical device
