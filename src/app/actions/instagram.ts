/**
 * Instagram Server Actions
 *
 * Thin action layer between UI and services.
 * All validation + orchestration lives here.
 * UI components call these — never call services directly from client.
 */

"use server";

import { generateInstagramContent } from "@/services/content-engine/content-engine.service";
import { createInstagramPost, getPostsByStatus, getPostsWithSchedules, updatePostStatus, deleteInstagramPost, publishPostNow, getQueueStats, getContentTemplates } from "@/services/instagram/instagram.service";
import { schedulePost, cancelSchedule } from "@/services/scheduler/scheduler.service";
import { revalidatePath } from "next/cache";
import type {
  ContentGenerationInput,
  GeneratedInstagramContent,
  InstagramPostStatus,
  ActionResult,
  InstagramPost,
  PostWithSchedule,
  QueueStats,
} from "@/types/instagram";

// ─── Generate Content ─────────────────────────────────────────────────────────

export async function actionGenerateContent(
  input: ContentGenerationInput
): Promise<ActionResult<GeneratedInstagramContent>> {
  const result = await generateInstagramContent(input);
  if (result.status === "error") {
    return { success: false, error: result.error };
  }
  return { success: true, data: result.data };
}

// ─── Save as Draft ────────────────────────────────────────────────────────────

export async function actionSaveAsDraft(
  input: ContentGenerationInput,
  generatedContent: GeneratedInstagramContent
): Promise<ActionResult<{ postId: string }>> {
  return createInstagramPost({ contentGenerationInput: input, generatedContent, status: "Draft" });
}

// ─── Generate + Save Draft ────────────────────────────────────────────────────

export async function actionGenerateAndSave(
  input: ContentGenerationInput
): Promise<ActionResult<{ postId: string; content: GeneratedInstagramContent }>> {
  const genResult = await generateInstagramContent(input);
  if (genResult.status === "error" || !genResult.data) {
    return { success: false, error: genResult.error ?? "Generation failed." };
  }

  const saveResult = await createInstagramPost({
    contentGenerationInput: input,
    generatedContent: genResult.data,
    status: "Draft",
  });

  if (!saveResult.success) {
    return { success: false, error: saveResult.error };
  }

  return { success: true, data: { postId: saveResult.data!.postId, content: genResult.data } };
}

// ─── Schedule Post ────────────────────────────────────────────────────────────

export async function actionSchedulePost(
  postId: string,
  scheduledTime: string,
  timezone = "UTC"
): Promise<ActionResult<{ scheduleId: string }>> {
  const scheduledDate = new Date(scheduledTime);

  if (isNaN(scheduledDate.getTime())) {
    return { success: false, error: "Invalid scheduled time." };
  }

  if (scheduledDate <= new Date()) {
    return { success: false, error: "Scheduled time must be in the future." };
  }

  const result = await schedulePost({ postId, scheduledTime: scheduledDate, timezone });
  if (!result.success) return { success: false, error: result.error };
  return { success: true, data: { scheduleId: result.scheduleId! } };
}

// ─── Cancel Schedule ──────────────────────────────────────────────────────────

export async function actionCancelSchedule(scheduleId: string): Promise<ActionResult> {
  const result = await cancelSchedule(scheduleId);
  return result.success ? { success: true } : { success: false, error: result.error };
}

// ─── Publish Immediately ──────────────────────────────────────────────────────

export async function actionPublishNow(postId: string): Promise<ActionResult> {
  const result = await publishPostNow(postId);
  return result.success ? { success: true } : { success: false, error: result.error };
}

// ─── Delete Post ──────────────────────────────────────────────────────────────

export async function actionDeletePost(postId: string): Promise<ActionResult> {
  return deleteInstagramPost(postId);
}

// ─── Update Post Status ───────────────────────────────────────────────────────

export async function actionUpdateStatus(
  postId: string,
  status: InstagramPostStatus
): Promise<ActionResult> {
  return updatePostStatus(postId, status);
}

// ─── Fetch Posts ──────────────────────────────────────────────────────────────

export async function actionGetPosts(
  status: InstagramPostStatus | "All" = "All",
  limit = 20
): Promise<ActionResult<InstagramPost[]>> {
  return getPostsByStatus(status, limit);
}

export async function actionGetPostsWithSchedules(
  limit = 50
): Promise<ActionResult<PostWithSchedule[]>> {
  return getPostsWithSchedules(limit);
}

// ─── Queue Stats ──────────────────────────────────────────────────────────────

export async function actionGetQueueStats(): Promise<ActionResult<QueueStats>> {
  return getQueueStats();
}

// ─── Templates ────────────────────────────────────────────────────────────────

export async function actionGetTemplates() {
  return getContentTemplates();
}
