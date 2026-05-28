import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /auth/callback
 *
 * Handles the OAuth PKCE code exchange for:
 * - Google OAuth login
 * - Magic link login
 * - Email confirmation
 *
 * Uses the shared server Supabase client (cookie-aware) instead of
 * manually constructing a client — simpler and consistent with the rest of the app.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Successful auth — redirect to intended destination
      const redirectUrl = new URL(next, origin);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Failed exchange — redirect to login with error param
  const errorUrl = new URL("/login", origin);
  errorUrl.searchParams.set("error", "auth-callback-failed");
  return NextResponse.redirect(errorUrl);
}
