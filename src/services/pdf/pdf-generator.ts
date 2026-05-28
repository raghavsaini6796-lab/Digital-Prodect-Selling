// ─── PDF Generator Service ────────────────────────────────────────────────────
// Server-side only. Uses @react-pdf/renderer to render a React document
// component to a binary PDF Buffer.
//
// NOTE: This module MUST only run on Node.js (Server Actions / Route Handlers).
//       Never import it in client components.

import { renderToBuffer } from "@react-pdf/renderer";
import type { Product, Profile } from "@/types/supabase";
import { BaseTemplate } from "@/templates/pdf/base-template";
import { mapProductToPdfData } from "./pdf-mapper";

// ─── Public API ───────────────────────────────────────────────────────────────

export interface GeneratePdfOptions {
  /** Optional version string (defaults to auto-generated timestamp version) */
  version?: string;
}

/**
 * Generates a professional PDF for the given product and returns a Buffer.
 *
 * @param product - Full product row from Supabase
 * @param profile - Seller profile (for author name / store name)
 * @param options - Optional generation options
 * @returns Buffer containing the rendered PDF
 */
export async function generateProductPdf(
  product: Product,
  profile: Profile | null,
  options: GeneratePdfOptions = {}
): Promise<Buffer> {
  // 1. Map product data to PDF template data structure
  const pdfData = mapProductToPdfData(product, profile, options.version);

  // 2. Render the React-PDF component tree to a Buffer.
  //    Calling the component as a function provides a correctly-typed DocumentProps element.
  const element = BaseTemplate({ data: pdfData });
  const buffer = await renderToBuffer(element);


  return Buffer.from(buffer);
}

/**
 * Returns the expected page count for a given product (for metadata).
 * Cover + TOC + one page per section.
 */
export function estimatePdfPageCount(product: Product): number {
  const sections = product.sections as unknown[];
  const sectionCount = Array.isArray(sections) ? sections.length : 4;
  return 2 + sectionCount; // Cover + TOC + sections
}
