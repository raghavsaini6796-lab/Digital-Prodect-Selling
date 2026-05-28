"use client";

import { useState, useTransition } from "react";
import { MoreHorizontal, Trash2, Send, Calendar, Clock, CheckCircle2, XCircle, AlertCircle, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { actionDeletePost, actionPublishNow } from "@/app/actions/instagram";
import type { InstagramPost, InstagramPostStatus } from "@/types/instagram";
import { CONTENT_TYPE_LABELS, POST_STATUS_LABELS } from "@/types/instagram";

interface PostCardProps {
  post: InstagramPost;
  onDeleted?: () => void;
  onPublished?: () => void;
}

const STATUS_CONFIG: Record<InstagramPostStatus, { color: string; icon: React.ReactNode }> = {
  Draft:      { color: "bg-muted text-muted-foreground",          icon: <FileText className="h-3 w-3" /> },
  Scheduled:  { color: "bg-blue-500/15 text-blue-600 dark:text-blue-400",   icon: <Clock className="h-3 w-3" /> },
  Publishing: { color: "bg-yellow-500/15 text-yellow-600",         icon: <AlertCircle className="h-3 w-3" /> },
  Published:  { color: "bg-green-500/15 text-green-600 dark:text-green-400", icon: <CheckCircle2 className="h-3 w-3" /> },
  Failed:     { color: "bg-red-500/15 text-red-600 dark:text-red-400",       icon: <XCircle className="h-3 w-3" /> },
  Cancelled:  { color: "bg-muted text-muted-foreground",           icon: <XCircle className="h-3 w-3" /> },
};

export function PostCard({ post, onDeleted, onPublished }: PostCardProps) {
  const [isPending, startTransition] = useTransition();
  const [localError, setLocalError] = useState<string | null>(null);
  const status = STATUS_CONFIG[post.status];

  const handleDelete = () => {
    startTransition(async () => {
      const res = await actionDeletePost(post.id);
      if (res.success) onDeleted?.();
      else setLocalError(res.error ?? "Delete failed.");
    });
  };

  const handlePublishNow = () => {
    startTransition(async () => {
      const res = await actionPublishNow(post.id);
      if (res.success) onPublished?.();
      else setLocalError(res.error ?? "Publish failed.");
    });
  };

  const formattedDate = (iso: string | null) => {
    if (!iso) return null;
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    });
  };

  return (
    <Card className="group border-border/60 hover:border-border transition-colors bg-card/80 hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Color accent bar */}
          <div className="w-1 rounded-full flex-shrink-0 self-stretch bg-gradient-to-b from-purple-500 to-pink-500 opacity-60" />

          <div className="flex-1 min-w-0">
            {/* Top row */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="text-xs px-2 py-0.5">
                  {CONTENT_TYPE_LABELS[post.content_type]}
                </Badge>
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${status.color}`}>
                  {status.icon}
                  {POST_STATUS_LABELS[post.status]}
                </span>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-opacity focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-6 w-6 opacity-0 group-hover:opacity-100 flex-shrink-0">
                  <MoreHorizontal className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  {(post.status === "Draft" || post.status === "Failed") && (
                    <DropdownMenuItem onClick={handlePublishNow} disabled={isPending}>
                      <Send className="mr-2 h-3.5 w-3.5" />
                      Publish Now
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleDelete}
                    disabled={isPending}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-3.5 w-3.5" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Hook */}
            {post.hook && (
              <p className="text-sm font-semibold text-foreground truncate mb-1">
                {post.hook}
              </p>
            )}

            {/* Caption preview */}
            {post.caption && (
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {post.caption}
              </p>
            )}

            {/* Hashtags count */}
            {post.hashtags && post.hashtags.length > 0 && (
              <p className="text-xs text-purple-500 dark:text-purple-400 mt-1.5">
                {post.hashtags.length} hashtags
              </p>
            )}

            {/* Dates */}
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              {post.scheduled_at && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Scheduled: {formattedDate(post.scheduled_at)}
                </span>
              )}
              {post.published_at && (
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  {formattedDate(post.published_at)}
                </span>
              )}
              {!post.scheduled_at && !post.published_at && (
                <span>Created {formattedDate(post.created_at)}</span>
              )}
            </div>

            {/* Error */}
            {(post.last_error || localError) && (
              <div className="mt-2 rounded-md bg-red-500/10 border border-red-500/20 px-2.5 py-1.5 text-xs text-red-600 dark:text-red-400">
                {localError ?? post.last_error}
              </div>
            )}

            {/* Provider badge */}
            {post.provider === "mock" && post.status === "Published" && (
              <span className="mt-1.5 inline-block text-[10px] text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                Simulated publish
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
