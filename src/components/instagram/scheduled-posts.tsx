"use client";

import { useState, useTransition, useCallback } from "react";
import { Clock, RefreshCw, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PostCard } from "./post-card";
import { actionGetPostsWithSchedules, actionCancelSchedule } from "@/app/actions/instagram";
import type { PostWithSchedule } from "@/types/instagram";

interface ScheduledPostsProps {
  initialPosts: PostWithSchedule[];
}

export function ScheduledPosts({ initialPosts }: ScheduledPostsProps) {
  const [posts, setPosts] = useState<PostWithSchedule[]>(initialPosts);
  const [isPending, startTransition] = useTransition();
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const refresh = useCallback(() => {
    startTransition(async () => {
      const result = await actionGetPostsWithSchedules();
      if (result.success && result.data) {
        setPosts(result.data.filter((p) => p.status === "Scheduled"));
      }
    });
  }, []);

  const handleCancel = (scheduleId: string) => {
    setCancellingId(scheduleId);
    startTransition(async () => {
      await actionCancelSchedule(scheduleId);
      setCancellingId(null);
      refresh();
    });
  };

  const scheduledPosts = posts.filter((p) => p.status === "Scheduled");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {scheduledPosts.length} post{scheduledPosts.length !== 1 ? "s" : ""} scheduled
        </p>
        <Button variant="ghost" size="sm" onClick={refresh} disabled={isPending}>
          <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${isPending ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {scheduledPosts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl border-2 border-dashed border-border/40">
          <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-3">
            <Clock className="h-6 w-6 text-blue-500" />
          </div>
          <p className="text-sm font-medium text-foreground">No scheduled posts</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs">
            Save a draft and schedule it for automatic publishing via the content queue.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {scheduledPosts.map((post) => (
            <div key={post.id} className="space-y-1.5">
              <PostCard
                post={post}
                onDeleted={refresh}
                onPublished={refresh}
              />

              {/* Schedule info row */}
              {post.schedule && (
                <div className="ml-3 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-blue-500" />
                    {new Date(post.schedule.scheduled_time).toLocaleString("en-US", {
                      month: "short", day: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </span>

                  {post.schedule.retry_count > 0 && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      Retry #{post.schedule.retry_count}
                    </Badge>
                  )}

                  {post.schedule.processing_status && (
                    <span className="text-muted-foreground/70">{post.schedule.processing_status}</span>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 px-2 text-[10px] text-destructive hover:text-destructive ml-auto"
                    disabled={isPending && cancellingId === post.schedule.id}
                    onClick={() => handleCancel(post.schedule!.id)}
                  >
                    <XCircle className="mr-1 h-2.5 w-2.5" />
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
