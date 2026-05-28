import { getPurchaseHistory } from '@/app/actions/payment';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import {
  Package, Download, Clock, CheckCircle, XCircle,
  AlertCircle, FileText, Image, Music, Video, File
} from 'lucide-react';
import Link from 'next/link';


function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
    paid: { label: 'Paid', className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: <CheckCircle className="w-3 h-3" /> },
    pending: { label: 'Pending', className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', icon: <Clock className="w-3 h-3" /> },
    failed: { label: 'Failed', className: 'bg-red-500/10 text-red-400 border-red-500/20', icon: <XCircle className="w-3 h-3" /> },
    refunded: { label: 'Refunded', className: 'bg-slate-500/10 text-slate-400 border-slate-500/20', icon: <AlertCircle className="w-3 h-3" /> },
  };
  const cfg = map[status] ?? map['pending'];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium ${cfg.className}`}>
      {cfg.icon}{cfg.label}
    </span>
  );
}

function ProductTypeIcon({ type }: { type?: string }) {
  const icons: Record<string, React.ReactNode> = {
    'Image Bundle': <Image className="w-5 h-5" />,
    'Document': <FileText className="w-5 h-5" />,
    'Template': <FileText className="w-5 h-5" />,
    'Audio': <Music className="w-5 h-5" />,
    'Video': <Video className="w-5 h-5" />,
  };
  return <>{icons[type ?? ''] ?? <File className="w-5 h-5" />}</>;
}

export default async function PurchasesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/sign-in');

  const { purchases, error } = await getPurchaseHistory();

  const paid = purchases.filter((p: Record<string, unknown>) => p.payment_status === 'paid');
  const pending = purchases.filter((p: Record<string, unknown>) => p.payment_status === 'pending');

  return (
    <div className="min-h-screen bg-[#0f0f17] p-6 md:p-10">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">My Purchases</h1>
              <p className="text-slate-400 text-sm">Your digital products &amp; downloads</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            {[
              { label: 'Total Purchases', value: paid.length, color: 'text-violet-400' },
              { label: 'Pending', value: pending.length, color: 'text-yellow-400' },
              { label: 'All Orders', value: purchases.length, color: 'text-slate-300' },
            ].map((stat) => (
              <div key={stat.label} className="bg-[#1a1a2e] border border-white/5 rounded-xl p-4">
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 flex items-center gap-2 text-red-400">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {purchases.length === 0 && (
          <div className="bg-[#1a1a2e] border border-white/5 rounded-2xl p-16 text-center">
            <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-white font-semibold text-lg mb-2">No purchases yet</h3>
            <p className="text-slate-400 text-sm mb-6">
              Browse our digital products and make your first purchase.
            </p>
            <Link
              href="/dashboard/products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium text-sm hover:from-violet-500 hover:to-indigo-500 transition-all"
            >
              Browse Products
            </Link>
          </div>
        )}

        {/* Purchase Cards */}
        <div className="space-y-4">
          {purchases.map((order: Record<string, unknown>) => {
            const product = order.products as { id: string; name: string; type: string; thumbnail_url: string | null } | null;
            const tokens = order.download_tokens as { token: string; expires_at: string; download_count: number; max_downloads: number }[] | null;
            const activeToken = tokens?.find((t) => new Date(t.expires_at) > new Date() && t.download_count < t.max_downloads);
            const snapshot = order.product_snapshot as { name?: string } | null;
            const productName = product?.name ?? snapshot?.name ?? 'Product';
            const isPaid = order.payment_status === 'paid';
            const amountFormatted = new Intl.NumberFormat('en-IN', {
              style: 'currency',
              currency: (order.currency as string) ?? 'INR',
            }).format(((order.amount as number) ?? 0) / 100);

            return (
              <div
                key={order.id as string}
                className="bg-[#1a1a2e] border border-white/5 hover:border-violet-500/20 rounded-2xl overflow-hidden transition-all duration-200"
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border border-violet-500/20 flex items-center justify-center flex-shrink-0 text-violet-400">
                      <ProductTypeIcon type={product?.type} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className="text-white font-semibold leading-tight truncate">{productName}</h3>
                        <StatusBadge status={order.payment_status as string} />
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 mb-4">
                        <span>Order <span className="font-mono text-slate-400">{(order.id as string).slice(0, 8).toUpperCase()}</span></span>
                        <span>{amountFormatted}</span>
                        {(order.purchased_at as string | null) && (
                          <span>
                            {new Date(order.purchased_at as string).toLocaleDateString('en-IN', {
                              day: 'numeric', month: 'short', year: 'numeric',
                            })}
                          </span>
                        )}
                      </div>

                      {/* Download section */}
                      {isPaid && (
                        <div className="flex items-center gap-3">
                          {activeToken ? (
                            <>
                              <a
                                href={`/api/download/${activeToken.token}`}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-medium transition-all shadow-sm shadow-violet-500/20"
                              >
                                <Download className="w-4 h-4" />
                                Download
                              </a>
                              <span className="text-xs text-slate-500">
                                {activeToken.download_count}/{activeToken.max_downloads} downloads ·{' '}
                                Expires {new Date(activeToken.expires_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                              </span>
                            </>
                          ) : (
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5 text-yellow-500" />
                              Download link expired — contact support
                            </span>
                          )}
                        </div>
                      )}

                      {order.payment_status === 'pending' && (
                        <p className="text-xs text-yellow-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          Payment pending — complete checkout to access your product
                        </p>
                      )}

                      {order.payment_status === 'failed' && (
                        <p className="text-xs text-red-400 flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" />
                          Payment failed —{' '}
                          {product?.id && (
                            <Link href={`/products/${product.id}`} className="underline hover:text-red-300">
                              try again
                            </Link>
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Invoice Footer */}
                {isPaid && (
                  <div className="border-t border-white/5 px-6 py-3 flex items-center justify-between">
                    <span className="text-xs text-slate-600">
                      Paid via Razorpay · {order.razorpay_payment_id ? `txn: ${(order.razorpay_payment_id as string).slice(0, 12)}…` : ''}
                    </span>
                    <Link
                      href={`/payment/success?orderId=${order.id as string}`}
                      className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors"
                    >
                      <FileText className="w-3 h-3" />
                      View Receipt
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
