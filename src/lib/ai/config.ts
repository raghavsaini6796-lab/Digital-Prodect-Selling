/**
 * AI Engine — Model Configuration
 *
 * Centralised model settings. Provider is resolved at runtime from
 * AI_PROVIDER env var. Token limits and retry config live here.
 *
 * To add a new provider:
 *   1. Add an entry to MODEL_REGISTRY
 *   2. Add the provider case in /lib/ai/provider.ts
 *   3. Set AI_PROVIDER=<provider> in .env.local
 */

// ─── Runtime constants (used by pipeline) ────────────────────────────────────

export const DEFAULT_TEMPERATURE = 0.8;
export const DEFAULT_MAX_TOKENS = 2048;

/**
 * Content-length token budget overrides.
 */
export const CONTENT_LENGTH_TOKENS: Record<string, number> = {
  short: 1024,
  medium: 2048,
  long: 4096,
};

// ─── Model Registry ───────────────────────────────────────────────────────────
// Reference table — the pipeline reads the active model from AI_PROVIDER env.

export const MODEL_REGISTRY = {
  // ── OpenRouter (free & paid) ───────────────────────────────────────────────
  "meta-llama/llama-3.3-70b-instruct:free": {
    provider: "openrouter",
    temperature: 0.8,
    maxTokens: 2048,
    notes: "Free tier — great for most generation tasks",
  },
  "openai/gpt-4o-mini": {
    provider: "openrouter",
    temperature: 0.8,
    maxTokens: 2048,
    notes: "Paid via OpenRouter",
  },

  // ── OpenAI direct ─────────────────────────────────────────────────────────
  "gpt-4o-mini": {
    provider: "openai",
    temperature: 0.8,
    maxTokens: 2048,
    notes: "Default direct OpenAI model",
  },
  "gpt-4o": {
    provider: "openai",
    temperature: 0.7,
    maxTokens: 4096,
    notes: "Best quality, higher cost",
  },

  // ── Google Gemini ─────────────────────────────────────────────────────────
  "gemini-1.5-flash": {
    provider: "google",
    temperature: 0.8,
    maxTokens: 2048,
    notes: "Fast and free Gemini model",
  },
  "gemini-1.5-pro": {
    provider: "google",
    temperature: 0.7,
    maxTokens: 4096,
    notes: "Best Gemini model",
  },

  // ── Anthropic Claude ──────────────────────────────────────────────────────
  "claude-3-haiku-20240307": {
    provider: "anthropic",
    temperature: 0.8,
    maxTokens: 2048,
    notes: "Fastest Claude model, lowest cost",
  },
  "claude-3-5-sonnet-20241022": {
    provider: "anthropic",
    temperature: 0.7,
    maxTokens: 4096,
    notes: "Best Claude model for content generation",
  },
} as const;

// ─── Retry Config ─────────────────────────────────────────────────────────────

export const RETRY_CONFIG = {
  maxAttempts: 3,
  initialDelayMs: 500,
  backoffMultiplier: 2,
} as const;

// ─── System Prompt Base ───────────────────────────────────────────────────────

export const BASE_SYSTEM_PROMPT = `You are an expert digital product creator specializing in creating
ready-to-sell digital products for online creators and entrepreneurs.

You always respond with structured, well-organized content that is:
- Ready to sell immediately with minimal editing
- Optimized for the specific target audience
- Clear, compelling, and conversion-focused
- Formatted professionally

Never include meta-commentary. Only output the requested product content.` as const;
