import type { ApiResponse } from "@/types/api";

/**
 * Wraps a successful API response in a standardised shape.
 * Accepts an optional `meta` object for pagination, counts, etc.
 */
export function successResponse<T>(data: T, meta?: Record<string, unknown>): ApiResponse<T> {
  return { data, error: null, success: true, ...(meta ? { meta } : {}) };
}

/**
 * Wraps an error in a standardised API response shape.
 * Accepts optional `details` for validation errors (e.g. Zod issues).
 */
export function errorResponse(
  message: string,
  details?: unknown
): ApiResponse<null> {
  return {
    data: null,
    error: message,
    success: false,
    ...(details !== undefined ? { details } : {}),
  };
}

/**
 * Extracts a human-readable error message from unknown errors.
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "An unexpected error occurred";
}
