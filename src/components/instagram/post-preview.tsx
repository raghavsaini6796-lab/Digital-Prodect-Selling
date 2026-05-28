"use client";

import type { InstagramContentType } from "@/types/instagram";
import { CONTENT_TYPE_LABELS } from "@/types/instagram";

interface PostPreviewProps {
  caption: string;
  hashtags: string[];
  hook: string;
  contentType: InstagramContentType;
  productName?: string;
}

export function PostPreview({ caption, hashtags, hook, contentType, productName }: PostPreviewProps) {
  const hashtagStr = hashtags.slice(0, 8).map((h) => `#${h}`).join(" ");

  return (
    <div className="flex flex-col items-center">
      <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wide">Mobile Preview</p>

      {/* Phone frame */}
      <div className="relative w-[280px]">
        {/* Phone shell */}
        <div className="rounded-[2.5rem] border-[6px] border-foreground/20 bg-background shadow-2xl overflow-hidden">
          {/* Status bar */}
          <div className="bg-black h-7 flex items-center justify-between px-5">
            <span className="text-white text-[9px] font-semibold">9:41</span>
            <div className="flex gap-1">
              <div className="h-1.5 w-1.5 rounded-full bg-white/70" />
              <div className="h-1.5 w-3 rounded-sm bg-white/70" />
              <div className="h-1.5 w-4 rounded-sm bg-white/70" />
            </div>
          </div>

          {/* Instagram header */}
          <div className="bg-white dark:bg-zinc-900 px-3 py-2 flex items-center gap-2 border-b border-border/20">
            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400" />
            <div>
              <p className="text-[10px] font-bold text-foreground leading-none">your_brand</p>
              <p className="text-[8px] text-muted-foreground">Sponsored</p>
            </div>
            <div className="ml-auto text-[16px] text-muted-foreground">···</div>
          </div>

          {/* Post image area */}
          <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 aspect-square flex flex-col items-center justify-center p-4 text-white text-center">
            <span className="text-[9px] font-medium uppercase tracking-widest opacity-70 mb-1">
              {CONTENT_TYPE_LABELS[contentType]}
            </span>
            <p className="text-sm font-bold leading-tight">
              {hook.length > 80 ? hook.slice(0, 80) + "…" : hook}
            </p>
            {productName && (
              <span className="mt-2 text-[8px] bg-white/20 rounded-full px-2 py-0.5">
                {productName}
              </span>
            )}
          </div>

          {/* Action row */}
          <div className="bg-white dark:bg-zinc-900 px-3 py-1.5 flex items-center gap-3">
            <svg className="h-4 w-4 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <svg className="h-4 w-4 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <svg className="h-4 w-4 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <svg className="h-4 w-4 text-foreground ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </div>

          {/* Caption */}
          <div className="bg-white dark:bg-zinc-900 px-3 pb-3">
            <p className="text-[9px] text-foreground leading-relaxed line-clamp-3">
              <span className="font-bold">your_brand </span>
              {caption.length > 120 ? caption.slice(0, 120) + "…" : caption}
            </p>
            <p className="text-[8px] text-blue-500 mt-1 line-clamp-1">{hashtagStr}</p>
          </div>
        </div>

        {/* Notch */}
        <div className="absolute top-[6px] left-1/2 -translate-x-1/2 h-4 w-20 bg-black rounded-b-2xl z-10" />
      </div>
    </div>
  );
}
