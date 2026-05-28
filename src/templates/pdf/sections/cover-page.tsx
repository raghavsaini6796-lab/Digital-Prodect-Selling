// ─── PDF Cover Page Section ───────────────────────────────────────────────────

import React from "react";
import { Page, View, Text } from "@react-pdf/renderer";
import type { ProductPdfData, ExportProductType } from "@/types/export";
import { pdfStyles } from "../styles";

// ─── Product type label map ───────────────────────────────────────────────────

const PRODUCT_TYPE_LABELS: Record<ExportProductType, string> = {
  PromptPack: "Prompt Pack",
  AIGuide: "AI Guide",
  InstagramToolkit: "Instagram Toolkit",
  StudyNotes: "Study Notes",
  CanvaInstructions: "Canva Instructions",
  MiniCourse: "Mini Course",
  Document: "Document",
  Template: "Template",
  Generic: "Digital Product",
};

// ─── Component ────────────────────────────────────────────────────────────────

interface CoverPageProps {
  data: Pick<
    ProductPdfData,
    | "title"
    | "subtitle"
    | "productType"
    | "authorName"
    | "storeName"
    | "exportDate"
    | "version"
  >;
}

export function CoverPage({ data }: CoverPageProps) {
  const typeLabel = PRODUCT_TYPE_LABELS[data.productType] ?? "Digital Product";

  return (
    <Page size="A4" style={pdfStyles.coverPage}>
      {/* ── Top spacer ────────────────────────────────────────────────────── */}
      <View style={{ flex: 1 }} />

      {/* ── Main content block ────────────────────────────────────────────── */}
      <View>
        {/* Accent bar */}
        <View style={pdfStyles.coverAccentBar} />

        {/* Eyebrow — product type */}
        <Text style={pdfStyles.coverEyebrow}>{typeLabel}</Text>

        {/* Title */}
        <Text style={pdfStyles.coverTitle}>{data.title}</Text>

        {/* Subtitle / description */}
        {data.subtitle ? (
          <Text style={pdfStyles.coverSubtitle}>{data.subtitle}</Text>
        ) : null}
      </View>

      {/* ── Footer bar ────────────────────────────────────────────────────── */}
      <View style={pdfStyles.coverFooter}>
        <View>
          <Text style={pdfStyles.coverFooterLeft}>
            {data.storeName ?? data.authorName}
          </Text>
          <Text style={[pdfStyles.coverFooterLeft, { marginTop: 2 }]}>
            {data.exportDate}
          </Text>
        </View>
        <Text style={pdfStyles.coverFooterRight}>{data.version}</Text>
      </View>
    </Page>
  );
}
