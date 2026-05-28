/**
 * AI Engine — Provider Resolver
 *
 * Single place to resolve which AI provider and model to use.
 * Environment-driven: set AI_PROVIDER in .env.local to switch providers.
 *
 * Supported providers:
 *  - openrouter  → Any model via OpenRouter (uses OPENAI_API_KEY)
 *  - openai      → Direct OpenAI (uses OPENAI_API_KEY)
 *  - google      → Google Gemini (uses GOOGLE_GENERATIVE_AI_API_KEY)
 *  - anthropic   → Anthropic Claude (uses ANTHROPIC_API_KEY)
 *
 * To add a new provider: add a case in resolveModel() and update .env.local.
 */

import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createAnthropic } from "@ai-sdk/anthropic";

// ─── Provider type ────────────────────────────────────────────────────────────

export type AIProvider = "openrouter" | "openai" | "google" | "anthropic";

// ─── Default model per provider ───────────────────────────────────────────────

export const DEFAULT_MODEL_IDS: Record<AIProvider, string> = {
  openrouter: "meta-llama/llama-3.3-70b-instruct:free",
  openai: "gpt-4o-mini",
  google: "gemini-1.5-flash",
  anthropic: "claude-3-haiku-20240307",
};

// ─── Provider resolver ────────────────────────────────────────────────────────

/**
 * Returns the correct model instance based on AI_PROVIDER env var.
 * Falls back to openrouter if not set.
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function resolveModel(overrideModelId?: string) {
  const provider = (process.env.AI_PROVIDER ?? "openrouter") as AIProvider;
  const modelId = overrideModelId ?? DEFAULT_MODEL_IDS[provider];

  switch (provider) {
    case "openai": {
      const client = createOpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      return client(modelId);
    }

    case "google": {
      const client = createGoogleGenerativeAI({
        apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
      });
      return client(modelId);
    }

    case "anthropic": {
      const client = createAnthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });
      return client(modelId);
    }

    case "openrouter":
    default: {
      const client = createOpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: process.env.OPENAI_API_KEY,
      });
      return client(modelId);
    }
  }
}

// ─── Current provider info (for logging / UI) ─────────────────────────────────

export function getCurrentProviderInfo(): { provider: AIProvider; modelId: string } {
  const provider = (process.env.AI_PROVIDER ?? "openrouter") as AIProvider;
  return {
    provider,
    modelId: DEFAULT_MODEL_IDS[provider],
  };
}
