"use client";

import { useRouter } from "next/navigation";
import { DataTable } from "@/components/common/data-table";
import { ExportStatusBadge } from "@/components/dashboard/product-detail/export-status-badge";
import type { ExportStatus } from "@/types/export";


interface ProductRow {
  id: string;
  name: string;
  price: string;
  type: string;
  sales: number;
  status: string;
  exportStatus: ExportStatus;
}


interface ProductsTableProps {
  data: ProductRow[];
  error?: boolean;
}

const STATUS_STYLES: Record<string, string> = {
  Active: "bg-green-500/10 text-green-600 dark:text-green-400",
  Draft: "bg-muted text-muted-foreground",
  Archived: "bg-red-500/10 text-red-600 dark:text-red-400",
};

/**
 * Client component wrapper for the products DataTable.
 *
 * WHY: DataTable accepts `render` functions in column definitions.
 * render functions are not serializable — they CANNOT be defined in
 * a Server Component and passed to a Client Component as props.
 * This wrapper lives on the client side, so render functions are safe here.
 */
export function ProductsTable({ data, error }: ProductsTableProps) {
  const router = useRouter();

  return (
    <DataTable
      data={data}
      onRowClick={(row) => router.push(`/dashboard/products/${row.id}`)}
      columns={[
        { key: "name", header: "Product Name" },
        { key: "type", header: "Type" },
        { key: "price", header: "Price" },
        { key: "sales", header: "Sales" },
        {
          key: "status",
          header: "Status",
          render: (item) => (
            <span
              className={`text-xs px-2 py-1 rounded-full font-medium ${
                STATUS_STYLES[item.status] ?? "bg-muted text-muted-foreground"
              }`}
            >
              {item.status}
            </span>
          ),
        },
        {
          key: "exportStatus",
          header: "Export Status",
          render: (item) => <ExportStatusBadge status={item.exportStatus} />,
        },
      ]}
      emptyMessage={
        error ? "Error loading products." : "No products yet. Create your first product!"
      }
    />
  );
}
