/**
 * Instagram Publishing & Connection Server Actions
 * Path: @/app/actions/instagram-connection.ts
 *
 * Implements server-side actions for:
 *   - Finalizing Meta OAuth exchange and persisting account info
 *   - Querying connection status
 *   - Fetching logs and queue lists for UI dashboard
 *   - Rescheduling or manual triggering failed posts in the queue
 */

"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { OAuthService } from "@/services/oauth/oauth.service";
import { QueueService } from "@/services/queue/queue.service";
import type { ActionResult } from "@/types/instagram";

/**
 * Exchanges oauth code for permanent token and connects IG Account.
 */
export async function actionConnectInstagram(code: string, userId: string): Promise<ActionResult<{ username: string }>> {
  const supabase = createAdminClient();

  try {
    console.info(`[Action] Starting Instagram OAuth connection for user ${userId}...`);
    
    // 1. Exchange OAuth code for permanent Meta Page token
    const accessToken = await OAuthService.exchangeToken(code);
    
    // 2. Discover linked Instagram Account info from Meta Graph API
    const igMeta = await OAuthService.validateAndDiscoverAccount(accessToken);

    // 3. Persist linked account details inside DB
    const { error: dbErr } = await (supabase
      .from("instagram_accounts") as any)
      .upsert({
        user_id: userId,
        instagram_account_id: igMeta.instagramAccountId,
        facebook_page_id: igMeta.facebookPageId,
        access_token: igMeta.pageAccessToken, // Save Page token for auto-posting
        token_expiry: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days
        account_name: igMeta.accountName,
        connection_status: "connected",
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "instagram_account_id",
      });

    if (dbErr) {
      throw new Error(`Failed to save Instagram account in database: ${dbErr.message}`);
    }

    revalidatePath("/dashboard/instagram");
    return {
      success: true,
      data: { username: igMeta.username },
    };
  } catch (err: any) {
    console.error("[Action] actionConnectInstagram failed:", err);
    return {
      success: false,
      error: err.message || String(err),
    };
  }
}

/**
 * Fetches connected Instagram Account details.
 */
export async function actionGetInstagramAccount(userId: string): Promise<ActionResult<any>> {
  const supabase = createAdminClient();

  try {
    const { data, error } = await supabase
      .from("instagram_accounts")
      .select("id, instagram_account_id, facebook_page_id, account_name, connection_status, token_expiry")
      .eq("user_id", userId)
      .eq("connection_status", "connected")
      .maybeSingle();

    if (error) throw error;

    return {
      success: true,
      data,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || String(err),
    };
  }
}

/**
 * Fetches current publishing queue and live log audits for the dashboard.
 */
export async function actionGetQueueAndLogs(): Promise<ActionResult<{ queue: any[]; logs: any[] }>> {
  const supabase = createAdminClient();

  try {
    const { data: queue, error: queueErr } = await supabase
      .from("publish_queue")
      .select("*")
      .order("scheduled_time", { ascending: true });

    if (queueErr) throw queueErr;

    const { data: logs, error: logsErr } = await supabase
      .from("publish_logs")
      .select("*")
      .order("published_at", { ascending: false })
      .limit(30);

    if (logsErr) throw logsErr;

    return {
      success: true,
      data: {
        queue: queue || [],
        logs: logs || [],
      },
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || String(err),
    };
  }
}

/**
 * Manual queue processor trigger (for debug, testing or webhook pings).
 */
export async function actionTriggerQueueProcessing(): Promise<ActionResult<{ processed: number; errors: number }>> {
  try {
    console.info("[Action] Manual queue processing triggered.");
    const result = await QueueService.processPendingQueue();
    revalidatePath("/dashboard/instagram");
    return {
      success: true,
      data: {
        processed: result.processedCount,
        errors: result.errorsCount,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || String(err),
    };
  }
}

/**
 * Reschedules or retries a failed queue post manually from the dashboard.
 */
export async function actionRetryFailedPost(jobId: string): Promise<ActionResult> {
  const supabase = createAdminClient();

  try {
    console.info(`[Action] Retrying failed job ID: ${jobId}`);

    const { error } = await (supabase
      .from("publish_queue") as any)
      .update({
        queue_status: "Pending",
        retry_count: 0,
        processing_status: "Manually re-queued for retry",
        scheduled_time: new Date().toISOString(), // trigger immediately
        last_error: null,
      })
      .eq("id", jobId);

    if (error) throw error;

    revalidatePath("/dashboard/instagram");
    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || String(err),
    };
  }
}
