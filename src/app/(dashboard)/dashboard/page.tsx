import type { Metadata } from "next";
import { DollarSign, Package, ShoppingCart, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/page-header";
import { SectionLayout } from "@/components/common/section-layout";
import { DataTable } from "@/components/common/data-table";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ROUTES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your product and Instagram selling overview.",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user?.id ?? "";

  // Fetch metrics concurrently
  const [{ data: orders }, { data: products }, { data: generations }] =
    await Promise.all([
      supabase
        .from("orders")
        .select("amount, created_at, order_status, products(title)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
      supabase.from("products").select("id, status").eq("user_id", userId),
      supabase
        .from("ai_generations") // ✅ correct table name
        .select("name, generation_type, status, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  // Calculate metrics
  const totalRevenue = (orders ?? []).reduce(
    (sum, o) => sum + (o.order_status === "Completed" ? (o.amount ?? 0) : 0), // ✅ order_status
    0
  );
  const totalOrders = (orders ?? []).length;
  const activeProducts = (products ?? []).filter(
    (p) => p.status === "Active"
  ).length;

  // Recent sales rows
  const recentSales = (orders ?? []).slice(0, 5).map((order, i) => {
    const prod = order.products as { title?: string } | null;
    return {
      id: i.toString(),
      product: prod?.title ?? "Unknown Product",
      amount: `₹${(order.amount ?? 0).toFixed(2)}`,
      date: new Date(order.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      status: order.order_status ?? "Pending",
    };
  });

  // Recent AI generation rows
  const recentGenerations = (generations ?? []).map((gen, i) => ({
    id: i.toString(),
    name: gen.name,
    type: gen.generation_type,
    status: gen.status,
  }));

  return (
    <SectionLayout>
      <PageHeader
        title="Dashboard"
        description="Welcome back. Here's what's happening with your store."
      >
        <Link href={ROUTES.products}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Product
          </Button>
        </Link>
      </PageHeader>

      {/* Metric cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{totalRevenue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Lifetime earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">Total orders received</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProducts}</div>
            <p className="text-xs text-muted-foreground">Currently on sale</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Generations</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(generations ?? []).length}</div>
            <p className="text-xs text-muted-foreground">Total generated</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent activity tables */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              data={recentSales}
              columns={[
                { key: "product", header: "Product" },
                { key: "amount", header: "Amount" },
                { key: "date", header: "Date" },
              ]}
              emptyMessage="No recent sales."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent AI Generations</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              data={recentGenerations}
              columns={[
                { key: "name", header: "Name" },
                { key: "type", header: "Type" },
                { key: "status", header: "Status" },
              ]}
              emptyMessage="No recent generations."
            />
          </CardContent>
        </Card>
      </div>
    </SectionLayout>
  );
}
