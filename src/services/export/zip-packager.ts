// ─── ZIP Packager Service ─────────────────────────────────────────────────────
// Creates a downloadable ZIP bundle containing the PDF, metadata JSON,
// README, and optional bonus content.
//
// Server-side only. Uses the jszip library.

import JSZip from "jszip";
import type { Product, Profile } from "@/types/supabase";
import type { ProductExportMeta } from "@/types/export";
import { formatDisplayDate, sanitizeFilename } from "@/lib/export/utils";

// ─── README generator ─────────────────────────────────────────────────────────

function buildReadmeText(product: Product, profile: Profile | null): string {
  const storeName = profile?.store_name ?? profile?.full_name ?? "Creator";
  const date = formatDisplayDate();

  return `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ${product.title}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Thank you for your purchase!

CREATOR:   ${storeName}
DATE:      ${date}
TYPE:      ${product.type ?? "Digital Product"}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHAT'S INCLUDED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  product.pdf   — Full professional PDF document
  metadata.json — Structured product data
  bonus.txt     — Additional tips and resources
  README.txt    — This file

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DESCRIPTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${product.description ?? "A premium digital product designed to deliver real value."}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LICENSE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Personal use only. Do not redistribute or resell this product
without written permission from ${storeName}.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SUPPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Questions? Contact ${storeName} for support.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
}

// ─── Bonus content generator ──────────────────────────────────────────────────

function buildBonusText(product: Product): string {
  const lines: string[] = [
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `  BONUS TIPS — ${product.title}`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    ``,
    `Here are additional resources and tips to get the most out of this product:`,
    ``,
    `1. IMPLEMENTATION`,
    `   Apply the core principles within 24 hours of reading for best results.`,
    `   Consistency beats perfection — start small and build momentum.`,
    ``,
    `2. TOOLS TO USE ALONGSIDE THIS PRODUCT`,
    `   • Notion or Obsidian for organising your notes`,
    `   • Canva for creating visual content`,
    `   • ChatGPT or Claude for AI-assisted implementation`,
    ``,
    `3. NEXT STEPS`,
    `   • Share your results and tag the creator`,
    `   • Leave a review to help others discover this product`,
    `   • Explore other products in the creator's store`,
    ``,
  ];

  // Append CTA if available
  if (product.cta) {
    lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    lines.push(`  SPECIAL OFFER`);
    lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    lines.push(``);
    lines.push(product.cta);
    lines.push(``);
  }

  lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  return lines.join("\n");
}

// ─── Metadata JSON builder ────────────────────────────────────────────────────

function buildMetadataJson(
  product: Product,
  profile: Profile | null,
  version: string,
  exportMeta: ProductExportMeta
): string {
  const metadata = {
    product: {
      id: product.id,
      title: product.title,
      type: product.type,
      description: product.description,
      tags: product.tags,
      price: product.price,
    },
    creator: {
      name: profile?.full_name ?? "Creator",
      store: profile?.store_name ?? null,
    },
    export: {
      version,
      exportedAt: new Date().toISOString(),
      pdfPageCount: exportMeta.pdfPageCount,
      pdfFileSizeBytes: exportMeta.pdfFileSizeBytes,
    },
    instagram: {
      caption: product.instagram_caption ?? null,
      hashtags: product.hashtags ?? [],
    },
  };

  return JSON.stringify(metadata, null, 2);
}

// ─── ZIP packager ─────────────────────────────────────────────────────────────

export interface ZipPackageInput {
  product: Product;
  profile: Profile | null;
  pdfBuffer: Buffer;
  version: string;
  exportMeta?: ProductExportMeta;
}

/**
 * Creates a complete ZIP bundle for a product.
 *
 * Contents:
 *   product.pdf       — generated PDF
 *   metadata.json     — structured product metadata
 *   bonus.txt         — bonus tips and resources
 *   README.txt        — usage instructions + license
 */
export async function createProductZip(input: ZipPackageInput): Promise<Buffer> {
  const { product, profile, pdfBuffer, version, exportMeta = {} } = input;

  const zip = new JSZip();

  const folderName = sanitizeFilename(product.title) || "product";
  const folder = zip.folder(folderName);

  if (!folder) {
    throw new Error("[zip-packager] Failed to create ZIP folder");
  }

  // 1. PDF
  folder.file("product.pdf", pdfBuffer);

  // 2. Metadata JSON
  folder.file(
    "metadata.json",
    buildMetadataJson(product, profile, version, exportMeta)
  );

  // 3. Bonus content
  folder.file("bonus.txt", buildBonusText(product));

  // 4. README
  folder.file("README.txt", buildReadmeText(product, profile));

  // Generate ZIP buffer
  const zipBuffer = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });

  return zipBuffer;
}
