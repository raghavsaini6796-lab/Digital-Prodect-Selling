// ─── Export System Types ──────────────────────────────────────────────────────

export type ExportStatus = "idle" | "pending" | "done" | "failed";

export type ExportType = "pdf" | "zip";

// ── Product types supported for export ───────────────────────────────────────

export type ExportProductType =
  | "PromptPack"
  | "AIGuide"
  | "InstagramToolkit"
  | "StudyNotes"
  | "CanvaInstructions"
  | "MiniCourse"
  | "Document"
  | "Template"
  | "Generic";

// ── PDF content data structures ───────────────────────────────────────────────

export interface PdfContentSection {
  /** Display heading for this section */
  heading: string;
  /** Ordered body paragraphs */
  paragraphs?: string[];
  /** Ordered bullet-list items */
  items?: string[];
  /** Optional sub-sections (nested) */
  subsections?: Array<{ heading: string; items: string[] }>;
}

export interface ProductPdfData {
  // Cover page
  title: string;
  subtitle?: string;
  productType: ExportProductType;
  authorName: string;
  storeName?: string;
  exportDate: string;
  version: string;

  // Content
  description?: string;
  sections: PdfContentSection[];

  // Branding
  primaryColor?: string;  // hex — defaults to #000000
  accentColor?: string;   // hex — defaults to #555555
  footerText?: string;
}

// ── Export log record ─────────────────────────────────────────────────────────

export interface ExportLog {
  id: string;
  product_id: string;
  user_id: string;
  export_type: ExportType;
  status: ExportStatus;
  storage_path: string | null;
  public_url: string | null;
  file_size_bytes: number | null;
  version: string;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}

// ── Export result returned from pipeline ──────────────────────────────────────

export interface ExportResult {
  success: boolean;
  url?: string;
  storagePath?: string;
  fileSizeBytes?: number;
  version?: string;
  error?: string;
}

// ── Product export metadata stored in products.export_metadata ────────────────

export interface ProductExportMeta {
  pdfPageCount?: number;
  pdfFileSizeBytes?: number;
  zipFileSizeBytes?: number;
  lastExportedAt?: string;
  exportCount?: number;
}
