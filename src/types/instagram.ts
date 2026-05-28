// ─── Enums ───────────────────────────────────────────────────────────────────

export type InstagramContentType =
  | "Reel"
  | "Carousel"
  | "Story"
  | "CTACaption"
  | "PromotionalPost"
  | "ProductLaunch"
  | "Educational";

export type InstagramPostStatus =
  | "Draft"
  | "Scheduled"
  | "Publishing"
  | "Published"
  | "Failed"
  | "Cancelled";

export type QueueStatus =
  | "Pending"
  | "Processing"
  | "Completed"
  | "Failed"
  | "Retrying"
  | "Cancelled";

export interface QueueStats {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  retrying: number;
  cancelled: number;
  total: number;
}

export type TemplateCategory =
  | "ProductLaunch"
  | "Educational"
  | "Promotional"
  | "Engagement"
  | "Storytelling"
  | "BehindTheScenes"
  | "Testimonial"
  | "FAQ";

// ─── Content Generation Input ─────────────────────────────────────────────────

export interface ContentGenerationInput {
  productName: string;
  audience: string;
  tone: ContentTone;
  contentType: InstagramContentType;
  ctaStyle: CTAStyle;
  platformGoal: PlatformGoal;
  productId?: string;
  additionalContext?: string;
}

export type ContentTone =
  | "Professional"
  | "Casual"
  | "Inspirational"
  | "Urgent"
  | "Educational"
  | "Playful"
  | "Luxury";

export type CTAStyle =
  | "SoftCTA"       // "Check the link in bio"
  | "DirectCTA"     // "Buy now — link in bio"
  | "EngagementCTA" // "Comment YES if you want this"
  | "QuestionCTA"   // "Which one would you try first?"
  | "NoCTA";

export type PlatformGoal =
  | "DriveTraffic"
  | "IncreaseFollowers"
  | "SellProduct"
  | "BuildAuthority"
  | "IncreaseEngagement"
  | "BuildEmailList";

// ─── Generated Content ────────────────────────────────────────────────────────

export interface CarouselSlide {
  slide: number;
  heading: string;
  body: string;
  visualNote?: string;
}

export interface StoryIdea {
  slide: number;
  textOverlay: string;
  backgroundSuggestion: string;
  cta?: string;
}

export interface GeneratedInstagramContent {
  hook: string;
  caption: string;
  cta: string;
  hashtags: string[];
  carouselSlides?: CarouselSlide[];
  reelScript?: string;
  storyIdeas?: StoryIdea[];
  estimatedEngagement?: string;
  bestPostTime?: string;
}

// ─── Database Row Types ───────────────────────────────────────────────────────

