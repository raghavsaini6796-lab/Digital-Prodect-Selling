import type { Metadata } from "next";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/page-header";
import { SectionLayout } from "@/components/common/section-layout";
import { createClient } from "@/lib/supabase/server";
import { CreateOrderModal } from "@/components/dashboard/create-order-modal";
import { OrdersTable } from "@/components/dashboard/orders-table";

export const metadata: Metadata = {
  title: "Orders",
  description: "View and manage customer orders.",
};

export default async function OrdersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id ?? "";

  const [{ data: orders, error }, { data: products }] = await Promise.all([
    supabase
      .from("orders")
      .select("id, customer_email, amount, order_status, created_at, products(title)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    supabase
      .from("products")
      .select("id, title, price")
      .eq("user_id", userId)
      .eq("status", "Active"),
  ]);

  const rows = (orders ?? []).map((o) => {
    const prod = o.products as { title?: string } | null;
    return {
      id: o.id.split("-")[0].toUpperCase(),
      customer: o.customer_email,
      product: prod?.title ?? "Unknown Product",
      amount: `₹${(o.amount ?? 0).toFixed(2)}`,
      date: new Date(o.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      order_status: o.order_status ?? "Pending",
    };
  });

  return (
    <SectionLayout>
      <PageHeader
        title="Orders"
        description="View recent sales, customer details, and transaction history."
      >
        <div className="flex gap-3">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <CreateOrderModal products={products ?? []} />
        </div>
      </PageHeader>

      {/* ✅ Client component — render functions stay on client side */}
      <OrdersTable data={rows} error={!!error} />
    </SectionLayout>
  );
}
