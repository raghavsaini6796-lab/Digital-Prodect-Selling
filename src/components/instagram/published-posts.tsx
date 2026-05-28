"use client";

import { useState, useTransition, useCallback } from "react";
import { CheckCircle2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PostCard } from "./post-card";
import { actionGetPosts } from "@/app/actions/instagram";
import type { InstagramPost } from "@/types/instagram";

interface PublishedPostsProps {
  initialPosts: InstagramPost[];
}

export function PublishedPosts({ initialPosts }: PublishedPostsProps) {
  const [posts, setPosts] = useState<InstagramPost[]>(initialPosts);
  const [isPending, startTransition] = useTransition();

  const refresh = useCallback(() => {
    startTransition(async () => {
      const result = await actionGetPosts("Published");
      if (result.success && result.data) setPosts(result.data);
    });
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {posts.length} post{posts.length !== 1 ? "s" : ""} published
        </p>
        <Button variant="ghost" size="sm" onClick={refresh} disabled={isPending}>
          <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${isPending ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl border-2 border-dashed border-border/40">
          <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-3">
            <CheckCircle2 className="h-6 w-6 text-green-500" />
          </div>
          <p className="text-sm font-medium text-foreground">No published posts yet</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs">
            Posts that have been successfully published to Instagram will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onDeleted={refresh}
            />
          ))}
        </div>
      )}
    </div>
  );
}
