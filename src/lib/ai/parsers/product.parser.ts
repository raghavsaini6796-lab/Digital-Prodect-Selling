/**
 * AI Engine — Output Parsers & Zod Schemas
 *
 * All structured output schemas live here.
 * Used with generateObject() for type-safe, validated AI responses.
 */

import { z } from "zod";
import type { GeneratedProduct } from "../types";

// ─── Zod Schema for Product Section ──────────────────────────────────────────

export const productSectionSchema = z.object({
  title: z.string().describe("Section heading"),
  content: z.string().describe("Section body content"),
});

// ─── Zod Schema for Full Generated Product ────────────────────────────────────

export const generatedProductSchema = z.object({
  title: z
    .string()
    .min(5)
    .max(100)
    .describe("Compelling product title that sells"),

  tagline: z
    .string()
    .max(150)
    .describe("One-line tagline that communicates the core value"),

  description: z
    .string()
    .min(50)
    .max(600)
    .describe("Product description that converts visitors to buyers"),

  sections: z
    .array(productSectionSchema)
    .min(3)
    .max(10)
    .describe("Main content sections of the product"),

  cta: z
    .string()
    .max(60)
    .describe("Primary call-to-action phrase (e.g. 'Get instant access today')"),

  suggestedPrice: z
    .string()
    .describe("Recommended selling price in Indian Rupees (e.g. '₹499', '₹999', '₹1499')"),

  instagramCaption: z
    .string()
    .max(2200)
    .describe("Ready-to-post Instagram caption with hook, value, and CTA"),

  hashtags: z
    .array(z.string().startsWith("#"))
    .min(10)
    .max(30)
    .describe("Instagram hashtags starting with #"),

  productTags: z
    .array(z.string())
    .min(3)
    .max(10)
    .describe("Short keyword tags for product discoverability"),

  sellingPoints: z
    .array(z.string())
    .min(3)
    .max(5)
    .describe("3-5 bullet points highlighting the strongest selling points"),

  promptPack: z
    .array(z.string())
    .optional()
    .describe("Array of prompts (only populated for Prompt Pack product type)"),
});

// ─── Type Export ──────────────────────────────────────────────────────────────

export type GeneratedProductSchema = z.infer<typeof generatedProductSchema>;

// ─── Parser: validate & clean AI output ──────────────────────────────────────

export function parseGeneratedProduct(raw: unknown): GeneratedProduct {
  const parsed = generatedProductSchema.parse(raw);

  return {
    title: parsed.title.trim(),
    tagline: parsed.tagline.trim(),
    description: parsed.description.trim(),
    sections: parsed.sections.map((s) => ({
      title: s.title.trim(),
      content: s.content.trim(),
    })),
    cta: parsed.cta.trim(),
    suggestedPrice: parsed.suggestedPrice.trim(),
    instagramCaption: parsed.instagramCaption.trim(),
    hashtags: parsed.hashtags.map((h) => h.trim().toLowerCase()),
    productTags: parsed.productTags.map((t) => t.trim().toLowerCase()),
    sellingPoints: parsed.sellingPoints.map((s) => s.trim()),
    promptPack: parsed.promptPack?.map((p) => p.trim()),
  };
}

// ─── Safe Parser (returns null on failure) ────────────────────────────────────

export function safeParseGeneratedProduct(raw: unknown): GeneratedProduct | null {
  try {
    return parseGeneratedProduct(raw);
  } catch {
    return null;
  }
}

// ─── Serialise product to JSON string for DB storage ─────────────────────────

export function serialiseProduct(product: GeneratedProduct): string {
  return JSON.stringify(product);
}

// ─── Deserialise product from DB JSON string ─────────────────────────────────

export function deserialiseProduct(json: string): GeneratedProduct | null {
  try {
    const raw = JSON.parse(json);
    return safeParseGeneratedProduct(raw);
  } catch {
    return null;
  }
}
