'use client';

import { useState, useCallback } from 'react';
import { createPaymentOrder, verifyAndFulfillPayment, handleFailedPayment } from '@/app/actions/payment';
import { useRouter } from 'next/navigation';

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: { email?: string; name?: string };
  theme?: { color: string };
  handler: (response: RazorpayResponse) => void;
  modal?: { ondismiss: () => void };
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, cb: (response: { error: { description: string } }) => void) => void;
}

export type CheckoutStatus =
  | 'idle'
  | 'creating-order'
  | 'payment-open'
  | 'verifying'
  | 'success'
  | 'failed'
  | 'dismissed';

interface UseBuyProductReturn {
  status: CheckoutStatus;
  errorMessage: string | null;
  downloadUrl: string | null;
  initiateCheckout: () => Promise<void>;
}

export function useBuyProduct(productId: string): UseBuyProductReturn {
  const [status, setStatus] = useState<CheckoutStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const router = useRouter();

  const loadRazorpayScript = (): Promise<boolean> =>
    new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const initiateCheckout = useCallback(async () => {
    setStatus('creating-order');
    setErrorMessage(null);

    // Load Razorpay SDK
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      setStatus('failed');
      setErrorMessage('Payment gateway failed to load. Please refresh and try again.');
      return;
    }

    // Create order server-side
    const result = await createPaymentOrder(productId);
    if ('error' in result && result.error) {
      setStatus('failed');
      setErrorMessage(result.error);
      return;
    }

    setStatus('payment-open');

    const options: RazorpayOptions = {
      key: result.keyId!,
      amount: result.amount!,
      currency: result.currency!,
      name: process.env.NEXT_PUBLIC_APP_NAME ?? 'D Product Selling',
      description: result.productName!,
      order_id: result.razorpayOrderId!,
      prefill: { email: result.userEmail },
      theme: { color: '#7c3aed' },

      handler: async (response: RazorpayResponse) => {
        setStatus('verifying');
        const verifyResult = await verifyAndFulfillPayment({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
          orderId: result.orderId!,
        });

        if ('error' in verifyResult && verifyResult.error) {
          setStatus('failed');
          setErrorMessage(verifyResult.error);
          return;
        }

        setStatus('success');
        setDownloadUrl(verifyResult.downloadUrl ?? null);
        router.push(`/payment/success?orderId=${result.orderId}`);
      },

      modal: {
        ondismiss: () => {
          setStatus('dismissed');
        },
      },
    };

    const rzp = new window.Razorpay(options);

    rzp.on('payment.failed', async (response) => {
      setStatus('failed');
      setErrorMessage(response.error.description);
      await handleFailedPayment({
        razorpay_order_id: result.razorpayOrderId!,
        error_description: response.error.description,
      });
      router.push(`/payment/failed?orderId=${result.orderId}`);
    });

    rzp.open();
  }, [productId, router]);

  return { status, errorMessage, downloadUrl, initiateCheckout };
}
