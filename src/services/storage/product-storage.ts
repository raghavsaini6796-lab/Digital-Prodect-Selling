// ─── Product Storage Service ──────────────────────────────────────────────────
// High-level storage helpers specific to the product export domain.
// Handles path construction + upload + signed URL generation in one call.

import {
  buildPdfPath,
  buildZipPath,
  buildAssetPath,
  EXPORT_CONTENT_TYPE,
} from "@/lib/export/constants";
import {
  uploadFile,
  getSignedUrl,
  getFileSize,
} from "./storage-client";

// ─── PDF upload ───────────────────────────────────────────────────────────────

export interface UploadResult {
  storagePath: string;
  signedUrl: string;
  fileSizeBytes: number | null;
}

/**
 * Uploads a PDF buffer for a product and returns the signed download URL.
 */
export async function uploadProductPdf(
  productId: string,
  version: string,
  pdfBuffer: Buffer
): Promise<UploadResult> {
  const storagePath = buildPdfPath(productId, version);

  await uploadFile(storagePath, pdfBuffer, EXPORT_CONTENT_TYPE.pdf);

  const [signedUrl, fileSizeBytes] = await Promise.all([
    getSignedUrl(storagePath),
    getFileSize(storagePath),
  ]);

  return { storagePath, signedUrl, fileSizeBytes };
}

// ─── ZIP upload ───────────────────────────────────────────────────────────────

/**
 * Uploads a ZIP buffer for a product and returns the signed download URL.
 */
export async function uploadProductZip(
  productId: string,
  version: string,
  zipBuffer: Buffer
): Promise<UploadResult> {
  const storagePath = buildZipPath(productId, version);

  await uploadFile(storagePath, zipBuffer, EXPORT_CONTENT_TYPE.zip);

  const [signedUrl, fileSizeBytes] = await Promise.all([
    getSignedUrl(storagePath),
    getFileSize(storagePath),
  ]);

  return { storagePath, signedUrl, fileSizeBytes };
}

// ─── Asset upload ─────────────────────────────────────────────────────────────

/**
 * Uploads an arbitrary asset file (e.g. thumbnail, bonus file) for a product.
 */
export async function uploadProductAsset(
  productId: string,
  version: string,
  filename: string,
  buffer: Buffer,
  contentType = "application/octet-stream"
): Promise<UploadResult> {
  const storagePath = buildAssetPath(productId, version, filename);

  await uploadFile(storagePath, buffer, contentType);

  const [signedUrl, fileSizeBytes] = await Promise.all([
    getSignedUrl(storagePath),
    getFileSize(storagePath),
  ]);

  return { storagePath, signedUrl, fileSizeBytes };
}
