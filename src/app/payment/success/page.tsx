import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { CheckCircle, Download, Package, ArrowRight, Home } from 'lucide-react';
import Link from 'next/link';

async function SuccessContent({ orderId }: { orderId: string }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/sign-in');

  const { data: order } = await supabase
    .from('orders')
    .select(`
      id, amount, currency, purchased_at, product_snapshot,
      products ( id, name, type, thumbnail_url ),
      download_tokens ( token, expires_at, download_count, max_downloads )
    `)
    .eq('id', orderId)
    .eq('user_id', user.id)
    .eq('payment_status', 'paid')
    .single();

  if (!order) redirect('/dashboard/purchases');

  const productsRaw = order.products;
  const product = (Array.isArray(productsRaw) ? productsRaw[0] : productsRaw) as { id: string; name: string; type: string; thumbnail_url: string | null } | null;
  const tokensRaw = order.download_tokens;
  const tokens = (Array.isArray(tokensRaw) ? tokensRaw : tokensRaw ? [tokensRaw] : []) as { token: string; expires_at: string; download_count: number; max_downloads: number }[];
  const activeToken = tokens?.[0];
  const downloadUrl = activeToken ? `/api/download/${activeToken.token}` : '/dashboard/purchases';

  const amountFormatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: order.currency ?? 'INR',
  }).format((order.amount ?? 0) / 100);

  const snapshot = order.product_snapshot as { name?: string } | null;
  const productName = product?.name ?? snapshot?.name ?? 'Your Product';

  return (
    <div className="min-h-screen bg-[#0f0f17] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Success Animation */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-emerald-500/10 border border-emerald-500/30 mb-6 animate-pulse">
            <CheckCircle className="w-12 h-12 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Payment Successful!</h1>
          <p className="text-slate-400">Your purchase is confirmed. Check your email for the receipt.</p>
        </div>

        {/* Order Card */}
        <div className="bg-[#1a1a2e] border border-violet-500/20 rounded-2xl overflow-hidden mb-6">
          {/* Product */}
          <div className="p-6 border-b border-white/5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center flex-shrink-0">
                <Package className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-violet-400 font-medium uppercase tracking-wider mb-1">Product Purchased</p>
                <h2 className="text-white font-semibold text-lg leading-tight truncate">{productName}</h2>
                {product?.type && <span className="text-xs text-slate-500">{product.type}</span>}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="p-6 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Order ID</span>
              <span className="text-white font-mono">{orderId.slice(0, 8).toUpperCase()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Amount Paid</span>
              <span className="text-emerald-400 font-bold text-base">{amountFormatted}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Date</span>
              <span className="text-white">
                {order.purchased_at
                  ? new Date(order.purchased_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                  : 'Just now'}
              </span>
            </div>
            {activeToken && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Downloads</span>
                <span className="text-white">{activeToken.download_count} / {activeToken.max_downloads} used</span>
              </div>
            )}
          </div>
        </div>

        {/* Download Button */}
        <a
          href={downloadUrl}
          className="flex items-center justify-center gap-3 w-full py-4 px-6 rounded-xl font-semibold text-base bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white transition-all duration-200 shadow-lg shadow-emerald-500/30 hover:-translate-y-0.5 mb-4"
        >
          <Download className="w-5 h-5" />
          Download Your Product
        </a>

        {/* Secondary Actions */}
        <div className="flex gap-3">
          <Link
            href="/dashboard/purchases"
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:border-white/20 text-sm font-medium transition-all duration-200"
          >
            <Package className="w-4 h-4" />
            My Purchases
          </Link>
          <Link
            href="/dashboard"
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:border-white/20 text-sm font-medium transition-all duration-200"
          >
            <Home className="w-4 h-4" />
            Dashboard
          </Link>
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          A confirmation email has been sent to your registered address
        </p>
      </div>
    </div>
  );
}

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const { orderId } = await searchParams;
  if (!orderId) redirect('/dashboard/purchases');

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0f0f17] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SuccessContent orderId={orderId} />
    </Suspense>
  );
}
