/**
 * Publish Queue & Audit Logs Retrieval Endpoint
 * Path: /src/app/api/instagram/queue/logs/route.ts
 *
 * Exposes active queue items and audit history logs for client-side rendering.
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const supabase = createAdminClient();
    console.info("[Queue Logs API] Fetching queue status and publish logs...");

    // 1. Query all entries from publish_queue sorted by scheduled time
    const { data: queue, error: queueErr } = await supabase
      .from("publish_queue")
      .select("*")
      .order("scheduled_time", { ascending: true });

    if (queueErr) {
      throw new Error(`Queue query error: ${queueErr.message}`);
    }

    // 2. Query recent entries from publish_logs
    const { data: logs, error: logsErr } = await supabase
      .from("publish_logs")
      .select("*")
      .order("published_at", { ascending: false })
      .limit(30);

    if (logsErr) {
      throw new Error(`Audit logs query error: ${logsErr.message}`);
    }

    return NextResponse.json({
      success: true,
      queue: queue || [],
      logs: logs || [],
    }, { status: 200 });

  } catch (err: any) {
    console.error("[Queue Logs API] Exception:", err);
    return NextResponse.json({ error: err.message || "Failed to retrieve logs and queue data." }, { status: 500 });
  }
}
