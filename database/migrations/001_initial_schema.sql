-- NIDA Finder initial PostgreSQL schema.
-- Apply only after selecting a database provider and completing a security review.
-- Never store NIDA numbers, identity documents, or raw provider responses in this schema.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE app_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_e164 TEXT NOT NULL UNIQUE,
  phone_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE wallets (
  user_id UUID PRIMARY KEY REFERENCES app_users(id) ON DELETE RESTRICT,
  balance_credits BIGINT NOT NULL DEFAULT 0 CHECK (balance_credits >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE credit_packages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  credits BIGINT NOT NULL CHECK (credits > 0),
  price_tzs BIGINT NOT NULL CHECK (price_tzs > 0),
  active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE RESTRICT,
  package_id TEXT NOT NULL REFERENCES credit_packages(id),
  provider TEXT NOT NULL,
  provider_reference TEXT UNIQUE,
  idempotency_key TEXT NOT NULL UNIQUE,
  amount_tzs BIGINT NOT NULL CHECK (amount_tzs > 0),
  status TEXT NOT NULL CHECK (status IN ('created','pending','succeeded','failed','reversed')),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE wallet_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE RESTRICT,
  payment_id UUID REFERENCES payments(id) ON DELETE RESTRICT,
  entry_type TEXT NOT NULL CHECK (entry_type IN ('credit_purchase','verification_debit','refund','adjustment')),
  credits_delta BIGINT NOT NULL CHECK (credits_delta <> 0),
  idempotency_key TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE consent_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE RESTRICT,
  purpose TEXT NOT NULL,
  consent_version TEXT NOT NULL,
  granted BOOLEAN NOT NULL,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at TIMESTAMPTZ
);

CREATE TABLE verification_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE RESTRICT,
  provider_reference TEXT,
  status TEXT NOT NULL CHECK (status IN ('created','pending','verified','rejected','failed','cancelled')),
  credits_charged BIGINT NOT NULL DEFAULT 0 CHECK (credits_charged >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX payments_user_created_idx ON payments(user_id, created_at DESC);
CREATE INDEX wallet_ledger_user_created_idx ON wallet_ledger(user_id, created_at DESC);
CREATE INDEX verification_user_created_idx ON verification_requests(user_id, created_at DESC);
CREATE INDEX consent_user_purpose_idx ON consent_events(user_id, purpose, captured_at DESC);
