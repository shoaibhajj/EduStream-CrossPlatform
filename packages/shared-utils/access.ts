// Pure TypeScript — no React, no Next.js, no Expo imports.
// Importable by both apps/web and apps/mobile.
import type { SupabaseClient } from "@supabase/supabase-js";

export async function canWatch(
  supabase: SupabaseClient,
  studentId: string,
  lessonId: string
): Promise<boolean> {
  try {
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
  } catch {
    return false;
  }
}
