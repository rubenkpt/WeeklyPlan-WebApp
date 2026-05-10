-- WeeklyPlan – Supabase Schema
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor)

-- ── Completions (tracks which recurring tasks are done per week) ──────────────
CREATE TABLE completions (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id    text        NOT NULL,
  user_name  text        NOT NULL CHECK (user_name IN ('Linus', 'Ruben', 'Markus')),
  completed_at timestamptz DEFAULT now(),
  UNIQUE (task_id, user_name)
);

ALTER TABLE completions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public access" ON completions FOR ALL USING (true) WITH CHECK (true);

-- ── Custom tasks ──────────────────────────────────────────────────────────────
CREATE TABLE custom_tasks (
  id           uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  title        text        NOT NULL,
  assigned_to  text        NOT NULL CHECK (assigned_to IN ('Linus', 'Ruben', 'Markus', 'all')),
  deadline     date,
  completed    boolean     DEFAULT false,
  completed_by text,
  completed_at timestamptz,
  created_by   text,
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE custom_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public access" ON custom_tasks FOR ALL USING (true) WITH CHECK (true);

-- ── Optional: seed some example custom tasks ──────────────────────────────────
-- INSERT INTO custom_tasks (title, assigned_to, created_by)
-- VALUES ('Kühlschrank aufräumen', 'all', 'Ruben');
