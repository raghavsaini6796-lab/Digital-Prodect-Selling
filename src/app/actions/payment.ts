'use server';

import { createClient } from '@/lib/supabase/server';
import { createRazorpayOrder, verifyPaymentSignature } from '@/lib/razorpay';
import {
  createDownloadToken,
  buildDownloadUrl,
} from '@/lib/download-tokens';
import {
  sendPurchaseConfirmationEmail,
  sendFailedPaymentEmail,
} from '@/lib/resend';
import { revalidatePath } from 'next/cache';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

// ── 1. Create Razorpay Order ───────────────────────────────────────────────────

export async function createPaymentOrder(productId: string) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: 'You must be signed in to purchase.' };
  }

  // Fetch product
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('id, title, price, status, download_url')
    .eq('id', productId)
    .in('status', ['Active', 'Draft'])
    .single();

  if (productError || !product) {
    return { error: 'Product not found or unavailable.' };
  }

  const amountPaise = Math.round((product.price ?? 0) * 100);
  if (amountPaise < 100) {
    return { error: 'Invalid product price.' };
  }

  // Check if already purchased
  const { data: existingOrder } = await supabase
    .from('orders')
    .select('id, payment_status')
    .eq('user_id', user.id)
    .eq('product_id', productId)
    .eq('payment_status', 'paid')
    .maybeSingle();

  if (existingOrder) {
    return { error: 'You already own this product. Check your purchases.' };
  }

  // Create Razorpay order
  let rzpOrder;
  try {
    rzpOrder = await createRazorpayOrder({
      amount: amountPaise,
      currency: 'INR',
      receipt: `${user.id.slice(0, 8)}-${productId.slice(0, 8)}`,
      notes: {
        user_id: user.id,
        product_id: productId,
        product_name: product.title,
      },
    });
  } catch (err) {
    console.error('[createPaymentOrder] Razorpay error:', err);
    return { error: 'Failed to create payment order. Please try again.' };
  }

  // Save order in DB
  const { data: dbOrder, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: user.id,
      product_id: productId,
      razorpay_order_id: rzpOrder.id,
      amount: amountPaise,
      currency: 'INR',
      payment_status: 'pending',
      order_status: 'Pending',
      delivery_status: 'pending',
      customer_email: user.email,
      product_snapshot: {
        title: product.title,
        price: product.price,
      },
    })
    .select('id')
    .single();

  if (orderError || !dbOrder) {
    console.error('[createPaymentOrder] DB error:', orderError);
    return { error: 'Failed to initialize order. Please try again.' };
  }

  // Save payment record
  await supabase.from('payments').insert({
    order_id: dbOrder.id,
    provider: 'razorpay',
    razorpay_order_id: rzpOrder.id,
    amount: amountPaise,
    currency: 'INR',
    status: 'pending',
  });

  return {
    success: true,
    orderId: dbOrder.id,
    razorpayOrderId: rzpOrder.id,
    amount: amountPaise,
    currency: 'INR',
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? '',
    productName: product.title,
    userEmail: user.email ?? '',
  };
}

// ── 2. Verify Payment & Fulfill Order ─────────────────────────────────────────

