"use server";

/**
 * Server Action — AI Generate
 *
 * Thin action layer: validates input, calls service, returns result.
 * No AI logic here — all logic lives in /services/ai/.
 *
 * ⚠️  "use server" files can only export async functions.
 *     Schema types live in @/lib/ai/schemas (no directive) and are
 *     imported directly by both this file and client components.
 */

import {
  generateAndSaveProduct,
  saveGeneratedProductToDB,
} from "@/services/ai/product-generator.service";
import type { GenerationInput, GeneratedProduct, PipelineResult } from "@/lib/ai/types";
import { generationInputSchema, type GenerationFormInput } from "@/lib/ai/schemas";

// ─── Action: Generate Product ─────────────────────────────────────────────────

export async function generateProductAction(
  formData: GenerationFormInput
): Promise<PipelineResult & { generationId?: string }> {
  const parsed = generationInputSchema.safeParse(formData);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return { status: "error", error: firstError?.message ?? "Invalid input." };
  }

  const input: GenerationInput = parsed.data as GenerationInput;
  return generateAndSaveProduct(input);
}

// ─── Action: Save Product to Library ─────────────────────────────────────────

export async function saveProductAction(
  product: GeneratedProduct,
  generationId: string
): Promise<{ success: boolean; productId?: string; error?: string }> {
  if (!generationId) {
    return { success: false, error: "Missing generation ID." };
  }
  return saveGeneratedProductToDB(product, generationId);
}
