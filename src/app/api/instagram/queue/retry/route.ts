/**
 * manual queue retry trigger endpoint
 * Path: /src/app/api/instagram/queue/retry/route.ts
 *
 * Allows manual retry scheduling for failed posts directly via client HTTP actions.
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("postId");

    if (!postId) {
      // Fallback try parsing body
      const body = await req.json().catch(() => ({}));
      const bodyPostId = body.postId;
      
      if (!bodyPostId) {
        return NextResponse.json({ error: "Missing post ID parameter" }, { status: 400 });
      }
    }

    const targetPostId = postId || (await req.json().catch(() => ({}))).postId;

    console.info(`[Queue Retry Route] Manual retry trigger request received for Post ID: ${targetPostId}`);

    const supabase = createAdminClient();

    // 1. Verify queue entry exists
    const { data: queueEntry, error: fetchErr } = await (supabase
      .from("publish_queue") as any)
      .select("*")
      .eq("post_id", targetPostId)
      .maybeSingle();

    if (fetchErr) {
      throw new Error(`Queue check database error: ${fetchErr.message}`);
    }

    if (!queueEntry) {
      // If no queue entry exists, create a new pending queue item
      const { error: insertErr } = await (supabase
        .from("publish_queue") as any)
        .insert({
          post_id: targetPostId,
          queue_status: "Pending",
          scheduled_time: new Date().toISOString(), // run immediately
          retry_count: 0,
          max_retries: 3,
          processing_status: "Manually re-queued for publishing",
        });

      if (insertErr) {
        throw new Error(`Failed to create queue job: ${insertErr.message}`);
      }
    } else {
      // Reset the existing queue state to Pending for immediate processing
      const { error: updateErr } = await (supabase
        .from("publish_queue") as any)
        .update({
          queue_status: "Pending",
          retry_count: 0,
          processing_status: "Queued manually for retry",
          scheduled_time: new Date().toISOString(), // reset execution target
          last_error: null,
        })
        .eq("id", queueEntry.id);

      if (updateErr) {
        throw new Error(`Failed to update queue job state: ${updateErr.message}`);
      }
    }

    // 2. Also reset post status to Scheduled
    await (supabase
      .from("instagram_posts") as any)
      .update({
        status: "Scheduled",
        last_error: null,
      })
      .eq("id", targetPostId);

    return NextResponse.json({
      success: true,
      message: "Post retry scheduled successfully. Processing queue will pick it up on the next run."
    }, { status: 200 });

  } catch (err: any) {
    console.error("[Queue Retry Route] Execution exception:", err);
    return NextResponse.json({ error: err.message || "Failed to schedule retry" }, { status: 500 });
  }
}
