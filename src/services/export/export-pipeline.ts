// ─── Export Pipeline Orchestrator ────────────────────────────────────────────
// Coordinates the full export flow:
//   fetch product → generate asset → upload → update DB → log result
//
// Both runPdfExport and runZipExport are idempotent:
// re-running with the same productId updates the existing record.

import { createAdminClient } from "@/lib/supabase/admin";
import type { Product, Profile } from "@/types/supabase";
import type { ExportResult } from "@/types/export";
import { generateProductPdf, estimatePdfPageCount } from "@/services/pdf/pdf-generator";
import { uploadProductPdf, uploadProductZip } from "@/services/storage/product-storage";
import { createProductZip } from "./zip-packager";
import {
  createExportLog,
  completeExportLog,
  failExportLog,
} from "./export-logger";
import { generateVersion, withRetry, nowIso } from "@/lib/export/utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getAdmin(): any { return createAdminClient(); }


// ─── Helpers ──────────────────────────────────────────────────────────────────

async function fetchProductAndProfile(
  productId: string,
  userId: string
): Promise<{ product: Product; profile: Profile | null }> {
  const admin = getAdmin();


  const [productResult, profileResult] = await Promise.all([
    admin
      .from("products")
      .select("*")
      .eq("id", productId)
      .eq("user_id", userId)
      .single(),
    admin
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle(),
  ]);

  if (productResult.error || !productResult.data) {
    throw new Error(
      `[pipeline] Product not found or access denied: ${productResult.error?.message}`
    );
  }

  return {
    product: productResult.data as Product,
    profile: (profileResult.data as Profile | null) ?? null,
  };
}

async function setProductExportStatus(
  productId: string,
  status: "pending" | "done" | "failed",
  updates: Record<string, unknown> = {}
): Promise<void> {
  const admin = getAdmin();


  await admin
    .from("products")
    .update({ export_status: status, ...updates })
    .eq("id", productId);
}

// ─── PDF Export Pipeline ──────────────────────────────────────────────────────

/**
 * Runs the full PDF export pipeline for a product.
 *
 * Steps:
 *   1. Fetch product + profile
 *   2. Mark product as pending
 *   3. Create export log entry
 *   4. Generate PDF buffer (server-side, @react-pdf/renderer)
 *   5. Upload to Supabase Storage (with retry)
 *   6. Update product row with pdf_url, version, export_status=done
 *   7. Complete export log entry
 *
 * @returns ExportResult with signed download URL on success
 */
export async function runPdfExport(
  productId: string,
  userId: string
): Promise<ExportResult> {
  const version = generateVersion();
  let logId: string | undefined;

  try {
    // 1. Fetch data
    const { product, profile } = await fetchProductAndProfile(productId, userId);

    // 2. Set product status to pending
    await setProductExportStatus(productId, "pending");

    // 3. Create log entry
    logId = await createExportLog({
      productId,
      userId,
      exportType: "pdf",
      version,
    });

    // 4. Generate PDF (with retry for transient failures)
    const pdfBuffer = await withRetry(
      () => generateProductPdf(product, profile, { version }),
      3,
      500
    );

    // 5. Upload to storage (with retry)
    const { storagePath, signedUrl, fileSizeBytes } = await withRetry(
      () => uploadProductPdf(productId, version, pdfBuffer),
      3,
      300
    );

    const pageCount = estimatePdfPageCount(product);

    // 6. Update product row
    await setProductExportStatus(productId, "done", {
      pdf_url: signedUrl,
      version,
      export_metadata: {
        pdfPageCount: pageCount,
        pdfFileSizeBytes: fileSizeBytes,
        lastExportedAt: nowIso(),
      },
    });

    // 7. Complete log entry
    await completeExportLog({
      logId,
      storagePath,
      publicUrl: signedUrl,
      fileSizeBytes,
    });

    return {
      success: true,
      url: signedUrl,
      storagePath,
      fileSizeBytes: fileSizeBytes ?? undefined,
      version,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);

    // Attempt to mark product and log as failed
    await Promise.allSettled([
      setProductExportStatus(productId, "failed"),
      logId ? failExportLog(logId, errorMessage) : Promise.resolve(),
    ]);

    console.error(`[pipeline:pdf] Export failed for product ${productId}:`, err);

    return { success: false, error: errorMessage };
  }
}

// ─── ZIP Export Pipeline ──────────────────────────────────────────────────────

/**
 * Runs the full ZIP export pipeline for a product.
 *
 * Steps:
 *   1. Fetch product + profile
 *   2. Ensure PDF exists (runs PDF export if not already done)
 *   3. Mark product as pending
 *   4. Create export log entry
 *   5. Generate PDF buffer (re-generate fresh)
 *   6. Create ZIP bundle (PDF + README + metadata + bonus)
 *   7. Upload ZIP to storage (with retry)
 *   8. Update product row with zip_url
 *   9. Complete export log entry
 *
 * @returns ExportResult with signed download URL on success
 */
export async function runZipExport(
  productId: string,
  userId: string
): Promise<ExportResult> {
  const version = generateVersion();
  let logId: string | undefined;

  try {
    // 1. Fetch data
    const { product, profile } = await fetchProductAndProfile(productId, userId);

    // 2. Set product status to pending
    await setProductExportStatus(productId, "pending");

    // 3. Create log entry
    logId = await createExportLog({
      productId,
      userId,
      exportType: "zip",
      version,
    });

    // 4. Generate fresh PDF for bundling
    const pdfBuffer = await withRetry(
      () => generateProductPdf(product, profile, { version }),
      3,
      500
    );

    const pageCount = estimatePdfPageCount(product);

    // 5. Create ZIP bundle
    const zipBuffer = await createProductZip({
      product,
      profile,
      pdfBuffer,
      version,
      exportMeta: {
        pdfPageCount: pageCount,
        pdfFileSizeBytes: pdfBuffer.length,
      },
    });

    // 6. Upload ZIP to storage (with retry)
    const { storagePath, signedUrl, fileSizeBytes } = await withRetry(
      () => uploadProductZip(productId, version, zipBuffer),
      3,
      300
    );

    // 7. Update product row — also ensure pdf_url is set
    const pdfUploadResult = await withRetry(
      () => uploadProductPdf(productId, version, pdfBuffer),
      3,
      300
    );

    await setProductExportStatus(productId, "done", {
      zip_url: signedUrl,
      pdf_url: product.pdf_url ?? pdfUploadResult.signedUrl,
      version,
      export_metadata: {
        pdfPageCount: pageCount,
        pdfFileSizeBytes: pdfUploadResult.fileSizeBytes,
        zipFileSizeBytes: fileSizeBytes,
        lastExportedAt: nowIso(),
      },
    });

    // 8. Complete log entry
    await completeExportLog({
      logId,
      storagePath,
      publicUrl: signedUrl,
      fileSizeBytes,
    });

    return {
      success: true,
      url: signedUrl,
      storagePath,
      fileSizeBytes: fileSizeBytes ?? undefined,
      version,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);

    await Promise.allSettled([
      setProductExportStatus(productId, "failed"),
      logId ? failExportLog(logId, errorMessage) : Promise.resolve(),
    ]);

    console.error(`[pipeline:zip] Export failed for product ${productId}:`, err);

    return { success: false, error: errorMessage };
  }
}
