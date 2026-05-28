/**
 * AI Engine — Shared Types & Interfaces
 *
 * Single source of truth for all AI-related types used across:
 * - prompts, parsers, pipelines, service layer, and UI.
 */

// ─── Product Types ────────────────────────────────────────────────────────────

export const PRODUCT_TYPES = [
  "Prompt Pack",
  "Instagram Toolkit",
  "AI Business Guide",
  "Canva Content Pack",
  "Study Notes",
  "Mini Course Outline",
] as const;

export type ProductType = (typeof PRODUCT_TYPES)[number];

// ─── Tone Options ─────────────────────────────────────────────────────────────

export const TONE_OPTIONS = [
  "Professional",
  "Casual",
  "Motivational",
  "Educational",
  "Bold",
  "Friendly",
] as const;

export type ToneOption = (typeof TONE_OPTIONS)[number];

// ─── Content Length ───────────────────────────────────────────────────────────

export const CONTENT_LENGTHS = ["short", "medium", "long"] as const;
export type ContentLength = (typeof CONTENT_LENGTHS)[number];

// ─── Generation Input ─────────────────────────────────────────────────────────

export interface GenerationInput {
  productType: ProductType;
  niche: string;
  audience: string;
  tone: ToneOption;
  priceRange: string;
  contentLength: ContentLength;
}

// ─── Structured Product Output ────────────────────────────────────────────────

export interface ProductSection {
  title: string;
  content: string;
}

export interface GeneratedProduct {
  title: string;
  tagline: string;
  description: string;
  sections: ProductSection[];
  cta: string;
  suggestedPrice: string;
  instagramCaption: string;
  hashtags: string[];
  productTags: string[];
  promptPack?: string[];   // populated for Prompt Pack type
  sellingPoints: string[]; // 3-5 bullet points
}

// ─── Pipeline Result ──────────────────────────────────────────────────────────

export type PipelineStatus = "success" | "error" | "retrying";

export interface PipelineResult {
  status: PipelineStatus;
  data?: GeneratedProduct;
  error?: string;
  tokensUsed?: number;
  generationMs?: number;
  generationId?: string;
}

// ─── Generation Record (DB shape) ─────────────────────────────────────────────

export interface GenerationRecord {
  id: string;
  user_id: string;
  name: string;
  prompt: string;
  output: string | null;
  generation_type: string;
  status: "Processing" | "Ready" | "Failed";
  model_used: string | null;
  product_type: string | null;
  niche: string | null;
  audience: string | null;
  tone: string | null;
  price_range: string | null;
  content_length: string | null;
  tokens_used: number | null;
  generation_ms: number | null;
  metadata: Record<string, unknown> | null;
  saved_product_id: string | null;
  created_at: string;
  updated_at: string;
}

// ─── AI Model Config ──────────────────────────────────────────────────────────

export type AIProvider = "openai" | "anthropic" | "google" | "openrouter";

export interface ModelConfig {
  modelId: string;
  temperature: number;
  maxTokens: number;
  provider: AIProvider;
}
