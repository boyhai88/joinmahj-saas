"use server";

import { createClient } from "@/lib/supabase/server";

export type MarkCompleteResult = {
  day: number;
  completed_at: string;
};

/**
 * Mark a roadmap day complete for the current user.
 *
 * Uses the `progress` table (keyed by day 1–7), which is purpose-built for the
 * 7-day beginner roadmap and requires no seeded `lessons` rows.
 */
export async function markLessonComplete(
  day: number
): Promise<MarkCompleteResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated.");
  }

  if (!Number.isInteger(day) || day < 1 || day > 7) {
    throw new Error("Invalid day.");
  }

  const completedAt = new Date().toISOString();

  const { error } = await supabase.from("progress").upsert(
    {
      user_id: user.id,
      day,
      status: "completed",
      completed_at: completedAt,
    },
    { onConflict: "user_id,day" }
  );

  if (error) {
    throw new Error(error.message);
  }

  return { day, completed_at: completedAt };
}
