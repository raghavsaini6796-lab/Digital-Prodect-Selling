/**
 * Secure download token utilities — server-side only
 */
import crypto from 'crypto';
import { createClient } from '@/lib/supabase/server';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

/** Generate a cryptographically secure random token */
export function generateDownloadToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/** Create and persist a download token in the DB */
export async function createDownloadToken({
  orderId,
  userId,
  productId,
}: {
  orderId: string;
  userId: string;
  productId: string;
}): Promise<string> {
  const supabase = await createClient();
  const token = generateDownloadToken();

  const { error } = await supabase.from('download_tokens').insert({
    order_id: orderId,
    user_id: userId,
    product_id: productId,
    token,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    max_downloads: 5,
  });

  if (error) throw new Error(`Failed to create download token: ${error.message}`);

  return token;
}

/** Build the secure download URL for a token */
export function buildDownloadUrl(token: string): string {
  return `${APP_URL}/api/download/${token}`;
}

/** Validate a token and return the associated product + order (increments counter) */
export async function validateAndUseToken(token: string, userId: string) {
  const supabase = await createClient();

  // Fetch token record
  const { data: tokenRecord, error } = await supabase
    .from('download_tokens')
    .select('*, orders(user_id, product_id, payment_status), products(name, download_url, type)')
    .eq('token', token)
    .single();

  if (error || !tokenRecord) {
    return { valid: false, reason: 'Token not found' };
  }

  // Check user ownership
  if (tokenRecord.user_id !== userId) {
    return { valid: false, reason: 'Unauthorized' };
  }

  // Check expiry
  if (new Date(tokenRecord.expires_at) < new Date()) {
    return { valid: false, reason: 'Token expired' };
  }

  // Check download limit
  if (tokenRecord.download_count >= tokenRecord.max_downloads) {
    return { valid: false, reason: 'Download limit reached' };
  }

  // Check order payment status
  const order = tokenRecord.orders as { user_id: string; product_id: string; payment_status: string };
  if (!order || order.payment_status !== 'paid') {
    return { valid: false, reason: 'Payment not confirmed' };
  }

  // Increment download counter
  await supabase
    .from('download_tokens')
    .update({ download_count: tokenRecord.download_count + 1 })
    .eq('id', tokenRecord.id);

  // Log delivery event
  await supabase.from('delivery_events').insert({
    order_id: tokenRecord.order_id,
    event_type: 'download_used',
    metadata: { token_id: tokenRecord.id, download_count: tokenRecord.download_count + 1 },
  });

  return {
    valid: true,
    product: tokenRecord.products as { name: string; download_url: string; type: string },
    orderId: tokenRecord.order_id,
  };
}
