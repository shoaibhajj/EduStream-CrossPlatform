// Shared types used by both apps/web and apps/mobile.
// Only extend — never remove or rename existing fields.

export type UserRole = "admin" | "teacher" | "student";

export type Profile = {
  id: string;
  clerk_user_id: string;
  role: UserRole | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
};

export type AcademicYear = {
  id: string;
  name: string;
  order: number;
  created_at: string;
};

export type Subject = {
  id: string;
  name: string;
  academic_year_id: string;
  order: number;
  created_at: string;
};

export type Course = {
  id: string;
  teacher_id: string;
  subject_id: string;
  academic_year_id: string;
  title: string;
  description: string | null;
  price: number;
  thumbnail_url: string | null;
  is_published: boolean;
  created_at: string;
};

export type VideoType = "cloudinary" | "youtube" | "vimeo";

export type Lesson = {
  id: string;
  course_id: string;
  title: string;
  order: number;
  video_type: VideoType;
  video_url: string | null;
  cloudinary_public_id: string | null;
  is_free_preview: boolean;
  is_published: boolean;
  created_at: string;
};

export type PaymentStatus = "pending" | "confirmed" | "rejected";

export type Enrollment = {
  id: string;
  student_id: string;
  course_id: string;
  payment_status: PaymentStatus;
  confirmed_by: string | null;
  created_at: string;
  updated_at: string;
};

export type PaymentInfo = {
  id: string;
  teacher_id: string;
  method: string;
  instructions: string;
  contact: string | null;
  created_at: string;
  updated_at: string;
};
