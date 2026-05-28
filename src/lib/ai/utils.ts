/**
 * AI Engine — Utilities
 *
 * Retry logic, error normalisation, delay helpers.
 * Retry-safe: never mutates input, always returns a fresh result.
 */

import { RETRY_CONFIG } from "./config";

// ─── Delay ───────────────────────────────────────────────────────────────────

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Retry with Exponential Backoff ──────────────────────────────────────────

export async function withRetry<T>(
  fn: () => Promise<T>,
  options?: {
    maxAttempts?: number;
    initialDelayMs?: number;
    backoffMultiplier?: number;
    onRetry?: (attempt: number, error: unknown) => void;
  }
): Promise<T> {
  const {
    maxAttempts = RETRY_CONFIG.maxAttempts,
    initialDelayMs = RETRY_CONFIG.initialDelayMs,
    backoffMultiplier = RETRY_CONFIG.backoffMultiplier,
    onRetry,
  } = options ?? {};

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;

      if (attempt === maxAttempts) break;

      const delayMs = initialDelayMs * Math.pow(backoffMultiplier, attempt - 1);
      onRetry?.(attempt, err);
      await sleep(delayMs);
    }
  }

  throw lastError;
}

// ─── Error Normaliser ─────────────────────────────────────────────────────────

export function normaliseError(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return "An unexpected error occurred during generation.";
}

// ─── Token Estimator (rough 4 chars ≈ 1 token) ───────────────────────────────

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

// ─── Build Generation Name ────────────────────────────────────────────────────

export function buildGenerationName(
  productType: string,
  niche: string
): string {
  const truncated = niche.length > 30 ? `${niche.substring(0, 30)}…` : niche;
  return `${productType} — ${truncated}`;
}

// ─── Format Duration ──────────────────────────────────────────────────────────

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}
