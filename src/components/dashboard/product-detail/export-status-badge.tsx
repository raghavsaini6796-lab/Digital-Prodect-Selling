"use client";

// ─── Export Status Badge ──────────────────────────────────────────────────────

import type { ExportStatus } from "@/types/export";

const STATUS_CONFIG: Record<
  ExportStatus,
  { label: string; className: string }
> = {
  idle: {
    label: "Not Exported",
    className:
      "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400",
  },
  pending: {
    label: "Exporting…",
    className:
      "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 animate-pulse",
  },
  done: {
    label: "Exported",
    className:
      "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  failed: {
    label: "Export Failed",
    className:
      "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
};

const STATUS_DOTS: Record<ExportStatus, string> = {
  idle: "bg-neutral-400",
  pending: "bg-amber-500",
  done: "bg-emerald-500",
  failed: "bg-red-500",
};

interface ExportStatusBadgeProps {
  status: ExportStatus;
}

export function ExportStatusBadge({ status }: ExportStatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <span className={config.className}>
      <span
        className={`h-1.5 w-1.5 rounded-full ${STATUS_DOTS[status]} ${
          status === "pending" ? "animate-ping" : ""
        }`}
        aria-hidden="true"
      />
      {config.label}
    </span>
  );
}
