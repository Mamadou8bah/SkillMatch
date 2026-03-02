ALTER TABLE users
ADD COLUMN IF NOT EXISTS email_notifications_enabled BOOLEAN;

UPDATE users
SET email_notifications_enabled = TRUE
WHERE email_notifications_enabled IS NULL;

ALTER TABLE users
ALTER COLUMN email_notifications_enabled SET DEFAULT TRUE;

ALTER TABLE users
ALTER COLUMN email_notifications_enabled SET NOT NULL;
