/**
 * AI Service Layer — Product Generator
 *
 * Orchestrates the full generation flow:
 *  1. Log generation start to DB
 *  2. Run pipeline
 *  3. Update DB with result or error
 *  4. Optionally save as product
 *
 * Server-only. Never import from client components.
 */

"use server";

import { createClient } from "@/lib/supabase/server";
import { runProductGenerationPipeline } from "@/lib/ai/pipelines/product.pipeline";
import {
  serialiseProduct,
  deserialiseProduct,
} from "@/lib/ai/parsers/product.parser";
import { buildGenerationName } from "@/lib/ai/utils";
import { getCurrentProviderInfo } from "@/lib/ai/provider";
import { revalidatePath } from "next/cache";
import { rateLimit } from "@/lib/rate-limit";

import type { GenerationInput, PipelineResult, GeneratedProduct } from "@/lib/ai/types";

// ─── Main Generate + Persist ──────────────────────────────────────────────────

export async function generateAndSaveProduct(
  input: GenerationInput
): Promise<PipelineResult & { generationId?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", error: "You must be logged in to generate products." };
  }

  // ── 0. Rate Limiting ─────────────────────────────────────────────────────
  // Limit to 5 generations per minute per user to prevent abuse of the AI API
  const rateLimitResult = rateLimit(user.id, 5, 60 * 1000);
  if (!rateLimitResult.success) {
    return { status: "error", error: "Too many generations requested. Please try again in a minute." };
  }

  // ── 1. Create generation log (Processing) ────────────────────────────────
  const name = buildGenerationName(input.productType, input.niche);

  const { data: generationRow, error: insertErr } = await supabase
    .from("ai_generations")
    .insert({
      user_id: user.id,
      name,
      prompt: `${input.productType} | ${input.niche} | ${input.audience}`,
      generation_type: "FullProduct",
      status: "Processing",
      model_used: getCurrentProviderInfo().modelId,
      product_type: input.productType,
      niche: input.niche,
      audience: input.audience,
      tone: input.tone,
      price_range: input.priceRange,
      content_length: input.contentLength,
    })
    .select("id")
    .single();

  if (insertErr || !generationRow) {
    console.error("[AI Service] Failed to create generation log:", insertErr);
    // Non-fatal: still run generation even if log fails
  }

  const generationId = generationRow?.id as string | undefined;

  // ── 2. Run pipeline ──────────────────────────────────────────────────────
  const result = await runProductGenerationPipeline(input);

  // ── 3. Update generation log with result ─────────────────────────────────
  if (generationId) {
    const updatePayload = {
      status: result.status === "success" ? "Ready" : "Failed",
      output: result.data ? serialiseProduct(result.data) : null,
      tokens_used: result.tokensUsed ?? null,
      generation_ms: result.generationMs ?? null,
      metadata: result.error ? { error: result.error } : null,
    };

    await supabase
      .from("ai_generations")
      .update(updatePayload)
      .eq("id", generationId)
      .eq("user_id", user.id);
  }

  revalidatePath("/dashboard/ai-generator");

  return { ...result, generationId };
}

// ─── Save Generated Product to Products Table ─────────────────────────────────

export async function saveGeneratedProductToDB(
  product: GeneratedProduct,
  generationId: string
): Promise<{ success: boolean; productId?: string; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized." };
  }

  // Parse price from suggestedPrice string (e.g. "$17" → 17)
  const priceMatch = product.suggestedPrice.match(/[\d.]+/);
  const price = priceMatch ? parseFloat(priceMatch[0]) : 0;

  const { data: productRow, error } = await supabase
    .from("products")
    .insert({
      user_id: user.id,
      title: product.title,
      description: product.description,
      type: "Document",
      price,
      status: "Draft",
      tags: product.productTags,
      ai_generated: true,
      ai_generation_id: generationId,
      sections: product.sections,
      cta: product.cta,
      instagram_caption: product.instagramCaption,
      hashtags: product.hashtags,
    })
    .select("id")
    .single();

  if (error || !productRow) {
    console.error("[AI Service] Failed to save product:", error);
    return { success: false, error: error?.message ?? "Failed to save product." };
  }

  // Link generation → saved product
  await supabase
    .from("ai_generations")
    .update({ saved_product_id: productRow.id })
    .eq("id", generationId)
    .eq("user_id", user.id);

  revalidatePath("/dashboard/products");
  revalidatePath("/dashboard/ai-generator");

  return { success: true, productId: productRow.id };
}

// ─── Fetch Recent Generations ─────────────────────────────────────────────────

export async function getRecentGenerations(limit = 10) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { data: null, error: "Unauthorized." };

  const { data, error } = await supabase
    .from("ai_generations")
    .select(
      "id, name, product_type, niche, status, tokens_used, generation_ms, created_at, saved_product_id"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  return { data, error: error?.message };
}

// ─── Get Generation Output ────────────────────────────────────────────────────

export async function getGenerationOutput(
  generationId: string
): Promise<GeneratedProduct | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("ai_generations")
    .select("output")
    .eq("id", generationId)
    .eq("user_id", user.id)
    .single();

  if (!data?.output) return null;
  return deserialiseProduct(data.output);
}
