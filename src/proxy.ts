import { NextRequest, NextResponse } from 'next/server';

// Note: True distributed rate limiting in Next.js Edge Middleware 
// requires Redis (e.g., @upstash/ratelimit). 
// For now, this is a middleware structure that adds secure headers 
// and prepares for rate limiting & auth checks.

export async function middleware(req: NextRequest) {
    const res = NextResponse.next();
    
    // 1. Add Security Headers (Hardening)
    res.headers.set('X-DNS-Prefetch-Control', 'on');
    res.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
    res.headers.set('X-XSS-Protection', '1; mode=block');
    res.headers.set('X-Frame-Options', 'SAMEORIGIN');
    res.headers.set('X-Content-Type-Options', 'nosniff');
    res.headers.set('Referrer-Policy', 'origin-when-cross-origin');

    // 2. Admin Route Protection (Basic Middleware Check)
    if (req.nextUrl.pathname.startsWith('/dashboard/admin')) {
        // In a real app, you would verify Supabase session here
        // using @supabase/ssr or similar, or redirect if missing.
        const hasSession = req.cookies.has('sb-access-token') || req.cookies.has('sb-hnxlfxbclhulkhqaucmf-auth-token');
        if (!hasSession) {
            // Optional: redirect to login if no auth cookie is present
            // return NextResponse.redirect(new URL('/login', req.url));
        }
    }

    // 3. API Rate Limiting Placeholder
    if (req.nextUrl.pathname.startsWith('/api/')) {
        // Implement @upstash/ratelimit here in production
        // Example: const { success } = await ratelimit.limit(req.ip ?? "127.0.0.1");
        // if (!success) return new NextResponse("Too Many Requests", { status: 429 });
    }

    return res;
}

export const config = {
    // Matcher config excludes static files and images to optimize performance
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
