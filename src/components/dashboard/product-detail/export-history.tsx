"use client";

// ─── Export History Table ─────────────────────────────────────────────────────
// Displays the export_logs entries for a product in a clean table.

import { useState } from "react";
import {
  FileText,
  Package,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { ExportLog } from "@/types/supabase";
import { ExportStatusBadge } from "./export-status-badge";
import type { ExportStatus } from "@/types/export";
import { formatFileSize } from "@/lib/export/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ExportHistoryProps {
  logs: ExportLog[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ExportHistory({ logs }: ExportHistoryProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const visibleLogs = isExpanded ? logs : logs.slice(0, 5);
  const hasMore = logs.length > 5;

  if (logs.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="text-sm font-semibold text-foreground mb-1">
          Export History
        </h3>
        <p className="text-xs text-muted-foreground">
          No exports yet. Use the export buttons above to generate your first
          PDF or ZIP.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="px-6 py-4 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Export History
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {logs.length} export{logs.length !== 1 ? "s" : ""} total
          </p>
        </div>
      </div>

      {/* ── Table ────────────────────────────────────────────────────────── */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm" id="export-history-table">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Version
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Size
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Link
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {visibleLogs.map((log) => (
              <ExportLogRow key={log.id} log={log} />
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Show more / less ─────────────────────────────────────────────── */}
      {hasMore && (
        <div className="px-6 py-3 border-t border-border">
          <button
            onClick={() => setIsExpanded((e) => !e)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            id="export-history-toggle"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-3.5 w-3.5" />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className="h-3.5 w-3.5" />
                Show all {logs.length} exports
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Table row ────────────────────────────────────────────────────────────────

function ExportLogRow({ log }: { log: ExportLog }) {
  return (
    <tr className="hover:bg-muted/20 transition-colors">
      {/* Type */}
      <td className="px-6 py-3">
        <div className="flex items-center gap-2">
          {log.export_type === "pdf" ? (
            <FileText className="h-4 w-4 text-blue-500 shrink-0" />
          ) : (
            <Package className="h-4 w-4 text-violet-500 shrink-0" />
          )}
          <span className="text-xs font-medium uppercase text-foreground">
            {log.export_type}
          </span>
        </div>
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <ExportStatusBadge status={log.status as ExportStatus} />
      </td>

      {/* Version */}
      <td className="px-4 py-3">
        <span className="font-mono text-xs text-muted-foreground">
          {log.version}
        </span>
      </td>

      {/* File size */}
      <td className="px-4 py-3">
        <span className="text-xs text-muted-foreground">
          {log.file_size_bytes
            ? formatFileSize(log.file_size_bytes)
            : "—"}
        </span>
      </td>

      {/* Date */}
      <td className="px-4 py-3">
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {formatDate(log.created_at)}
        </span>
      </td>

      {/* Download link */}
      <td className="px-4 py-3">
        {log.public_url && log.status === "done" ? (
          <a
            href={log.public_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            id={`download-log-${log.id}`}
          >
            <ExternalLink className="h-3 w-3" />
            Download
          </a>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </td>
    </tr>
  );
}
