ALTER TABLE users ADD COLUMN IF NOT EXISTS is_approved BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_users_approved ON users(is_approved);

UPDATE users SET is_approved = TRUE WHERE is_approved = FALSE;

UPDATE users SET role = 'admin', is_approved = TRUE WHERE email = 'startreckcustome@gmail.com';