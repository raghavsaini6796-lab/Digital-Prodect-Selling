"use client";

import { ContentTemplate } from "@/types/instagram";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CONTENT_TYPE_LABELS } from "@/types/instagram";
import { LayoutTemplate, Play, BookOpen, Search, Copy, CheckCircle2 } from "lucide-react";
import { useState } from "react";

interface TemplateGalleryProps {
  templates: ContentTemplate[];
  onSelect?: (template: ContentTemplate) => void;
}

export function TemplateGallery({ templates, onSelect }: TemplateGalleryProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (e: React.MouseEvent, text: string, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (templates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl border-2 border-dashed border-border/40">
        <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-3">
          <LayoutTemplate className="h-6 w-6 text-purple-500" />
        </div>
        <p className="text-sm font-medium text-foreground">No templates found</p>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs">
          Content templates define the structure and tone of your generated posts.
        </p>
      </div>
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "REELS": return <Play className="h-3.5 w-3.5" />;
      case "CAROUSEL": return <BookOpen className="h-3.5 w-3.5" />;
      default: return <Search className="h-3.5 w-3.5" />;
    }
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {templates.map((template) => (
        <Card
          key={template.id}
          className="group border-border/60 hover:border-purple-500/50 transition-all cursor-pointer bg-card/80 hover:shadow-md relative overflow-hidden"
          onClick={() => onSelect?.(template)}
        >
          {/* Accent border */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500 opacity-50 group-hover:opacity-100 transition-opacity" />
          
          <CardContent className="p-4 pt-5">
            <div className="flex items-start justify-between mb-3">
              <Badge variant="secondary" className="flex items-center gap-1.5 text-xs bg-purple-500/10 text-purple-600 dark:text-purple-400 border-none">
                {getIcon(template.content_type)}
                {CONTENT_TYPE_LABELS[template.content_type]}
              </Badge>
              {template.is_active ? (
                <span className="flex items-center gap-1 text-[10px] font-medium text-green-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  Active
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                  Inactive
                </span>
              )}
            </div>

            <h3 className="font-semibold text-sm mb-1">{template.name}</h3>
            <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
              {template.description}
            </p>

            <div className="bg-muted/40 rounded-lg p-3 relative group/code">
              <p className="text-[10px] font-mono text-muted-foreground line-clamp-3">
                {template.prompt_template}
              </p>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 absolute top-2 right-2 opacity-0 group-hover/code:opacity-100 transition-opacity bg-background/80 backdrop-blur"
                onClick={(e) => handleCopy(e, template.prompt_template, template.id)}
              >
                {copiedId === template.id ? (
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
