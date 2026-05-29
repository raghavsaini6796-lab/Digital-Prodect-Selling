-- Migration to add price column to factory_products
ALTER TABLE factory_products ADD COLUMN IF NOT EXISTS price INTEGER DEFAULT 99;
