/**
 * AI Engine — Product Generation Pipeline
 *
 * Provider-agnostic. The active provider is resolved at runtime from
 * AI_PROVIDER env var via resolveModel(). No provider-specific code here.
 *
 * To switch providers: update AI_PROVIDER in .env.local. That's it.
 */

import { generateObject } from "ai";

import { resolveModel } from "../provider";
import { CONTENT_LENGTH_TOKENS, DEFAULT_TEMPERATURE, DEFAULT_MAX_TOKENS } from "../config";
import {
  buildSystemPrompt,
  buildProductGenerationPrompt,
} from "../prompts/product.prompts";
import {
  generatedProductSchema,
  parseGeneratedProduct,
} from "../parsers/product.parser";
import { withRetry, normaliseError } from "../utils";
import type { GenerationInput, PipelineResult } from "../types";

// ─── Pipeline ─────────────────────────────────────────────────────────────────

export async function runProductGenerationPipeline(
  input: GenerationInput
): Promise<PipelineResult> {
  const startMs = Date.now();

  try {
    const maxTokens =
      CONTENT_LENGTH_TOKENS[input.contentLength] ?? DEFAULT_MAX_TOKENS;

    const systemPrompt = buildSystemPrompt();
    const userPrompt = buildProductGenerationPrompt(input);

    // Resolve the active provider + model from environment at runtime
    const model = resolveModel();

    const result = await withRetry(
      async () => {
        const { object, usage } = await generateObject({
          model,
          schema: generatedProductSchema,
          system: systemPrompt,
          prompt: userPrompt,
          temperature: DEFAULT_TEMPERATURE,
          maxOutputTokens: maxTokens,
        });

        return { object, usage };
      },
      {
        maxAttempts: 3,
        initialDelayMs: 600,
        onRetry: (attempt) => {
          console.warn(`[AI Pipeline] Retry attempt ${attempt} for product generation`);
        },
      }
    );

    const generatedProduct = parseGeneratedProduct(result.object);
    const generationMs = Date.now() - startMs;

    return {
      status: "success",
      data: generatedProduct,
      tokensUsed: result.usage?.totalTokens,
      generationMs,
    };
  } catch (err) {
    const generationMs = Date.now() - startMs;
    console.error("[AI Pipeline] Generation failed:", err);

    return {
      status: "error",
      error: normaliseError(err),
      generationMs,
    };
  }
}
