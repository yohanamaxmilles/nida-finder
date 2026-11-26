-- Account credentials and wallet support. Run after 001_initial_schema.sql.
-- Until SMS OTP is integrated, account signup uses email/password and does not mark phone as verified.
ALTER TABLE app_users ALTER COLUMN phone_e164 DROP NOT NULL;
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS password_hash TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS app_users_email_unique ON app_users (lower(email)) WHERE email IS NOT NULL;
ALTER TABLE app_users ADD CONSTRAINT app_users_auth_identity_check CHECK (email IS NOT NULL OR phone_e164 IS NOT NULL);
