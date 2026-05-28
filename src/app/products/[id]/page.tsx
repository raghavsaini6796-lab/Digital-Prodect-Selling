import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { BuyButton } from '@/components/checkout/BuyButton';
import {
  Package, Star, Shield, Download, Clock,
  Tag, FileText, Image, Music, Video, File, CheckCircle
} from 'lucide-react';

function ProductTypeIcon({ type }: { type?: string }) {
  const map: Record<string, React.ReactNode> = {
    'Image Bundle': <Image className="w-6 h-6" />,
    'Document':     <FileText className="w-6 h-6" />,
    'Template':     <FileText className="w-6 h-6" />,
    'Audio':        <Music className="w-6 h-6" />,
    'Video':        <Video className="w-6 h-6" />,
  };
  return <>{map[type ?? ''] ?? <File className="w-6 h-6" />}</>;
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch product (active + draft both visible publicly)
  const { data: product, error } = await supabase
    .from('products')
    .select('id, title, description, price, type, status, thumbnail_url, tags, ai_generated, sections, cta, created_at')
    .eq('id', id)
    .in('status', ['Active', 'Draft'])
    .single();

  if (error || !product) notFound();

  // Check auth & existing purchase
  const { data: { user } } = await supabase.auth.getUser();
  let alreadyPurchased = false;
  let activeDownloadToken: string | null = null;

  if (user) {
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('id, download_tokens(token, expires_at, download_count, max_downloads)')
      .eq('user_id', user.id)
      .eq('product_id', id)
      .eq('payment_status', 'paid')
      .maybeSingle();

    if (existingOrder) {
      alreadyPurchased = true;
      const tokens = existingOrder.download_tokens as { token: string; expires_at: string; download_count: number; max_downloads: number }[] | null;
      const valid = tokens?.find(
        (t) => new Date(t.expires_at) > new Date() && t.download_count < t.max_downloads
      );
      activeDownloadToken = valid?.token ?? null;
    }
  }

  const price = product.price ?? 0;
  const priceFormatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);

  const sections = product.sections as Record<string, string>[] | null;
  const tags = product.tags as string[] | null;

  const features = [
    'Instant digital delivery',
    'Secure download link',
    '7-day access, up to 5 downloads',
    '100% satisfaction guaranteed',
  ];

  return (
    <div className="min-h-screen bg-[#0f0f17]">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">

          {/* ── Left: Product Info ── */}
          <div className="lg:col-span-3 space-y-8">

            {/* Type + AI Badge */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-medium">
                <ProductTypeIcon type={product.type} />
                {product.type}
              </span>
              {product.ai_generated && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium">
                  ✦ AI Generated
                </span>
              )}
              {tags?.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 text-slate-400 text-xs"
                >
                  <Tag className="w-2.5 h-2.5" />
                  {tag}
                </span>
              ))}
            </div>

            {/* Title */}
            <div>
              <h1 className="text-4xl font-bold text-white leading-tight mb-4">{product.title}</h1>
              {product.description && (
                <p className="text-slate-400 text-lg leading-relaxed">{product.description}</p>
              )}
            </div>

            {/* Thumbnail */}
            {product.thumbnail_url && (
              <div className="rounded-2xl overflow-hidden border border-white/5 aspect-video bg-[#1a1a2e]">
                <img
                  src={product.thumbnail_url}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {!product.thumbnail_url && (
              <div className="rounded-2xl border border-white/5 bg-gradient-to-br from-violet-900/20 to-indigo-900/20 aspect-video flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center mx-auto mb-3 text-white">
                    <ProductTypeIcon type={product.type} />
                  </div>
                  <p className="text-slate-400 text-sm">{product.title}</p>
                </div>
              </div>
            )}

            {/* Sections / Content */}
            {sections && sections.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-white font-semibold text-lg">What's Included</h2>
                <div className="space-y-3">
                  {sections.map((section, i) => (
                    <div
                      key={i}
                      className="bg-[#1a1a2e] border border-white/5 rounded-xl p-4"
                    >
                      {section.title && (
                        <h3 className="text-white font-medium mb-1">{section.title}</h3>
                      )}
                      {section.content && (
                        <p className="text-slate-400 text-sm leading-relaxed">{section.content}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Right: Checkout Card ── */}
          <div className="lg:col-span-2">
            <div className="sticky top-8">
              <div className="bg-[#1a1a2e] border border-violet-500/20 rounded-2xl overflow-hidden shadow-2xl shadow-violet-500/5">

                {/* Price Header */}
                <div className="bg-gradient-to-br from-violet-900/40 to-indigo-900/40 p-6 border-b border-white/5">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-4xl font-bold text-white">{priceFormatted}</span>
                    <span className="text-slate-400 text-sm">one-time</span>
                  </div>
                  <p className="text-slate-400 text-sm">No subscription · Instant access</p>
                </div>

                {/* Buy Section */}
                <div className="p-6 space-y-4">

                  {/* Already purchased info */}
                  {alreadyPurchased && (
                    <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm">
                      <CheckCircle className="w-4 h-4 flex-shrink-0" />
                      You already own this product
                    </div>
                  )}

                  <BuyButton
                    productId={product.id}
                    price={price}
                    currency="INR"
                    alreadyPurchased={alreadyPurchased}
                    downloadUrl={activeDownloadToken ? `/api/download/${activeDownloadToken}` : undefined}
                  />

                  {/* Features */}
                  <ul className="space-y-2.5 pt-2">
                    {features.map((f) => (
                      <li key={f} className="flex items-center gap-2.5 text-sm text-slate-400">
                        <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Trust Badges */}
                <div className="border-t border-white/5 p-5">
                  <div className="grid grid-cols-3 gap-3 text-center">
                    {[
                      { icon: <Shield className="w-4 h-4" />, label: 'Secure' },
                      { icon: <Download className="w-4 h-4" />, label: 'Instant' },
                      { icon: <Star className="w-4 h-4" />, label: 'Quality' },
                    ].map(({ icon, label }) => (
                      <div key={label} className="flex flex-col items-center gap-1">
                        <span className="text-violet-400">{icon}</span>
                        <span className="text-xs text-slate-500">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* CTA below card */}
              {product.cta && (
                <p className="text-center text-slate-400 text-sm mt-4 px-2">{product.cta}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
