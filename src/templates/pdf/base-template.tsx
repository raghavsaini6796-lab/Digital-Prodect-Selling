// ─── PDF Base Template ────────────────────────────────────────────────────────
// Composes the full document: Cover → TOC → Content sections.
// Supports future theme injection via the `theme` prop.

import React from "react";
import { Document } from "@react-pdf/renderer";
import type { ProductPdfData } from "@/types/export";
import type { PdfTheme } from "./styles";
import { CoverPage } from "./sections/cover-page";
import { TableOfContents } from "./sections/toc";
import { ContentSection } from "./sections/content-section";

// ─── Props ────────────────────────────────────────────────────────────────────

interface BaseTemplateProps {
  data: ProductPdfData;
  /** Optional theme override for branded PDF output */
  theme?: PdfTheme;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function BaseTemplate({ data }: BaseTemplateProps) {
  const storeName = data.storeName ?? data.authorName ?? "Product";

  return (
    <Document
      title={data.title}
      author={data.authorName}
      subject={data.productType}
      creator="D Product Selling"
      producer="@react-pdf/renderer"
      keywords={[data.productType, data.authorName].join(", ")}
    >
      {/* ── 1. Cover Page ──────────────────────────────────────────────────── */}
      <CoverPage
        data={{
          title: data.title,
          subtitle: data.subtitle,
          productType: data.productType,
          authorName: data.authorName,
          storeName: data.storeName,
          exportDate: data.exportDate,
          version: data.version,
        }}
      />

      {/* ── 2. Table of Contents ───────────────────────────────────────────── */}
      {data.sections.length > 0 && (
        <TableOfContents sections={data.sections} storeName={storeName} />
      )}

      {/* ── 3. Content Sections ────────────────────────────────────────────── */}
      {data.sections.map((section, index) => (
        <ContentSection
          key={index}
          section={section}
          sectionNumber={index + 1}
          storeName={storeName}
        />
      ))}
    </Document>
  );
}
