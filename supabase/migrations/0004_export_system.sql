-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: 0004_export_system.sql
-- Purpose  : Digital Product Export System
--            Adds export columns to products, creates export_logs table,
--            and provisions the product-exports storage bucket.
--            Run AFTER 0003_ai_engine.sql.
-- ─────────────────────────────────────────────────────────────────────────────


-- ══════════════════════════════════════════════════════════════════════════════
-- 1. Extend export_status enum
-- ══════════════════════════════════════════════════════════════════════════════

DO $$ BEGIN
    CREATE TYPE export_status AS ENUM ('idle', 'pending', 'done', 'failed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE export_type AS ENUM ('pdf', 'zip');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ══════════════════════════════════════════════════════════════════════════════
-- 2. Add export columns to products table
-- ══════════════════════════════════════════════════════════════════════════════

ALTER TABLE public.products
    ADD COLUMN IF NOT EXISTS export_status   export_status   NOT NULL DEFAULT 'idle',
    ADD COLUMN IF NOT EXISTS pdf_url         TEXT,
    ADD COLUMN IF NOT EXISTS zip_url         TEXT,
    ADD COLUMN IF NOT EXISTS version         TEXT            NOT NULL DEFAULT 'v1',
    ADD COLUMN IF NOT EXISTS export_metadata JSONB;          -- e.g. page_count, file sizes, durations


-- ══════════════════════════════════════════════════════════════════════════════
-- 3. Create export_logs table
-- ══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.export_logs (
    id               UUID             PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id       UUID             NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    user_id          UUID             NOT NULL REFERENCES auth.users(id)      ON DELETE CASCADE,
    export_type      export_type      NOT NULL,
    status           export_status    NOT NULL DEFAULT 'pending',
    storage_path     TEXT,            -- e.g. products/{id}/pdf/v1/product.pdf
    public_url       TEXT,            -- signed / public download URL
    file_size_bytes  BIGINT,
    version          TEXT             NOT NULL DEFAULT 'v1',
    error_message    TEXT,
    created_at       TIMESTAMPTZ      NOT NULL DEFAULT now(),
    completed_at     TIMESTAMPTZ
);


-- ══════════════════════════════════════════════════════════════════════════════
-- 4. Indexes
-- ══════════════════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_export_logs_product_id
    ON public.export_logs(product_id);

CREATE INDEX IF NOT EXISTS idx_export_logs_user_id
    ON public.export_logs(user_id);

CREATE INDEX IF NOT EXISTS idx_export_logs_created_at
    ON public.export_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_products_export_status
    ON public.products(export_status);


-- ══════════════════════════════════════════════════════════════════════════════
-- 5. Row Level Security for export_logs
-- ══════════════════════════════════════════════════════════════════════════════

ALTER TABLE public.export_logs ENABLE ROW LEVEL SECURITY;

-- Owners can see and insert their own logs
CREATE POLICY "export_logs: owner select"
    ON public.export_logs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "export_logs: owner insert"
    ON public.export_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "export_logs: owner update"
    ON public.export_logs FOR UPDATE
    USING (auth.uid() = user_id);

-- Service role bypasses RLS (used by server-side export pipeline)


-- ══════════════════════════════════════════════════════════════════════════════
-- 6. Create Supabase Storage bucket for product exports
-- ══════════════════════════════════════════════════════════════════════════════

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'product-exports',
    'product-exports',
    FALSE,                     -- private bucket; URLs are signed
    52428800,                  -- 50 MB per file
    ARRAY[
        'application/pdf',
        'application/zip',
        'application/octet-stream',
        'image/png',
        'image/jpeg',
        'image/webp',
        'text/plain'
    ]
)
ON CONFLICT (id) DO NOTHING;


-- ── Storage RLS policies ─────────────────────────────────────────────────────

CREATE POLICY "product-exports: owner read"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'product-exports'
        AND auth.uid()::TEXT = (storage.foldername(name))[2]   -- path: products/{user_id}/...
    );

CREATE POLICY "product-exports: service role write"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'product-exports');

CREATE POLICY "product-exports: service role update"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'product-exports');
