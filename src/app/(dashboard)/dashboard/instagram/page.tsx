/**
 * Refactored Instagram Dashboard View Page
 * Path: /src/app/(dashboard)/dashboard/instagram/page.tsx
 *
 * Implements a spacious, premium, responsive grid layout (12-column layout)
 * to resolve overlapping panel wrappers and visual clashing.
 */

import type { Metadata } from "next";
import { Share2, Calendar, PenTool, LayoutTemplate, Clock, CheckCircle2, FileText, Settings, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/common/page-header";
import { SectionLayout } from "@/components/common/section-layout";

import { ContentGenerator } from "@/components/instagram/content-generator";
import InstagramContentGenerator from "@/components/instagram/instagram-content-generator";
import { ContentCalendar } from "@/components/instagram/content-calendar";
import { DraftPosts } from "@/components/instagram/draft-posts";
import { ScheduledPosts } from "@/components/instagram/scheduled-posts";
import { PublishedPosts } from "@/components/instagram/published-posts";
import { QueueStatus } from "@/components/instagram/queue-status";
import { TemplateGallery } from "@/components/instagram/template-gallery";

import {
  actionGetPosts,
  actionGetPostsWithSchedules,
  actionGetQueueStats,
  actionGetTemplates,
} from "@/app/actions/instagram";

import { actionGetInstagramAccount } from "@/app/actions/instagram-connection";
import { OAuthService } from "@/services/oauth/oauth.service";

export const metadata: Metadata = {
  title: "Instagram Automation Engine",
  description: "Generate, schedule, and publish Instagram content.",
};

export default async function InstagramPage() {
  // Fetch initial data concurrently
  const [
    draftsRes,
    scheduledRes,
    publishedRes,
    statsRes,
    templatesRes,
    accountRes
  ] = await Promise.all([
    actionGetPosts("Draft"),
    actionGetPostsWithSchedules(100),
    actionGetPosts("Published", 50),
    actionGetQueueStats(),
    actionGetTemplates(),
    actionGetInstagramAccount("1"), // Fallback dynamic query uses standard user contexts
  ]);

  const drafts = draftsRes.success && draftsRes.data ? draftsRes.data : [];
  const scheduledPosts = scheduledRes.success && scheduledRes.data ? scheduledRes.data : [];
  const publishedPosts = publishedRes.success && publishedRes.data ? publishedRes.data : [];
  
  const defaultStats = { total: 0, pending: 0, processing: 0, completed: 0, failed: 0, retrying: 0, cancelled: 0 };
  const queueStats = statsRes.success && statsRes.data ? statsRes.data : defaultStats;
  
  const templates = templatesRes.success && templatesRes.data ? templatesRes.data : [];
  const connectedAccount = accountRes.success && accountRes.data ? accountRes.data : null;

  // Build OAuth URL
  const metaAuthUrl = OAuthService.getAuthorizationUrl();

  return (
    <SectionLayout>
      {/* Dynamic Connected Account Alert Bar at top for clean discovery */}
      {connectedAccount ? (
        <div className="mb-4 flex items-center justify-between bg-purple-500/10 border border-purple-500/20 px-4 py-2.5 rounded-xl backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Instagram Business Linked: <span className="text-purple-600 dark:text-purple-400">@{connectedAccount.account_name || "linked_user"}</span>
              </p>
              <p className="text-[10px] text-muted-foreground">Connected to Page ID: {connectedAccount.facebook_page_id}</p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-green-500/20 text-green-700 dark:text-green-300 rounded-full">
            Active
          </span>
        </div>
      ) : (
        <div className="mb-4 flex flex-col md:flex-row items-center justify-between bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 p-4 rounded-xl backdrop-blur-sm gap-4">
          <div>
            <p className="text-sm font-semibold text-foreground">Link Facebook Page & Instagram Business Account</p>
            <p className="text-xs text-muted-foreground">Connect your accounts to enable automated visual scheduling and queue processors.</p>
          </div>
          <a href={metaAuthUrl}>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md text-xs px-4 py-2 h-auto">
              <Share2 className="mr-2 h-3.5 w-3.5" />
              Connect Meta Account
            </Button>
          </a>
        </div>
      )}

      <PageHeader 
        title="Instagram Automation Engine" 
        description="End-to-end pipeline: from AI generation to scheduled publishing."
      />

      {/* Spacious 12-Column Responsive Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 mt-6">
        
        {/* Left Column: Form & Prompt Templates (5 cols span) */}
        <div className="xl:col-span-9 space-y-6">
          <Tabs defaultValue="create" className="w-full flex-col">
            <TabsList className="mb-4 flex flex-wrap w-full lg:w-fit gap-2">
              <TabsTrigger value="create">
                <PenTool className="mr-2 h-4 w-4" />
                Create Post
              </TabsTrigger>
              <TabsTrigger value="generate">
                <Zap className="mr-2 h-4 w-4" />
                AI Generate
              </TabsTrigger>
              <TabsTrigger value="drafts">
                <FileText className="mr-2 h-4 w-4" />
                Drafts ({drafts.length})
              </TabsTrigger>
              <TabsTrigger value="scheduled">
                <Clock className="mr-2 h-4 w-4" />
                Scheduled ({scheduledPosts.filter(p => p.status === "Scheduled").length})
              </TabsTrigger>
              <TabsTrigger value="published">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Published
              </TabsTrigger>
            </TabsList>
            
            {/* Manual Content Creation Tab */}
            <TabsContent value="create" className="space-y-6">
              <InstagramContentGenerator />
            </TabsContent>

            {/* AI Generate Content Tab */}
            <TabsContent value="generate" className="space-y-6">
              <ContentGenerator />
              
              <div className="mt-8 border-t border-border/40 pt-8">
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <LayoutTemplate className="h-5 w-5 text-purple-500" />
                  Prompt Templates
                </h3>
                <TemplateGallery templates={templates} />
              </div>
            </TabsContent>

            {/* Drafts Tab */}
            <TabsContent value="drafts">
              <DraftPosts initialPosts={drafts} />
            </TabsContent>

            {/* Scheduled Tab */}
            <TabsContent value="scheduled">
              <ScheduledPosts initialPosts={scheduledPosts} />
            </TabsContent>

            {/* Published Tab */}
            <TabsContent value="published">
              <PublishedPosts initialPosts={publishedPosts} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Sidebar Column: Queue status & Calendar overview (3 cols span) */}
        <div className="xl:col-span-3 space-y-6">
          <QueueStatus stats={queueStats} />
          
          <div className="rounded-xl border border-border/60 bg-card/50 p-4">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-4 w-4 text-purple-500" />
              <h3 className="font-semibold text-sm">Schedule Overview</h3>
            </div>
            <ContentCalendar posts={[...scheduledPosts, ...publishedPosts]} />
          </div>
        </div>

      </div>
    </SectionLayout>
  );
}
