-- ============================================================
-- Migration 004: Instagram Content Automation Engine
-- ============================================================
-- Tables:
--   instagram_posts        - generated/scheduled content
--   content_schedules      - queue management for publishing
--   content_templates      - reusable AI marketing templates
-- ============================================================

-- ── 1. instagram_posts ───────────────────────────────────────────────────────

create type public.instagram_content_type as enum (
  'Reel',
  'Carousel',
  'Story',
  'CTACaption',
  'PromotionalPost',
  'ProductLaunch',
  'Educational'
);

create type public.instagram_post_status as enum (
  'Draft',
  'Scheduled',
  'Publishing',
  'Published',
  'Failed',
  'Cancelled'
);

create table if not exists public.instagram_posts (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  product_id        uuid references public.products(id) on delete set null,

  -- Content
  caption           text,
  hashtags          text[],
  content_type      public.instagram_content_type not null default 'CTACaption',
  hook              text,
  cta               text,
  carousel_slides   jsonb,   -- [{slide: 1, heading: '', body: ''}]
  reel_script       text,
  story_ideas       jsonb,   -- [{idea: '', cta: ''}]

  -- Generation metadata
  ai_prompt         text,
  generated_content jsonb,   -- full raw AI output
  product_name      text,
  audience          text,
  tone              text,
  platform_goal     text,
  cta_style         text,

  -- Status & scheduling
  status            public.instagram_post_status not null default 'Draft',
  scheduled_at      timestamptz,
  published_at      timestamptz,
  publish_attempt   int not null default 0,
  last_error        text,

  -- Provider tracking
  provider          text default 'mock',        -- 'mock' | 'meta_graph'
  provider_post_id  text,                        -- remote ID from provider

  -- Timestamps
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- RLS
alter table public.instagram_posts enable row level security;

create policy "Users can CRUD own instagram posts"
  on public.instagram_posts
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- updated_at trigger
create or replace function public.update_instagram_posts_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_instagram_posts_updated_at
  before update on public.instagram_posts
  for each row execute function public.update_instagram_posts_updated_at();

-- Indexes
create index idx_instagram_posts_user_id      on public.instagram_posts(user_id);
create index idx_instagram_posts_status        on public.instagram_posts(status);
create index idx_instagram_posts_scheduled_at  on public.instagram_posts(scheduled_at);
create index idx_instagram_posts_product_id    on public.instagram_posts(product_id);


-- ── 2. content_schedules ─────────────────────────────────────────────────────

create type public.queue_status as enum (
  'Pending',
  'Processing',
  'Completed',
  'Failed',
  'Retrying',
  'Cancelled'
);

create table if not exists public.content_schedules (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  post_id           uuid not null references public.instagram_posts(id) on delete cascade,

  -- Scheduling
  scheduled_time    timestamptz not null,
  timezone          text not null default 'UTC',

  -- Queue management
  queue_status      public.queue_status not null default 'Pending',
  processing_status text,       -- free-text human-readable status message
  retry_count       int not null default 0,
  max_retries       int not null default 3,
  next_retry_at     timestamptz,
  last_attempted_at timestamptz,

  -- Job metadata
  job_id            text,       -- external job reference (e.g., cron job ID)
  worker_id         text,       -- which worker picked this up
  picked_up_at      timestamptz,
  completed_at      timestamptz,
  error_log         jsonb,      -- [{attempt: 1, error: '...', at: '...'}]

  -- Timestamps
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

alter table public.content_schedules enable row level security;

create policy "Users can CRUD own content schedules"
  on public.content_schedules
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.update_content_schedules_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_content_schedules_updated_at
  before update on public.content_schedules
  for each row execute function public.update_content_schedules_updated_at();

create index idx_content_schedules_user_id      on public.content_schedules(user_id);
create index idx_content_schedules_queue_status  on public.content_schedules(queue_status);
create index idx_content_schedules_scheduled_time on public.content_schedules(scheduled_time);
create index idx_content_schedules_post_id       on public.content_schedules(post_id);


-- ── 3. content_templates ─────────────────────────────────────────────────────

create type public.template_category as enum (
  'ProductLaunch',
  'Educational',
  'Promotional',
  'Engagement',
  'Storytelling',
  'BehindTheScenes',
  'Testimonial',
  'FAQ'
);

create table if not exists public.content_templates (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete cascade,  -- null = system template

  name          text not null,
  description   text,
  category      public.template_category not null default 'Promotional',
  content_type  public.instagram_content_type not null default 'CTACaption',

  -- Template structure
  prompt_template   text not null,   -- interpolatable prompt with {{variables}}
  variables         jsonb,           -- [{key: 'productName', label: 'Product Name', required: true}]
  example_output    jsonb,           -- sample generated content
  system_template   boolean not null default false,

  -- Stats
  use_count     int not null default 0,
  is_active     boolean not null default true,

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.content_templates enable row level security;

create policy "Anyone can read system templates"
  on public.content_templates for select
  using (system_template = true or auth.uid() = user_id);

create policy "Users can manage own templates"
  on public.content_templates for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.update_content_templates_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_content_templates_updated_at
  before update on public.content_templates
  for each row execute function public.update_content_templates_updated_at();

-- ── 4. Seed system templates ──────────────────────────────────────────────────

insert into public.content_templates
  (name, description, category, content_type, prompt_template, variables, system_template)
values
  (
    'Product Launch Reel',
    'High-energy reel hook for a new digital product launch.',
    'ProductLaunch',
    'Reel',
    'Write a high-converting Instagram Reel script for launching {{productName}}. Target audience: {{audience}}. Tone: {{tone}}. Include: attention-grabbing hook (first 3 seconds), value proposition, CTA. Keep total runtime under 60 seconds.',
    '[{"key":"productName","label":"Product Name","required":true},{"key":"audience","label":"Target Audience","required":true},{"key":"tone","label":"Tone","required":false}]',
    true
  ),
  (
    'Carousel Educator',
    '5-slide educational carousel that builds authority.',
    'Educational',
    'Carousel',
    'Create a 5-slide Instagram carousel about {{topic}} for {{audience}}. Slide 1: Bold hook. Slides 2-4: Key insights. Slide 5: Strong CTA to get {{offer}}. Tone: {{tone}}. Keep each slide to 2-3 lines.',
    '[{"key":"topic","label":"Topic","required":true},{"key":"audience","label":"Audience","required":true},{"key":"offer","label":"Offer/CTA","required":true},{"key":"tone","label":"Tone","required":false}]',
    true
  ),
  (
    'Promotional Caption',
    'Urgency-driven promotional post with discount hook.',
    'Promotional',
    'CTACaption',
    'Write a promotional Instagram caption for {{productName}} with {{discount}} discount. Audience: {{audience}}. Create urgency, highlight the main benefit, end with clear CTA. Add 15-20 relevant hashtags.',
    '[{"key":"productName","label":"Product Name","required":true},{"key":"discount","label":"Discount/Offer","required":true},{"key":"audience","label":"Audience","required":true}]',
    true
  ),
  (
    'Story CTA',
    'Quick Story idea with swipe-up style CTA.',
    'Engagement',
    'Story',
    'Create 3 Instagram Story slide ideas for {{productName}}. Each slide: text overlay, background suggestion, and CTA. Goal: {{goal}}. Make it casual and conversational for {{audience}}.',
    '[{"key":"productName","label":"Product Name","required":true},{"key":"goal","label":"Goal","required":true},{"key":"audience","label":"Audience","required":true}]',
    true
  ),
  (
    'Behind The Scenes',
    'Authentic behind-the-scenes caption that builds trust.',
    'BehindTheScenes',
    'CTACaption',
    'Write a behind-the-scenes Instagram caption showing how {{productName}} was created. Tone: authentic and personal. Audience: {{audience}}. Share a challenge overcome and why it matters to them. End with engagement CTA.',
    '[{"key":"productName","label":"Product Name","required":true},{"key":"audience","label":"Audience","required":true}]',
    true
  );
