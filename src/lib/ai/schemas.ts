/**
 * Shared Zod schemas for AI generation.
 *
 * ⚠️  Keep this file free of "use server" / "use client" directives.
 * It is imported both by the client form (zodResolver) and the server
 * action (safeParse), so the SAME Zod instance must be used everywhere.
 */

import { z } from "zod";
import { PRODUCT_TYPES, TONE_OPTIONS, CONTENT_LENGTHS } from "./types";

export const generationInputSchema = z.object({
  productType: z.enum(PRODUCT_TYPES as unknown as [string, ...string[]]),
  niche: z.string().min(2, "Niche must be at least 2 characters").max(80),
  audience: z.string().min(2, "Audience must be at least 2 characters").max(80),
  tone: z.enum(TONE_OPTIONS as unknown as [string, ...string[]]),
  priceRange: z.string().min(1, "Select a price range"),
  contentLength: z.enum(CONTENT_LENGTHS as unknown as [string, ...string[]]),
});

export type GenerationFormInput = z.infer<typeof generationInputSchema>;
