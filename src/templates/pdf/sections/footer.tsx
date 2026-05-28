// ─── PDF Footer Component ─────────────────────────────────────────────────────

import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { pdfStyles } from "../styles";

interface PdfFooterProps {
  storeName: string;
  pageLabel?: string;
}

export function PdfFooter({ storeName, pageLabel }: PdfFooterProps) {
  return (
    <View style={pdfStyles.footer} fixed>
      <Text style={pdfStyles.footerBrand}>{storeName}</Text>
      <Text
        style={pdfStyles.footerPageNumber}
        render={({ pageNumber, totalPages }) =>
          pageLabel ? pageLabel : `${pageNumber} / ${totalPages}`
        }
      />
    </View>
  );
}
