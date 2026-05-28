"use client";

/**
 * Result Preview Component
 *
 * Displays the fully structured generated product output.
 * Shows: title, tagline, description, sections, CTA,
 *        suggested price, caption, hashtags, selling points.
 */

import { useState, useTransition } from "react";
import {
  CheckCircle2,
  Loader2,
  Save,
  Copy,
  Check,
  Tag,
  DollarSign,
  Camera,
  Hash,
  Zap,
  BookOpen,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { saveProductAction } from "@/app/actions/ai-generate";
import type { GeneratedProduct } from "@/lib/ai/types";

// ─── Copy Button ──────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
      title="Copy to clipboard"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-green-500" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </button>
  );
}

// ─── Section Row ──────────────────────────────────────────────────────────────

function SectionRow({
  title,
  content,
  index,
}: {
  title: string;
  content: string;
  index: number;
}) {
  const [open, setOpen] = useState(index < 2);

  return (
    <div className="rounded-lg border border-border/50 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
            {index + 1}
          </span>
          <span className="text-sm font-semibold">{title}</span>
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1 text-sm text-muted-foreground leading-relaxed border-t border-border/30">
          {content}
        </div>
      )}
    </div>
  );
}

// ─── Info Card ────────────────────────────────────────────────────────────────

function InfoCard({
  icon,
  label,
  children,
  copyText,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  copyText?: string;
}) {
  return (
    <Card className="border-border/40 bg-card/40 backdrop-blur-sm">
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            {icon}
            {label}
          </CardTitle>
          {copyText && <CopyButton text={copyText} />}
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4">{children}</CardContent>
    </Card>
  );
}

// ─── Props ─────────────────────────────────────────────────────────────────────

interface ResultPreviewProps {
  product: GeneratedProduct;
  generationId: string;
  onSaved?: (productId: string) => void;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ResultPreview({ product, generationId, onSaved }: ResultPreviewProps) {
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSave = () => {
    setSaveError(null);
    startTransition(async () => {
      const result = await saveProductAction(product, generationId);
      if (result.success && result.productId) {
        setSaved(true);
        onSaved?.(result.productId);
      } else {
        setSaveError(result.error ?? "Failed to save product.");
      }
    });
  };

  return (
    <div className="space-y-5 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">

      {/* Header: Title + Save */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
            <span className="text-xs font-semibold text-emerald-500 uppercase tracking-wide">
              Generated
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">{product.title}</h2>
          <p className="text-sm text-muted-foreground mt-1 italic">{product.tagline}</p>
        </div>

        <Button
          onClick={handleSave}
          disabled={isPending || saved}
          size="sm"
          className="flex-shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white border-0 shadow-md"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              Saving…
            </>
          ) : saved ? (
            <>
              <Check className="mr-1.5 h-3.5 w-3.5" />
              Saved!
            </>
          ) : (
            <>
              <Save className="mr-1.5 h-3.5 w-3.5" />
              Save Product
            </>
          )}
        </Button>
      </div>

      {saveError && (
        <p className="text-sm text-destructive">{saveError}</p>
      )}

      {/* Top Row: Price + CTA */}
      <div className="grid grid-cols-2 gap-3">
        <InfoCard
          icon={<DollarSign className="h-3 w-3" />}
          label="Suggested Price"
        >
          <p className="text-2xl font-black text-primary">{product.suggestedPrice}</p>
        </InfoCard>

        <InfoCard
          icon={<Zap className="h-3 w-3" />}
          label="Call to Action"
          copyText={product.cta}
        >
          <p className="text-sm font-semibold">{product.cta}</p>
        </InfoCard>
      </div>

      {/* Description */}
      <InfoCard
        icon={<BookOpen className="h-3 w-3" />}
        label="Product Description"
        copyText={product.description}
      >
        <p className="text-sm text-muted-foreground leading-relaxed">
          {product.description}
        </p>
      </InfoCard>

      {/* Selling Points */}
      <Card className="border-border/40 bg-gradient-to-br from-violet-950/20 to-indigo-950/20 backdrop-blur-sm">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            ✦ Key Selling Points
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-2">
          {product.sellingPoints.map((point, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-primary font-bold text-sm mt-0.5">✓</span>
              <p className="text-sm">{point}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Sections */}
      <div>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Product Sections
        </h3>
        <div className="space-y-2">
          {product.sections.map((section, i) => (
            <SectionRow
              key={i}
              title={section.title}
              content={section.content}
              index={i}
            />
          ))}
        </div>
      </div>

      {/* Prompt Pack (if applicable) */}
      {product.promptPack && product.promptPack.length > 0 && (
        <InfoCard
          icon={<Zap className="h-3 w-3" />}
          label={`Prompt Pack (${product.promptPack.length} prompts)`}
        >
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {product.promptPack.map((prompt, i) => (
              <div
                key={i}
                className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/40 rounded-md px-3 py-2"
              >
                <span className="font-bold text-primary flex-shrink-0 mt-0.5">
                  {i + 1}.
                </span>
                <span>{prompt}</span>
              </div>
            ))}
          </div>
        </InfoCard>
      )}

      {/* Instagram Caption */}
      <InfoCard
        icon={<Camera className="h-3 w-3" />}
        label="Instagram Caption"
        copyText={product.instagramCaption}
      >
        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
          {product.instagramCaption}
        </p>
      </InfoCard>

      {/* Hashtags */}
      <InfoCard
        icon={<Hash className="h-3 w-3" />}
        label="Hashtags"
        copyText={product.hashtags.join(" ")}
      >
        <div className="flex flex-wrap gap-1.5">
          {product.hashtags.map((tag, i) => (
            <span
              key={i}
              className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      </InfoCard>

      {/* Product Tags */}
      <InfoCard
        icon={<Tag className="h-3 w-3" />}
        label="Product Tags"
      >
        <div className="flex flex-wrap gap-1.5">
          {product.productTags.map((tag, i) => (
            <Badge key={i} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </InfoCard>
    </div>
  );
}
