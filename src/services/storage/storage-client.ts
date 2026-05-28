// ─── Storage Client Service ───────────────────────────────────────────────────
// Server-side only. Uses the Supabase service role client (admin) for
// storage operations to bypass RLS and manage files authoritatively.
//
// All uploads go to the "product-exports" private bucket.

import { createAdminClient } from "@/lib/supabase/admin";
import { EXPORT_BUCKET, SIGNED_URL_EXPIRY_SECONDS } from "@/lib/export/constants";

// ─── Upload ───────────────────────────────────────────────────────────────────

/**
 * Uploads a Buffer to Supabase Storage at the given path.
 * Upserts (overwrites) existing files at the same path — idempotent.
 *
 * @returns The storage path of the uploaded file
 */
export async function uploadFile(
  storagePath: string,
  data: Buffer,
  contentType: string
): Promise<string> {
  const admin = createAdminClient();

  const { error } = await admin.storage
    .from(EXPORT_BUCKET)
    .upload(storagePath, data, {
      contentType,
      upsert: true, // overwrite if already exists (idempotent)
      cacheControl: "3600",
    });

  if (error) {
    throw new Error(`[storage] Upload failed at "${storagePath}": ${error.message}`);
  }

  return storagePath;
}

// ─── Signed URL ───────────────────────────────────────────────────────────────

/**
 * Creates a time-limited signed download URL for a private file.
 *
 * @param storagePath - Full path within the bucket
 * @param expiresInSeconds - Defaults to SIGNED_URL_EXPIRY_SECONDS (7 days)
 * @returns A signed URL string
 */
export async function getSignedUrl(
  storagePath: string,
  expiresInSeconds: number = SIGNED_URL_EXPIRY_SECONDS
): Promise<string> {
  const admin = createAdminClient();

  const { data, error } = await admin.storage
    .from(EXPORT_BUCKET)
    .createSignedUrl(storagePath, expiresInSeconds);

  if (error || !data?.signedUrl) {
    throw new Error(
      `[storage] Failed to create signed URL for "${storagePath}": ${error?.message}`
    );
  }

  return data.signedUrl;
}

// ─── Delete ───────────────────────────────────────────────────────────────────

/**
 * Deletes a file from Supabase Storage.
 * Fails silently if the file does not exist.
 */
export async function deleteFile(storagePath: string): Promise<void> {
  const admin = createAdminClient();

  const { error } = await admin.storage
    .from(EXPORT_BUCKET)
    .remove([storagePath]);

  if (error) {
    // Log but don't throw — deletion failures shouldn't block export pipeline
    console.warn(`[storage] Delete failed at "${storagePath}": ${error.message}`);
  }
}

// ─── File metadata ────────────────────────────────────────────────────────────

/**
 * Returns the file size in bytes for a stored object, or null if not found.
 */
export async function getFileSize(storagePath: string): Promise<number | null> {
  const admin = createAdminClient();

  // Extract folder path and filename
  const lastSlash = storagePath.lastIndexOf("/");
  const folderPath = storagePath.slice(0, lastSlash);
  const fileName = storagePath.slice(lastSlash + 1);

  const { data, error } = await admin.storage
    .from(EXPORT_BUCKET)
    .list(folderPath, { search: fileName });

  if (error || !data || data.length === 0) return null;

  const file = data.find((f) => f.name === fileName);
  return file?.metadata?.size ?? null;
}