export async function verifyAndFulfillPayment({
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
  orderId,
}: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  orderId: string;
}) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: 'Unauthorized' };

  // 1. Verify Razorpay signature
  const isValid = verifyPaymentSignature({
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  });

  if (!isValid) {
    return { error: 'Payment verification failed. Please contact support.' };
  }

  // 2. Fetch order (ensure it belongs to this user and is still pending)
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('id, product_id, payment_status, user_id, customer_email, amount, currency, product_snapshot')
    .eq('id', orderId)
    .eq('user_id', user.id)
    .single();

  if (orderError || !order) return { error: 'Order not found.' };
  if (order.payment_status === 'paid') {
    // Idempotent — already processed
    return { success: true, alreadyProcessed: true };
  }

  // 3. Update order to paid
  const { error: updateError } = await supabase
    .from('orders')
    .update({
      payment_status: 'paid',
      order_status: 'Completed',
      razorpay_payment_id,
      payment_signature: razorpay_signature,
      purchased_at: new Date().toISOString(),
      payment_provider: 'razorpay',
    })
    .eq('id', orderId);

  if (updateError) {
    console.error('[verifyAndFulfillPayment] order update error:', updateError);
    return { error: 'Failed to update order status.' };
  }

  // 4. Update payment record
  await supabase
    .from('payments')
    .update({
      transaction_id: razorpay_payment_id,
      status: 'paid',
      metadata: { razorpay_order_id, razorpay_payment_id, razorpay_signature },
    })
    .eq('razorpay_order_id', razorpay_order_id);

  // 5. Create download token
  let downloadToken: string | null = null;
  try {
    downloadToken = await createDownloadToken({
      orderId,
      userId: user.id,
      productId: order.product_id,
    });
  } catch (err) {
    console.error('[verifyAndFulfillPayment] download token error:', err);
  }

  // 6. Update delivery status
  await supabase
    .from('orders')
    .update({ delivery_status: 'delivered' })
    .eq('id', orderId);

  // 7. Log delivery event
  await supabase.from('delivery_events').insert({
    order_id: orderId,
    event_type: 'download_granted',
    metadata: { token_created: !!downloadToken },
  });

  // 8. Send purchase confirmation email
  const downloadUrl = downloadToken
    ? buildDownloadUrl(downloadToken)
    : `${APP_URL}/dashboard/purchases`;

  try {
    await sendPurchaseConfirmationEmail({
      to: order.customer_email ?? user.email ?? '',
      customerName: user.email?.split('@')[0] ?? 'Customer',
      productName: (order.product_snapshot as { title?: string })?.title ?? 'Your Product',
      orderId,
      amount: order.amount,
      currency: order.currency,
      downloadUrl,
    });

    await supabase.from('delivery_events').insert({
      order_id: orderId,
      event_type: 'email_sent',
      metadata: { type: 'purchase_confirmation', to: order.customer_email },
    });
  } catch (err) {
    console.error('[verifyAndFulfillPayment] email error:', err);
  }

  revalidatePath('/dashboard/purchases');
  revalidatePath('/dashboard');

  return { success: true, downloadUrl };
}

// ── 3. Handle Failed Payment ───────────────────────────────────────────────────

export async function handleFailedPayment({
  razorpay_order_id,
  error_description,
}: {
  razorpay_order_id: string;
  error_description?: string;
}) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const { data: order } = await supabase
    .from('orders')
    .select('id, product_id, customer_email, product_snapshot')
    .eq('razorpay_order_id', razorpay_order_id)
    .maybeSingle();

  if (order) {
    await supabase
      .from('orders')
      .update({ payment_status: 'failed', order_status: 'Failed' })
      .eq('id', order.id);

    await supabase
      .from('payments')
      .update({ status: 'failed', metadata: { error_description } })
      .eq('razorpay_order_id', razorpay_order_id);

    await supabase.from('delivery_events').insert({
      order_id: order.id,
      event_type: 'payment_failed',
      metadata: { error_description, razorpay_order_id },
    });

    // Send failure email
    try {
      const snapshot = order.product_snapshot as { title?: string } | null;
      await sendFailedPaymentEmail({
        to: order.customer_email ?? user?.email ?? '',
        customerName: (user?.email ?? 'Customer').split('@')[0],
        productName: snapshot?.title ?? 'Your Product',
        retryUrl: `${APP_URL}/products/${order.product_id}`,
      });
    } catch (err) {
      console.error('[handleFailedPayment] email error:', err);
    }
  }

  return { success: true };
}

// ── 4. Get Purchase History ────────────────────────────────────────────────────

export async function getPurchaseHistory() {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: 'Unauthorized', purchases: [] };

  const { data, error } = await supabase
    .from('orders')
    .select(`
      id,
      payment_status,
      order_status,
      delivery_status,
      amount,
      currency,
      purchased_at,
      created_at,
      razorpay_payment_id,
      product_snapshot,
      products (
        id,
        title,
        type,
        thumbnail_url
      ),
      download_tokens (
        token,
        expires_at,
        download_count,
        max_downloads
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[getPurchaseHistory] error:', error);
    return { error: error.message, purchases: [] };
  }

  return { purchases: data ?? [] };
}
