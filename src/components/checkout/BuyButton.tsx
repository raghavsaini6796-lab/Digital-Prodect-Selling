'use client';

import { useBuyProduct } from '@/hooks/useBuyProduct';
import { Loader2, ShoppingCart, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BuyButtonProps {
  productId: string;
  price: number;
  currency?: string;
  className?: string;
  alreadyPurchased?: boolean;
  downloadUrl?: string;
}

export function BuyButton({
  productId,
  price,
  currency = 'INR',
  className,
  alreadyPurchased,
  downloadUrl,
}: BuyButtonProps) {
  const { status, errorMessage, initiateCheckout } = useBuyProduct(productId);

  const priceFormatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(price);

  if (alreadyPurchased) {
    return (
      <a
        href={downloadUrl ?? '/dashboard/purchases'}
        className={cn(
          'flex items-center justify-center gap-2 w-full py-4 px-6 rounded-xl font-semibold text-base',
          'bg-emerald-600 hover:bg-emerald-500 text-white transition-all duration-200',
          className
        )}
      >
        <Download className="w-5 h-5" />
        Download Product
      </a>
    );
  }

  const isLoading =
    status === 'creating-order' ||
    status === 'verifying' ||
    status === 'payment-open';

  const buttonLabel = {
    idle: `Buy Now — ${priceFormatted}`,
    'creating-order': 'Creating order…',
    'payment-open': 'Complete payment…',
    verifying: 'Verifying payment…',
    success: 'Payment successful!',
    failed: `Retry — ${priceFormatted}`,
    dismissed: `Buy Now — ${priceFormatted}`,
  }[status];

  const buttonIcon = {
    idle: <ShoppingCart className="w-5 h-5" />,
    'creating-order': <Loader2 className="w-5 h-5 animate-spin" />,
    'payment-open': <Loader2 className="w-5 h-5 animate-spin" />,
    verifying: <Loader2 className="w-5 h-5 animate-spin" />,
    success: <CheckCircle className="w-5 h-5" />,
    failed: <AlertCircle className="w-5 h-5" />,
    dismissed: <ShoppingCart className="w-5 h-5" />,
  }[status];

  return (
    <div className="w-full space-y-3">
      <button
        onClick={initiateCheckout}
        disabled={isLoading || status === 'success'}
        className={cn(
          'flex items-center justify-center gap-2 w-full py-4 px-6 rounded-xl font-semibold text-base',
          'transition-all duration-200 select-none',
          status === 'success'
            ? 'bg-emerald-600 text-white cursor-default'
            : status === 'failed'
            ? 'bg-red-600 hover:bg-red-500 text-white'
            : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 hover:-translate-y-0.5 active:translate-y-0',
          isLoading && 'opacity-80 cursor-not-allowed',
          className
        )}
      >
        {buttonIcon}
        {buttonLabel}
      </button>

      {errorMessage && (
        <p className="text-sm text-red-400 text-center flex items-center justify-center gap-1">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {errorMessage}
        </p>
      )}

      {status === 'dismissed' && (
        <p className="text-sm text-slate-400 text-center">
          Payment window closed. Click to try again.
        </p>
      )}

      <p className="text-xs text-slate-500 text-center flex items-center justify-center gap-1">
        🔒 Secured by Razorpay · UPI, Cards, Netbanking accepted
      </p>
    </div>
  );
}
