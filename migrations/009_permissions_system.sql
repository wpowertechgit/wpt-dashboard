-- Granular permissions system
-- roles are preset bundles; user_permission_overrides stack on top

CREATE TABLE IF NOT EXISTS public.permissions (
  key         TEXT PRIMARY KEY,
  label       TEXT NOT NULL,
  description TEXT,
  category    TEXT CHECK (category IN ('production', 'office', 'admin')),
  sort_order  INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.role_permissions (
  role           TEXT NOT NULL,
  permission_key TEXT REFERENCES public.permissions(key) ON DELETE CASCADE,
  PRIMARY KEY (role, permission_key)
);

CREATE TABLE IF NOT EXISTS public.user_permission_overrides (
  user_id        UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  permission_key TEXT REFERENCES public.permissions(key) ON DELETE CASCADE,
  granted        BOOLEAN NOT NULL,
  PRIMARY KEY (user_id, permission_key)
);

-- RLS
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_permission_overrides ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read the permissions registry and role presets
CREATE POLICY permissions_read ON public.permissions FOR SELECT TO authenticated USING (true);
CREATE POLICY role_permissions_read ON public.role_permissions FOR SELECT TO authenticated USING (true);

-- Admins can manage the registry (unlikely to need this often, but available)
CREATE POLICY permissions_admin_write ON public.permissions
  FOR ALL TO authenticated USING (private.is_admin()) WITH CHECK (private.is_admin());
CREATE POLICY role_permissions_admin_write ON public.role_permissions
  FOR ALL TO authenticated USING (private.is_admin()) WITH CHECK (private.is_admin());

-- User overrides: user can read their own; admins can read/write all
CREATE POLICY user_overrides_read ON public.user_permission_overrides
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id OR private.is_admin());
CREATE POLICY user_overrides_admin_write ON public.user_permission_overrides
  FOR ALL TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

-- ── Seed permission keys ──────────────────────────────────────────────────────
INSERT INTO public.permissions (key, label, description, category, sort_order) VALUES
  -- Production
  ('view_dashboard',      'View Dashboard',        'See the main operational dashboard',          'production', 10),
  ('view_projects',       'View Projects',         'See the projects list',                       'production', 20),
  ('edit_projects',       'Edit Projects',         'Create, edit and delete projects',            'production', 21),
  ('view_subassemblies',  'View Subassemblies',    'See subassembly tracking',                    'production', 30),
  ('edit_subassemblies',  'Edit Subassemblies',    'Update subassembly stages and status',        'production', 31),
  ('view_planning',       'View Planning',         'See the production calendar',                 'production', 40),
  ('view_blockages',      'View Blockages',        'See blockages log',                           'production', 50),
  ('edit_blockages',      'Edit Blockages',        'Create and resolve blockages',                'production', 51),
  ('view_pdca',           'View PDCA',             'See PDCA action tracker',                    'production', 60),
  ('edit_pdca',           'Edit PDCA',             'Create and close PDCA actions',               'production', 61),
  ('view_daily_flow',     'View Daily Flow',       'See production daily flow log',               'production', 70),
  ('edit_daily_flow',     'Edit Daily Flow',       'Log production movements',                    'production', 71),
  ('view_kpi',            'View Team KPI',         'See team performance metrics',                'production', 80),
  ('edit_kpi',            'Edit Team KPI',         'Add and update KPI records',                  'production', 81),
  -- Office
  ('view_tasks',          'View Tasks',            'See office task board',                       'office',    100),
  ('create_tasks',        'Create Tasks',          'Assign tasks to other users',                 'office',    101),
  ('manage_tasks',        'Manage Tasks',          'Edit and delete any task',                    'office',    102),
  ('view_inventory',      'View Inventory',        'See inventory items and stock levels',        'office',    110),
  ('edit_inventory',      'Edit Inventory',        'Add/edit items and log transactions',         'office',    111),
  -- Admin
  ('manage_users',        'Manage Users',          'Create and edit user accounts',               'admin',     200),
  ('manage_roles',        'Manage Roles',          'Change roles and permission overrides',       'admin',     201)
ON CONFLICT (key) DO NOTHING;

-- ── Seed role presets ─────────────────────────────────────────────────────────
-- admin: everything
INSERT INTO public.role_permissions (role, permission_key) VALUES
  ('admin','view_dashboard'), ('admin','view_projects'), ('admin','edit_projects'),
  ('admin','view_subassemblies'), ('admin','edit_subassemblies'), ('admin','view_planning'),
  ('admin','view_blockages'), ('admin','edit_blockages'), ('admin','view_pdca'), ('admin','edit_pdca'),
  ('admin','view_daily_flow'), ('admin','edit_daily_flow'), ('admin','view_kpi'), ('admin','edit_kpi'),
  ('admin','view_tasks'), ('admin','create_tasks'), ('admin','manage_tasks'),
  ('admin','view_inventory'), ('admin','edit_inventory'),
  ('admin','manage_users'), ('admin','manage_roles')
ON CONFLICT DO NOTHING;

-- production: production read+write, inventory read only
INSERT INTO public.role_permissions (role, permission_key) VALUES
  ('production','view_dashboard'), ('production','view_projects'), ('production','edit_projects'),
  ('production','view_subassemblies'), ('production','edit_subassemblies'), ('production','view_planning'),
  ('production','view_blockages'), ('production','edit_blockages'), ('production','view_pdca'), ('production','edit_pdca'),
  ('production','view_daily_flow'), ('production','edit_daily_flow'), ('production','view_kpi'), ('production','edit_kpi'),
  ('production','view_inventory')
ON CONFLICT DO NOTHING;

-- office: office read+write, inventory read+write, tasks
INSERT INTO public.role_permissions (role, permission_key) VALUES
  ('office','view_tasks'), ('office','create_tasks'),
  ('office','view_inventory'), ('office','edit_inventory')
ON CONFLICT DO NOTHING;

-- office_production: everything except admin
INSERT INTO public.role_permissions (role, permission_key) VALUES
  ('office_production','view_dashboard'), ('office_production','view_projects'), ('office_production','edit_projects'),
  ('office_production','view_subassemblies'), ('office_production','edit_subassemblies'), ('office_production','view_planning'),
  ('office_production','view_blockages'), ('office_production','edit_blockages'), ('office_production','view_pdca'), ('office_production','edit_pdca'),
  ('office_production','view_daily_flow'), ('office_production','edit_daily_flow'), ('office_production','view_kpi'), ('office_production','edit_kpi'),
  ('office_production','view_tasks'), ('office_production','create_tasks'),
  ('office_production','view_inventory'), ('office_production','edit_inventory')
ON CONFLICT DO NOTHING;

-- viewer: all view_ permissions, no edit_ or manage_
INSERT INTO public.role_permissions (role, permission_key) VALUES
  ('viewer','view_dashboard'), ('viewer','view_projects'),
  ('viewer','view_subassemblies'), ('viewer','view_planning'),
  ('viewer','view_blockages'), ('viewer','view_pdca'),
  ('viewer','view_daily_flow'), ('viewer','view_kpi'),
  ('viewer','view_tasks'), ('viewer','view_inventory')
ON CONFLICT DO NOTHING;
