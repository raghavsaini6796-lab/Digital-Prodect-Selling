/**
 * Scheduler Service
 *
 * Facade for scheduling Instagram posts.
 * Inserts jobs into content_schedules for queue processing.
 */

"use server";

import { createClient } from "@/lib/supabase/server";
import type { SchedulePostInput } from "@/types/instagram";
import { revalidatePath } from "next/cache";

// ─── Schedule a Post ──────────────────────────────────────────────────────────

export async function schedulePost(
  input: SchedulePostInput
): Promise<{ success: boolean; scheduleId?: string; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized." };

  const now = new Date();
  if (input.scheduledTime <= now) {
    return { success: false, error: "Scheduled time must be in the future." };
  }

  // 1. Insert into content_schedules
  const { data: scheduleData, error: scheduleErr } = await supabase
    .from("content_schedules")
    .insert({
      user_id: user.id,
      post_id: input.postId,
      scheduled_time: input.scheduledTime.toISOString(),
      timezone: input.timezone || "UTC",
      queue_status: "Pending",
      processing_status: "Queued and waiting for scheduled time",
      retry_count: 0,
      max_retries: 3
    })
    .select("id")
    .single();

  if (scheduleErr || !scheduleData) {
    return { success: false, error: scheduleErr?.message ?? "Failed to enqueue schedule." };
  }

  // 2. Update the post's scheduled_at + status
  const { error: postErr } = await supabase
    .from("instagram_posts")
    .update({
      status: "Scheduled",
      scheduled_at: input.scheduledTime.toISOString(),
    })
    .eq("id", input.postId)
    .eq("user_id", user.id);

  if (postErr) {
    // Attempt rollback if post update fails
    await supabase.from("content_schedules").delete().eq("id", scheduleData.id);
    return { success: false, error: postErr.message };
  }

  revalidatePath("/dashboard/instagram");
  return { success: true, scheduleId: scheduleData.id };
}

// ─── Cancel Schedule ──────────────────────────────────────────────────────────

export async function cancelSchedule(scheduleId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized." };

  // 1. Get schedule to find post_id
  const { data: schedule } = await supabase
    .from("content_schedules")
    .select("post_id")
    .eq("id", scheduleId)
    .eq("user_id", user.id)
    .single();

  if (!schedule) return { success: false, error: "Schedule not found." };
  
  // 2. Cancel the task
  const { error: cancelErr } = await supabase
    .from("content_schedules")
    .update({ queue_status: "Cancelled", processing_status: "Cancelled by user" })
    .eq("id", scheduleId)
    .eq("user_id", user.id);
    
  if (cancelErr) return { success: false, error: cancelErr.message };

  // 3. Revert post to Draft
  await supabase
    .from("instagram_posts")
    .update({ status: "Draft", scheduled_at: null })
    .eq("id", schedule.post_id)
    .eq("user_id", user.id);

  revalidatePath("/dashboard/instagram");
  return { success: true };
}
