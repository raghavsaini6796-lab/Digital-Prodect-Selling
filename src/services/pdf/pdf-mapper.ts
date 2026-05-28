// ─── PDF Data Mapper ──────────────────────────────────────────────────────────
// Converts a Supabase Product row (with AI sections JSON) into
// a ProductPdfData object that the PDF template can render.
//
// Supports all 6 export product types:
//   PromptPack | AIGuide | InstagramToolkit | StudyNotes | CanvaInstructions | MiniCourse

import type { Product, Profile } from "@/types/supabase";
import type { ProductPdfData, PdfContentSection, ExportProductType } from "@/types/export";
import { formatDisplayDate, generateVersion } from "@/lib/export/utils";

// ─── Product type resolver ────────────────────────────────────────────────────

function resolveExportType(product: Product): ExportProductType {
  // First check if it's stored in the sections metadata
  const meta = product.export_metadata as Record<string, unknown> | null;
  if (meta?.productType) return meta.productType as ExportProductType;

  // Fall back to DB type mapping
  switch (product.type) {
    case "Document":  return "AIGuide";
    case "Template":  return "CanvaInstructions";
    case "Image Bundle": return "InstagramToolkit";
    default:          return "Generic";
  }
}

// ─── Section builders per product type ───────────────────────────────────────

function buildPromptPackSections(product: Product): PdfContentSection[] {
  const raw = product.sections as Array<Record<string, unknown>> | null;

  if (raw && Array.isArray(raw) && raw.length > 0) {
    return raw.map((s) => ({
      heading: String(s.heading ?? s.title ?? "Prompt Set"),
      paragraphs: s.description ? [String(s.description)] : undefined,
      items: Array.isArray(s.prompts)
        ? (s.prompts as unknown[]).map(String)
        : Array.isArray(s.items)
        ? (s.items as unknown[]).map(String)
        : undefined,
    }));
  }

  // Fallback: generate from description
  return [
    {
      heading: "What's Inside This Prompt Pack",
      paragraphs: [
        product.description ??
          "A curated collection of AI prompts designed to accelerate your workflow.",
      ],
    },
    {
      heading: "How to Use These Prompts",
      items: [
        "Copy the prompt exactly as written.",
        "Paste it into your AI tool of choice (ChatGPT, Claude, Gemini, etc.).",
        "Customise the bracketed fields to match your context.",
        "Iterate on the output to refine results.",
      ],
    },
    {
      heading: "Pro Tips",
      items: [
        "Combine multiple prompts for longer-form content.",
        "Save your best outputs to build a personal prompt library.",
        "Add your niche-specific context for better results.",
      ],
    },
  ];
}

function buildAIGuideSections(product: Product): PdfContentSection[] {
  const raw = product.sections as Array<Record<string, unknown>> | null;

  if (raw && Array.isArray(raw) && raw.length > 0) {
    return raw.map((s) => ({
      heading: String(s.heading ?? s.title ?? "Chapter"),
      paragraphs: [String(s.content ?? s.body ?? s.description ?? "")].filter(Boolean),
      items: Array.isArray(s.items) ? (s.items as unknown[]).map(String) : undefined,
    }));
  }

  return [
    {
      heading: "Introduction",
      paragraphs: [
        product.description ??
          "This guide walks you through everything you need to know to get started.",
      ],
    },
    {
      heading: "Core Concepts",
      items: [
        "Understand the fundamentals before diving in.",
        "Build a solid foundation for advanced techniques.",
        "Apply concepts immediately with practical exercises.",
      ],
    },
    {
      heading: "Step-by-Step Process",
      items: [
        "Start with the basics and work your way up.",
        "Follow the proven framework outlined in each chapter.",
        "Track your progress using the checklist at the end.",
      ],
    },
    {
      heading: "Key Takeaways",
      items: [
        "The most important lessons from this guide.",
        "Action items to implement immediately.",
        "Resources for continued learning.",
      ],
    },
  ];
}

function buildInstagramToolkitSections(product: Product): PdfContentSection[] {
  const raw = product.sections as Array<Record<string, unknown>> | null;

  if (raw && Array.isArray(raw) && raw.length > 0) {
    return raw.map((s) => ({
      heading: String(s.heading ?? s.title ?? "Toolkit Section"),
      paragraphs: s.content ? [String(s.content)] : undefined,
      items: Array.isArray(s.captions)
        ? (s.captions as unknown[]).map(String)
        : Array.isArray(s.items)
        ? (s.items as unknown[]).map(String)
        : undefined,
    }));
  }

  const captions = product.instagram_caption
    ? [product.instagram_caption]
    : [];

  return [
    {
      heading: "Caption Templates",
      paragraphs: ["Ready-to-use Instagram captions crafted for maximum engagement."],
      items: captions.length > 0 ? captions : [
        "Hook your audience in the first line.",
        "Add value through storytelling.",
        "Close with a strong call to action.",
      ],
    },
    {
      heading: "Hashtag Strategy",
      paragraphs: ["Use these hashtag groups to maximise your reach."],
      items: (product.hashtags ?? []).slice(0, 20).length > 0
        ? (product.hashtags ?? []).slice(0, 20)
        : ["#contentcreator", "#instagramtips", "#digitalproducts"],
    },
    {
      heading: "Posting Schedule",
      items: [
        "Post 3–5 times per week for consistent growth.",
        "Use Reels for maximum organic reach.",
        "Engage with comments within the first hour.",
        "Test different times and track your analytics.",
      ],
    },
  ];
}

