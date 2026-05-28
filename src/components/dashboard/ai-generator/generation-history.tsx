"use client";

/**
 * Generation History Sidebar
 *
 * Displays recent AI generations with status badges and timestamps.
 */

import { Clock, CheckCircle2, XCircle, Loader2, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface GenerationHistoryItem {
  id: string;
  name: string;
  product_type: string | null;
  niche: string | null;
  status: string;
  tokens_used: number | null;
  generation_ms: number | null;
  created_at: string;
  saved_product_id: string | null;
}

interface GenerationHistoryProps {
  items: GenerationHistoryItem[];
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  if (status === "Ready")
    return (
      <div className="flex items-center gap-1 text-emerald-500">
        <CheckCircle2 className="h-3 w-3" />
        <span className="text-[10px] font-medium">Ready</span>
      </div>
    );
  if (status === "Failed")
    return (
      <div className="flex items-center gap-1 text-destructive">
        <XCircle className="h-3 w-3" />
        <span className="text-[10px] font-medium">Failed</span>
      </div>
    );
  return (
    <div className="flex items-center gap-1 text-amber-500">
      <Loader2 className="h-3 w-3 animate-spin" />
      <span className="text-[10px] font-medium">Processing</span>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function GenerationHistory({ items }: GenerationHistoryProps) {
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3 pt-4 px-4">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          Recent Generations
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        {items.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">
            No generations yet. Create your first product!
          </p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex gap-3 group rounded-lg p-2 -mx-2 hover:bg-muted/40 transition-colors"
              >
                <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Package className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <p className="text-xs font-medium truncate leading-tight">
                      {item.name}
                    </p>
                    {item.saved_product_id && (
                      <span className="flex-shrink-0 text-[9px] bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded-full font-medium">
                        Saved
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-0.5">
                    {item.product_type && (
                      <span className="text-[10px] text-muted-foreground">
                        {item.product_type}
                      </span>
                    )}
                    <span className="text-[10px] text-muted-foreground">·</span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(item.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <div className="mt-1 flex items-center gap-2">
                    <StatusBadge status={item.status} />
                    {item.tokens_used && (
                      <>
                        <span className="text-[10px] text-muted-foreground/60">·</span>
                        <span className="text-[10px] text-muted-foreground/60">
                          {item.tokens_used.toLocaleString()} tokens
                        </span>
                      </>
                    )}
                    {item.generation_ms && (
                      <>
                        <span className="text-[10px] text-muted-foreground/60">·</span>
                        <span className="text-[10px] text-muted-foreground/60">
                          {(item.generation_ms / 1000).toFixed(1)}s
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
