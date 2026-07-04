-- Reliable background execution across multiple application replicas.
ALTER TABLE notification_jobs DROP CONSTRAINT IF EXISTS notification_jobs_status_check;
ALTER TABLE notification_jobs ADD CONSTRAINT notification_jobs_status_check CHECK(status IN ('draft','active','paused','running','completed','failed'));
ALTER TABLE notification_jobs ADD COLUMN IF NOT EXISTS locked_at TIMESTAMPTZ;
ALTER TABLE notification_jobs ADD COLUMN IF NOT EXISTS attempt_count INTEGER NOT NULL DEFAULT 0;
UPDATE notification_jobs SET status='active',locked_at=NULL WHERE status='running' AND locked_at<now()-interval '15 minutes';
