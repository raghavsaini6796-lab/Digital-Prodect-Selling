/**
 * Queue Processor
 *
 * Core logic for processing the Instagram content publishing queue.
 * Decoupled from HTTP layer — callable from:
 *   - API route (POST /api/instagram/queue/process)
 *   - Vercel Cron Jobs
 *   - Future worker processes (BullMQ, Inngest, etc.)
 *
 * Architecture:
 *   1. Fetch `Pending` schedules whose time has passed
 *   2. Mark each as `Processing` (prevents double-pick)
 *   3. Call the provider to publish
 *   4. Update status: Completed / Retrying / Failed
 *   5. Return a typed ProcessResult for the caller to log/respond
 */

import { createAdminClient } from "@/lib/supabase/admin";
import { getInstagramProvider } from "@/services/instagram/instagram.service";
import type { InstagramPost } from "@/types/instagram";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface QueueProcessOptions {
  /**
   * Maximum number of schedules to process in one run.
   * Keep small to stay within serverless time limits.
   * @default 5
   */
  batchSize?: number;

  /**
   * Worker identifier — logged to `content_schedules.worker_id`.
   * Useful for debugging distributed workers.
   * @default "default"
   */
  workerId?: string;
}

export interface QueueJobResult {
  scheduleId: string;
  postId: string;
  status: "published" | "retrying" | "failed";
  error?: string;
  providerPostId?: string;
}

export interface ProcessResult {
  ok: boolean;
  processed: number;
  successCount: number;
  failCount: number;
  durationMs: number;
  jobs: QueueJobResult[];
  error?: string;
}

// ─── Main Processor ───────────────────────────────────────────────────────────

