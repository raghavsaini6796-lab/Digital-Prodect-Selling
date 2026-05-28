// ─── PDF StyleSheet ───────────────────────────────────────────────────────────
// Centralized design tokens for all PDF templates.
// Supports future multi-theme branding via the createPdfStyles factory.

import { StyleSheet, Font } from "@react-pdf/renderer";

// ─── Color tokens ─────────────────────────────────────────────────────────────

export interface PdfTheme {
  primary: string;    // headings, cover title
  accent: string;     // section rules, bullets
  body: string;       // body text
  muted: string;      // footer, captions, metadata
  background: string; // page background
  surface: string;    // card / highlighted block backgrounds
  border: string;     // dividers, lines
}

export const defaultTheme: PdfTheme = {
  primary: "#0a0a0a",
  accent: "#1a1a1a",
  body: "#1c1c1c",
  muted: "#6b7280",
  background: "#ffffff",
  surface: "#f9f9f9",
  border: "#e5e7eb",
};

// ─── Typography tokens ────────────────────────────────────────────────────────

export const FONT_SIZES = {
  display: 32,
  h1: 24,
  h2: 18,
  h3: 14,
  body: 11,
  small: 9,
  caption: 8,
} as const;

export const LINE_HEIGHTS = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
} as const;

// ─── Spacing tokens ───────────────────────────────────────────────────────────

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

// ─── Page dimensions (A4) ─────────────────────────────────────────────────────

export const PAGE = {
  width: 595.28,
  height: 841.89,
  paddingX: 56,
  paddingTop: 48,
  paddingBottom: 64,
} as const;

// ─── StyleSheet factory ───────────────────────────────────────────────────────

export function createPdfStyles(theme: PdfTheme = defaultTheme) {
  return StyleSheet.create({
    // ── Page ──────────────────────────────────────────────────────────────────
    page: {
      backgroundColor: theme.background,
      paddingHorizontal: PAGE.paddingX,
      paddingTop: PAGE.paddingTop,
      paddingBottom: PAGE.paddingBottom,
      fontFamily: "Helvetica",
    },

    // ── Cover page ────────────────────────────────────────────────────────────
    coverPage: {
      backgroundColor: theme.primary,
      paddingHorizontal: PAGE.paddingX,
      paddingTop: 0,
      paddingBottom: 0,
      flex: 1,
      justifyContent: "flex-end",
    },
    coverAccentBar: {
      height: 6,
      backgroundColor: theme.background,
      marginBottom: SPACING.xxl,
      width: 48,
    },
    coverEyebrow: {
      fontSize: FONT_SIZES.small,
      color: theme.muted,
      letterSpacing: 2,
      textTransform: "uppercase",
      marginBottom: SPACING.md,
    },
    coverTitle: {
      fontSize: FONT_SIZES.display,
      fontFamily: "Helvetica-Bold",
      color: theme.background,
      lineHeight: LINE_HEIGHTS.tight,
      marginBottom: SPACING.md,
    },
    coverSubtitle: {
      fontSize: FONT_SIZES.h3,
      color: "#9ca3af",
      lineHeight: LINE_HEIGHTS.relaxed,
      marginBottom: SPACING.xxl,
    },
    coverFooter: {
      borderTopWidth: 1,
      borderTopColor: "#2d2d2d",
      paddingTop: SPACING.md,
      marginBottom: SPACING.xl,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    coverFooterLeft: {
      fontSize: FONT_SIZES.caption,
      color: "#9ca3af",
    },
    coverFooterRight: {
      fontSize: FONT_SIZES.caption,
      color: "#9ca3af",
    },

    // ── Section page ──────────────────────────────────────────────────────────
    sectionEyebrow: {
      fontSize: FONT_SIZES.caption,
      color: theme.muted,
      letterSpacing: 1.5,
      textTransform: "uppercase",
      marginBottom: SPACING.xs,
    },
    sectionHeading: {
      fontSize: FONT_SIZES.h2,
      fontFamily: "Helvetica-Bold",
      color: theme.primary,
      marginBottom: SPACING.sm,
      lineHeight: LINE_HEIGHTS.tight,
    },
    sectionRule: {
      height: 1,
      backgroundColor: theme.border,
      marginBottom: SPACING.md,
    },
    paragraph: {
      fontSize: FONT_SIZES.body,
      color: theme.body,
      lineHeight: LINE_HEIGHTS.relaxed,
      marginBottom: SPACING.sm,
    },

    // ── Bullet list ───────────────────────────────────────────────────────────
    bulletRow: {
      flexDirection: "row",
      marginBottom: SPACING.xs,
      paddingLeft: SPACING.sm,
    },
    bulletDot: {
      fontSize: FONT_SIZES.body,
      color: theme.accent,
      marginRight: SPACING.sm,
      marginTop: 1,
    },
    bulletText: {
      fontSize: FONT_SIZES.body,
      color: theme.body,
      lineHeight: LINE_HEIGHTS.relaxed,
      flex: 1,
    },

    // ── Highlighted block ─────────────────────────────────────────────────────
    callout: {
      backgroundColor: theme.surface,
      borderLeftWidth: 3,
      borderLeftColor: theme.accent,
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
      marginBottom: SPACING.md,
    },
    calloutText: {
      fontSize: FONT_SIZES.body,
      color: theme.body,
      lineHeight: LINE_HEIGHTS.relaxed,
    },

    // ── Table of Contents ─────────────────────────────────────────────────────
    tocTitle: {
      fontSize: FONT_SIZES.h1,
      fontFamily: "Helvetica-Bold",
      color: theme.primary,
      marginBottom: SPACING.xl,
    },
    tocRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
      marginBottom: SPACING.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      paddingBottom: SPACING.xs,
    },
    tocLabel: {
      fontSize: FONT_SIZES.body,
      color: theme.body,
      flex: 1,
    },
    tocPage: {
      fontSize: FONT_SIZES.body,
      color: theme.muted,
    },

    // ── Footer ────────────────────────────────────────────────────────────────
    footer: {
      position: "absolute",
      bottom: 28,
      left: PAGE.paddingX,
      right: PAGE.paddingX,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      borderTopWidth: 1,
      borderTopColor: theme.border,
      paddingTop: SPACING.xs,
    },
    footerBrand: {
      fontSize: FONT_SIZES.caption,
      color: theme.muted,
    },
    footerPageNumber: {
      fontSize: FONT_SIZES.caption,
      color: theme.muted,
    },
  });
}

/** Default pre-built StyleSheet (avoids re-creating on every render) */
export const pdfStyles = createPdfStyles(defaultTheme);
