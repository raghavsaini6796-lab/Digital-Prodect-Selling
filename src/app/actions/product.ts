"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// ─── Validation Schemas ───────────────────────────────────────────────────────

const createProductSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().max(1000).optional(),
  type: z.enum(["Image Bundle", "Document", "Template", "Video", "Audio"]),
  price: z.coerce.number().min(0, "Price must be a positive number"),
  status: z.enum(["Active", "Draft", "Archived"]).default("Draft"),
  thumbnail_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  download_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  tags: z.string().optional(), // comma-separated string from form input
});

const updateProductSchema = createProductSchema.partial().extend({
  id: z.string().uuid("Invalid product ID"),
});

// ─── Helper ───────────────────────────────────────────────────────────────────

function parseTags(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
}

// ─── Actions ─────────────────────────────────────────────────────────────────

export async function createProduct(formData: FormData) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "You must be logged in to create a product." };
    }

    const parsed = createProductSchema.safeParse({
      title: formData.get("title"),
      description: formData.get("description") || undefined,
      type: formData.get("type"),
      price: formData.get("price"),
      status: formData.get("status"),
      thumbnail_url: formData.get("thumbnail_url") || undefined,
      download_url: formData.get("download_url") || undefined,
      tags: formData.get("tags") || undefined,
    });

    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return { error: firstError?.message ?? "Invalid product data." };
    }

    const { tags: rawTags, thumbnail_url, download_url, ...rest } = parsed.data;

    const { error } = await supabase.from("products").insert({
      user_id: user.id,
      ...rest,
      thumbnail_url: thumbnail_url || null,
      download_url: download_url || null,
      tags: parseTags(rawTags),
    });

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/products");

    return { success: true };
  } catch (err) {
    console.error('Error creating product:', err);
    return { error: 'Internal server error' };
  }
}

export async function updateProduct(formData: FormData) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "You must be logged in to update a product." };
    }

    const parsed = updateProductSchema.safeParse({
      id: formData.get("id"),
      title: formData.get("title"),
      description: formData.get("description") || undefined,
      type: formData.get("type"),
      price: formData.get("price"),
      status: formData.get("status"),
      thumbnail_url: formData.get("thumbnail_url") || undefined,
      download_url: formData.get("download_url") || undefined,
      tags: formData.get("tags") || undefined,
    });

    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return { error: firstError?.message ?? "Invalid product data." };
    }

    const { id, tags: rawTags, thumbnail_url, download_url, ...rest } = parsed.data;

    const { error } = await supabase
      .from("products")
      .update({
        ...rest,
        thumbnail_url: thumbnail_url || null,
        download_url: download_url || null,
        tags: parseTags(rawTags),
      })
      .eq("id", id!)
      .eq("user_id", user.id); // ensures RLS at action level too

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/products");

    return { success: true };
  } catch (err) {
    console.error('Error updating product:', err);
    return { error: 'Internal server error' };
  }
}

export async function deleteProduct(productId: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "You must be logged in to delete a product." };
    }

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId)
      .eq("user_id", user.id);

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/products");

    return { success: true };
  } catch (err) {
    console.error('Error deleting product:', err);
    return { error: 'Internal server error' };
  }
}