export interface InstagramPost {
  id: string;
  user_id: string;
  product_id: string | null;
  caption: string | null;
  hashtags: string[] | null;
  content_type: InstagramContentType;
  hook: string | null;
  cta: string | null;
  carousel_slides: CarouselSlide[] | null;
  reel_script: string | null;
  story_ideas: StoryIdea[] | null;
  ai_prompt: string | null;
  generated_content: GeneratedInstagramContent | null;
  product_name: string | null;
  audience: string | null;
  tone: string | null;
  platform_goal: string | null;
  cta_style: string | null;
  status: InstagramPostStatus;
  scheduled_at: string | null;
  published_at: string | null;
  publish_attempt: number;
  last_error: string | null;
  provider: string;
  provider_post_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContentSchedule {
  id: string;
  user_id: string;
  post_id: string;
  scheduled_time: string;
  timezone: string;
  queue_status: QueueStatus;
  processing_status: string | null;
  retry_count: number;
  max_retries: number;
  next_retry_at: string | null;
  last_attempted_at: string | null;
  job_id: string | null;
  worker_id: string | null;
  picked_up_at: string | null;
  completed_at: string | null;
  error_log: Array<{ attempt: number; error: string; at: string }> | null;
  created_at: string;
  updated_at: string;
}

export interface TemplateVariable {
  key: string;
  label: string;
  required: boolean;
  placeholder?: string;
}

export interface ContentTemplate {
  id: string;
  user_id: string | null;
  name: string;
  description: string | null;
  category: TemplateCategory;
  content_type: InstagramContentType;
  prompt_template: string;
  variables: TemplateVariable[] | null;
  example_output: GeneratedInstagramContent | null;
  system_template: boolean;
  use_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ─── Service Layer Types ──────────────────────────────────────────────────────

export interface CreatePostInput {
  contentGenerationInput: ContentGenerationInput;
  generatedContent: GeneratedInstagramContent;
  status: InstagramPostStatus;
  scheduledAt?: Date;
}

export interface SchedulePostInput {
  postId: string;
  scheduledTime: Date;
  timezone?: string;
}

export interface QueueJob {
  id: string;
  postId: string;
  scheduledTime: Date;
  retryCount: number;
  maxRetries: number;
}

export interface PublishResult {
  success: boolean;
  providerPostId?: string;
  error?: string;
  simulatedAt?: string;
}

// ─── Provider Interface ───────────────────────────────────────────────────────

export interface IInstagramProvider {
  name: string;
  isLive: boolean;
  publishPost(post: InstagramPost): Promise<PublishResult>;
  validateCredentials(): Promise<{ valid: boolean; error?: string }>;
  getAccountInfo(): Promise<{ username?: string; followersCount?: number } | null>;
}

// ─── Action Response Types ────────────────────────────────────────────────────

export interface ActionResult<T = undefined> {
  success: boolean;
  data?: T;
  error?: string;
}

// ─── UI State Types ───────────────────────────────────────────────────────────

export interface PostWithSchedule extends InstagramPost {
  schedule?: ContentSchedule;
}

export type CalendarView = "month" | "week" | "list";

export interface CalendarDay {
  date: Date;
  posts: InstagramPost[];
  isToday: boolean;
  isCurrentMonth: boolean;
}

// ─── Content Type Labels ──────────────────────────────────────────────────────

export const CONTENT_TYPE_LABELS: Record<InstagramContentType, string> = {
  Reel: "🎬 Reel",
  Carousel: "🎠 Carousel",
  Story: "📖 Story",
  CTACaption: "✍️ CTA Caption",
  PromotionalPost: "📣 Promotional",
  ProductLaunch: "🚀 Product Launch",
  Educational: "🎓 Educational",
};

export const POST_STATUS_LABELS: Record<InstagramPostStatus, string> = {
  Draft: "Draft",
  Scheduled: "Scheduled",
  Publishing: "Publishing...",
  Published: "Published",
  Failed: "Failed",
  Cancelled: "Cancelled",
};

export const TONE_OPTIONS: { value: ContentTone; label: string }[] = [
  { value: "Professional", label: "Professional" },
  { value: "Casual", label: "Casual & Friendly" },
  { value: "Inspirational", label: "Inspirational" },
  { value: "Urgent", label: "Urgent & Scarcity" },
  { value: "Educational", label: "Educational" },
  { value: "Playful", label: "Playful & Fun" },
  { value: "Luxury", label: "Luxury & Exclusive" },
];

export const CTA_STYLE_OPTIONS: { value: CTAStyle; label: string }[] = [
  { value: "SoftCTA", label: "Soft — Link in Bio" },
  { value: "DirectCTA", label: "Direct — Buy Now" },
  { value: "EngagementCTA", label: "Engagement — Comment to Respond" },
  { value: "QuestionCTA", label: "Question — Ask Audience" },
  { value: "NoCTA", label: "No CTA (Organic)" },
];

export const PLATFORM_GOAL_OPTIONS: { value: PlatformGoal; label: string }[] = [
  { value: "SellProduct", label: "Sell Product" },
  { value: "DriveTraffic", label: "Drive Traffic" },
  { value: "IncreaseFollowers", label: "Grow Followers" },
  { value: "BuildAuthority", label: "Build Authority" },
  { value: "IncreaseEngagement", label: "Increase Engagement" },
  { value: "BuildEmailList", label: "Build Email List" },
];
