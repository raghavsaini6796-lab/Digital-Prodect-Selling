/**
 * Instagram Service
 *
 * - Provider factory (selects mock vs meta_graph via ENV)
 * - Core DB operations for instagram_posts table
 * - All DB logic lives here — scheduler calls this service
 */

"use server";

import { createClient } from "@/lib/supabase/server";
import { MockInstagramProvider } from "./mock.provider";
import { MetaGraphProvider } from "./meta-graph.provider";
import type { IInstagramProvider } from "./provider.interface";
import type {
  InstagramPost,
  InstagramPostStatus,
  CreatePostInput,
  PublishResult,
  ActionResult,
  PostWithSchedule,
  QueueStats,
} from "@/types/instagram";
import { revalidatePath } from "next/cache";

// ─── Provider Factory ─────────────────────────────────────────────────────────

let _providerInstance: IInstagramProvider | null = null;

export async function getInstagramProvider(): Promise<IInstagramProvider> {
  if (_providerInstance) return _providerInstance;

  const providerType = process.env.INSTAGRAM_PROVIDER ?? "mock";

  if (providerType === "meta_graph") {
    _providerInstance = new MetaGraphProvider({
      type: "meta_graph",
      accessToken: process.env.META_ACCESS_TOKEN,
      pageId: process.env.META_PAGE_ID,
      instagramAccountId: process.env.META_IG_ACCOUNT_ID,
    });
  } else {
    _providerInstance = new MockInstagramProvider();
  }

  console.info(`[InstagramService] Using provider: ${_providerInstance.name}`);
  return _providerInstance;
}

// ─── Create Post ──────────────────────────────────────────────────────────────

export async function createInstagramPost(
  input: CreatePostInput
): Promise<ActionResult<{ postId: string }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized." };

  const { contentGenerationInput: gen, generatedContent: gc, status, scheduledAt } = input;

  const { data, error } = await supabase
    .from("instagram_posts")
    .insert({
      user_id: user.id,
      product_id: gen.productId ?? null,
      content_type: gen.contentType,
      caption: gc.caption,
      hashtags: gc.hashtags,
      hook: gc.hook,
      cta: gc.cta,
      carousel_slides: gc.carouselSlides ?? null,
      reel_script: gc.reelScript ?? null,
      story_ideas: gc.storyIdeas ?? null,
      generated_content: gc,
      ai_prompt: `${gen.contentType} | ${gen.productName} | ${gen.audience}`,
      product_name: gen.productName,
      audience: gen.audience,
      tone: gen.tone,
      platform_goal: gen.platformGoal,
      cta_style: gen.ctaStyle,
      status,
      scheduled_at: scheduledAt?.toISOString() ?? null,
      provider: process.env.INSTAGRAM_PROVIDER ?? "mock",
    })
    .select("id")
    .single();

  if (error || !data) {
    return { success: false, error: error?.message ?? "Failed to create post." };
  }

  revalidatePath("/dashboard/instagram");
  return { success: true, data: { postId: data.id } };
}

// ─── Fetch Posts by Status ────────────────────────────────────────────────────

export async function getPostsByStatus(
  status: InstagramPostStatus | "All",
  limit = 20
): Promise<ActionResult<InstagramPost[]>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized." };

  let query = supabase
    .from("instagram_posts")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (status !== "All") {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) return { success: false, error: error.message };
  return { success: true, data: (data as InstagramPost[]) ?? [] };
}

// ─── Fetch Posts with Schedules ───────────────────────────────────────────────

export async function getPostsWithSchedules(
  limit = 50
): Promise<ActionResult<PostWithSchedule[]>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized." };

  const { data: posts, error: postErr } = await supabase
    .from("instagram_posts")
    .select("*")
    .eq("user_id", user.id)
    .in("status", ["Scheduled", "Failed"])
    .order("created_at", { ascending: false })
    .limit(limit);

  if (postErr) return { success: false, error: postErr.message };

  // Fetch corresponding tasks from content_schedules
  const postIds = (posts ?? []).map(p => p.id);
  
  // We can query content_schedules securely
  const { data: tasks } = await supabase
    .from("content_schedules")
    .select("id, post_id, scheduled_time, queue_status, retry_count, processing_status")
    .eq("user_id", user.id)
    .in("post_id", postIds);

  const tasksByPostId = new Map(
    (tasks ?? []).map(t => [t.post_id, t])
  );

  const merged = (posts ?? []).map((row: any) => ({
    ...row,
    schedule: tasksByPostId.get(row.id) ?? null,
  }));

  return { success: true, data: merged as PostWithSchedule[] };
}

// ─── Update Post Status ───────────────────────────────────────────────────────

export async function updatePostStatus(
  postId: string,
  status: InstagramPostStatus,
  extra?: Partial<Pick<InstagramPost, "published_at" | "last_error" | "provider_post_id" | "publish_attempt">>
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized." };

  const { error } = await supabase
    .from("instagram_posts")
    .update({ status, ...extra })
    .eq("id", postId)
    .eq("user_id", user.id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard/instagram");
  return { success: true };
}

// ─── Delete Post ──────────────────────────────────────────────────────────────

export async function deleteInstagramPost(postId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized." };

  const { error } = await supabase
    .from("instagram_posts")
    .delete()
    .eq("id", postId)
    .eq("user_id", user.id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard/instagram");
  return { success: true };
}

// ─── Publish Post (immediate) ─────────────────────────────────────────────────

export async function publishPostNow(postId: string): Promise<ActionResult<PublishResult>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized." };

  const { data: post, error: fetchErr } = await supabase
    .from("instagram_posts")
    .select("*")
    .eq("id", postId)
    .eq("user_id", user.id)
    .single();

  if (fetchErr || !post) return { success: false, error: "Post not found." };

  // Mark as Publishing
  await supabase
    .from("instagram_posts")
    .update({ status: "Publishing", publish_attempt: (post.publish_attempt ?? 0) + 1 })
    .eq("id", postId);

  const provider = await getInstagramProvider();
  const result = await provider.publishPost(post as InstagramPost);

  // Update based on result
  await supabase
    .from("instagram_posts")
    .update({
      status: result.success ? "Published" : "Failed",
      published_at: result.success ? new Date().toISOString() : null,
      provider_post_id: result.providerPostId ?? null,
      last_error: result.error ?? null,
    })
    .eq("id", postId);

  revalidatePath("/dashboard/instagram");
  return { success: result.success, data: result, error: result.error };
}

// ─── Queue Stats ──────────────────────────────────────────────────────────────

export async function getQueueStats(): Promise<ActionResult<QueueStats>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized." };

  const { data, error } = await supabase
    .from("content_schedules")
    .select("queue_status")
    .eq("user_id", user.id);

  if (error) return { success: false, error: error.message };

  const stats: QueueStats = {
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0,
    retrying: 0,
    cancelled: 0,
    total: data?.length ?? 0,
  };

  for (const row of data ?? []) {
    const s = (row.queue_status as string).toLowerCase() as keyof QueueStats;
    if (s in stats) (stats[s] as number)++;
  }

  return { success: true, data: stats };
}

// ─── Fetch Templates ──────────────────────────────────────────────────────────

export async function getContentTemplates() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("content_templates")
    .select("*")
    .eq("is_active", true)
    .order("use_count", { ascending: false });

  if (error) return { success: false, error: error.message, data: [] };
  return { success: true, data: data ?? [] };
}
