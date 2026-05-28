"use client";

import { DataTable } from "@/components/common/data-table";

interface OrderRow {
  id: string;
  customer: string;
  product: string;
  amount: string;
  date: string;
  order_status: string;
}

interface OrdersTableProps {
  data: OrderRow[];
  error?: boolean;
}

const STATUS_STYLES: Record<string, string> = {
  Completed: "bg-green-500/10 text-green-600 dark:text-green-400",
  Pending: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  Refunded: "bg-red-500/10 text-red-600 dark:text-red-400",
  Cancelled: "bg-red-500/10 text-red-600 dark:text-red-400",
};

/**
 * Client component wrapper for the orders DataTable.
 * Keeps render functions on the client side to avoid serialization errors.
 */
export function OrdersTable({ data, error }: OrdersTableProps) {
  return (
    <DataTable
      data={data}
      columns={[
        { key: "id", header: "Order ID" },
        { key: "customer", header: "Customer" },
        { key: "product", header: "Product" },
        { key: "amount", header: "Amount" },
        { key: "date", header: "Date" },
        {
          key: "order_status",
          header: "Status",
          render: (item) => (
            <span
              className={`text-xs px-2 py-1 rounded-full font-medium ${
                STATUS_STYLES[item.order_status] ?? "bg-muted text-muted-foreground"
              }`}
            >
              {item.order_status}
            </span>
          ),
        },
      ]}
      emptyMessage={error ? "Error loading orders." : "No orders found."}
    />
  );
}
