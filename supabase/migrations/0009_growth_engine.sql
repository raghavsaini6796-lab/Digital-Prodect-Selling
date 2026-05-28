-- Create leads table
CREATE TABLE IF NOT EXISTS leads (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    source VARCHAR(255),
    campaign VARCHAR(255),
    funnel_stage VARCHAR(255),
    tags JSONB,
    metadata JSONB,
    captured_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create email_campaigns and email_sequences tables
CREATE TABLE IF NOT EXISTS email_campaigns (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS email_sequences (
    id SERIAL PRIMARY KEY,
    campaign_id INT REFERENCES email_campaigns(id),
    subject VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    order_number INT NOT NULL,
    sent_at TIMESTAMP
);

-- Create referrals and affiliate_accounts tables
CREATE TABLE IF NOT EXISTS referrals (
    id SERIAL PRIMARY KEY,
    referer_id UUID REFERENCES users(id),
    referred_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS affiliate_accounts (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    commission_rate DECIMAL(5, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create affiliate_commissions table
CREATE TABLE IF NOT EXISTS affiliate_commissions (
    id SERIAL PRIMARY KEY,
    referral_id INT REFERENCES referrals(id),
    amount NUMERIC(10, 2) NOT NULL,
    commission_rate DECIMAL(5, 2) NOT NULL,
    paid_at TIMESTAMP
);

-- Create coupons and conversion_events tables
CREATE TABLE IF NOT EXISTS coupons (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_amount NUMERIC(10, 2),
    expiration_date DATE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS conversion_events (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    event_type VARCHAR(50) NOT NULL,
    event_data JSONB,
    occurred_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
