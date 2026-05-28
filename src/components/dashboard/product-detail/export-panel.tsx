"use client";

// ─── Export Panel ─────────────────────────────────────────────────────────────
// Provides PDF and ZIP export buttons with progress states,
// download links, file sizes, and error handling.

import { useState, useTransition } from "react";
import {
  FileText,
  Package,
  Download,
  Loader2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExportStatusBadge } from "./export-status-badge";
import { exportProductPdf, exportProductZip } from "@/app/actions/export";
import type { ExportStatus } from "@/types/export";
import { formatFileSize } from "@/lib/export/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ExportState {
  status: ExportStatus;
  url?: string;
  fileSizeBytes?: number;
  version?: string;
  error?: string;
}

interface ExportPanelProps {
  productId: string;
  /** Pre-populated from server-fetched product row */
  initialPdfUrl?: string | null;
  initialZipUrl?: string | null;
  initialExportStatus?: ExportStatus;
  initialVersion?: string;
  initialExportMeta?: {
    pdfFileSizeBytes?: number;
    zipFileSizeBytes?: number;
  } | null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ExportPanel({
  productId,
  initialPdfUrl,
  initialZipUrl,
  initialExportStatus = "idle",
  initialVersion,
  initialExportMeta,
}: ExportPanelProps) {
  const [isPdfPending, startPdfTransition] = useTransition();
  const [isZipPending, startZipTransition] = useTransition();

  const [pdfState, setPdfState] = useState<ExportState>({
    status: initialPdfUrl ? "done" : initialExportStatus,
    url: initialPdfUrl ?? undefined,
    fileSizeBytes: initialExportMeta?.pdfFileSizeBytes,
    version: initialVersion,
  });

  const [zipState, setZipState] = useState<ExportState>({
    status: initialZipUrl ? "done" : "idle",
    url: initialZipUrl ?? undefined,
    fileSizeBytes: initialExportMeta?.zipFileSizeBytes,
    version: initialVersion,
  });

  // ── PDF export handler ─────────────────────────────────────────────────────

  function handleExportPdf() {
    setPdfState((s) => ({ ...s, status: "pending", error: undefined }));

    startPdfTransition(async () => {
      const result = await exportProductPdf(productId);

      if (result.success) {
        setPdfState({
          status: "done",
          url: result.url,
          fileSizeBytes: result.fileSizeBytes,
          version: result.version,
        });
      } else {
        setPdfState((s) => ({
          ...s,
          status: "failed",
          error: result.error ?? "Export failed. Please try again.",
        }));
      }
    });
  }

  // ── ZIP export handler ─────────────────────────────────────────────────────

  function handleExportZip() {
    setZipState((s) => ({ ...s, status: "pending", error: undefined }));

    startZipTransition(async () => {
      const result = await exportProductZip(productId);

      if (result.success) {
        setZipState({
          status: "done",
          url: result.url,
          fileSizeBytes: result.fileSizeBytes,
          version: result.version,
        });
      } else {
        setZipState((s) => ({
          ...s,
          status: "failed",
          error: result.error ?? "Export failed. Please try again.",
        }));
      }
    });
  }

  const isAnyExporting = isPdfPending || isZipPending;

  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-6">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Export Product
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Generate downloadable files from this product.
          </p>
        </div>
        {initialVersion && (
          <span className="text-xs text-muted-foreground font-mono">
            {initialVersion}
          </span>
        )}
      </div>

      {/* ── PDF Export Card ─────────────────────────────────────────────────── */}
      <ExportCard
        icon={<FileText className="h-5 w-5" />}
        title="PDF Document"
        description="Professional PDF with cover page, TOC, and branded sections."
        status={pdfState.status}
        url={pdfState.url}
        fileSizeBytes={pdfState.fileSizeBytes}
        version={pdfState.version}
        error={pdfState.error}
        isLoading={isPdfPending}
        isDisabled={isAnyExporting}
        onExport={handleExportPdf}
        onRetry={handleExportPdf}
        downloadFilename={`product-${productId.slice(0, 8)}.pdf`}
        exportId="export-pdf"
      />

      {/* ── ZIP Export Card ─────────────────────────────────────────────────── */}
      <ExportCard
        icon={<Package className="h-5 w-5" />}
        title="ZIP Bundle"
        description="Complete package with PDF, bonus content, README, and metadata."
        status={zipState.status}
        url={zipState.url}
        fileSizeBytes={zipState.fileSizeBytes}
        version={zipState.version}
        error={zipState.error}
        isLoading={isZipPending}
        isDisabled={isAnyExporting}
        onExport={handleExportZip}
        onRetry={handleExportZip}
        downloadFilename={`product-${productId.slice(0, 8)}.zip`}
        exportId="export-zip"
      />
    </div>
  );
}

