-- SQL src/supabase/migrations/202401010000_create_factory_products.sql
CREATE TABLE factory_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL,
    hook TEXT NOT NULL,
    sections JSONB NOT NULL,
    cta TEXT NOT NULL,
    upsell TEXT,
    cover_image_url TEXT,
    pdf_url TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    instagram_caption TEXT,
    instagram_hashtags TEXT[],
    scheduled_time TIMESTAMPTZ
);

CREATE INDEX idx_factory_products_user ON factory_products(user_id);
