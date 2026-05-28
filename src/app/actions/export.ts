"use server";

// ─── Export Server Actions ────────────────────────────────────────────────────
// These actions are the only entry point from UI to the export pipeline.
// All heavy processing stays server-side; clients only trigger and poll status.

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { runPdfExport, runZipExport } from "@/services/export/export-pipeline";
import { getExportLogs } from "@/services/export/export-logger";
import type { ExportResult } from "@/types/export";
import type { ExportLog } from "@/types/supabase";

// ─── Auth helper ──────────────────────────────────────────────────────────────

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be logged in to export products.");
  }

  return user;
}

// ─── Export PDF ───────────────────────────────────────────────────────────────

/**
 * Server Action: Trigger a PDF export for a product.
 *
 * Runs the full pipeline server-side:
 *   generate → upload → update DB → return signed URL
 *
 * @param productId - UUID of the product to export
 * @returns ExportResult with download URL or error message
 */
export async function exportProductPdf(
  productId: string
): Promise<ExportResult> {
  const user = await requireUser();

  if (!productId?.trim()) {
    return { success: false, error: "Product ID is required." };
  }

  const result = await runPdfExport(productId, user.id);

  if (result.success) {
    revalidatePath(`/dashboard/products/${productId}`);
    revalidatePath("/dashboard/products");
  }

  return result;
}

// ─── Export ZIP ───────────────────────────────────────────────────────────────

/**
 * Server Action: Trigger a ZIP export for a product.
 *
 * Bundles PDF + README + metadata + bonus content into a ZIP.
 *
 * @param productId - UUID of the product to export
 * @returns ExportResult with download URL or error message
 */
export async function exportProductZip(
  productId: string
): Promise<ExportResult> {
  const user = await requireUser();

  if (!productId?.trim()) {
    return { success: false, error: "Product ID is required." };
  }

  const result = await runZipExport(productId, user.id);

  if (result.success) {
    revalidatePath(`/dashboard/products/${productId}`);
    revalidatePath("/dashboard/products");
  }

  return result;
}

// ─── Get Export History ───────────────────────────────────────────────────────

/**
 * Server Action: Fetch export history for a product.
 *
 * Returns the 50 most recent export log entries for the given product.
 *
 * @param productId - UUID of the product
 * @returns Array of ExportLog rows
 */
export async function getProductExportHistory(
  productId: string
): Promise<ExportLog[]> {
  await requireUser(); // ensure authenticated

  if (!productId?.trim()) return [];

  return getExportLogs(productId);
}
