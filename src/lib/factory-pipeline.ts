import { Redis } from '@upstash/redis';

// Note: In client-side code, we can't directly use @upstash/redis with env variables.
// The scheduling should ideally call the /api/factory/schedule route.
// I will adapt the DeepSeek code slightly to ensure it runs correctly on the client/frontend.

export async function runAutoPilotPipeline(userId: string) {
  let currentStatus = "Initializing...";
  try {
    // Step 1: Research Viral Topic
    currentStatus = "Researching market trends...";
    const researchRes = await fetch('/api/factory/research', { method: 'POST' });
    const { research } = await researchRes.json();
    if (!research) throw new Error('Research failed');

    // Step 2: Generate Product
    currentStatus = `Writing high-conversion content about "${research.topic}"...`;
    const productRes = await fetch('/api/factory/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: research.topic,
        audience: research.audience,
        productType: research.productType,
        tone: "exciting and direct"
      }),
    });
    const productData = await productRes.json();
    if (!productData.success) throw new Error('Generation failed');
    const product = productData.product;

    // Step 3: Generate Cover
    currentStatus = "Designing viral cover...";
    const coverRes = await fetch('/api/factory/cover', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: product.title,
        subtitle: product.subtitle,
      }),
    });
    const cover = await coverRes.json();
    if (!cover.success) throw new Error('Cover generation failed');
    const coverUrl = cover.imageUrl;

    // Step 4: Save to Supabase
    currentStatus = "Packaging product...";
    const supabaseRes = await fetch('/api/factory/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...product,
        price: research.price,
        coverImageUrl: coverUrl,
        userId,
      }),
    });
    const { productId } = await supabaseRes.json();

    // Step 5: Schedule IG Post
    currentStatus = "Scheduling viral post...";
    const scheduleRes = await fetch('/api/factory/schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId,
        caption: `🔥 ${product.title}\n\n${product.hook}\n\nDM "BUY" to grab (₹${research.price})`,
        hashtags: ['#DigitalProduct', '#MakeMoneyOnline', '#SideHustle'],
        mediaUrl: coverUrl,
        scheduledTime: Date.now() + 86400000 // 24h from now
      }),
    });

    return { 
      success: true,
      status: "Cash cow generated successfully!",
      productId,
      product,
      coverUrl
    };

  } catch (error: any) {
    console.error('Auto-pilot error:', error);
    return { 
      success: false,
      status: `Failed at: ${currentStatus}`,
      error: error.message 
    };
  }
}
