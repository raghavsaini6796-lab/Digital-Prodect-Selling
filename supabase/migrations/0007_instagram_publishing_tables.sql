-- Migration: Create Real Instagram Publishing Tables
-- File: 0007_instagram_publishing_tables.sql

-- Drop existing tables if they exist to prevent conflicts during fresh migration
DROP TABLE IF EXISTS publish_logs CASCADE;
DROP TABLE IF EXISTS publish_queue CASCADE;
DROP TABLE IF EXISTS instagram_accounts CASCADE;

CREATE TABLE instagram_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  instagram_account_id VARCHAR UNIQUE NOT NULL,
  facebook_page_id VARCHAR NOT NULL,
  access_token TEXT NOT NULL,
  token_expiry TIMESTAMP WITH TIME ZONE,
  account_name VARCHAR,
  connection_status VARCHAR CHECK (connection_status IN ('connected', 'expired', 'disconnected')) DEFAULT 'connected',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE publish_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL,
  queue_status VARCHAR CHECK (queue_status IN ('Pending', 'Processing', 'Completed', 'Failed', 'Retrying')) DEFAULT 'Pending',
  retry_count INT DEFAULT 0,
  max_retries INT DEFAULT 3,
  scheduled_time TIMESTAMPTZ NOT NULL,
  processing_status TEXT,
  last_error TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE publish_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL,
  publish_status VARCHAR CHECK (publish_status IN ('Success', 'Failed')) DEFAULT 'Failed',
  response_data JSONB,
  published_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  error_logs JSONB
);

-- Apply automatic updated_at triggers using existing trigger_set_timestamp function if applicable
DO $$
BEGIN
  -- Trigger for instagram_accounts
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'trigger_set_timestamp') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_timestamp_instagram_accounts') THEN
      CREATE TRIGGER set_timestamp_instagram_accounts
        BEFORE UPDATE ON instagram_accounts
        FOR EACH ROW
        EXECUTE FUNCTION trigger_set_timestamp();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_timestamp_publish_queue') THEN
      CREATE TRIGGER set_timestamp_publish_queue
        BEFORE UPDATE ON publish_queue
        FOR EACH ROW
        EXECUTE FUNCTION trigger_set_timestamp();
    END IF;
  END IF;
END $$;
