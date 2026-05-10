-- WeeklyPlan – Supabase Schema
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor → New query)
-- Safe to re-run: uses IF NOT EXISTS and DROP POLICY IF EXISTS

-- ── Completions ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS completions (
  id           uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id      text        NOT NULL,
  user_name    text        NOT NULL CHECK (user_name IN ('Linus', 'Ruben', 'Markus')),
  completed_at timestamptz DEFAULT now(),
  UNIQUE (task_id, user_name)
);
ALTER TABLE completions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public access" ON completions;
CREATE POLICY "Public access" ON completions FOR ALL USING (true) WITH CHECK (true);

-- ── Custom tasks ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS custom_tasks (
  id           uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  title        text        NOT NULL,
  assigned_to  text        NOT NULL CHECK (assigned_to IN ('Linus', 'Ruben', 'Markus', 'all')),
  deadline     date,
  recurrence   text        CHECK (recurrence IN ('weekly', 'biweekly', 'monthly')),
  completed    boolean     DEFAULT false,
  completed_by text,
  completed_at timestamptz,
  created_by   text,
  created_at   timestamptz DEFAULT now()
);
ALTER TABLE custom_tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public access" ON custom_tasks;
CREATE POLICY "Public access" ON custom_tasks FOR ALL USING (true) WITH CHECK (true);

-- Add recurrence column if it doesn't exist yet (for existing installations)
ALTER TABLE custom_tasks ADD COLUMN IF NOT EXISTS recurrence text
  CHECK (recurrence IN ('weekly', 'biweekly', 'monthly'));

-- Enable Realtime for custom_tasks
ALTER PUBLICATION supabase_realtime ADD TABLE custom_tasks;

-- ── Push subscriptions ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id         uuid  DEFAULT gen_random_uuid() PRIMARY KEY,
  user_name  text  NOT NULL CHECK (user_name IN ('Linus', 'Ruben', 'Markus')),
  endpoint   text  NOT NULL,
  p256dh     text  NOT NULL,
  auth       text  NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (endpoint)
);
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public access" ON push_subscriptions;
CREATE POLICY "Public access" ON push_subscriptions FOR ALL USING (true) WITH CHECK (true);
