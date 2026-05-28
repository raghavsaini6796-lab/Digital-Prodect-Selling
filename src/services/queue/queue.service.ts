/**
 * Scalable Resilient Publishing Queue Service
 * Path: @/services/queue/queue.service.ts
 *
 * Automatically picks up pending scheduled jobs, queries live credentials,
 * handles token validations, triggers the publishing engine, and audit logs the output.
 */

import { createAdminClient } from "@/lib/supabase/admin";
import { MetaPublishingService } from "../meta/meta.service";
import type { InstagramPost } from "@/types/instagram";

export interface QueueItem {
  id: string;
  post_id: string;
  scheduled_time: string;
  retry_count: number;
  max_retries: number;
}

export class QueueService {
  /**
   * Main Queue Processor Loop.
   * Scans 'publish_queue' table, executes due jobs, logs errors, and updates statuses.
   */
  static async processPendingQueue(): Promise<{ processedCount: number; errorsCount: number }> {
    const supabase = createAdminClient();
    let processedCount = 0;
    let errorsCount = 0;

    try {
      console.info("[QueueService] Scanning queue for pending posts...");

      // 1. Fetch pending scheduled posts that are due for publishing
      const { data: pendingJobs, error: fetchErr } = await (supabase
        .from("publish_queue") as any)
        .select("*")
        .eq("queue_status", "Pending")
        .lte("scheduled_time", new Date().toISOString());

      if (fetchErr) {
        throw new Error(`Failed to fetch pending queue: ${fetchErr.message}`);
      }

      if (!pendingJobs || pendingJobs.length === 0) {
        console.info("[QueueService] Zero pending posts due at this time.");
        return { processedCount: 0, errorsCount: 0 };
      }

      console.info(`[QueueService] Found ${pendingJobs.length} due posts to process.`);

      for (const job of (pendingJobs || [])) {
        processedCount++;
        const jobId = job.id;
        const postId = job.post_id;

        try {
          // A. Mark job as "Processing" to prevent double publish attempts
          await (supabase
            .from("publish_queue") as any)
            .update({ queue_status: "Processing", processing_status: "Publishing in progress..." })
            .eq("id", jobId);

          // B. Retrieve parent Instagram Post data
          const { data: post, error: postErr } = await (supabase
            .from("instagram_posts") as any)
            .select("*")
            .eq("id", postId)
            .single();

          if (postErr || !post) {
            throw new Error(`Instagram post not found or removed. Error: ${postErr?.message}`);
          }

          // C. Get Access token from instagram_accounts
          const { data: account, error: accountErr } = await (supabase
            .from("instagram_accounts") as any)
            .select("access_token, token_expiry, connection_status")
            .eq("user_id", post.user_id)
            .eq("connection_status", "connected")
            .single();

          if (accountErr || !account) {
            throw new Error("No connected Instagram Business account or valid access token found for user.");
          }

          // D. Publish post using MetaPublishingService
          const publishResult = await MetaPublishingService.publish({
            accessToken: account.access_token,
            instagramAccountId: post.instagram_account_id || "default", // will auto-detect inside service or use standard
            post: post as unknown as InstagramPost,
          });

          if (publishResult.success && publishResult.providerPostId) {
            // E1. Success! Update queue state, save audit log, and update main post state
            await (supabase
              .from("publish_queue") as any)
              .update({ queue_status: "Completed", processing_status: "Successfully Published" })
              .eq("id", jobId);

            await (supabase
              .from("instagram_posts") as any)
              .update({ status: "Published", published_at: new Date().toISOString(), provider_post_id: publishResult.providerPostId })
              .eq("id", postId);

            await this.createPublishLog(supabase, postId, "Success", publishResult);
          } else {
            // E2. Publisher failed without throwing
            throw new Error(publishResult.error || "Meta rejected post creation request.");
          }

        } catch (jobErr: any) {
          errorsCount++;
          console.error(`[QueueService] Job ${jobId} failed:`, jobErr);
          
          const newRetryCount = job.retry_count + 1;
          const maxRetries = job.max_retries || 3;
          const hasRetriesLeft = newRetryCount < maxRetries;
          const nextStatus = hasRetriesLeft ? "Retrying" : "Failed";

          // Save error logs to queue state
          await (supabase
            .from("publish_queue") as any)
            .update({
              queue_status: nextStatus,
              retry_count: newRetryCount,
              processing_status: `Failed on attempt #${newRetryCount}`,
              last_error: jobErr.message || String(jobErr),
            })
            .eq("id", jobId);

          // Update main post status if it fails completely
          if (!hasRetriesLeft) {
            await (supabase
              .from("instagram_posts") as any)
              .update({ status: "Failed", last_error: jobErr.message || String(jobErr) })
              .eq("id", postId);
          }

          // Create fail log entry
          await this.createPublishLog(supabase, postId, "Failed", { error: jobErr.message || String(jobErr) });
        }
      }
    } catch (globalErr) {
      console.error("[QueueService] Global loop exception:", globalErr);
    }

    return { processedCount, errorsCount };
  }

  /**
   * Helper: Secure insertion of logging audits inside Database
   */
  private static async createPublishLog(
    supabase: any,
    postId: string,
    status: "Success" | "Failed",
    data: any
  ) {
    try {
      const logEntry = {
        post_id: postId,
        publish_status: status,
        response_data: status === "Success" ? data : null,
        error_logs: status === "Failed" ? data : null,
        published_at: new Date().toISOString(),
      };

      await supabase.from("publish_logs").insert([logEntry]);
    } catch (logErr) {
      console.error("[QueueService] Audit log write warning:", logErr);
    }
  }
}
