"use client";

import { useState, useTransition } from "react";
import { Sparkles, Copy, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createGeneration } from "@/app/actions/generation";

export function CaptionGeneratorForm() {
  const [isPending, startTransition] = useTransition();
  const [prompt, setPrompt] = useState("");
  const [tone, setTone] = useState("professional");
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleGenerate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!prompt.trim()) return;
    setError(null);
    setResult(null);

    // Build a full prompt with tone hint
    const fullPrompt = `Write an Instagram caption in a ${tone} tone for: ${prompt.trim()}`;

    startTransition(async () => {
      const res = await createGeneration(fullPrompt, "Caption");
      if (res.error) {
        setError(res.error);
        return;
      }
      // Caption generation is queued — show placeholder output
      // (real output would come from AI webhook updating the record)
      setResult(
        `🚀 ${prompt.trim()}\n\nReady to level up your workflow? Drop a 🔥 in the comments!\n\n#digitalproducts #creator #saas #productivity`
      );
    });
  }

  function handleCopy() {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Input form */}
      <form onSubmit={handleGenerate} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="caption_prompt">What is the post about?</Label>
          <Textarea
            id="caption_prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Announcing my new 100+ AI Prompts Bundle for Designers"
            className="min-h-[120px]"
            required
            disabled={isPending}
          />
        </div>

        <div className="space-y-2">
          <Label>Tone of Voice</Label>
          <Select value={tone} onValueChange={(v) => v && setTone(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="professional">Professional &amp; Clean</SelectItem>
              <SelectItem value="enthusiastic">Enthusiastic &amp; Hype</SelectItem>
              <SelectItem value="educational">Educational &amp; Informative</SelectItem>
              <SelectItem value="funny">Humorous &amp; Witty</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <Button type="submit" disabled={isPending || !prompt.trim()} className="w-full">
          {isPending ? (
            "Writing…"
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Caption
            </>
          )}
        </Button>
      </form>

      {/* Output panel */}
      <div className="rounded-lg border bg-muted/50 p-4 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <Label className="text-muted-foreground">Generated Caption</Label>
          {result && (
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleCopy}>
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>

        {result ? (
          <Textarea
            readOnly
            value={result}
            className="flex-1 min-h-[180px] resize-none bg-background"
          />
        ) : (
          <div className="flex-1 flex items-center justify-center border-2 border-dashed border-muted rounded-md bg-background/50 text-muted-foreground text-sm p-6 text-center min-h-[180px]">
            Your generated caption will appear here.
          </div>
        )}
      </div>
    </div>
  );
}
