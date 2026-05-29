'use client';

import { createClient } from '@/utils/supabase/client';
import { useState, useEffect } from 'react';
import { Check, Shield } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function ProductPage() {
  const params = useParams<{ id: string }>();
  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('factory_products')
          .select('*')
          .eq('id', params.id)
          .single();

        if (error) throw error;
        setProduct(data);
      } catch (err) {
        setError('Product not found');
      } finally {
        setIsLoading(false);
      }
    };
    if (params?.id) {
      fetchProduct();
    }
  }, [params?.id]);

  const handlePurchase = async () => {
    if (!product) return;
    setIsPurchasing(true);

    try {
      // Create Razorpay order
      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id }),
      });
      
      const responseData = await res.json();
      
      if (!responseData.order) {
        throw new Error("Failed to create order");
      }
      
      const { order } = responseData;

      // Load Razorpay script dynamically
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        const rzp = new (window as any).Razorpay({
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Ensure you add this to .env.local
          amount: order.amount,
          currency: 'INR',
          name: product.title,
          description: product.subtitle,
          image: product.cover_image_url,
          order_id: order.id,
          handler: function(response: any) {
            // Payment success callback
            console.log("Payment Successful", response);
            setShowPaymentSuccess(true);
          },
          prefill: {
            email: '', 
          },
          theme: {
            color: '#16a34a' // matches the green-600 button
          }
        });

        rzp.open();
        setIsPurchasing(false);
      };
      
      script.onerror = () => {
         throw new Error("Razorpay SDK failed to load");
      };
    } catch (error) {
      console.error('Payment error:', error);
      alert("Payment initialization failed. Please try again.");
      setIsPurchasing(false);
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center">{error}</div>;

  // Use a fallback price if not in DB yet (we will add price to DB soon)
  const displayPrice = product.price || 99;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-2xl mx-auto p-6">
        {/* Product Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <img 
            src={product.cover_image_url || 'https://via.placeholder.com/800x400?text=Viral+Product'} 
            alt={product.title}
            className="w-full h-64 object-cover"
          />
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-4">{product.title}</h1>
            <p className="text-gray-600 mb-6">{product.subtitle}</p>
            
            {/* Hook Section */}
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <p className="text-blue-800 font-medium">✨ Viral Hook: {product.hook}</p>
            </div>

            {/* Purchase Section */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center justify-between mb-6">
                <div className="text-3xl font-bold text-gray-900">₹{displayPrice}</div>
                <div className="flex items-center gap-2 text-green-600 font-semibold">
                  <Shield className="w-5 h-5" />
                  <span>Secure Payment</span>
                </div>
              </div>

              <button
                onClick={handlePurchase}
                disabled={isPurchasing}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 px-6 rounded-lg text-lg transition-all transform hover:scale-105 focus:scale-95 active:scale-95 shadow-md disabled:opacity-70 disabled:hover:scale-100"
              >
                {isPurchasing ? 'Securely Processing...' : `Buy Now - ₹${displayPrice}`}
              </button>
              <p className="text-center text-xs text-gray-400 mt-4">Payments processed securely via Razorpay</p>
            </div>
          </div>
        </div>

        {/* Payment Success Modal */}
        {showPaymentSuccess && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white p-8 rounded-2xl max-w-md w-full text-center shadow-2xl transform transition-all">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-gray-900">Payment Successful! 🎉</h2>
              <p className="text-gray-600 mb-8">
                Your payment of ₹{displayPrice} was received. We have sent the download instructions to your email. Thank you for your purchase!
              </p>
              <button
                onClick={() => setShowPaymentSuccess(false)}
                className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-semibold transition-colors"
              >
                Download Product Now
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
