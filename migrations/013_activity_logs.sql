-- ── Activity Logs ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.activity_logs (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email   TEXT,
  action       TEXT        NOT NULL,  -- create | update | delete | comment | transaction | reset_password | update_permissions | login | logout
  entity_type  TEXT,                  -- project | subassembly | blocaj | pdca | flux | kpi | task | inventory | user
  entity_id    TEXT,
  entity_label TEXT,
  details      JSONB,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS activity_logs_created_at_idx ON public.activity_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS activity_logs_user_id_idx    ON public.activity_logs (user_id);

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can insert their own log entries
CREATE POLICY logs_insert ON public.activity_logs
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Only admins can read logs (or users granted view_logs override)
CREATE POLICY logs_select ON public.activity_logs
  FOR SELECT TO authenticated
  USING (private.is_admin());

-- Only admins can delete logs
CREATE POLICY logs_delete ON public.activity_logs
  FOR DELETE TO authenticated
  USING (private.is_admin());

-- ── Permissions ─────────────────────────────────────────────────────────────────

INSERT INTO public.permissions (key, label, description, category, sort_order) VALUES
  ('view_logs',   'View Activity Logs',   'See all user activity in the admin panel', 'admin', 201),
  ('delete_logs', 'Delete Activity Logs', 'Delete individual or all log entries',     'admin', 202)
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.role_permissions (role, permission_key) VALUES
  ('admin', 'view_logs'),
  ('admin', 'delete_logs')
ON CONFLICT DO NOTHING;
