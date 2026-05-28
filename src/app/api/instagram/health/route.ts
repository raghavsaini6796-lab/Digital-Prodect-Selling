/**
 * Instagram Queue Health Check
 * GET /api/instagram/health
 *
 * Returns the current state of the publish queue.
 * Used by monitoring tools, uptime checkers, and the dashboard.
 *
 * Secured: requires CRON_SECRET bearer token when set in env.
 */

import { NextRequest, NextResponse } from "next/server";
import { getQueueHealth } from "@/lib/queue";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // Optional auth — only enforced when CRON_SECRET is set
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (token !== cronSecret) {
      return NextResponse.json(
        { error: "Unauthorized — invalid CRON_SECRET." },
        { status: 401 }
      );
    }
  }

  const health = await getQueueHealth();

  return NextResponse.json(
    {
      ok: health.healthy,
      queue: {
        pending: health.pendingCount,
        processing: health.processingCount,
        failed: health.failedCount,
        oldestPendingAge: health.oldestPendingAge ?? null,
      },
      provider: {
        name: health.providerName,
        isLive: health.providerIsLive,
      },
      checkedAt: new Date().toISOString(),
    },
    { status: health.healthy ? 200 : 503 }
  );
}
