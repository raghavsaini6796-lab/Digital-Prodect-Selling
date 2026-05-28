"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// ─── Validation ───────────────────────────────────────────────────────────────

const createGenerationSchema = z.object({
  prompt: z.string().min(3, "Prompt must be at least 3 characters").max(2000),
  generation_type: z.enum(["Image", "Caption", "Text"]).default("Image"),
  model_used: z.string().optional(),
});

// ─── Actions ─────────────────────────────────────────────────────────────────

/**
 * Records an AI generation request in the database.
 *
 * Status starts as "Processing" — once the AI returns output,
 * call updateGenerationOutput() to update the record.
 */
export async function createGeneration(
  prompt: string,
  type: "Image" | "Caption" | "Text" = "Image",
  modelUsed?: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to generate products." };
  }

  const parsed = createGenerationSchema.safeParse({
    prompt,
    generation_type: type,
    model_used: modelUsed,
  });

  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return { error: firstError?.message ?? "Invalid generation data." };
  }

  // Derive a readable name from the prompt
  const name =
    parsed.data.prompt.length > 40
      ? `${parsed.data.prompt.substring(0, 40)}…`
      : parsed.data.prompt;

  const { data, error } = await supabase
    .from("ai_generations")
    .insert({
      user_id: user.id,
      name,
      prompt: parsed.data.prompt,
      generation_type: parsed.data.generation_type,
      status: "Processing",
      model_used: parsed.data.model_used ?? null,
    })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/ai-generator");

  return { success: true, id: data.id };
}

/**
 * Update the output of an existing generation record.
 * Called after the AI model returns a result.
 */
export async function updateGenerationOutput(
  generationId: string,
  output: string,
  status: "Ready" | "Failed" = "Ready"
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized." };
  }

  const { error } = await supabase
    .from("ai_generations")
    .update({ output, status })
    .eq("id", generationId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/ai-generator");

  return { success: true };
}
