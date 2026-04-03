
CREATE TABLE IF NOT EXISTS t_p73680056_casino_site_creation.users (
    id BIGSERIAL PRIMARY KEY,
    telegram_id BIGINT UNIQUE NOT NULL,
    username VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    photo_url TEXT,
    balance NUMERIC(20, 2) NOT NULL DEFAULT 500000000000.00,
    is_new BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p73680056_casino_site_creation.sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES t_p73680056_casino_site_creation.users(id),
    token VARCHAR(128) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '30 days'
);

CREATE INDEX IF NOT EXISTS idx_sessions_token ON t_p73680056_casino_site_creation.sessions(token);
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON t_p73680056_casino_site_creation.users(telegram_id);
