// ─── Export System Constants ──────────────────────────────────────────────────

/** Supabase Storage bucket for all product export files */
export const EXPORT_BUCKET = "product-exports" as const;

/** Storage folder structure:  products/{productId}/{type}/{version}/{filename} */
export const STORAGE_ROOT = "products" as const;

/** Default PDF filename inside the storage path */
export const PDF_FILENAME = "product.pdf" as const;

/** Default ZIP filename inside the storage path */
export const ZIP_FILENAME = "product.zip" as const;

/** Default README filename bundled inside ZIP */
export const README_FILENAME = "README.txt" as const;

/** Default metadata filename bundled inside ZIP */
export const METADATA_FILENAME = "metadata.json" as const;

/** Signed URL expiry for secure download links (7 days in seconds) */
export const SIGNED_URL_EXPIRY_SECONDS = 60 * 60 * 24 * 7;

/** Maximum file size allowed per export (50 MB) */
export const MAX_EXPORT_FILE_SIZE_BYTES = 50 * 1024 * 1024;

// ─── Path builders ────────────────────────────────────────────────────────────

/**
 * Returns the base storage path for a product's exports.
 * Pattern: `products/{productId}/{type}/{version}`
 */
export function buildExportDir(
  productId: string,
  type: "pdf" | "zip" | "assets",
  version: string
): string {
  return `${STORAGE_ROOT}/${productId}/${type}/${version}`;
}

/**
 * Returns the full storage path for a PDF file.
 * Pattern: `products/{productId}/pdf/{version}/product.pdf`
 */
export function buildPdfPath(productId: string, version: string): string {
  return `${buildExportDir(productId, "pdf", version)}/${PDF_FILENAME}`;
}

/**
 * Returns the full storage path for a ZIP file.
 * Pattern: `products/{productId}/zip/{version}/product.zip`
 */
export function buildZipPath(productId: string, version: string): string {
  return `${buildExportDir(productId, "zip", version)}/${ZIP_FILENAME}`;
}

/**
 * Returns the full storage path for an asset file inside the product folder.
 * Pattern: `products/{productId}/assets/{version}/{filename}`
 */
export function buildAssetPath(
  productId: string,
  version: string,
  filename: string
): string {
  return `${buildExportDir(productId, "assets", version)}/${filename}`;
}

// ─── Export type → MIME type map ─────────────────────────────────────────────

export const EXPORT_CONTENT_TYPE: Record<"pdf" | "zip", string> = {
  pdf: "application/pdf",
  zip: "application/zip",
};
