/**
 * OAuth & Meta Account Connection Service
 * Path: @/services/oauth/oauth.service.ts
 *
 * Implements complete Meta OAuth flows, secure long-lived token exchange,
 * and robust Instagram Business Account discovery & validation.
 */

export interface MetaTokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
}

export interface InstagramValidationResult {
  instagramAccountId: string;
  facebookPageId: string;
  pageAccessToken: string;
  accountName: string;
  username: string;
}

export class OAuthService {
  private static readonly apiVersion = "v18.0";
  private static readonly baseUrl = "https://graph.facebook.com";

  /**
   * Generates the secure Meta authorization URL.
   */
  static getAuthorizationUrl(): string {
    const clientId = process.env.META_APP_ID;
    const redirectUri = process.env.META_REDIRECT_URI;
    
    if (!clientId || !redirectUri) {
      console.error("[OAuthService] META_APP_ID or META_REDIRECT_URI is missing in env vars.");
    }

    const scopes = [
      "instagram_basic",
      "instagram_content_publish",
      "pages_read_engagement",
      "pages_show_list",
      "public_profile"
    ].join(",");

    return `https://www.facebook.com/${this.apiVersion}/dialog/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri!)}&scope=${scopes}&response_type=code`;
  }

  /**
   * Exchanges a temporary OAuth authorization code for a Long-Lived Access Token (60 Days).
   */
  static async exchangeToken(code: string): Promise<string> {
    const clientId = process.env.META_APP_ID;
    const clientSecret = process.env.META_APP_SECRET;
    const redirectUri = process.env.META_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      throw new Error("Missing Meta App credentials in environment variables.");
    }

    try {
      // Step 1: Exchange code for standard short-lived token (expires in ~2 hours)
      console.info("[OAuthService] Exchanging temporary authorization code...");
      const exchangeUrl = `${this.baseUrl}/${this.apiVersion}/oauth/access_token?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${clientSecret}&code=${code}`;
      
      const res = await fetch(exchangeUrl);
      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error?.message || "Failed to exchange authorization code.");
      }

      const shortLivedToken = data.access_token;

      // Step 2: Upgrade short-lived token to a Long-Lived Access Token (~60 days validity)
      console.info("[OAuthService] Upgrading token to long-lived (60 days)...");
      const upgradeUrl = `${this.baseUrl}/${this.apiVersion}/oauth/access_token?grant_type=fb_exchange_token&client_id=${clientId}&client_secret=${clientSecret}&fb_exchange_token=${shortLivedToken}`;
      
      const upgradeRes = await fetch(upgradeUrl);
      const upgradeData = await upgradeRes.json();

      if (!upgradeRes.ok || upgradeData.error) {
        throw new Error(upgradeData.error?.message || "Failed to generate long-lived token.");
      }

      return upgradeData.access_token;
    } catch (err: any) {
      throw new Error(`Token exchange failed: ${err.message}`);
    }
  }

  /**
   * Discovers and validates linked Facebook Page & Instagram Business Account.
   */
  static async validateAndDiscoverAccount(accessToken: string): Promise<InstagramValidationResult> {
    try {
      console.info("[OAuthService] Fetching linked Facebook Pages and Instagram Accounts...");
      
      // Query Page Accounts list with instagram_business_account parameter mapping
      const pagesUrl = `${this.baseUrl}/${this.apiVersion}/me/accounts?fields=instagram_business_account{id,username,name,profile_picture_url},name,access_token&access_token=${accessToken}`;
      
      const res = await fetch(pagesUrl);
      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error?.message || "Failed to retrieve accounts from Meta.");
      }

      const pagesList = data.data || [];
      
      // Locate page with a valid linked Instagram Business account
      const connectedPage = pagesList.find(
        (page: any) => page.instagram_business_account && page.instagram_business_account.id
      );

      if (!connectedPage) {
        throw new Error(
          "No Instagram Business Account linked to your Facebook Pages. " +
          "Please verify that your IG Account is registered as a Business Profile and connected to a FB Page."
        );
      }

      const igAccount = connectedPage.instagram_business_account;

      return {
        instagramAccountId: igAccount.id,
        facebookPageId: connectedPage.id,
        pageAccessToken: connectedPage.access_token, // Page access token used for content creation workflows
        accountName: igAccount.name || connectedPage.name,
        username: igAccount.username || "ig_business_user",
      };
    } catch (err: any) {
      throw new Error(`Account discovery failed: ${err.message}`);
    }
  }
}
