"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { Loader2, Sparkles, Copy, Check, Save, Calendar, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  actionGenerateContent,
  actionSaveAsDraft,
  actionSchedulePost,
  actionGenerateAndSave,
} from "@/app/actions/instagram";
import type {
  ContentGenerationInput,
  GeneratedInstagramContent,
  InstagramContentType,
  ContentTone,
  CTAStyle,
  PlatformGoal,
} from "@/types/instagram";
import {
  TONE_OPTIONS,
  CTA_STYLE_OPTIONS,
  PLATFORM_GOAL_OPTIONS,
  CONTENT_TYPE_LABELS,
} from "@/types/instagram";
import { PostPreview } from "./post-preview";

const CONTENT_TYPES: InstagramContentType[] = [
  "Reel", "Carousel", "Story", "CTACaption", "PromotionalPost", "ProductLaunch", "Educational",
];

interface FormValues {
  productName: string;
  audience: string;
  tone: ContentTone;
  contentType: InstagramContentType;
  ctaStyle: CTAStyle;
  platformGoal: PlatformGoal;
  additionalContext: string;
}

export function ContentGenerator() {
  const [isPending, startTransition] = useTransition();
  const [generatedContent, setGeneratedContent] = useState<GeneratedInstagramContent | null>(null);
  const [savedPostId, setSavedPostId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [schedulingPostId, setSchedulingPostId] = useState<string | null>(null);
  const [scheduleTime, setScheduleTime] = useState("");
  const [scheduleMsg, setScheduleMsg] = useState<string | null>(null);
  
  // Custom local image/video attachments state integrations
  const [attachments, setAttachments] = useState<File[]>([]);

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setAttachments(prev => [...prev, ...Array.from(e.target.files!)]);
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      productName: "",
      audience: "",
      tone: "Professional",
      contentType: "CTACaption",
      ctaStyle: "SoftCTA",
      platformGoal: "SellProduct",
      additionalContext: "",
    },
  });

  const currentInput = watch();

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const onGenerate = (values: FormValues) => {
    setError(null);
    setGeneratedContent(null);
    setSavedPostId(null);
    setScheduleMsg(null);

    startTransition(async () => {
      const input: ContentGenerationInput = { ...values };
      const result = await actionGenerateContent(input);
      if (result.success && result.data) {
        setGeneratedContent(result.data);
      } else {
        setError(result.error ?? "Generation failed. Please try again.");
      }
    });
  };

  const onSaveDraft = () => {
    if (!generatedContent) return;
    startTransition(async () => {
      const result = await actionSaveAsDraft(currentInput as ContentGenerationInput, generatedContent);
      if (result.success && result.data) {
        setSavedPostId(result.data.postId);
        setSchedulingPostId(result.data.postId);
      } else {
        setError(result.error ?? "Failed to save draft.");
      }
    });
  };

  const onSchedule = () => {
    if (!schedulingPostId || !scheduleTime) return;
    startTransition(async () => {
      const result = await actionSchedulePost(schedulingPostId, scheduleTime);
      if (result.success) {
        setScheduleMsg("✅ Post scheduled successfully!");
        setSchedulingPostId(null);
      } else {
        setScheduleMsg(`❌ ${result.error}`);
      }
    });
  };

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      {/* ── Left: Input Form ── */}
      <div className="space-y-4">
        <Card className="border-border/60 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-purple-500" />
              Content Generator
            </CardTitle>
            <CardDescription>
              Fill in your product details — AI generates complete Instagram content.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onGenerate)} className="space-y-4">
              {/* Product Name */}
              <div className="space-y-1.5">
                <Label htmlFor="productName">Product Name *</Label>
                <Input
                  id="productName"
                  placeholder="e.g. Ultimate Notion Finance Tracker"
                  {...register("productName", { required: "Product name is required" })}
                />
                {errors.productName && (
                  <p className="text-xs text-destructive">{errors.productName.message}</p>
                )}
              </div>

              {/* Audience */}
              <div className="space-y-1.5">
                <Label htmlFor="audience">Target Audience *</Label>
                <Input
                  id="audience"
                  placeholder="e.g. Freelancers aged 25-35 who struggle with budgeting"
                  {...register("audience", { required: "Audience is required" })}
                />
                {errors.audience && (
                  <p className="text-xs text-destructive">{errors.audience.message}</p>
                )}
              </div>

              {/* Content Type */}
              <div className="space-y-1.5">
                <Label>Content Type</Label>
                <div className="flex flex-wrap gap-2">
                  {CONTENT_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setValue("contentType", type)}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                        currentInput.contentType === type
                          ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {CONTENT_TYPE_LABELS[type]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Row: Tone + CTA Style */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Tone</Label>
                  <Select
                    value={currentInput.tone}
                    onValueChange={(v) => setValue("tone", v as ContentTone)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TONE_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>CTA Style</Label>
                  <Select
                    value={currentInput.ctaStyle}
                    onValueChange={(v) => setValue("ctaStyle", v as CTAStyle)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CTA_STYLE_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Platform Goal */}
              <div className="space-y-1.5">
                <Label>Platform Goal</Label>
                <Select
                  value={currentInput.platformGoal}
                  onValueChange={(v) => setValue("platformGoal", v as PlatformGoal)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PLATFORM_GOAL_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Additional Context */}
              <div className="space-y-1.5">
                <Label htmlFor="additionalContext">Additional Context (optional)</Label>
                <Textarea
                  id="additionalContext"
                  placeholder="e.g. This is a Black Friday sale, 50% off for 24 hours only..."
                  rows={2}
                  {...register("additionalContext")}
                />
              </div>

              {/* Dynamic Local Image/Video Attachments Section */}
              <div className="space-y-2 border-t border-border/40 pt-4">
                <Label className="text-sm font-semibold flex items-center justify-between">
                  <span>Visual Attachments ({attachments.length})</span>
                  <span className="text-[10px] text-muted-foreground uppercase font-mono">Image/Video preview</span>
                </Label>
                
                {attachments.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 border border-border/60 bg-muted/20 p-2.5 rounded-xl">
                    {attachments.map((file, index) => {
                      const objectUrl = URL.createObjectURL(file);
                      return (
                        <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-border/80 bg-black/40">
                          {file.type.startsWith("video/") ? (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs font-mono">
                              🎬 Video
                            </div>
                          ) : (
                            <img
                              src={objectUrl}
                              alt={`Attachment ${index}`}
                              className="w-full h-full object-cover"
                            />
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveAttachment(index)}
                            className="absolute inset-0 bg-red-600/80 text-white text-[10px] font-bold uppercase flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          >
                            Remove
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="relative group border-2 border-dashed border-border/60 hover:border-purple-500/40 rounded-xl p-4 transition-all duration-200 bg-card/40">
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/mp4"
                    onChange={handleAttachmentChange}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  <div className="flex flex-col items-center justify-center text-center gap-1.5">
                    <span className="text-xs font-medium text-foreground">Click to upload media files</span>
                    <span className="text-[10px] text-muted-foreground">Supports Images and MP4 Videos</span>
                  </div>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={isPending}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-500/20"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Content
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Schedule Card (after save) */}
        {schedulingPostId && (
          <Card className="border-purple-500/30 bg-purple-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="h-4 w-4 text-purple-500" />
                Schedule This Post
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="scheduleTime">Schedule Date & Time</Label>
                <Input
                  id="scheduleTime"
                  type="datetime-local"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  min={new Date(Date.now() + 60_000).toISOString().slice(0, 16)}
                />
              </div>
              {scheduleMsg && (
                <p className="text-sm text-muted-foreground">{scheduleMsg}</p>
              )}
              <div className="flex gap-2">
                <Button
                  onClick={onSchedule}
                  disabled={isPending || !scheduleTime}
                  size="sm"
                  className="flex-1"
                >
                  {isPending ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <Calendar className="mr-2 h-3 w-3" />}
                  Schedule
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSchedulingPostId(null)}
                >
                  Skip
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ── Right: Output ── */}
      <div className="space-y-4">
        {isPending && !generatedContent && (
          <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-pink-500/5">
            <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="relative">
                <div className="h-14 w-14 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin" />
                <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-purple-500" />
              </div>
              <p className="text-sm text-muted-foreground animate-pulse">
                AI is crafting your content...
              </p>
            </CardContent>
          </Card>
        )}

        {generatedContent && (
          <>
            {/* Generated Results */}
            <Card className="border-green-500/20 bg-green-500/5">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Zap className="h-4 w-4 text-green-500" />
                    Generated Content
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={onSaveDraft} disabled={isPending || !!savedPostId}>
                      {savedPostId ? (
                        <><Check className="mr-1.5 h-3 w-3 text-green-500" /> Saved</>
                      ) : (
                        <><Save className="mr-1.5 h-3 w-3" /> Save Draft</>
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Hook */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground">Hook</Label>
                    <button onClick={() => copyToClipboard(generatedContent.hook, "hook")} className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                      {copiedField === "hook" ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                      {copiedField === "hook" ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <div className="rounded-lg bg-muted/60 p-3 text-sm font-medium">
                    {generatedContent.hook}
                  </div>
                </div>

                {/* Caption */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground">Caption</Label>
                    <button onClick={() => copyToClipboard(generatedContent.caption, "caption")} className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                      {copiedField === "caption" ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                      {copiedField === "caption" ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <div className="rounded-lg bg-muted/60 p-3 text-sm whitespace-pre-wrap max-h-48 overflow-y-auto">
                    {generatedContent.caption}
                  </div>
                </div>

                {/* CTA */}
                <div className="space-y-1">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">CTA</Label>
                  <div className="rounded-lg bg-purple-500/10 border border-purple-500/20 p-3 text-sm font-medium text-purple-700 dark:text-purple-300">
                    {generatedContent.cta}
                  </div>
                </div>

                {/* Hashtags */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                      Hashtags ({generatedContent.hashtags.length})
                    </Label>
                    <button
                      onClick={() => copyToClipboard(generatedContent.hashtags.map(h => `#${h}`).join(" "), "hashtags")}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                    >
                      {copiedField === "hashtags" ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                      {copiedField === "hashtags" ? "Copied" : "Copy All"}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {generatedContent.hashtags.map((tag, i) => (
                      <Badge key={i} variant="secondary" className="text-xs cursor-pointer hover:bg-purple-500/20"
                        onClick={() => copyToClipboard(`#${tag}`, `tag_${i}`)}>
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Carousel Slides */}
                {generatedContent.carouselSlides && generatedContent.carouselSlides.length > 0 && (
                  <div className="space-y-1.5">
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground">Carousel Slides</Label>
                    <div className="space-y-2">
                      {generatedContent.carouselSlides.map((slide) => (
                        <div key={slide.slide} className="rounded-lg border border-border/60 p-3">
                          <div className="flex items-start gap-2">
                            <span className="flex-shrink-0 h-5 w-5 rounded-full bg-purple-500 text-white text-xs flex items-center justify-center font-bold">
                              {slide.slide}
                            </span>
                            <div>
                              <p className="text-sm font-semibold">{slide.heading}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{slide.body}</p>
                              {slide.visualNote && (
                                <p className="text-xs text-blue-500 mt-0.5 italic">📷 {slide.visualNote}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reel Script */}
                {generatedContent.reelScript && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs uppercase tracking-wide text-muted-foreground">Reel Script</Label>
                      <button onClick={() => copyToClipboard(generatedContent.reelScript!, "reelScript")} className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                        {copiedField === "reelScript" ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                        Copy
                      </button>
                    </div>
                    <div className="rounded-lg bg-muted/60 p-3 text-xs whitespace-pre-wrap max-h-40 overflow-y-auto font-mono">
                      {generatedContent.reelScript}
                    </div>
                  </div>
                )}

                {/* Meta info */}
                {(generatedContent.estimatedEngagement || generatedContent.bestPostTime) && (
                  <div className="flex gap-3 pt-1">
                    {generatedContent.estimatedEngagement && (
                      <div className="rounded-lg bg-muted/60 px-3 py-2 text-xs">
                        <span className="text-muted-foreground">Engagement: </span>
                        <span className="font-medium">{generatedContent.estimatedEngagement}</span>
                      </div>
                    )}
                    {generatedContent.bestPostTime && (
                      <div className="rounded-lg bg-muted/60 px-3 py-2 text-xs">
                        <span className="text-muted-foreground">Best time: </span>
                        <span className="font-medium">{generatedContent.bestPostTime}</span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Mobile Preview */}
            <PostPreview
              caption={generatedContent.caption}
              hashtags={generatedContent.hashtags}
              hook={generatedContent.hook}
              contentType={currentInput.contentType}
              productName={currentInput.productName}
            />
          </>
        )}

        {!generatedContent && !isPending && (
          <Card className="border-dashed border-2 border-border/40 bg-transparent">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-4">
                <Sparkles className="h-8 w-8 text-purple-400" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">Ready to generate</p>
              <p className="text-xs text-muted-foreground max-w-xs">
                Fill in the form on the left and click Generate Content to create your Instagram post.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
