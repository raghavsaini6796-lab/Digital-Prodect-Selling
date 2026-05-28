import type { Metadata } from "next";
import { Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/common/page-header";
import { SectionLayout } from "@/components/common/section-layout";
import { createClient } from "@/lib/supabase/server";
import { CreateProductModal } from "@/components/dashboard/create-product-modal";
import { ProductsTable } from "@/components/dashboard/products-table";

export const metadata: Metadata = {
  title: "Products",
  description: "Manage your digital products.",
};

export default async function ProductsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: products, error } = await supabase
    .from("products")
    .select("id, title, price, type, status, export_status, created_at")
    .eq("user_id", user?.id ?? "")
    .order("created_at", { ascending: false });

  const rows = (products ?? []).map((p) => ({
    id: p.id,
    name: p.title,
    price: `₹${(p.price ?? 0).toFixed(2)}`,
    type: p.type ?? "—",
    sales: 0,
    status: p.status ?? "Draft",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    exportStatus: ((p as any).export_status ?? "idle") as import("@/types/export").ExportStatus,
  }));


  return (
    <SectionLayout>
      <PageHeader
        title="Products"
        description="Manage your digital products, pricing, and availability."
      >
        <CreateProductModal />
      </PageHeader>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search products..."
            className="pl-8"
          />
        </div>
        <Button variant="outline" size="icon" aria-label="Filter">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* ✅ Client component — render functions stay on client side */}
      <ProductsTable data={rows} error={!!error} />
    </SectionLayout>
  );
}
