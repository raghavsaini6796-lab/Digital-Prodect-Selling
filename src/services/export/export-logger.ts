// ─── Export Logger ────────────────────────────────────────────────────────────
// Wraps all write operations to the export_logs table.
// Uses the Supabase admin client so it always succeeds regardless of RLS.

import { createAdminClient } from "@/lib/supabase/admin";
import type { DbExportStatus, DbExportType, ExportLog } from "@/types/supabase";
import { nowIso } from "@/lib/export/utils";

// ─── Helper — typed admin client ─────────────────────────────────────────────
// The export_logs table was added after the initial type generation.
// We cast to any to avoid "property does not exist on type 'never'" errors
// until `supabase gen types` is re-run against the live schema.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getAdmin(): any {
  return createAdminClient();
}

// ─── Create a new log entry ───────────────────────────────────────────────────

export interface CreateExportLogInput {
  productId: string;
  userId: string;
  exportType: DbExportType;
  version: string;
}

/**
 * Inserts a new export log entry in "pending" state.
 * Returns the log's UUID for subsequent updates.
 */
export async function createExportLog(
  input: CreateExportLogInput
): Promise<string> {
  const admin = getAdmin();

  const { data, error } = await admin
    .from("export_logs")
    .insert({
      product_id: input.productId,
      user_id: input.userId,
      export_type: input.exportType,
      version: input.version,
      status: "pending" as DbExportStatus,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(`[export-logger] Failed to create log: ${error?.message}`);
  }

  return data.id as string;
}

// ─── Update log on success ────────────────────────────────────────────────────

export interface CompleteExportLogInput {
  logId: string;
  storagePath: string;
  publicUrl: string;
  fileSizeBytes: number | null;
}

/**
 * Marks an export log as "done" and stores the result URLs.
 */
export async function completeExportLog(input: CompleteExportLogInput): Promise<void> {
  const admin = getAdmin();

  const { error } = await admin
    .from("export_logs")
    .update({
      status: "done" as DbExportStatus,
      storage_path: input.storagePath,
      public_url: input.publicUrl,
      file_size_bytes: input.fileSizeBytes,
      completed_at: nowIso(),
    })
    .eq("id", input.logId);

  if (error) {
    console.warn(`[export-logger] Failed to complete log ${input.logId}: ${error.message}`);
  }
}

// ─── Update log on failure ────────────────────────────────────────────────────

/**
 * Marks an export log as "failed" and stores the error message.
 */
export async function failExportLog(logId: string, errorMessage: string): Promise<void> {
  const admin = getAdmin();

  const { error } = await admin
    .from("export_logs")
    .update({
      status: "failed" as DbExportStatus,
      error_message: errorMessage,
      completed_at: nowIso(),
    })
    .eq("id", logId);

  if (error) {
    console.warn(`[export-logger] Failed to fail log ${logId}: ${error.message}`);
  }
}

// ─── Read export history for a product ───────────────────────────────────────

/**
 * Returns all export logs for a product, newest first.
 */
export async function getExportLogs(productId: string): Promise<ExportLog[]> {
  const admin = getAdmin();

  const { data, error } = await admin
    .from("export_logs")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.warn(`[export-logger] Failed to fetch logs for ${productId}: ${error.message}`);
    return [];
  }

  return (data ?? []) as ExportLog[];
}
