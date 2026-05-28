"use client";

/**
 * Generation Loading State
 *
 * Animated skeleton shown while AI is generating.
 * Includes progress steps to keep user engaged.
 */

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const STEPS = [
  "Analysing your niche and audience…",
  "Crafting product structure…",
  "Writing compelling sections…",
  "Generating Instagram caption…",
  "Building hashtag strategy…",
  "Finalising your product…",
];

export function GenerationLoading() {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((i) => (i + 1) % STEPS.length);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in-0 duration-300">
      {/* Animated Header */}
      <div className="flex items-center gap-3 py-4">
        <div className="relative">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Sparkles className="h-5 w-5 text-white animate-pulse" />
          </div>
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-emerald-500 rounded-full animate-ping" />
        </div>
        <div>
          <p className="text-sm font-semibold">AI is generating your product</p>
          <p className="text-xs text-muted-foreground transition-all duration-500 key-[stepIndex]">
            {STEPS[stepIndex]}
          </p>
        </div>
      </div>

      {/* Skeleton Preview */}
      <div className="space-y-4 rounded-xl border border-border/40 bg-card/30 p-5 backdrop-blur-sm">
        {/* Title */}
        <div className="space-y-2">
          <Skeleton className="h-7 w-3/4 rounded-lg" />
          <Skeleton className="h-4 w-1/2 rounded-lg" />
        </div>

        {/* Price + CTA */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="space-y-1.5 rounded-lg border border-border/30 p-3">
            <Skeleton className="h-3 w-16 rounded" />
            <Skeleton className="h-8 w-20 rounded-lg" />
          </div>
          <div className="space-y-1.5 rounded-lg border border-border/30 p-3">
            <Skeleton className="h-3 w-12 rounded" />
            <Skeleton className="h-5 w-full rounded" />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5 pt-1">
          <Skeleton className="h-3 w-24 rounded" />
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-5/6 rounded" />
          <Skeleton className="h-4 w-4/6 rounded" />
        </div>

        {/* Sections */}
        <div className="space-y-2 pt-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg border border-border/30 px-4 py-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-6 w-6 rounded-full flex-shrink-0" />
                <Skeleton className="h-4 w-2/3 rounded" />
              </div>
            </div>
          ))}
        </div>

        {/* Caption */}
        <div className="space-y-1.5 pt-1">
          <Skeleton className="h-3 w-32 rounded" />
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-5/6 rounded" />
        </div>

        {/* Hashtags */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {[80, 100, 70, 90, 85, 75, 110, 65].map((w, i) => (
            <Skeleton key={i} className={`h-6 w-${w === 80 ? '20' : w === 100 ? '24' : w === 70 ? '16' : w === 90 ? '22' : w === 85 ? '20' : w === 75 ? '18' : w === 110 ? '28' : '16'} rounded-full`} />
          ))}
        </div>
      </div>
    </div>
  );
}
