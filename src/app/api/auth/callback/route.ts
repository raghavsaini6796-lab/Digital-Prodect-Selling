import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ROUTES } from "@/lib/constants";

/**
 * Supabase OAuth + Magic Link callback handler.
 * Supabase redirects here after email confirmation / OAuth login.
 * Exchanges the code for a session and redirects into the app.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? ROUTES.dashboard;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Auth failed — redirect to login with error flag
  return NextResponse.redirect(`${origin}${ROUTES.login}?error=auth_failed`);
}
