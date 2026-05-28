-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: 0005_fix_missing_columns.sql
-- Purpose  : Add all missing columns that were defined in local migrations
--            but never ran on the live Supabase database.
--            Safe to run multiple times (uses IF NOT EXISTS / IF EXISTS guards).
-- ─────────────────────────────────────────────────────────────────────────────


-- ══════════════════════════════════════════════════════════════════════════════
-- 1. ENUMS (safe - skip if already exists)
-- ══════════════════════════════════════════════════════════════════════════════

DO $$ BEGIN
    CREATE TYPE product_type AS ENUM ('Image Bundle', 'Document', 'Template', 'Video', 'Audio');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE product_status AS ENUM ('Active', 'Draft', 'Archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('Completed', 'Pending', 'Refunded', 'Failed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE payment_provider AS ENUM ('stripe', 'paypal', 'manual');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('paid', 'pending', 'refunded', 'failed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE generation_type AS ENUM ('Image', 'Caption', 'Text');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE generation_status AS ENUM ('Ready', 'Processing', 'Failed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ══════════════════════════════════════════════════════════════════════════════
-- 2. PRODUCTS TABLE — add all missing columns
-- ══════════════════════════════════════════════════════════════════════════════

ALTER TABLE public.products
    ADD COLUMN IF NOT EXISTS user_id         UUID            REFERENCES auth.users(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS type            product_type    NOT NULL DEFAULT 'Document',
    ADD COLUMN IF NOT EXISTS status          product_status  NOT NULL DEFAULT 'Draft',
    ADD COLUMN IF NOT EXISTS thumbnail_url   TEXT,
    ADD COLUMN IF NOT EXISTS download_url    TEXT,
    ADD COLUMN IF NOT EXISTS tags            TEXT[]          NOT NULL DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS ai_generated    BOOLEAN         NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS ai_generation_id UUID,
    ADD COLUMN IF NOT EXISTS sections        JSONB,
    ADD COLUMN IF NOT EXISTS cta             TEXT,
    ADD COLUMN IF NOT EXISTS instagram_caption TEXT,
    ADD COLUMN IF NOT EXISTS hashtags        TEXT[];

-- Rename file_url -> thumbnail_url if data exists there
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name='products' AND column_name='file_url'
    ) THEN
        UPDATE public.products SET thumbnail_url = file_url WHERE thumbnail_url IS NULL AND file_url IS NOT NULL;
    END IF;
END;
$$;


-- ══════════════════════════════════════════════════════════════════════════════
-- 3. PRODUCTS RLS
-- ══════════════════════════════════════════════════════════════════════════════

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Users can manage their own products"
        ON public.products FOR ALL
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ══════════════════════════════════════════════════════════════════════════════
-- 4. ORDERS TABLE — add missing columns
-- ══════════════════════════════════════════════════════════════════════════════

ALTER TABLE public.orders
    ADD COLUMN IF NOT EXISTS customer_email    TEXT,
    ADD COLUMN IF NOT EXISTS payment_status    payment_status  NOT NULL DEFAULT 'pending',
    ADD COLUMN IF NOT EXISTS payment_provider  payment_provider,
    ADD COLUMN IF NOT EXISTS payment_reference TEXT;

-- Add order_status column if missing
ALTER TABLE public.orders
    ADD COLUMN IF NOT EXISTS order_status  order_status  NOT NULL DEFAULT 'Pending';


-- ══════════════════════════════════════════════════════════════════════════════
-- 5. UPDATED_AT trigger function (safe recreate)
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger on products (safe: drop then recreate)
DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ══════════════════════════════════════════════════════════════════════════════
-- 6. AI_GENERATIONS TABLE — add missing columns
-- ══════════════════════════════════════════════════════════════════════════════

ALTER TABLE public.ai_generations
    ADD COLUMN IF NOT EXISTS name         TEXT,
    ADD COLUMN IF NOT EXISTS output       TEXT,
    ADD COLUMN IF NOT EXISTS model_used   TEXT,
    ADD COLUMN IF NOT EXISTS metadata     JSONB;

-- Backfill name from prompt if empty
UPDATE public.ai_generations
    SET name = LEFT(prompt, 50)
    WHERE name IS NULL AND prompt IS NOT NULL;


-- ══════════════════════════════════════════════════════════════════════════════
-- 7. PROFILES TABLE — add missing columns
-- ══════════════════════════════════════════════════════════════════════════════

ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS avatar_url    TEXT,
    ADD COLUMN IF NOT EXISTS store_name    TEXT,
    ADD COLUMN IF NOT EXISTS custom_domain TEXT;


-- ══════════════════════════════════════════════════════════════════════════════
-- 8. INDEXES
-- ══════════════════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_products_user_id    ON public.products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_status     ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_orders_user_id      ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_product_id   ON public.orders(product_id);
CREATE INDEX IF NOT EXISTS idx_ai_gen_user_id      ON public.ai_generations(user_id);
