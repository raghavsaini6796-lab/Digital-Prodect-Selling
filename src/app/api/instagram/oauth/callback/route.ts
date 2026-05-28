/**
 * Meta OAuth Callback API Route Handler
 * Path: /src/app/api/instagram/oauth/callback/route.ts
 *
 * Receives the authorization code from Meta redirection, exchanges it for access tokens,
 * validates the connected business profile, upserts connection state, and queues a welcome post.
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { OAuthService } from "@/services/oauth/oauth.service";
import { MetaPublishingService } from "@/services/meta/meta.service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { code } = body;
    
    // Header standard auth validation context
    const userId = req.headers.get("x-user-id") || "1"; // Uses dynamic header context or standard fallback

    if (!code) {
      return NextResponse.json({ error: "Missing authorization code" }, { status: 400 });
    }

    console.info(`[OAuth Route] Received callback request. Code length: ${code.length}`);

    // 1. Step 1: Exchange temporary code for 60-day access token
    const accessToken = await OAuthService.exchangeToken(code);

    // 2. Step 2: Query linked profiles to map Pages and Instagram Business Account ID
    const accountValidation = await OAuthService.validateAndDiscoverAccount(accessToken);

    const supabase = createAdminClient();

    // 3. Step 3: Create or update (upsert) the Instagram Account Connection
    const expiryDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(); // 60 Days Meta lifespan token

    const { data: upsertData, error: dbErr } = await (supabase
      .from("instagram_accounts") as any)
      .upsert({
        user_id: userId,
        instagram_account_id: accountValidation.instagramAccountId,
        facebook_page_id: accountValidation.facebookPageId,
        access_token: accountValidation.pageAccessToken, // Save page access token for automation
        token_expiry: expiryDate,
        account_name: accountValidation.accountName,
        connection_status: "connected",
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "instagram_account_id",
      })
      .select()
      .single();

    if (dbErr) {
      console.error("[OAuth Route] Supabase account upsert failed:", dbErr);
      return NextResponse.json({ error: "Failed to persist connected Instagram account state." }, { status: 500 });
    }

    // 4. Step 4: Queue a dynamic demo post to confirm publish pipelines (Optional testing check)
    try {
      console.info("[OAuth Route] Queueing demo/welcome post checks...");
      
      // Insert welcome post
      const { data: postData, error: postErr } = await (supabase
        .from("instagram_posts") as any)
        .insert({
          user_id: userId,
          caption: "Successfully linked Instagram Automation Engine! Ready to auto-publish product marketing visual schedules. 🚀",
          hashtags: ["Automation", "SaaS", "DigitalProducts"],
          content_type: "CTACaption",
          status: "Scheduled",
        })
        .select()
        .single();

      if (!postErr && postData) {
        // Queue job schedule mapping
        await (supabase
          .from("publish_queue") as any)
          .insert({
            post_id: postData.id,
            queue_status: "Pending",
            scheduled_time: new Date(Date.now() + 5000).toISOString(), // 5 seconds wait to let systems settle
            retry_count: 0,
            max_retries: 3,
            processing_status: "Demonstration post queued",
          });
      }
    } catch (queueErr) {
      console.warn("[OAuth Route] Non-fatal exception while scheduling demo post:", queueErr);
    }

    return NextResponse.json({
      success: true,
      message: "Instagram account connected successfully.",
      account: {
        id: upsertData.id,
        name: upsertData.account_name,
        instagramId: upsertData.instagram_account_id,
      }
    }, { status: 200 });

  } catch (err: any) {
    console.error("[OAuth Route] Exception inside oauth callback route:", err);
    return NextResponse.json({ error: err.message || "Failed to process Meta Account linkage callback." }, { status: 500 });
  }
}

// GET handler (handles redirects/code retrieval queries from standard OAuth parameter windows)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error_description") || searchParams.get("error");

  if (error) {
    return NextResponse.json({ error: `OAuth authorization rejected: ${error}` }, { status: 400 });
  }

  if (!code) {
    return NextResponse.json({ error: "No authorization code parameters detected." }, { status: 400 });
  }

  // Next.js App page handles callback visually. We redirect with query parameters to authorization screen
  return NextResponse.redirect(new URL(`/dashboard/instagram?oauth_code=${code}`, req.url));
}
