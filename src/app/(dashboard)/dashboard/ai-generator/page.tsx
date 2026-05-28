import type { Metadata } from "next";
import { Sparkles, TrendingUp, Package, Zap } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/common/page-header";
import { SectionLayout } from "@/components/common/section-layout";
import { GeneratorClient } from "@/components/dashboard/ai-generator/generator-client";
import { GenerationHistory } from "@/components/dashboard/ai-generator/generation-history";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "AI Product Generator",
  description:
    "Generate ready-to-sell digital products using structured AI generation pipelines.",
};

// ─── Stats Card ───────────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <Card className="border-border/40 bg-card/40 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            {icon}
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">{label}</p>
            <p className="text-xl font-black leading-tight">{value}</p>
            {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AIGeneratorPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ── Fetch recent generations ──────────────────────────────────────────────
  const { data: generations } = await supabase
    .from("ai_generations")
    .select(
      "id, name, product_type, niche, status, tokens_used, generation_ms, created_at, saved_product_id"
    )
    .eq("user_id", user?.id ?? "")
    .order("created_at", { ascending: false })
    .limit(15);

  // ── Compute stats ─────────────────────────────────────────────────────────
  const totalGenerations = generations?.length ?? 0;
  const successfulGenerations =
    generations?.filter((g) => g.status === "Ready").length ?? 0;
  const savedProducts =
    generations?.filter((g) => g.saved_product_id !== null).length ?? 0;
  const totalTokens =
    generations?.reduce((sum, g) => sum + (g.tokens_used ?? 0), 0) ?? 0;

  return (
    <SectionLayout>
      <PageHeader
        title="AI Product Generator"
        description="Generate ready-to-sell digital products in seconds with structured AI pipelines."
      />

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard
          icon={<Sparkles className="h-4 w-4 text-primary" />}
          label="Total Generated"
          value={totalGenerations}
          sub="all time"
        />
        <StatCard
          icon={<Zap className="h-4 w-4 text-emerald-500" />}
          label="Successful"
          value={successfulGenerations}
          sub={
            totalGenerations > 0
              ? `${Math.round((successfulGenerations / totalGenerations) * 100)}% success rate`
              : "no data yet"
          }
        />
        <StatCard
          icon={<Package className="h-4 w-4 text-blue-500" />}
          label="Saved Products"
          value={savedProducts}
          sub="in your library"
        />
        <StatCard
          icon={<TrendingUp className="h-4 w-4 text-violet-500" />}
          label="Tokens Used"
          value={totalTokens > 1000 ? `${(totalTokens / 1000).toFixed(1)}k` : totalTokens}
          sub="total consumption"
        />
      </div>

      {/* Main Layout */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Generator Workspace */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">Generator Workspace</h2>
              <p className="text-xs text-muted-foreground">
                Fill in the form below to generate your digital product
              </p>
            </div>
          </div>

          <GeneratorClient />
        </div>

        {/* Sidebar: Generation History */}
        <div className="space-y-4">
          {/* Supported Products */}
          <Card className="border-border/40 bg-gradient-to-br from-violet-950/30 to-indigo-950/30 backdrop-blur-sm">
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Supported Products
              </p>
              <div className="space-y-1.5">
                {[
                  { name: "Prompt Pack", emoji: "🤖" },
                  { name: "Instagram Toolkit", emoji: "📸" },
                  { name: "AI Business Guide", emoji: "📈" },
                  { name: "Canva Content Pack", emoji: "🎨" },
                  { name: "Study Notes", emoji: "📚" },
                  { name: "Mini Course Outline", emoji: "🎓" },
                ].map((p) => (
                  <div
                    key={p.name}
                    className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <span>{p.emoji}</span>
                    <span>{p.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* History */}
          <GenerationHistory items={generations ?? []} />
        </div>
      </div>
    </SectionLayout>
  );
}
