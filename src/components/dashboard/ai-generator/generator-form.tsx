"use client";

/**
 * AI Generator Form Component
 *
 * Handles all user inputs for product generation.
 * Calls the server action and lifts result state to parent.
 */

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Sparkles, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

import { generateProductAction } from "@/app/actions/ai-generate";
import { generationInputSchema, type GenerationFormInput } from "@/lib/ai/schemas";
import type { PipelineResult } from "@/lib/ai/types";
import { PRODUCT_TYPES, TONE_OPTIONS } from "@/lib/ai/types";

// ─── Price Range Options ──────────────────────────────────────────────────────

const PRICE_RANGES = [
  "₹49 – ₹199",
  "₹199 – ₹499",
  "₹499 – ₹999",
  "₹999 – ₹1999",
  "₹1999 – ₹4999",
  "₹4999+",
] as const;

// ─── Props ─────────────────────────────────────────────────────────────────────

interface GeneratorFormProps {
  onResult: (
    result: PipelineResult & { generationId?: string }
  ) => void;
  onGenerating: (loading: boolean) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function GeneratorForm({ onResult, onGenerating }: GeneratorFormProps) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<GenerationFormInput>({
    resolver: zodResolver(generationInputSchema),
    defaultValues: {
      productType: "Prompt Pack",
      niche: "",
      audience: "",
      tone: "Professional",
      priceRange: "₹499 – ₹999",
      contentLength: "medium",
    },
  });

  const onSubmit = (data: GenerationFormInput) => {
    setServerError(null);
    onGenerating(true);

    startTransition(async () => {
      try {
        const result = await generateProductAction(data);
        onResult(result);
        if (result.status === "error") {
          setServerError(result.error ?? "Generation failed.");
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unexpected error.";
        setServerError(msg);
        onResult({ status: "error", error: msg });
      } finally {
        onGenerating(false);
      }
    });
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardContent className="p-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

          {/* Product Type */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Product Type</Label>
            <Select
              value={form.watch("productType")}
              onValueChange={(v) =>
                form.setValue("productType", v as GenerationFormInput["productType"])
              }
            >
              <SelectTrigger className="h-10 bg-background/60">
                <SelectValue placeholder="Choose product type" />
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.productType && (
              <p className="text-xs text-destructive">
                {form.formState.errors.productType.message}
              </p>
            )}
          </div>

          {/* Niche + Audience side by side */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Niche</Label>
              <Input
                placeholder="e.g. Fitness, Crypto, Parenting"
                className="h-10 bg-background/60"
                {...form.register("niche")}
              />
              {form.formState.errors.niche && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.niche.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Target Audience</Label>
              <Input
                placeholder="e.g. Beginners, Freelancers"
                className="h-10 bg-background/60"
                {...form.register("audience")}
              />
              {form.formState.errors.audience && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.audience.message}
                </p>
              )}
            </div>
          </div>

          {/* Tone */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Tone</Label>
            <div className="flex flex-wrap gap-2">
              {TONE_OPTIONS.map((tone) => (
                <button
                  key={tone}
                  type="button"
                  onClick={() => form.setValue("tone", tone as GenerationFormInput["tone"])}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 ${
                    form.watch("tone") === tone
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-background/60 border-border/60 text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  }`}
                >
                  {tone}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range + Content Length */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Price Range</Label>
              <Select
                value={form.watch("priceRange")}
                onValueChange={(v) => form.setValue("priceRange", v ?? "")}
              >
                <SelectTrigger className="h-10 bg-background/60">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRICE_RANGES.map((range) => (
                    <SelectItem key={range} value={range}>
                      {range}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Content Length</Label>
              <div className="flex gap-1 rounded-lg border border-border/60 p-1 bg-background/60">
                {(["short", "medium", "long"] as const).map((len) => (
                  <button
                    key={len}
                    type="button"
                    onClick={() => form.setValue("contentLength", len)}
                    className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all duration-150 capitalize ${
                      form.watch("contentLength") === len
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {len}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Error */}
          {serverError && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3">
              <p className="text-sm text-destructive">{serverError}</p>
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            disabled={isPending}
            className="w-full h-11 text-sm font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 border-0 shadow-lg shadow-violet-500/25 transition-all duration-200"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating your product…
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Product
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
