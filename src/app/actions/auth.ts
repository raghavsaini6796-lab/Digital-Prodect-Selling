"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ROUTES } from "@/lib/constants";

/** Sign out and redirect to /login */
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(ROUTES.login);
}

/** Get current authenticated user. Returns null if unauthenticated. */
export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

// ─── Profile schemas ──────────────────────────────────────────────────────────

const updateProfileSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters").max(80),
});

const updateBrandingSchema = z.object({
  store_name: z.string().max(100).optional(),
  custom_domain: z
    .string()
    .max(200)
    .optional()
    .transform((v) => (v === "" ? null : v)),
});

/** Update user's full name in the profiles table */
export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized." };

  const parsed = updateProfileSchema.safeParse({
    full_name: formData.get("full_name"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: parsed.data.full_name })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath(ROUTES.settings);
  return { success: true };
}

/** Update store branding: store_name and custom_domain */
export async function updateBranding(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized." };

  const parsed = updateBrandingSchema.safeParse({
    store_name: formData.get("store_name"),
    custom_domain: formData.get("custom_domain"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      store_name: parsed.data.store_name ?? null,
      custom_domain: parsed.data.custom_domain ?? null,
    })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath(ROUTES.settings);
  return { success: true };
}

/** Send a password reset email to the current user */
export async function sendPasswordReset() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return { error: "No email found." };

  const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/dashboard/settings`,
  });

  if (error) return { error: error.message };
  return { success: true, message: "Password reset email sent. Check your inbox." };
}
