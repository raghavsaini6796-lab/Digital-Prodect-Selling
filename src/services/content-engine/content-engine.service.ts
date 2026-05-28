/**
 * Content Engine Service
 *
 * Orchestrates AI content generation for Instagram.
 * Uses the existing OpenAI/AI SDK infrastructure from the project.
 * Server-only. Never import from client components.
 */

"use server";

import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { buildInstagramPrompt } from "./prompts";
import type { ContentGenerationInput, GeneratedInstagramContent } from "@/types/instagram";

// ─── Zod Schema for AI Output Validation ─────────────────────────────────────

const CarouselSlideSchema = z.object({
  slide: z.number(),
  heading: z.string(),
  body: z.string(),
  visualNote: z.string().optional(),
});

const StoryIdeaSchema = z.object({
  slide: z.number(),
  textOverlay: z.string(),
  backgroundSuggestion: z.string(),
  cta: z.string().optional(),
});

const GeneratedContentSchema = z.object({
  hook: z.string(),
  caption: z.string(),
  cta: z.string(),
  hashtags: z.array(z.string()).max(30),
  carouselSlides: z.array(CarouselSlideSchema).optional().default([]),
  reelScript: z.string().optional().default(""),
  storyIdeas: z.array(StoryIdeaSchema).optional().default([]),
  estimatedEngagement: z.string().optional().default(""),
  bestPostTime: z.string().optional().default(""),
});

// ─── Result Type ──────────────────────────────────────────────────────────────

export interface ContentEngineResult {
  status: "success" | "error";
  data?: GeneratedInstagramContent;
  error?: string;
  tokensUsed?: number;
  generationMs?: number;
}

// ─── Main Generation Function ─────────────────────────────────────────────────

export async function generateInstagramContent(
  input: ContentGenerationInput
): Promise<ContentEngineResult> {
  const startedAt = Date.now();

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not configured.");
    }

    const prompt = buildInstagramPrompt(input);

    const { object, usage } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: GeneratedContentSchema,
      prompt,
      temperature: 0.85,
    });

    // Ensure hashtags don't have # prefix
    const cleanHashtags = (object.hashtags ?? []).map((h: string) =>
      h.startsWith("#") ? h.slice(1) : h
    );

    const data: GeneratedInstagramContent = {
      hook: object.hook,
      caption: object.caption,
      cta: object.cta,
      hashtags: cleanHashtags,
      carouselSlides: object.carouselSlides?.length ? object.carouselSlides : undefined,
      reelScript: object.reelScript || undefined,
      storyIdeas: object.storyIdeas?.length ? object.storyIdeas : undefined,
      estimatedEngagement: object.estimatedEngagement || undefined,
      bestPostTime: object.bestPostTime || undefined,
    };

    return {
      status: "success",
      data,
      tokensUsed: usage?.totalTokens,
      generationMs: Date.now() - startedAt,
    };
  } catch (err) {
    console.error("[ContentEngine] Generation failed:", err);
    return {
      status: "error",
      error: err instanceof Error ? err.message : "Content generation failed.",
      generationMs: Date.now() - startedAt,
    };
  }
}

// ─── Hashtag Generator (standalone) ──────────────────────────────────────────

export async function generateHashtags(
  niche: string,
  count = 30
): Promise<{ success: boolean; hashtags?: string[]; error?: string }> {
  try {
    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: z.object({
        hashtags: z.array(z.string()).max(count),
      }),
      prompt: `Generate ${count} highly relevant Instagram hashtags for the niche: "${niche}".
Mix: 10 niche-specific (under 100k posts), 10 medium (100k-1M posts), 10 broad (1M+ posts).
Return without # symbol. Focus on digital products, online business, and content creators.
Respond with JSON only.`,
    });

    const clean = (object.hashtags ?? []).map((h: string) =>
      h.startsWith("#") ? h.slice(1) : h
    );

    return { success: true, hashtags: clean };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Hashtag generation failed.",
    };
  }
}

// ─── Reel Hook Generator (standalone) ────────────────────────────────────────

export async function generateReelHooks(
  productName: string,
  audience: string,
  count = 5
): Promise<{ success: boolean; hooks?: string[]; error?: string }> {
  try {
    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: z.object({
        hooks: z.array(z.string()).max(count),
      }),
      prompt: `Generate ${count} scroll-stopping Instagram Reel hooks for "${productName}" targeting ${audience}.
Each hook must:
- Be under 15 words
- Create immediate curiosity or emotion
- Work as a text overlay or spoken line
- NOT start with "Are you" or "Do you"
Return as JSON array of strings only.`,
    });

    return { success: true, hooks: object.hooks ?? [] };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Hook generation failed.",
    };
  }
}
