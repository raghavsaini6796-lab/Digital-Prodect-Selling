import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { validateAndUseToken } from '@/lib/download-tokens';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    const loginUrl = new URL('/auth/sign-in', req.url);
    loginUrl.searchParams.set('next', req.url);
    return NextResponse.redirect(loginUrl);
  }

  const { token } = await params;

  const result = await validateAndUseToken(token, user.id);

  if (!result.valid) {
    const errorUrl = new URL('/payment/failed', req.url);
    errorUrl.searchParams.set('reason', result.reason ?? 'invalid_token');
    return NextResponse.redirect(errorUrl);
  }

  const product = result.product as { name: string; download_url: string; type: string };

  if (!product?.download_url) {
    // No direct file — redirect to purchases dashboard
    return NextResponse.redirect(new URL('/dashboard/purchases', req.url));
  }

  // Redirect to the actual file URL (could be Supabase Storage signed URL)
  // For Supabase Storage: generate a signed URL
  try {
    // Parse storage path from download_url if it's a Supabase storage path
    if (product.download_url.startsWith('http')) {
      // External / direct URL — redirect directly
      return NextResponse.redirect(product.download_url);
    }

    // Supabase storage path — generate signed URL
    const { data: signedData, error: signError } = await supabase.storage
      .from('products')
      .createSignedUrl(product.download_url, 3600); // 1 hour

    if (signError || !signedData) {
      throw new Error(signError?.message ?? 'Failed to generate signed URL');
    }

    return NextResponse.redirect(signedData.signedUrl);
  } catch (err) {
    console.error('[download] Error generating download URL:', err);
    // Fallback to dashboard
    return NextResponse.redirect(new URL('/dashboard/purchases', req.url));
  }
}
