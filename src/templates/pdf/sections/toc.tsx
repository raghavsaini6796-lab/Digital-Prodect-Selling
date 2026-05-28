// ─── PDF Table of Contents Section ───────────────────────────────────────────

import React from "react";
import { Page, View, Text } from "@react-pdf/renderer";
import type { PdfContentSection } from "@/types/export";
import { PdfFooter } from "./footer";
import { pdfStyles } from "../styles";

interface TocProps {
  sections: PdfContentSection[];
  storeName: string;
}

export function TableOfContents({ sections, storeName }: TocProps) {
  return (
    <Page size="A4" style={pdfStyles.page}>
      {/* Title */}
      <Text style={pdfStyles.tocTitle}>Contents</Text>

      {/* TOC rows — one per section */}
      {sections.map((section, index) => (
        <View key={index} style={pdfStyles.tocRow}>
          <Text style={pdfStyles.tocLabel}>
            {String(index + 1).padStart(2, "0")}. {section.heading}
          </Text>
          <Text style={pdfStyles.tocPage}>{index + 3}</Text>
        </View>
      ))}

      <PdfFooter storeName={storeName} />
    </Page>
  );
}
