"use client";

// ─── Product Detail View ──────────────────────────────────────────────────────
// Full product detail page rendered as a client component so export
// state can update optimistically without full page reloads.

import {
  ArrowLeft,
  Tag,
  IndianRupee,
  Calendar,
  Layers,
  Hash,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import type { Product, ExportLog } from "@/types/supabase";
import type { ExportStatus, ProductExportMeta } from "@/types/export";
import { ExportPanel } from "./export-panel";
import { ExportHistory } from "./export-history";
import { formatDisplayDate } from "@/lib/export/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProductDetailViewProps {
  product: Product;
  exportLogs: ExportLog[];
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ProductDetailView({
  product,
  exportLogs,
}: ProductDetailViewProps) {
  const exportMeta = product.export_metadata as ProductExportMeta | null;
  const exportStatus = (product.export_status ?? "idle") as ExportStatus;

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-6">
      {/* ── Header Actions ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/products"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          id="back-to-products"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Products
        </Link>

        <Link
          href={`/products/${product.id}`}
          target="_blank"
          className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 transition-colors"
        >
          View Public Page <ExternalLink className="h-4 w-4" />
        </Link>
      </div>

      {/* ── Product header ──────────────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            {/* Type badge */}
            <div className="mb-2">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                <Layers className="h-3 w-3" />
                {product.type}
              </span>
            </div>

            {/* Title */}
            <h1
              id="product-title"
              className="text-2xl font-bold text-foreground truncate"
            >
              {product.title}
            </h1>

            {/* Description */}
            {product.description && (
              <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
                {product.description}
              </p>
            )}
          </div>

          {/* Price */}
          <div className="shrink-0 text-right">
            <div className="flex items-center gap-1 text-2xl font-bold text-foreground">
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
              {(product.price ?? 0).toFixed(2)}
            </div>
            <StatusPill status={product.status} />
          </div>
        </div>

        {/* ── Metadata grid ─────────────────────────────────────────────── */}
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 border-t border-border pt-4">
          <MetaItem
            icon={<Calendar className="h-3.5 w-3.5" />}
            label="Created"
            value={formatDisplayDate(product.created_at)}
          />
          <MetaItem
            icon={<Calendar className="h-3.5 w-3.5" />}
            label="Updated"
            value={formatDisplayDate(product.updated_at)}
          />
          <MetaItem
            icon={<Layers className="h-3.5 w-3.5" />}
            label="Version"
            value={product.version ?? "v1"}
            mono
          />
        </div>

        {/* Tags */}
        {(product.tags ?? []).length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5 border-t border-border pt-4">
            <Hash className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
            {(product.tags ?? []).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Export Panel ─────────────────────────────────────────────────── */}
      <ExportPanel
        productId={product.id}
        initialPdfUrl={product.pdf_url}
        initialZipUrl={product.zip_url}
        initialExportStatus={exportStatus}
        initialVersion={product.version}
        initialExportMeta={
          exportMeta
            ? {
                pdfFileSizeBytes: exportMeta.pdfFileSizeBytes,
                zipFileSizeBytes: exportMeta.zipFileSizeBytes,
              }
            : null
        }
      />

      {/* ── Export History ───────────────────────────────────────────────── */}
      <ExportHistory logs={exportLogs} />

      {/* ── AI / Content preview (if available) ─────────────────────────── */}
      {product.instagram_caption && (
        <div className="rounded-xl border border-border bg-card p-6 space-y-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Instagram Caption
          </h3>
          <p className="text-sm text-muted-foreground whitespace-pre-line">
            {product.instagram_caption}
          </p>
          {(product.hashtags ?? []).length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border">
              {(product.hashtags ?? []).slice(0, 15).map((tag) => (
                <span
                  key={tag}
                  className="text-xs text-blue-600 dark:text-blue-400"
                >
                  {tag.startsWith("#") ? tag : `#${tag}`}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MetaItem({
  icon,
  label,
  value,
  mono = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-0.5">
        {icon}
        {label}
      </div>
      <p
        className={`text-sm font-medium text-foreground ${mono ? "font-mono text-xs" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    Active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    Draft: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400",
    Archived: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  };

  return (
    <span
      className={`mt-1 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        colorMap[status] ?? colorMap["Draft"]
      }`}
    >
      {status}
    </span>
  );
}
