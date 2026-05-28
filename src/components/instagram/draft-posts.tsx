"use client";

import { useState, useTransition, useCallback } from "react";
import { FileText, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PostCard } from "./post-card";
import { actionGetPosts } from "@/app/actions/instagram";
import type { InstagramPost } from "@/types/instagram";

interface DraftPostsProps {
  initialPosts: InstagramPost[];
}

export function DraftPosts({ initialPosts }: DraftPostsProps) {
  const [posts, setPosts] = useState<InstagramPost[]>(initialPosts);
  const [isPending, startTransition] = useTransition();

  const refresh = useCallback(() => {
    startTransition(async () => {
      const result = await actionGetPosts("Draft");
      if (result.success && result.data) setPosts(result.data);
    });
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {posts.length} draft{posts.length !== 1 ? "s" : ""} saved
        </p>
        <Button variant="ghost" size="sm" onClick={refresh} disabled={isPending}>
          <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${isPending ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl border-2 border-dashed border-border/40">
          <div className="h-12 w-12 rounded-xl bg-muted/60 flex items-center justify-center mb-3">
            <FileText className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">No drafts yet</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs">
            Generate content and click "Save Draft" to store posts here for later scheduling.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onDeleted={refresh}
              onPublished={refresh}
            />
          ))}
        </div>
      )}
    </div>
  );
}
