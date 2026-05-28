import { XCircle, RefreshCw, Home, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export default async function PaymentFailedPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string; reason?: string }>;
}) {
  const { orderId, reason } = await searchParams;

  const reasonMessages: Record<string, string> = {
    invalid_token: 'The download link is invalid or has expired.',
    expired: 'This download link has expired.',
    limit_reached: 'Download limit has been reached for this purchase.',
    unauthorized: 'You do not have access to this resource.',
  };

  const displayReason = reason
    ? reasonMessages[reason] ?? 'Your payment could not be processed.'
    : 'Your payment could not be processed.';

  return (
    <div className="min-h-screen bg-[#0f0f17] flex items-center justify-center p-4">
      <div className="w-full max-w-lg text-center">

        {/* Error Icon */}
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-500/10 border border-red-500/30 mb-6">
          <XCircle className="w-12 h-12 text-red-400" />
        </div>

        <h1 className="text-3xl font-bold text-white mb-3">Payment Failed</h1>
        <p className="text-slate-400 mb-2">{displayReason}</p>
        <p className="text-slate-500 text-sm mb-10">
          No amount has been charged to your account. You can safely try again.
        </p>

        {/* Action Cards */}
        <div className="bg-[#1a1a2e] border border-red-500/10 rounded-2xl p-6 mb-6 text-left space-y-4">
          <h3 className="text-white font-semibold text-sm uppercase tracking-wider">Why this might happen</h3>
          <ul className="space-y-2">
            {[
              'Insufficient balance in your account',
              'Bank declined the transaction',
              'Network timeout during payment',
              'UPI/card authentication failed',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-slate-400">
                <span className="text-red-400 mt-0.5">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Retry */}
        <Link
          href={orderId ? `/dashboard/purchases` : '/dashboard'}
          className="flex items-center justify-center gap-2 w-full py-4 px-6 rounded-xl font-semibold text-base bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white transition-all duration-200 shadow-lg shadow-violet-500/30 hover:-translate-y-0.5 mb-4"
        >
          <RefreshCw className="w-5 h-5" />
          Try Again
        </Link>

        <div className="flex gap-3">
          <Link
            href="/dashboard"
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:border-white/20 text-sm font-medium transition-all"
          >
            <Home className="w-4 h-4" />
            Dashboard
          </Link>
          <a
            href="mailto:support@dproductselling.com"
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:border-white/20 text-sm font-medium transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            Get Support
          </a>
        </div>

        <p className="text-xs text-slate-600 mt-8">
          Secured by Razorpay · Your payment info is never stored on our servers
        </p>
      </div>
    </div>
  );
}
