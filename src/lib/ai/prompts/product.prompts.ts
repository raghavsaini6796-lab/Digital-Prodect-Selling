/**
 * AI Engine — Product Prompt Templates
 *
 * All prompts live here. NEVER write prompts inside components or actions.
 * Each template is a pure function that accepts context and returns a string.
 */

import { BASE_SYSTEM_PROMPT } from "../config";
import type { GenerationInput, ProductType } from "../types";

// ─── System Prompt ────────────────────────────────────────────────────────────

export function buildSystemPrompt(): string {
  return BASE_SYSTEM_PROMPT;
}

// ─── Content Length Guidance ──────────────────────────────────────────────────

function contentLengthGuide(length: string): string {
  const guides: Record<string, string> = {
    short: "Keep sections concise (2-3 sentences each). Aim for quick, punchy value.",
    medium: "Write detailed sections (4-6 sentences each). Balance depth with clarity.",
    long: "Write comprehensive sections (6-10 sentences each). Provide maximum detail and examples.",
  };
  return guides[length] ?? guides["medium"];
}

// ─── Product-Type Specific Instructions ──────────────────────────────────────

function productTypeInstructions(productType: ProductType): string {
  const instructions: Record<ProductType, string> = {
    "Prompt Pack": `Create a pack of 20 high-quality, ready-to-use AI prompts.
Each prompt should be specific, actionable, and designed for immediate use.
The prompts should solve real problems in the niche.
Format each prompt clearly and number them 1-20.`,

    "Instagram Toolkit": `Create a complete Instagram content toolkit.
Include caption templates, story ideas, content pillars, and engagement hooks.
Focus on content that drives follows, saves, and sales.`,

    "AI Business Guide": `Create a structured business guide with actionable steps.
Include market analysis insights, implementation roadmap, and success metrics.
Each section should provide concrete, implementable advice.`,

    "Canva Content Pack": `Create a content pack with design brief, template ideas, and usage instructions.
Describe specific Canva templates to create, color palettes, font suggestions, and layout concepts.
Focus on scroll-stopping visual content ideas.`,

    "Study Notes": `Create comprehensive, well-organized study notes.
Use clear headings, bullet points, key concepts, and summary sections.
Include memory aids, key terms, and practical applications.`,

    "Mini Course Outline": `Create a complete mini-course outline with modules and lessons.
Each module should have clear learning objectives, lesson topics, and action items.
Structure it for maximum transformation and completion rates.`,
  };
  return instructions[productType];
}

// ─── Main Product Generation Prompt ──────────────────────────────────────────

export function buildProductGenerationPrompt(input: GenerationInput): string {
  const {
    productType,
    niche,
    audience,
    tone,
    priceRange,
    contentLength,
  } = input;

  return `Create a complete, ready-to-sell digital product with the following specifications:

**Product Type:** ${productType}
**Niche:** ${niche}
**Target Audience:** ${audience}
**Tone:** ${tone}
**Price Point:** ${priceRange}
**Content Depth:** ${contentLength}

${productTypeInstructions(productType)}

**Content Depth Guide:** ${contentLengthGuide(contentLength)}

**Pricing Context:** This product will be priced at ${priceRange}. Ensure the content quality and depth justifies this price point.

Generate the complete product now. Return structured data exactly as specified in the output schema.`;
}

// ─── Instagram Caption Prompt ─────────────────────────────────────────────────

export function buildInstagramCaptionPrompt(
  productTitle: string,
  niche: string,
  tone: string,
  audience: string
): string {
  return `Write a compelling Instagram caption for this digital product:

Product: ${productTitle}
Niche: ${niche}
Target Audience: ${audience}
Tone: ${tone}

Requirements:
- Hook in the first line (stops the scroll)
- Value proposition in 2-3 sentences
- Social proof or credibility statement
- Clear call to action
- 150-220 characters optimal length
- Conversational and authentic

Return only the caption text, no quotation marks.`;
}

// ─── Hashtag Generation Prompt ────────────────────────────────────────────────

export function buildHashtagPrompt(
  niche: string,
  productType: string,
  audience: string
): string {
  return `Generate 20 targeted Instagram hashtags for a ${productType} product in the ${niche} niche targeting ${audience}.

Mix of:
- 5 high-volume hashtags (1M+ posts)
- 8 mid-range hashtags (100K-1M posts)  
- 7 niche-specific hashtags (under 100K posts)

Return as a simple list, each hashtag starting with #, one per line.`;
}

// ─── CTA Generation Prompt ────────────────────────────────────────────────────

export function buildCTAPrompt(
  productType: string,
  priceRange: string,
  audience: string,
  tone: string
): string {
  return `Write 3 powerful call-to-action phrases for a ${productType} priced at ${priceRange} targeting ${audience}.

Tone: ${tone}

Each CTA should:
- Create urgency or excitement
- Be specific (not generic like "Buy Now")
- Speak directly to the audience's desire or pain point
- Be 5-10 words maximum

Return as a JSON array of 3 strings.`;
}
