"use client";

/**
 * AI Generator Client Wrapper
 *
 * Manages all client-side state for the generator:
 * - form submission flow
 * - loading state
 * - result display
 * - history refresh trigger
 *
 * Server Components fetch initial data; this handles interactivity.
 */

import { useState, useCallback } from "react";
import { GeneratorForm } from "./generator-form";
import { GenerationLoading } from "./generation-loading";
import { ResultPreview } from "./result-preview";
import type { GeneratedProduct, PipelineResult } from "@/lib/ai/types";
import { Sparkles, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Types ─────────────────────────────────────────────────────────────────────

type UIState = "idle" | "generating" | "result" | "error";

interface GeneratorClientProps {
  onProductSaved?: (productId: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function GeneratorClient({ onProductSaved }: GeneratorClientProps) {
  const [uiState, setUiState] = useState<UIState>("idle");
  const [result, setResult] = useState<GeneratedProduct | null>(null);
  const [generationId, setGenerationId] = useState<string | undefined>();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleResult = useCallback(
    (pipelineResult: PipelineResult & { generationId?: string }) => {
      if (pipelineResult.status === "success" && pipelineResult.data) {
        setResult(pipelineResult.data);
        setGenerationId(pipelineResult.generationId);
        setUiState("result");
      } else {
        setErrorMsg(pipelineResult.error ?? "Generation failed. Please try again.");
        setUiState("error");
      }
    },
    []
  );

  const handleGenerating = useCallback((loading: boolean) => {
    if (loading) {
      setUiState("generating");
      setResult(null);
      setErrorMsg(null);
    }
  }, []);

  const handleReset = () => {
    setUiState("idle");
    setResult(null);
    setGenerationId(undefined);
    setErrorMsg(null);
  };

  return (
    <div className="space-y-6">
      {/* Form — always visible, but disabled hint shown during generation */}
      <div
        className={
          uiState === "generating"
            ? "opacity-60 pointer-events-none select-none transition-opacity duration-300"
            : "transition-opacity duration-300"
        }
      >
        <GeneratorForm
          onResult={handleResult}
          onGenerating={handleGenerating}
        />
      </div>

      {/* Loading State */}
      {uiState === "generating" && <GenerationLoading />}

      {/* Error State */}
      {uiState === "error" && errorMsg && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-5 py-4 space-y-3 animate-in fade-in-0 duration-300">
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-4 w-4 text-destructive" />
            </div>
            <div>
              <p className="text-sm font-semibold text-destructive">Generation Failed</p>
              <p className="text-sm text-muted-foreground mt-0.5">{errorMsg}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="ml-11"
          >
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            Try Again
          </Button>
        </div>
      )}

      {/* Result */}
      {uiState === "result" && result && generationId && (
        <div className="space-y-3">
          {/* Generate Another Button */}
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-xs text-muted-foreground"
            >
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
              Generate Another
            </Button>
          </div>

          <ResultPreview
            product={result}
            generationId={generationId}
            onSaved={onProductSaved}
          />
        </div>
      )}
    </div>
  );
}