// ─── Export Card sub-component ────────────────────────────────────────────────

interface ExportCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  status: ExportStatus;
  url?: string;
  fileSizeBytes?: number;
  version?: string;
  error?: string;
  isLoading: boolean;
  isDisabled: boolean;
  onExport: () => void;
  onRetry: () => void;
  downloadFilename: string;
  exportId: string;
}

function ExportCard({
  icon,
  title,
  description,
  status,
  url,
  fileSizeBytes,
  version,
  error,
  isLoading,
  isDisabled,
  onExport,
  onRetry,
  downloadFilename,
  exportId,
}: ExportCardProps) {
  return (
    <div
      className={`rounded-lg border p-4 transition-colors ${
        status === "done"
          ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-800/40 dark:bg-emerald-950/20"
          : status === "failed"
          ? "border-red-200 bg-red-50/50 dark:border-red-800/40 dark:bg-red-950/20"
          : "border-border bg-background"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={`mt-0.5 shrink-0 ${
            status === "done"
              ? "text-emerald-600 dark:text-emerald-400"
              : status === "failed"
              ? "text-red-500"
              : "text-muted-foreground"
          }`}
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
          ) : status === "done" ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          ) : status === "failed" ? (
            <AlertCircle className="h-5 w-5 text-red-500" />
          ) : (
            icon
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-medium text-foreground">{title}</p>
            <ExportStatusBadge status={status} />
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>

          {/* Progress text */}
          {isLoading && (
            <p className="mt-2 text-xs text-amber-600 dark:text-amber-400 font-medium">
              Generating your {title.toLowerCase()}… This may take a few
              seconds.
            </p>
          )}

          {/* Error message */}
          {status === "failed" && error && (
            <p className="mt-2 text-xs text-red-600 dark:text-red-400">
              {error}
            </p>
          )}

          {/* Success metadata */}
          {status === "done" && (url || fileSizeBytes) && (
            <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
              {fileSizeBytes && (
                <span>{formatFileSize(fileSizeBytes)}</span>
              )}
              {version && (
                <span className="font-mono">{version}</span>
              )}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="shrink-0 flex items-center gap-2">
          {/* Download button */}
          {status === "done" && url && (
            <a
              id={`download-${exportId}`}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              download={downloadFilename}
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium bg-foreground text-background hover:bg-foreground/90 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              Download
            </a>
          )}

          {/* Re-export / Retry button */}
          {(status === "done" || status === "failed") && (
            <Button
              id={`retry-${exportId}`}
              variant="ghost"
              size="sm"
              onClick={onRetry}
              disabled={isDisabled}
              className="h-7 w-7 p-0"
              title={status === "failed" ? "Retry export" : "Re-export"}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span className="sr-only">
                {status === "failed" ? "Retry" : "Re-export"}
              </span>
            </Button>
          )}

          {/* Initial export button */}
          {(status === "idle") && (
            <Button
              id={`export-${exportId}`}
              size="sm"
              onClick={onExport}
              disabled={isDisabled}
              className="h-8 gap-1.5"
            >
              {isLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                icon
              )}
              Export {title.split(" ")[0]}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
