"use client";

import { useState, useTransition } from "react";
import { RefreshCw, Loader2, CheckCircle2, Clock, AlertCircle, XCircle, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { QueueStats } from "@/types/instagram";

interface QueueStatusProps {
  stats: QueueStats;
  onRefresh?: () => void;
}

export function QueueStatus({ stats, onRefresh }: QueueStatusProps) {
  const [isPending, startTransition] = useTransition();
  const [triggerMsg, setTriggerMsg] = useState<string | null>(null);

  const handleTriggerProcess = () => {
    startTransition(async () => {
      setTriggerMsg(null);
      try {
        const cronSecret = process.env.NEXT_PUBLIC_CRON_SECRET_HINT ?? "";
        const res = await fetch("/api/instagram/queue/process", {
          method: "POST",
          headers: cronSecret ? { Authorization: `Bearer ${cronSecret}` } : {},
        });
        const data = await res.json();
        if (data.ok) {
          setTriggerMsg(
            `✅ Queue processed — ${data.succeeded ?? 0} succeeded, ${data.failed ?? 0} failed (${data.durationMs ?? 0}ms)`
          );
          onRefresh?.();
        } else {
          setTriggerMsg(`❌ ${data.error ?? "Queue processing failed."}`);
        }
      } catch {
        setTriggerMsg("❌ Failed to reach queue endpoint.");
      }
    });
  };

  const statItems = [
    {
      label: "Pending",
      value: stats.pending,
      icon: <Clock className="h-4 w-4" />,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "Processing",
      value: stats.processing,
      icon: <Loader2 className="h-4 w-4 animate-spin" />,
      color: "text-yellow-500",
      bg: "bg-yellow-500/10",
    },
    {
      label: "Completed",
      value: stats.completed,
      icon: <CheckCircle2 className="h-4 w-4" />,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      label: "Failed",
      value: stats.failed,
      icon: <XCircle className="h-4 w-4" />,
      color: "text-red-500",
      bg: "bg-red-500/10",
    },
    {
      label: "Retrying",
      value: stats.retrying,
      icon: <AlertCircle className="h-4 w-4" />,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
  ];

  return (
    <Card className="border-border/60 bg-card/80">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="h-4 w-4 text-yellow-500" />
              Queue Status
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              {stats.total} total jobs · Auto-processes every minute via cron
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onRefresh}
              disabled={isPending}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isPending ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Stats grid */}
        <div className="grid grid-cols-5 gap-2">
          {statItems.map((item) => (
            <div
              key={item.label}
              className={`rounded-xl ${item.bg} p-3 flex flex-col items-center gap-1`}
            >
              <span className={item.color}>{item.icon}</span>
              <span className={`text-xl font-bold ${item.color}`}>{item.value}</span>
              <span className="text-[10px] text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Health indicator */}
        <div className="flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-2">
          <div className={`h-2 w-2 rounded-full ${
            stats.failed > 0 ? "bg-red-500 animate-pulse" :
            stats.processing > 0 ? "bg-yellow-500 animate-pulse" :
            stats.pending > 0 ? "bg-blue-500" :
            "bg-green-500"
          }`} />
          <span className="text-xs text-muted-foreground">
            {stats.failed > 0
              ? `${stats.failed} job(s) failed — check error logs`
              : stats.processing > 0
              ? "Currently processing..."
              : stats.pending > 0
              ? `${stats.pending} job(s) queued and waiting`
              : "Queue is clear"}
          </span>
        </div>

        {/* Manual trigger */}
        <div className="border-t border-border/40 pt-3 space-y-2">
          <p className="text-xs text-muted-foreground font-medium">Manual Queue Trigger</p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleTriggerProcess}
            disabled={isPending}
            className="w-full text-xs"
          >
            {isPending ? (
              <><Loader2 className="mr-2 h-3 w-3 animate-spin" />Processing queue...</>
            ) : (
              <><Zap className="mr-2 h-3 w-3" />Run Queue Now</>
            )}
          </Button>
          {triggerMsg && (
            <p className="text-xs text-muted-foreground">{triggerMsg}</p>
          )}
          <p className="text-[10px] text-muted-foreground/60">
            In production, this runs automatically every minute via Vercel Cron.
            Use this button to trigger it manually during development.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
