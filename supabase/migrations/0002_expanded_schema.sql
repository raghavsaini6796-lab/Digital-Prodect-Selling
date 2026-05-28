-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: 0002_expanded_schema.sql
-- Purpose  : Expand tables to match production requirements.
--            Run AFTER 0001_initial_schema.sql.
-- ─────────────────────────────────────────────────────────────────────────────


-- ══════════════════════════════════════════════════════════════════════════════
-- 1. PROFILES TABLE
-- Auto-populated via trigger when a new user signs up via Supabase Auth.
-- ══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.profiles (
    id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email       TEXT NOT NULL,
    full_name   TEXT,
    avatar_url  TEXT,
    store_name  TEXT,
    custom_domain TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Trigger: auto-create profile row when a new auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data ->> 'full_name',
        NEW.raw_user_meta_data ->> 'avatar_url'
    );
    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at trigger for profiles
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ══════════════════════════════════════════════════════════════════════════════
-- 2. EXPAND PRODUCTS TABLE
-- Add: thumbnail_url, download_url, tags (array)
-- ══════════════════════════════════════════════════════════════════════════════

ALTER TABLE public.products
    ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
    ADD COLUMN IF NOT EXISTS download_url  TEXT,
    ADD COLUMN IF NOT EXISTS tags          TEXT[] NOT NULL DEFAULT '{}';

-- Rename image_url -> thumbnail_url if old column exists (safe: idempotent via IF EXISTS)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name='products' AND column_name='image_url'
    ) THEN
        -- Copy data then drop old column
        UPDATE public.products SET thumbnail_url = image_url WHERE thumbnail_url IS NULL;
        ALTER TABLE public.products DROP COLUMN IF EXISTS image_url;
    END IF;
END;
$$;


-- ══════════════════════════════════════════════════════════════════════════════
-- 3. EXPAND ORDERS TABLE
-- Add: order_status, payment_status, payment_provider, payment_reference
-- ══════════════════════════════════════════════════════════════════════════════

-- New enums
DO $$ BEGIN
    CREATE TYPE payment_provider AS ENUM ('stripe', 'paypal', 'manual');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('paid', 'pending', 'refunded', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

ALTER TABLE public.orders
    ADD COLUMN IF NOT EXISTS order_status       order_status       NOT NULL DEFAULT 'Pending',
    ADD COLUMN IF NOT EXISTS payment_status     payment_status     NOT NULL DEFAULT 'pending',
    ADD COLUMN IF NOT EXISTS payment_provider   payment_provider,
    ADD COLUMN IF NOT EXISTS payment_reference  TEXT;

-- Migrate old `status` column -> `order_status` (if old column exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name='orders' AND column_name='status'
    ) THEN
        UPDATE public.orders SET order_status = status::order_status;
        ALTER TABLE public.orders DROP COLUMN IF EXISTS status;
    END IF;
END;
$$;


-- ══════════════════════════════════════════════════════════════════════════════
-- 4. CREATE AI_GENERATIONS TABLE (replace old 'generations' table)
-- ══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.ai_generations (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name             TEXT NOT NULL,
    prompt           TEXT NOT NULL,
    output           TEXT,                          -- URL or text result
    generation_type  generation_type NOT NULL DEFAULT 'Image',
    status           generation_status NOT NULL DEFAULT 'Processing',
    model_used       TEXT,                          -- e.g. 'dall-e-3', 'gpt-4o'
    metadata         JSONB,                         -- flexible extra output data
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own generations"
    ON public.ai_generations FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_ai_generations_updated_at
    BEFORE UPDATE ON public.ai_generations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Migrate data from old 'generations' table if it exists
INSERT INTO public.ai_generations (
    id, user_id, name, prompt, output, generation_type, status, created_at, updated_at
)
SELECT
    id,
    user_id,
    name,
    COALESCE(prompt, name),
    result_url,
    type::generation_type,
    status::generation_status,
    created_at,
    updated_at
FROM public.generations
ON CONFLICT (id) DO NOTHING;

-- Drop old table after migration (comment out if you need to keep history)
-- DROP TABLE IF EXISTS public.generations;


-- ══════════════════════════════════════════════════════════════════════════════
-- 5. INDEXES for common queries
-- ══════════════════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_products_user_id ON public.products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_status  ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_orders_user_id   ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_product_id ON public.orders(product_id);
CREATE INDEX IF NOT EXISTS idx_ai_generations_user_id ON public.ai_generations(user_id);
