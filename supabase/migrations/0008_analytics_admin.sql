CREATE TABLE analytics_events (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(255) NOT NULL,
    user_id UUID REFERENCES users(id),
    product_id UUID REFERENCES products(id),
    metadata JSONB,
    source VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    action_type VARCHAR(255) NOT NULL,
    actor_id UUID REFERENCES users(id),
    target_type VARCHAR(255),
    target_id UUID,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE system_metrics (
    id SERIAL PRIMARY KEY,
    metric_name VARCHAR(255) NOT NULL,
    metric_value FLOAT NOT NULL,
    metric_type VARCHAR(255) NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
