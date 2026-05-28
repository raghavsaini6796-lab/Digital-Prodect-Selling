-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: 0003_ai_engine.sql
-- Purpose  : Expand ai_generations + products tables for the AI engine.
--            Run AFTER 0002_expanded_schema.sql.
-- ─────────────────────────────────────────────────────────────────────────────


-- ══════════════════════════════════════════════════════════════════════════════
-- 1. Expand generation_type enum for all supported product types
-- ══════════════════════════════════════════════════════════════════════════════

DO $$ BEGIN
    ALTER TYPE generation_type ADD VALUE IF NOT EXISTS 'ProductIdea';
EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN
    ALTER TYPE generation_type ADD VALUE IF NOT EXISTS 'PromptPack';
EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN
    ALTER TYPE generation_type ADD VALUE IF NOT EXISTS 'MiniPDF';
EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN
    ALTER TYPE generation_type ADD VALUE IF NOT EXISTS 'InstagramCaption';
EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN
    ALTER TYPE generation_type ADD VALUE IF NOT EXISTS 'ProductDescription';
EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN
    ALTER TYPE generation_type ADD VALUE IF NOT EXISTS 'ProductTags';
EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN
    ALTER TYPE generation_type ADD VALUE IF NOT EXISTS 'CTA';
EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN
    ALTER TYPE generation_type ADD VALUE IF NOT EXISTS 'FullProduct';
EXCEPTION WHEN others THEN NULL; END $$;


-- ══════════════════════════════════════════════════════════════════════════════
-- 2. Add engine metadata columns to ai_generations
-- ══════════════════════════════════════════════════════════════════════════════

ALTER TABLE public.ai_generations
    ADD COLUMN IF NOT EXISTS product_type   TEXT,          -- e.g. 'PromptPack', 'InstagramToolkit'
    ADD COLUMN IF NOT EXISTS niche          TEXT,          -- e.g. 'fitness', 'crypto'
    ADD COLUMN IF NOT EXISTS audience       TEXT,          -- e.g. 'beginners', 'entrepreneurs'
    ADD COLUMN IF NOT EXISTS tone           TEXT,          -- e.g. 'professional', 'casual'
    ADD COLUMN IF NOT EXISTS price_range    TEXT,          -- e.g. '$7-$27'
    ADD COLUMN IF NOT EXISTS content_length TEXT,          -- 'short' | 'medium' | 'long'
    ADD COLUMN IF NOT EXISTS tokens_used    INT,           -- total tokens consumed
    ADD COLUMN IF NOT EXISTS generation_ms  INT,           -- latency in ms
    ADD COLUMN IF NOT EXISTS saved_product_id UUID REFERENCES public.products(id) ON DELETE SET NULL;


-- ══════════════════════════════════════════════════════════════════════════════
-- 3. Expand products table with AI-origin columns
-- ══════════════════════════════════════════════════════════════════════════════

ALTER TABLE public.products
    ADD COLUMN IF NOT EXISTS ai_generated      BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS ai_generation_id  UUID REFERENCES public.ai_generations(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS sections          JSONB,           -- structured content sections
    ADD COLUMN IF NOT EXISTS cta               TEXT,            -- call-to-action
    ADD COLUMN IF NOT EXISTS instagram_caption TEXT,
    ADD COLUMN IF NOT EXISTS hashtags          TEXT[];          -- suggested hashtags


-- ══════════════════════════════════════════════════════════════════════════════
-- 4. Index new columns
-- ══════════════════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_ai_generations_product_type
    ON public.ai_generations(product_type);

CREATE INDEX IF NOT EXISTS idx_ai_generations_status
    ON public.ai_generations(status);

CREATE INDEX IF NOT EXISTS idx_products_ai_generated
    ON public.products(ai_generated);
