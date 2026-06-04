-- Expand role system: admin | production | office | office_production | viewer
-- Migrates existing 'worker' role to 'production'

-- Ensure private schema exists (created in 004/007, but safe to repeat)
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated;

-- Drop the old CHECK constraint on profiles.role
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Migrate existing workers → production BEFORE adding the new constraint
UPDATE public.profiles SET role = 'production' WHERE role = 'worker';

-- Now add the new constraint (all existing rows are now compliant)
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('admin', 'production', 'office', 'office_production', 'viewer'));

-- Update auto-signup trigger to default new users to 'viewer' (safest default)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'viewer')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Update RLS helper functions to reflect new role structure
-- can_read_production: admin, production, office_production, viewer (everyone except office-only)
CREATE OR REPLACE FUNCTION private.can_read_production()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT coalesce(private.current_user_role() IN ('admin', 'production', 'office_production', 'viewer'), false)
$$;

-- can_write_production: admin, production, office_production
CREATE OR REPLACE FUNCTION private.can_write_production()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT coalesce(private.current_user_role() IN ('admin', 'production', 'office_production'), false)
$$;

-- can_read_office: admin, office, office_production, viewer
CREATE OR REPLACE FUNCTION private.can_read_office()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT coalesce(private.current_user_role() IN ('admin', 'office', 'office_production', 'viewer'), false)
$$;

-- can_write_office: admin, office, office_production
CREATE OR REPLACE FUNCTION private.can_write_office()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT coalesce(private.current_user_role() IN ('admin', 'office', 'office_production'), false)
$$;

REVOKE ALL ON FUNCTION private.can_read_production() FROM PUBLIC;
REVOKE ALL ON FUNCTION private.can_write_production() FROM PUBLIC;
REVOKE ALL ON FUNCTION private.can_read_office() FROM PUBLIC;
REVOKE ALL ON FUNCTION private.can_write_office() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.can_read_production() TO authenticated;
GRANT EXECUTE ON FUNCTION private.can_write_production() TO authenticated;
GRANT EXECUTE ON FUNCTION private.can_read_office() TO authenticated;
GRANT EXECUTE ON FUNCTION private.can_write_office() TO authenticated;

-- Update production table policies to use new role-aware functions
-- Drop old worker-based read policies
DROP POLICY IF EXISTS proiecte_worker_read ON public.proiecte;
DROP POLICY IF EXISTS subansambluri_worker_read ON public.subansambluri;
DROP POLICY IF EXISTS blocaje_worker_read ON public.blocaje;
DROP POLICY IF EXISTS pdca_worker_read ON public.pdca;
DROP POLICY IF EXISTS flux_zilnic_worker_read ON public.flux_zilnic;
DROP POLICY IF EXISTS kpi_echipe_worker_read ON public.kpi_echipe;

-- Drop old admin-only write policies (will replace with write-capable roles)
DROP POLICY IF EXISTS proiecte_admin_all ON public.proiecte;
DROP POLICY IF EXISTS subansambluri_admin_all ON public.subansambluri;
DROP POLICY IF EXISTS blocaje_admin_all ON public.blocaje;
DROP POLICY IF EXISTS pdca_admin_all ON public.pdca;
DROP POLICY IF EXISTS flux_zilnic_admin_all ON public.flux_zilnic;
DROP POLICY IF EXISTS kpi_echipe_admin_all ON public.kpi_echipe;

-- New production table policies
CREATE POLICY proiecte_read ON public.proiecte
  FOR SELECT TO authenticated USING (private.can_read_production());
CREATE POLICY proiecte_write ON public.proiecte
  FOR ALL TO authenticated
  USING (private.can_write_production())
  WITH CHECK (private.can_write_production());

CREATE POLICY subansambluri_read ON public.subansambluri
  FOR SELECT TO authenticated USING (private.can_read_production());
CREATE POLICY subansambluri_write ON public.subansambluri
  FOR ALL TO authenticated
  USING (private.can_write_production())
  WITH CHECK (private.can_write_production());

CREATE POLICY blocaje_read ON public.blocaje
  FOR SELECT TO authenticated USING (private.can_read_production());
CREATE POLICY blocaje_write ON public.blocaje
  FOR ALL TO authenticated
  USING (private.can_write_production())
  WITH CHECK (private.can_write_production());

CREATE POLICY pdca_read ON public.pdca
  FOR SELECT TO authenticated USING (private.can_read_production());
CREATE POLICY pdca_write ON public.pdca
  FOR ALL TO authenticated
  USING (private.can_write_production())
  WITH CHECK (private.can_write_production());

CREATE POLICY flux_zilnic_read ON public.flux_zilnic
  FOR SELECT TO authenticated USING (private.can_read_production());
CREATE POLICY flux_zilnic_write ON public.flux_zilnic
  FOR ALL TO authenticated
  USING (private.can_write_production())
  WITH CHECK (private.can_write_production());

CREATE POLICY kpi_echipe_read ON public.kpi_echipe
  FOR SELECT TO authenticated USING (private.can_read_production());
CREATE POLICY kpi_echipe_write ON public.kpi_echipe
  FOR ALL TO authenticated
  USING (private.can_write_production())
  WITH CHECK (private.can_write_production());
