import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { 
      title, 
      subtitle, 
      hook, 
      sections, 
      cta, 
      upsell, 
      coverImageUrl, 
      userId 
    } = data;

    const { data: product, error } = await supabase
      .from('factory_products')
      .insert([
        {
          title,
          subtitle,
          hook,
          sections,
          cta,
          upsell,
          cover_image_url: coverImageUrl,
          user_id: userId || null // Optional if testing without auth
        }
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      productId: product.id,
      product
    });

  } catch (error) {
    console.error('Save to database error:', error);
    return NextResponse.json(
      { error: 'Failed to save product to database' },
      { status: 500 }
    );
  }
}
