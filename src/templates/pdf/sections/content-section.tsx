// ─── PDF Content Section ──────────────────────────────────────────────────────
// Renders a single branded content section on its own page.

import React from "react";
import { Page, View, Text } from "@react-pdf/renderer";
import type { PdfContentSection } from "@/types/export";
import { PdfFooter } from "./footer";
import { pdfStyles } from "../styles";

interface ContentSectionProps {
  section: PdfContentSection;
  sectionNumber: number;
  storeName: string;
}

export function ContentSection({
  section,
  sectionNumber,
  storeName,
}: ContentSectionProps) {
  return (
    <Page size="A4" style={pdfStyles.page}>
      {/* ── Section header ──────────────────────────────────────────────── */}
      <View>
        <Text style={pdfStyles.sectionEyebrow}>
          Section {String(sectionNumber).padStart(2, "0")}
        </Text>
        <Text style={pdfStyles.sectionHeading}>{section.heading}</Text>
        <View style={pdfStyles.sectionRule} />
      </View>

      {/* ── Body paragraphs ─────────────────────────────────────────────── */}
      {section.paragraphs?.map((para, i) => (
        <Text key={`p-${i}`} style={pdfStyles.paragraph}>
          {para}
        </Text>
      ))}

      {/* ── Bullet list items ────────────────────────────────────────────── */}
      {section.items?.map((item, i) => (
        <View key={`b-${i}`} style={pdfStyles.bulletRow}>
          <Text style={pdfStyles.bulletDot}>•</Text>
          <Text style={pdfStyles.bulletText}>{item}</Text>
        </View>
      ))}

      {/* ── Sub-sections ────────────────────────────────────────────────── */}
      {section.subsections?.map((sub, si) => (
        <View key={`sub-${si}`} style={{ marginTop: 16 }}>
          <Text
            style={[
              pdfStyles.sectionHeading,
              { fontSize: 13, marginBottom: 6 },
            ]}
          >
            {sub.heading}
          </Text>
          {sub.items.map((item, ii) => (
            <View key={`sub-b-${ii}`} style={pdfStyles.bulletRow}>
              <Text style={pdfStyles.bulletDot}>–</Text>
              <Text style={pdfStyles.bulletText}>{item}</Text>
            </View>
          ))}
        </View>
      ))}

      <PdfFooter storeName={storeName} pageLabel={`Section ${sectionNumber}`} />
    </Page>
  );
}
