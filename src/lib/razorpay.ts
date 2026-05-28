/**
 * Razorpay client — server-side only
 * Never import this from client components.
 */
import Razorpay from 'razorpay';
import crypto from 'crypto';

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  // Soft warn in dev; hard error in production
  if (process.env.NODE_ENV === 'production') {
    throw new Error('[razorpay] RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set in production.');
  }
}

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID ?? 'rzp_test_placeholder',
  key_secret: process.env.RAZORPAY_KEY_SECRET ?? 'placeholder_secret',
});

// ── Order Creation ─────────────────────────────────────────────────────────────

export interface CreateOrderParams {
  amount: number;      // in paise (INR × 100)
  currency?: string;
  receipt: string;     // your internal order/reference ID
  notes?: Record<string, string>;
}

export async function createRazorpayOrder(params: CreateOrderParams) {
  const order = await razorpay.orders.create({
    amount: params.amount,
    currency: params.currency ?? 'INR',
    receipt: params.receipt,
    notes: params.notes ?? {},
  });
  return order;
}

// ── Signature Verification ─────────────────────────────────────────────────────

export function verifyPaymentSignature({
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
}: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET ?? '';
  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');
  return expectedSignature === razorpay_signature;
}

// ── Webhook Signature Verification ────────────────────────────────────────────

export function verifyWebhookSignature(
  rawBody: string,
  signature: string,
  webhookSecret: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature, 'hex'),
    Buffer.from(signature, 'hex')
  );
}
