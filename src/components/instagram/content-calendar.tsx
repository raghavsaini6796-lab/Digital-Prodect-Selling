"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { InstagramPost } from "@/types/instagram";
import { CONTENT_TYPE_LABELS } from "@/types/instagram";

interface ContentCalendarProps {
  posts: InstagramPost[];
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const STATUS_DOT: Record<string, string> = {
  Draft:      "bg-muted-foreground",
  Scheduled:  "bg-blue-500",
  Publishing: "bg-yellow-500",
  Published:  "bg-green-500",
  Failed:     "bg-red-500",
  Cancelled:  "bg-muted-foreground",
};

export function ContentCalendar({ posts }: ContentCalendarProps) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  // Build calendar grid
  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrev = new Date(year, month, 0).getDate();

    const days: { date: Date; isCurrentMonth: boolean }[] = [];

    // Previous month padding
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ date: new Date(year, month - 1, daysInPrev - i), isCurrentMonth: false });
    }
    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({ date: new Date(year, month, d), isCurrentMonth: true });
    }
    // Next month padding
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      days.push({ date: new Date(year, month + 1, d), isCurrentMonth: false });
    }
    return days;
  }, [viewDate]);

  // Map posts to date keys
  const postsByDate = useMemo(() => {
    const map = new Map<string, InstagramPost[]>();
    for (const post of posts) {
      const dateKey = post.scheduled_at
        ? post.scheduled_at.slice(0, 10)
        : post.published_at
        ? post.published_at.slice(0, 10)
        : null;
      if (!dateKey) continue;
      if (!map.has(dateKey)) map.set(dateKey, []);
      map.get(dateKey)!.push(post);
    }
    return map;
  }, [posts]);

  const prevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  const nextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

  const selectedPosts = selectedDay
    ? postsByDate.get(selectedDay.toISOString().slice(0, 10)) ?? []
    : [];

  const isToday = (d: Date) =>
    d.toDateString() === today.toDateString();

  const isSelected = (d: Date) =>
    selectedDay?.toDateString() === d.toDateString();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">
          {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
        </h3>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setViewDate(new Date(today.getFullYear(), today.getMonth(), 1))}>
            Today
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 gap-1">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map(({ date, isCurrentMonth }, idx) => {
          const key = date.toISOString().slice(0, 10);
          const dayPosts = postsByDate.get(key) ?? [];
          const hasPosts = dayPosts.length > 0;

          return (
            <button
              key={idx}
              onClick={() => setSelectedDay(isSelected(date) ? null : date)}
              className={`
                relative min-h-[52px] rounded-lg p-1.5 text-left transition-all border
                ${isCurrentMonth ? "bg-card" : "bg-muted/30 opacity-50"}
                ${isToday(date) ? "border-purple-500 ring-1 ring-purple-500/30" : "border-border/40"}
                ${isSelected(date) ? "border-purple-500 bg-purple-500/10" : "hover:border-border hover:bg-muted/50"}
              `}
            >
              <span className={`text-xs font-medium block leading-none mb-1 ${
                isToday(date) ? "text-purple-500 font-bold" : isCurrentMonth ? "text-foreground" : "text-muted-foreground"
              }`}>
                {date.getDate()}
              </span>

              {hasPosts && (
                <div className="flex flex-wrap gap-0.5">
                  {dayPosts.slice(0, 3).map((p) => (
                    <div key={p.id} className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[p.status]}`} />
                  ))}
                  {dayPosts.length > 3 && (
                    <span className="text-[8px] text-muted-foreground">+{dayPosts.length - 3}</span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
        {Object.entries(STATUS_DOT).filter(([k]) => k !== "Cancelled").map(([status, cls]) => (
          <span key={status} className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${cls}`} />
            {status}
          </span>
        ))}
      </div>

      {/* Selected day detail */}
      {selectedDay && (
        <div className="rounded-xl border border-border/60 bg-card/80 p-4 space-y-3">
          <h4 className="text-sm font-semibold">
            {selectedDay.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            <span className="ml-2 text-muted-foreground font-normal">
              {selectedPosts.length} post{selectedPosts.length !== 1 ? "s" : ""}
            </span>
          </h4>

          {selectedPosts.length === 0 ? (
            <p className="text-xs text-muted-foreground">No posts scheduled for this day.</p>
          ) : (
            <div className="space-y-2">
              {selectedPosts.map((post) => (
                <div key={post.id} className="flex items-start gap-2.5 rounded-lg bg-muted/40 p-2.5">
                  <div className={`mt-0.5 h-2 w-2 rounded-full flex-shrink-0 ${STATUS_DOT[post.status]}`} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        {CONTENT_TYPE_LABELS[post.content_type]}
                      </Badge>
                      {post.scheduled_at && (
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(post.scheduled_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-foreground mt-0.5 truncate">
                      {post.hook ?? post.caption?.slice(0, 60) ?? "No caption"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
