-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: 0006_payment_system.sql
-- Purpose  : Full Razorpay payment, orders, delivery, and download system
-- Safe to run multiple times (IF NOT EXISTS / IF EXISTS guards)
-- ─────────────────────────────────────────────────────────────────────────────

-- ══════════════════════════════════════════════════════════════════════════════
-- 1. ENUMS
-- ══════════════════════════════════════════════════════════════════════════════

DO $$ BEGIN
    CREATE TYPE delivery_status AS ENUM ('pending', 'delivered', 'failed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER TYPE payment_provider ADD VALUE IF NOT EXISTS 'razorpay';
EXCEPTION WHEN others THEN NULL; END $$;

-- ══════════════════════════════════════════════════════════════════════════════
-- 2. EXTEND ORDERS TABLE — add Razorpay columns
-- ══════════════════════════════════════════════════════════════════════════════

ALTER TABLE public.orders
    ADD COLUMN IF NOT EXISTS razorpay_order_id    TEXT UNIQUE,
    ADD COLUMN IF NOT EXISTS razorpay_payment_id  TEXT,
    ADD COLUMN IF NOT EXISTS payment_signature    TEXT,
    ADD COLUMN IF NOT EXISTS delivery_status      delivery_status NOT NULL DEFAULT 'pending',
    ADD COLUMN IF NOT EXISTS purchased_at         TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS amount               INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS currency             TEXT NOT NULL DEFAULT 'INR',
    ADD COLUMN IF NOT EXISTS product_snapshot     JSONB;

-- ══════════════════════════════════════════════════════════════════════════════
-- 3. PAYMENTS TABLE — individual payment transactions
-- ══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.payments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id        UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    provider        TEXT NOT NULL DEFAULT 'razorpay',
    transaction_id  TEXT,
    razorpay_order_id TEXT,
    amount          INTEGER NOT NULL,
    currency        TEXT NOT NULL DEFAULT 'INR',
    status          TEXT NOT NULL DEFAULT 'pending',
    metadata        JSONB,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ══════════════════════════════════════════════════════════════════════════════
-- 4. DOWNLOAD TOKENS TABLE — secure, expiring download links
-- ══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.download_tokens (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id    UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    token       TEXT NOT NULL UNIQUE,
    expires_at  TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '7 days'),
    download_count INTEGER NOT NULL DEFAULT 0,
    max_downloads  INTEGER NOT NULL DEFAULT 5,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ══════════════════════════════════════════════════════════════════════════════
-- 5. DELIVERY EVENTS TABLE — audit log for all delivery actions
-- ══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.delivery_events (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id    UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    event_type  TEXT NOT NULL,  -- 'email_sent', 'download_granted', 'download_used', 'webhook_received'
    metadata    JSONB,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ══════════════════════════════════════════════════════════════════════════════
-- 6. RLS POLICIES
-- ══════════════════════════════════════════════════════════════════════════════

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.download_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_events ENABLE ROW LEVEL SECURITY;

-- Payments: users can read their own payment records via order join
DO $$ BEGIN
    CREATE POLICY "Users can view own payments"
        ON public.payments FOR SELECT
        USING (
            order_id IN (
                SELECT id FROM public.orders WHERE user_id = auth.uid()
            )
        );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Download tokens: users can only access their own tokens
DO $$ BEGIN
    CREATE POLICY "Users can view own download tokens"
        ON public.download_tokens FOR SELECT
        USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Delivery events: users can view their own delivery events
DO $$ BEGIN
    CREATE POLICY "Users can view own delivery events"
        ON public.delivery_events FOR SELECT
        USING (
            order_id IN (
                SELECT id FROM public.orders WHERE user_id = auth.uid()
            )
        );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ══════════════════════════════════════════════════════════════════════════════
-- 7. UPDATED_AT TRIGGERS
-- ══════════════════════════════════════════════════════════════════════════════

DROP TRIGGER IF EXISTS update_payments_updated_at ON public.payments;
CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON public.payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ══════════════════════════════════════════════════════════════════════════════
-- 8. INDEXES
-- ══════════════════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_payments_order_id      ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON public.payments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_dl_tokens_token        ON public.download_tokens(token);
CREATE INDEX IF NOT EXISTS idx_dl_tokens_user_id      ON public.download_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_dl_tokens_order_id     ON public.download_tokens(order_id);
CREATE INDEX IF NOT EXISTS idx_delivery_events_order  ON public.delivery_events(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order  ON public.orders(razorpay_order_id);
