/**
 * Queue Processor API Route for Instagram
 *
 * POST /api/instagram/queue/process
 * GET  /api/instagram/queue/process  (alias for cron-friendly GET pings)
 *
 * Trigger patterns:
 *   1. Vercel Cron Job (vercel.json or vercel dashboard)
 *   2. External cron service (cron-job.org, etc.)
 *   3. Manual trigger for testing
 *
 * Security:
 *   Set CRON_SECRET in your env and pass as:
 *   Authorization: Bearer <CRON_SECRET>
 *
 * The actual queue logic lives in @/lib/queue — this route is
 * a thin HTTP adapter only.
 */

import { NextRequest, NextResponse } from "next/server";
import { processQueue } from "@/lib/queue";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Vercel max for hobby tier

export async function POST(req: NextRequest) {
  // ── Security check ───────────────────────────────────────────────────────
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret) {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (token !== cronSecret) {
      return NextResponse.json(
        { error: "Unauthorized — invalid CRON_SECRET." },
        { status: 401 }
      );
    }
  }

  // ── Parse optional config from body ─────────────────────────────────────
  let batchSize = 5;
  try {
    const body = await req.json().catch(() => ({}));
    if (typeof body?.batchSize === "number") {
      batchSize = Math.min(Math.max(1, body.batchSize), 20); // clamp 1-20
    }
  } catch {
    // ignore parse errors — use defaults
  }

  // ── Process the queue ────────────────────────────────────────────────────
  const result = await processQueue({
    batchSize,
    workerId: `vercel-cron-${Date.now()}`,
  });

  console.info("[QueueRoute] Run complete:", {
    processed: result.processed,
    successCount: result.successCount,
    failCount: result.failCount,
    durationMs: result.durationMs,
  });

  return NextResponse.json(result, {
    status: result.ok ? 200 : 500,
  });
}

// GET alias — some cron services only support GET
export async function GET(req: NextRequest) {
  return POST(req);
}
