import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: Request) {
  try {
    const { productId } = await req.json();
    
    // Check for razorpay keys
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.warn("Razorpay keys are missing. Skipping real payment creation for development/demo mode.");
      return NextResponse.json({
        success: true,
        order: {
          id: `demo_order_${Date.now()}`,
          amount: 99 * 100,
        }
      });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    
    // Verify product details
    const supabase = createClient();
    const { data: product, error } = await supabase
      .from('factory_products')
      .select('title, price')
      .eq('id', productId)
      .single();

    if (error || !product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const priceToCharge = product.price || 99; // Fallback price just in case

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: priceToCharge * 100, // Convert rupees to paise
      currency: 'INR',
      receipt: `order_${productId}`,
      notes: {
        productId: productId,
      },
    });

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount / 100, // Return amount in rupees
      }
    });

  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    );
  }
}
