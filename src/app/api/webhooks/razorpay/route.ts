import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyWebhookSignature } from '@/lib/razorpay';
import {
  createDownloadToken,
  buildDownloadUrl,
} from '@/lib/download-tokens';
import {
  sendPurchaseConfirmationEmail,
  sendFailedPaymentEmail,
} from '@/lib/resend';

const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET ?? '';

export async function POST(req: NextRequest) {
  try {
    // 1. Read raw body for signature verification
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature') ?? '';

    // 2. Verify webhook signature
    if (!WEBHOOK_SECRET || !verifyWebhookSignature(rawBody, signature, WEBHOOK_SECRET)) {
      console.error('[webhook] Invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    let payload: {
      event: string;
      payload: {
        payment?: {
          entity: {
            id: string;
            order_id: string;
            email: string;
            status: string;
            amount: number;
            currency: string;
            error_description?: string;
          };
        };
        refund?: {
          entity: {
            id: string;
            payment_id: string;
            amount: number;
          };
        };
      };
    };

    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const supabase = await createClient();

    // ── payment.captured — successful payment ─────────────────────────────────

    if (payload.event === 'payment.captured') {
      const payment = payload.payload.payment?.entity;
      if (!payment) return NextResponse.json({ ok: true });

      const { id: paymentId, order_id: razorpayOrderId, email } = payment;

      // Fetch the order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('id, user_id, product_id, payment_status, customer_email, amount, currency, product_snapshot')
        .eq('razorpay_order_id', razorpayOrderId)
        .maybeSingle();

      if (orderError || !order) {
        console.error('[webhook] Order not found for razorpay_order_id:', razorpayOrderId);
        return NextResponse.json({ ok: true }); // Return 200 to stop Razorpay retrying
      }

      // Idempotency check — skip if already paid
      if (order.payment_status === 'paid') {
        return NextResponse.json({ ok: true });
      }

      // Update order
      await supabase
        .from('orders')
        .update({
          payment_status: 'paid',
          order_status: 'Completed',
          razorpay_payment_id: paymentId,
          purchased_at: new Date().toISOString(),
          payment_provider: 'razorpay',
        })
        .eq('id', order.id);

      // Update payment record
      await supabase
        .from('payments')
        .update({ transaction_id: paymentId, status: 'paid' })
        .eq('razorpay_order_id', razorpayOrderId);

      // Log webhook event
      await supabase.from('delivery_events').insert({
        order_id: order.id,
        event_type: 'webhook_received',
        metadata: { event: 'payment.captured', payment_id: paymentId },
      });

      // Create download token
      let downloadUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/purchases`;
      try {
        const token = await createDownloadToken({
          orderId: order.id,
          userId: order.user_id,
          productId: order.product_id,
        });
        downloadUrl = buildDownloadUrl(token);

        await supabase
          .from('orders')
          .update({ delivery_status: 'delivered' })
          .eq('id', order.id);

        await supabase.from('delivery_events').insert({
          order_id: order.id,
          event_type: 'download_granted',
          metadata: { via: 'webhook' },
        });
      } catch (err) {
        console.error('[webhook] Token creation error:', err);
      }

      // Send email
      try {
        const snapshot = order.product_snapshot as { name?: string } | null;
        await sendPurchaseConfirmationEmail({
          to: order.customer_email ?? email,
          customerName: (order.customer_email ?? email).split('@')[0],
          productName: snapshot?.name ?? 'Your Product',
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
          downloadUrl,
        });

        await supabase.from('delivery_events').insert({
          order_id: order.id,
          event_type: 'email_sent',
          metadata: { type: 'purchase_confirmation', via: 'webhook' },
        });
      } catch (err) {
        console.error('[webhook] Email error:', err);
      }

      return NextResponse.json({ ok: true });
    }

    // ── payment.failed ─────────────────────────────────────────────────────────

    if (payload.event === 'payment.failed') {
      const payment = payload.payload.payment?.entity;
      if (!payment) return NextResponse.json({ ok: true });

      const { order_id: razorpayOrderId, email, error_description } = payment;

      const { data: order } = await supabase
        .from('orders')
        .select('id, user_id, product_id, customer_email, product_snapshot')
        .eq('razorpay_order_id', razorpayOrderId)
        .maybeSingle();

      if (order) {
        await supabase
          .from('orders')
          .update({ payment_status: 'failed', order_status: 'Failed' })
          .eq('id', order.id);

        await supabase
          .from('payments')
          .update({ status: 'failed', metadata: { error_description } })
          .eq('razorpay_order_id', razorpayOrderId);

        await supabase.from('delivery_events').insert({
          order_id: order.id,
          event_type: 'webhook_received',
          metadata: { event: 'payment.failed', error_description },
        });

        try {
          const snapshot = order.product_snapshot as { name?: string } | null;
          await sendFailedPaymentEmail({
            to: order.customer_email ?? email,
            customerName: (order.customer_email ?? email).split('@')[0],
            productName: snapshot?.name ?? 'Your Product',
            retryUrl: `${process.env.NEXT_PUBLIC_APP_URL}/products/${order.product_id}`,
          });
        } catch (err) {
          console.error('[webhook] Failed payment email error:', err);
        }
      }

      return NextResponse.json({ ok: true });
    }

    // ── refund.created ─────────────────────────────────────────────────────────

    if (payload.event === 'refund.created') {
      const refund = payload.payload.refund?.entity;
      if (!refund) return NextResponse.json({ ok: true });

      const { payment_id: paymentId } = refund;

      const { data: order } = await supabase
        .from('orders')
        .select('id')
        .eq('razorpay_payment_id', paymentId)
        .maybeSingle();

      if (order) {
        await supabase
          .from('orders')
          .update({ payment_status: 'refunded', order_status: 'Refunded' })
          .eq('id', order.id);

        await supabase
          .from('payments')
          .update({ status: 'refunded' })
          .eq('transaction_id', paymentId);

        await supabase.from('delivery_events').insert({
          order_id: order.id,
          event_type: 'refund_processed',
          metadata: { refund_id: refund.id, amount: refund.amount },
        });
      }

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Razorpay webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