function buildStudyNotesSections(product: Product): PdfContentSection[] {
  const raw = product.sections as Array<Record<string, unknown>> | null;

  if (raw && Array.isArray(raw) && raw.length > 0) {
    return raw.map((s) => ({
      heading: String(s.heading ?? s.topic ?? "Topic"),
      paragraphs: s.notes ? [String(s.notes)] : undefined,
      items: Array.isArray(s.keyPoints) ? (s.keyPoints as unknown[]).map(String) : undefined,
    }));
  }

  return [
    {
      heading: "Overview",
      paragraphs: [product.description ?? "Structured study notes for effective learning."],
    },
    {
      heading: "Key Concepts",
      items: [
        "Master the core terminology before proceeding.",
        "Understand the relationship between concepts.",
        "Apply active recall to test your understanding.",
      ],
    },
    {
      heading: "Summary & Review",
      items: [
        "Revisit these notes 24 hours after studying.",
        "Test yourself without looking at the notes.",
        "Create flashcards for difficult concepts.",
      ],
    },
  ];
}

function buildCanvaInstructionsSections(product: Product): PdfContentSection[] {
  const raw = product.sections as Array<Record<string, unknown>> | null;

  if (raw && Array.isArray(raw) && raw.length > 0) {
    return raw.map((s) => ({
      heading: String(s.heading ?? s.step ?? "Step"),
      paragraphs: s.instruction ? [String(s.instruction)] : undefined,
      items: Array.isArray(s.tips) ? (s.tips as unknown[]).map(String) : undefined,
    }));
  }

  return [
    {
      heading: "Getting Started with Canva",
      items: [
        "Create a free account at canva.com.",
        "Click 'Create a design' and choose your template size.",
        "Import this template using the provided template link.",
      ],
    },
    {
      heading: "Customisation Instructions",
      items: [
        "Click on any text element to edit the copy.",
        "Use the colour palette on the left to match your brand.",
        "Replace placeholder images with your own photos.",
        "Adjust fonts from the text toolbar.",
      ],
    },
    {
      heading: "Exporting Your Design",
      items: [
        "Click 'Share' in the top right corner.",
        "Select 'Download' and choose your format (PNG, PDF, MP4).",
        "Enable 'Transparent background' for logos.",
        "Use 'PDF Print' for highest quality print output.",
      ],
    },
  ];
}

function buildMiniCourseSections(product: Product): PdfContentSection[] {
  const raw = product.sections as Array<Record<string, unknown>> | null;

  if (raw && Array.isArray(raw) && raw.length > 0) {
    return raw.map((s, i) => ({
      heading: String(s.heading ?? s.title ?? `Module ${i + 1}`),
      paragraphs: s.content ? [String(s.content)] : undefined,
      items: Array.isArray(s.lessons)
        ? (s.lessons as unknown[]).map(String)
        : Array.isArray(s.items)
        ? (s.items as unknown[]).map(String)
        : undefined,
    }));
  }

  return [
    {
      heading: "Course Overview",
      paragraphs: [product.description ?? "Welcome to this mini course."],
      items: [
        "What you will learn in this course.",
        "Prerequisites and recommended tools.",
        "How to get the most out of this material.",
      ],
    },
    {
      heading: "Module 1: Foundations",
      items: [
        "Core principles you must understand first.",
        "Building blocks of the system.",
        "Common mistakes to avoid.",
      ],
    },
    {
      heading: "Module 2: Implementation",
      items: [
        "Step-by-step walkthrough of the process.",
        "Practical exercises and assignments.",
        "Real-world examples and case studies.",
      ],
    },
    {
      heading: "Module 3: Advanced Strategies",
      items: [
        "Scaling beyond the basics.",
        "Optimisation and efficiency techniques.",
        "Your next steps after completing this course.",
      ],
    },
  ];
}

// ─── Main mapper ──────────────────────────────────────────────────────────────

/**
 * Maps a Supabase Product row + Profile into a ProductPdfData object
 * ready for rendering by the PDF template.
 */
export function mapProductToPdfData(
  product: Product,
  profile: Profile | null,
  version?: string
): ProductPdfData {
  const exportType = resolveExportType(product);

  let sections: PdfContentSection[];
  switch (exportType) {
    case "PromptPack":
      sections = buildPromptPackSections(product);
      break;
    case "AIGuide":
      sections = buildAIGuideSections(product);
      break;
    case "InstagramToolkit":
      sections = buildInstagramToolkitSections(product);
      break;
    case "StudyNotes":
      sections = buildStudyNotesSections(product);
      break;
    case "CanvaInstructions":
      sections = buildCanvaInstructionsSections(product);
      break;
    case "MiniCourse":
      sections = buildMiniCourseSections(product);
      break;
    default:
      sections = buildAIGuideSections(product);
  }

  return {
    title: product.title,
    subtitle: product.description ?? undefined,
    productType: exportType,
    authorName: profile?.full_name ?? "Creator",
    storeName: profile?.store_name ?? undefined,
    exportDate: formatDisplayDate(),
    version: version ?? generateVersion(),
    description: product.description ?? undefined,
    sections,
  };
}
