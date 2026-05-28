// ─── Export System Utilities ──────────────────────────────────────────────────

/**
 * Generate a version string in the format "v{YYYYMMDD}-{HHmmss}".
 * Guaranteed to be unique per second and lexically sortable.
 */
export function generateVersion(): string {
  const now = new Date();
  const date = now
    .toISOString()
    .replace(/[-T:.Z]/g, "")
    .slice(0, 15); // e.g. "20241215143022"
  const datePart = date.slice(0, 8);  // "20241215"
  const timePart = date.slice(8, 14); // "143022"
  return `v${datePart}-${timePart}`;
}

/**
 * Format a byte count into a human-readable string.
 * e.g. 1536000 → "1.46 MB"
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = (bytes / Math.pow(1024, i)).toFixed(2);
  return `${size} ${units[i]}`;
}

/**
 * Sanitize a product title for use in filenames (replaces spaces and
 * special characters with underscores, lowercases everything).
 */
export function sanitizeFilename(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 60);
}

/**
 * Returns an ISO-8601 timestamp string for the current moment.
 */
export function nowIso(): string {
  return new Date().toISOString();
}

/**
 * Returns a formatted date string suitable for PDF display.
 * e.g. "December 15, 2024"
 */
export function formatDisplayDate(iso?: string): string {
  const d = iso ? new Date(iso) : new Date();
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Converts a Buffer or Uint8Array to a Node.js Buffer.
 * Safe to use on both Node.js and edge runtimes.
 */
export function toBuffer(data: Uint8Array | Buffer): Buffer {
  return Buffer.isBuffer(data) ? data : Buffer.from(data);
}

/**
 * Sleeps for the given number of milliseconds. Useful for retry back-off.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry an async function up to `maxAttempts` times with exponential back-off.
 * Throws the last error if all attempts fail.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  baseDelayMs = 300
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < maxAttempts) {
        await sleep(baseDelayMs * Math.pow(2, attempt - 1));
      }
    }
  }

  throw lastError;
}