export async function processQueue(
  options: QueueProcessOptions = {}
): Promise<ProcessResult> {
  const { batchSize = 5, workerId = "default" } = options;
  const startedAt = Date.now();
  const jobs: QueueJobResult[] = [];

  try {
    // Use admin client — queue processor runs outside user auth context
    const supabase = createAdminClient();
    const now = new Date().toISOString();

    // ── Step 1: Claim pending jobs ─────────────────────────────────────────

    const { data: schedules, error: fetchErr } = await (supabase
      .from("content_schedules") as any)
      .select("*")
      .eq("queue_status", "Pending")
      .lte("scheduled_time", now)
      .limit(batchSize);

    if (fetchErr) {
      return {
        ok: false,
        processed: 0,
        successCount: 0,
        failCount: 0,
        durationMs: Date.now() - startedAt,
        jobs: [],
        error: fetchErr.message,
      };
    }

    if (!schedules || schedules.length === 0) {
      return {
        ok: true,
        processed: 0,
        successCount: 0,
        failCount: 0,
        durationMs: Date.now() - startedAt,
        jobs: [],
      };
    }

    // Fetch the corresponding instagram_posts in one query
    const postIds = (schedules || []).map((s: any) => s.post_id);
    const { data: postsData, error: postsErr } = await (supabase
      .from("instagram_posts") as any)
      .select("*")
      .in("id", postIds);

    if (postsErr) {
      return {
        ok: false,
        processed: 0,
        successCount: 0,
        failCount: 0,
        durationMs: Date.now() - startedAt,
        jobs: [],
        error: postsErr.message,
      };
    }

    // Build a Map for O(1) post lookup
    const postsMap = new Map<string, InstagramPost>(
      (postsData ?? []).map((p: any) => [p.id, p as unknown as InstagramPost])
    );

    const provider = await getInstagramProvider();
    let successCount = 0;
    let failCount = 0;

    // ── Step 2: Process each schedule ─────────────────────────────────────

    for (const schedule of schedules) {
      const post = postsMap.get(schedule.post_id);
      if (!post) {
        // Post was deleted — cancel the schedule
        await (supabase
          .from("content_schedules") as any)
          .update({ queue_status: "Cancelled", processing_status: "Post not found" })
          .eq("id", schedule.id);
        continue;
      }

      // Mark as Processing to prevent re-processing by concurrent workers
      await (supabase
        .from("content_schedules") as any)
        .update({
          queue_status: "Processing",
          processing_status: "Picked up by worker — publishing...",
          picked_up_at: new Date().toISOString(),
          worker_id: workerId,
        })
        .eq("id", schedule.id)
        .eq("queue_status", "Pending"); // optimistic lock — only claim if still Pending

      // ── Step 3: Attempt publish ──────────────────────────────────────────

      const publishResult = await provider.publishPost(post);

      if (publishResult.success) {
        // ── Success path ─────────────────────────────────────────────────

        await (supabase
          .from("instagram_posts") as any)
          .update({
            status: "Published",
            published_at: new Date().toISOString(),
            provider_post_id: publishResult.providerPostId ?? null,
            last_error: null,
          })
          .eq("id", post.id);

        await (supabase
          .from("content_schedules") as any)
          .update({
            queue_status: "Completed",
            processing_status: `Published${publishResult.providerPostId ? ` — ID: ${publishResult.providerPostId}` : ""}`,
            completed_at: new Date().toISOString(),
          })
          .eq("id", schedule.id);

        jobs.push({
          scheduleId: schedule.id,
          postId: post.id,
          status: "published",
          providerPostId: publishResult.providerPostId,
        });

        successCount++;
      } else {
        // ── Failure path — with retry logic ──────────────────────────────

        const retryCount = (schedule.retry_count ?? 0) + 1;
        const maxRetries = schedule.max_retries ?? 3;
        const isFinalFail = retryCount >= maxRetries;

        // Exponential backoff for next retry: 2^n minutes
        const nextRetryMs = Math.pow(2, retryCount) * 60_000;
        const nextRetryAt = isFinalFail
          ? null
          : new Date(Date.now() + nextRetryMs).toISOString();

        // Append to error_log jsonb array
        const errorEntry = {
          attempt: retryCount,
          error: publishResult.error ?? "Unknown error",
          at: new Date().toISOString(),
        };

        const existingLog = Array.isArray(schedule.error_log)
          ? schedule.error_log
          : [];

        await (supabase
          .from("instagram_posts") as any)
          .update({
            status: isFinalFail ? "Failed" : "Scheduled",
            last_error: publishResult.error ?? null,
            publish_attempt: retryCount,
          })
          .eq("id", post.id);

        await (supabase
          .from("content_schedules") as any)
          .update({
            queue_status: isFinalFail ? "Failed" : "Retrying",
            processing_status: isFinalFail
              ? `Permanently failed after ${retryCount} attempts`
              : `Retry ${retryCount}/${maxRetries} — next at ${nextRetryAt}`,
            retry_count: retryCount,
            last_attempted_at: new Date().toISOString(),
            next_retry_at: nextRetryAt,
            error_log: [...existingLog, errorEntry],
            // If retrying, reset to Pending so next cron picks it up
            ...(isFinalFail ? {} : { queue_status: "Pending" }),
          })
          .eq("id", schedule.id);

        jobs.push({
          scheduleId: schedule.id,
          postId: post.id,
          status: isFinalFail ? "failed" : "retrying",
          error: publishResult.error,
        });

        failCount++;
      }
    }

    return {
      ok: true,
      processed: schedules.length,
      successCount,
      failCount,
      durationMs: Date.now() - startedAt,
      jobs,
    };
  } catch (err) {
    console.error("[QueueProcessor] Unhandled error:", err);
    return {
      ok: false,
      processed: 0,
      successCount: 0,
      failCount: 0,
      durationMs: Date.now() - startedAt,
      jobs,
      error: err instanceof Error ? err.message : "Unexpected queue error",
    };
  }
}

// ─── Health Check ─────────────────────────────────────────────────────────────

export interface QueueHealthStatus {
  healthy: boolean;
  pendingCount: number;
  failedCount: number;
  processingCount: number;
  oldestPendingAge?: string; // ISO string
  providerName: string;
  providerIsLive: boolean;
}

export async function getQueueHealth(): Promise<QueueHealthStatus> {
  try {
    const supabase = createAdminClient();
    const provider = await getInstagramProvider();

    const { data } = await (supabase
      .from("content_schedules") as any)
      .select("queue_status, scheduled_time")
      .in("queue_status", ["Pending", "Failed", "Processing"]);

    const rows = data ?? [];
    const pending = rows.filter((r: any) => r.queue_status === "Pending");
    const failed = rows.filter((r: any) => r.queue_status === "Failed");
    const processing = rows.filter((r: any) => r.queue_status === "Processing");

    const oldestPending =
      pending.length > 0
        ? pending.reduce((a: any, b: any) =>
            a.scheduled_time < b.scheduled_time ? a : b
          ).scheduled_time
        : undefined;

    return {
      healthy: failed.length === 0 && processing.length < 10,
      pendingCount: pending.length,
      failedCount: failed.length,
      processingCount: processing.length,
      oldestPendingAge: oldestPending,
      providerName: provider.name,
      providerIsLive: provider.isLive,
    };
  } catch {
    return {
      healthy: false,
      pendingCount: 0,
      failedCount: 0,
      processingCount: 0,
      providerName: "unknown",
      providerIsLive: false,
    };
  }
}
