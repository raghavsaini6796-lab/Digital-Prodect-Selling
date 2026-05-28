"use client";

import { useState, useTransition } from "react";
import { Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createGeneration } from "@/app/actions/generation";

export function GenerateProductForm() {
  const [isPending, startTransition] = useTransition();
  const [prompt, setPrompt] = useState("");
  const [genType, setGenType] = useState<"Image" | "Caption" | "Text">("Image");
  const [status, setStatus] = useState<{ success?: boolean; error?: string } | null>(null);

  function handleGenerate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!prompt.trim()) return;

    setStatus(null);
    startTransition(async () => {
      const result = await createGeneration(prompt.trim(), genType);
      if (result.error) {
        setStatus({ error: result.error });
      } else {
        setStatus({ success: true });
        setPrompt("");
      }
    });
  }

  return (
    <form onSubmit={handleGenerate} className="space-y-4 rounded-lg border p-4 bg-card">
      <div className="space-y-2">
        <Label htmlFor="gen_prompt">What do you want to generate?</Label>
        <Input
          id="gen_prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. Cyberpunk style character portraits for a gaming pack"
          className="h-12"
          required
          disabled={isPending}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Generation Type</Label>
          <Select
            value={genType}
            onValueChange={(v) => v && setGenType(v as typeof genType)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Image">Image</SelectItem>
              <SelectItem value="Caption">Caption</SelectItem>
              <SelectItem value="Text">Text / Copy</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Style Hint</Label>
          <Select defaultValue="realistic">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="realistic">Realistic Photography</SelectItem>
              <SelectItem value="digital-art">Digital Art</SelectItem>
              <SelectItem value="anime">Anime / Manga</SelectItem>
              <SelectItem value="3d">3D Render</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Status feedback */}
      {status?.success && (
        <div className="flex items-center gap-2 rounded-md bg-green-500/10 px-3 py-2 text-sm text-green-600 dark:text-green-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Generation queued! Check the history below once ready.
        </div>
      )}
      {status?.error && (
        <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {status.error}
        </div>
      )}

      <Button type="submit" disabled={isPending || !prompt.trim()} className="w-full" size="lg">
        {isPending ? (
          "Queuing…"
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            Generate Product
          </>
        )}
      </Button>
    </form>
  );
}
