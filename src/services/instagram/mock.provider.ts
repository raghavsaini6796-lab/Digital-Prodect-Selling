/**
 * Mock Instagram Provider
 *
 * Safe simulation provider for development and staging.
 * Marks posts as "Published" in DB but never touches real Instagram.
 * Swap this with MetaGraphProvider to go live.
 */

import type { IInstagramProvider } from "./provider.interface";
import type { InstagramPost, PublishResult } from "@/types/instagram";

export class MockInstagramProvider implements IInstagramProvider {
  readonly name = "MockInstagramProvider";
  readonly isLive = false;

  async publishPost(post: InstagramPost): Promise<PublishResult> {
    // Simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Simulate occasional failure for realistic retry testing (5% rate)
    if (Math.random() < 0.05) {
      return {
        success: false,
        error: "[Mock] Simulated transient publish failure — retry eligible.",
      };
    }

    const mockPostId = `mock_${post.id.slice(0, 8)}_${Date.now()}`;

    console.info(
      `[MockProvider] Simulated publish:\n` +
        `  Post ID: ${post.id}\n` +
        `  Type: ${post.content_type}\n` +
        `  Caption: ${post.caption?.slice(0, 60)}...\n` +
        `  Mock Post ID: ${mockPostId}`
    );

    return {
      success: true,
      providerPostId: mockPostId,
      simulatedAt: new Date().toISOString(),
    };
  }

  async validateCredentials(): Promise<{ valid: boolean; error?: string }> {
    // Mock always has valid "credentials"
    return { valid: true };
  }

  async getAccountInfo() {
    return {
      username: "mock_account",
      followersCount: 0,
      profilePicture: undefined,
    };
  }
}
