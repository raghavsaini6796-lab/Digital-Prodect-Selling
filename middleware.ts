import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Next.js Middleware
 * 1. Refresh Supabase session on every request
 * 2. Protect /dashboard/* — redirect unauthenticated users to /auth/sign-in
 * 3. Redirect authenticated users away from /auth/* pages
 * 4. Public: /products/*, /payment/*, /api/webhooks/*, /api/download/*
 */
export default async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const { pathname } = request.nextUrl;

  // Skip auth for webhook + download API — they handle their own verification
  if (
    pathname.startsWith("/api/webhooks/") ||
    pathname.startsWith("/api/download/")
  ) {
    return NextResponse.next({ request });
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Must be called before any route logic — refreshes session cookies
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isProtectedRoute = pathname.startsWith("/dashboard");
  const isAuthRoute =
    pathname.startsWith("/auth/") ||
    pathname === "/login" ||
    pathname === "/signup";

  // Unauthenticated → dashboard redirect
  if (isProtectedRoute && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/auth/sign-in";
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Authenticated → skip auth pages
  if (isAuthRoute && user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/dashboard";
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
