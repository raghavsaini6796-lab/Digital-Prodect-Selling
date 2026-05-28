import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getExportLogs } from "@/services/export/export-logger";
import { ProductDetailView } from "@/components/dashboard/product-detail/product-detail-view";
import type { Product, ExportLog } from "@/types/supabase";

// ─── Dynamic metadata ─────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("products")
    .select("title, description")
    .eq("id", id)
    .maybeSingle();

  return {
    title: data?.title ?? "Product Detail",
    description: data?.description ?? "Manage and export your digital product.",
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) notFound();

  // Fetch full product row (including export columns added in migration 0004)
  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !product) {
    notFound();
  }

  // Fetch export history (admin client used internally)
  const exportLogs: ExportLog[] = await getExportLogs(id);

  return (
    <ProductDetailView
      product={product as Product}
      exportLogs={exportLogs}
    />
  );
}
