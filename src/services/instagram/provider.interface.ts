/**
 * Instagram Provider Interface
 *
 * Abstraction layer for Instagram publishing providers.
 *
 * Pattern: Strategy + Factory
 *   - IInstagramProvider defines the contract
 *   - MockInstagramProvider satisfies it safely (no real publishing)
 *   - MetaGraphProvider will satisfy it when Meta API is integrated
 *   - getInstagramProvider() factory selects at runtime via ENV
 *
 * This means zero changes to scheduler/service code when going live —
 * only swap the provider implementation.
 */

import type { InstagramPost, PublishResult } from "@/types/instagram";

// ─── Core Interface ───────────────────────────────────────────────────────────

export interface IInstagramProvider {
  /** Human-readable provider name (for logging) */
  readonly name: string;

  /** Whether this provider publishes to a real platform */
  readonly isLive: boolean;

  /**
   * Publish a post to Instagram (or simulate publishing).
   * Must be idempotent-safe — check provider_post_id before re-publishing.
   */
  publishPost(post: InstagramPost): Promise<PublishResult>;

  /**
   * Validate that credentials are correctly configured.
   * Called during health checks and before scheduling.
   */
  validateCredentials(): Promise<{ valid: boolean; error?: string }>;

  /**
   * Get basic account information.
   * Returns null if credentials are invalid or provider is mock.
   */
  getAccountInfo(): Promise<{
    username?: string;
    followersCount?: number;
    profilePicture?: string;
  } | null>;
}

// ─── Provider Type Registry ───────────────────────────────────────────────────

export type ProviderName = "mock" | "meta_graph";

export interface ProviderConfig {
  type: ProviderName;
  accessToken?: string;
  pageId?: string;
  instagramAccountId?: string;
}
