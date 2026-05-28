-- Replace broad authenticated write access with role-aware policies.
-- Admins keep full access. Workers can read operational data but cannot mutate
-- core production records directly from the browser.

CREATE SCHEMA IF NOT EXISTS private;

REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated;

CREATE OR REPLACE FUNCTION private.current_user_role()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT role
  FROM public.profiles
  WHERE id = (select auth.uid())
$$;

CREATE OR REPLACE FUNCTION private.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT coalesce(private.current_user_role() = 'admin', false)
$$;

CREATE OR REPLACE FUNCTION private.is_worker()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT coalesce(private.current_user_role() = 'worker', false)
$$;

REVOKE ALL ON FUNCTION private.current_user_role() FROM PUBLIC;
REVOKE ALL ON FUNCTION private.is_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION private.is_worker() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.current_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_worker() TO authenticated;

DROP POLICY IF EXISTS auth_all_proiecte ON public.proiecte;
DROP POLICY IF EXISTS auth_all_subansambluri ON public.subansambluri;
DROP POLICY IF EXISTS auth_all_blocaje ON public.blocaje;
DROP POLICY IF EXISTS auth_all_pdca ON public.pdca;
DROP POLICY IF EXISTS auth_all_flux_zilnic ON public.flux_zilnic;
DROP POLICY IF EXISTS auth_all_kpi_echipe ON public.kpi_echipe;

DROP POLICY IF EXISTS proiecte_admin_all ON public.proiecte;
DROP POLICY IF EXISTS proiecte_worker_read ON public.proiecte;
DROP POLICY IF EXISTS subansambluri_admin_all ON public.subansambluri;
DROP POLICY IF EXISTS subansambluri_worker_read ON public.subansambluri;
DROP POLICY IF EXISTS blocaje_admin_all ON public.blocaje;
DROP POLICY IF EXISTS blocaje_worker_read ON public.blocaje;
DROP POLICY IF EXISTS pdca_admin_all ON public.pdca;
DROP POLICY IF EXISTS pdca_worker_read ON public.pdca;
DROP POLICY IF EXISTS flux_zilnic_admin_all ON public.flux_zilnic;
DROP POLICY IF EXISTS flux_zilnic_worker_read ON public.flux_zilnic;
DROP POLICY IF EXISTS kpi_echipe_admin_all ON public.kpi_echipe;
DROP POLICY IF EXISTS kpi_echipe_worker_read ON public.kpi_echipe;

CREATE POLICY proiecte_admin_all ON public.proiecte
  FOR ALL TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

CREATE POLICY proiecte_worker_read ON public.proiecte
  FOR SELECT TO authenticated
  USING (private.is_worker());

CREATE POLICY subansambluri_admin_all ON public.subansambluri
  FOR ALL TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

CREATE POLICY subansambluri_worker_read ON public.subansambluri
  FOR SELECT TO authenticated
  USING (private.is_worker());

CREATE POLICY blocaje_admin_all ON public.blocaje
  FOR ALL TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

CREATE POLICY blocaje_worker_read ON public.blocaje
  FOR SELECT TO authenticated
  USING (private.is_worker());

CREATE POLICY pdca_admin_all ON public.pdca
  FOR ALL TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

CREATE POLICY pdca_worker_read ON public.pdca
  FOR SELECT TO authenticated
  USING (private.is_worker());

CREATE POLICY flux_zilnic_admin_all ON public.flux_zilnic
  FOR ALL TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

CREATE POLICY flux_zilnic_worker_read ON public.flux_zilnic
  FOR SELECT TO authenticated
  USING (private.is_worker());

CREATE POLICY kpi_echipe_admin_all ON public.kpi_echipe
  FOR ALL TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

CREATE POLICY kpi_echipe_worker_read ON public.kpi_echipe
  FOR SELECT TO authenticated
  USING (private.is_worker());

DROP POLICY IF EXISTS profiles_read_self_or_admin ON public.profiles;
DROP POLICY IF EXISTS profiles_admin_insert ON public.profiles;
DROP POLICY IF EXISTS profiles_admin_update ON public.profiles;
DROP POLICY IF EXISTS profiles_admin_delete ON public.profiles;

CREATE POLICY profiles_read_self_or_admin ON public.profiles
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = id OR private.is_admin());

CREATE POLICY profiles_admin_insert ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (private.is_admin());

CREATE POLICY profiles_admin_update ON public.profiles
  FOR UPDATE TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

CREATE POLICY profiles_admin_delete ON public.profiles
  FOR DELETE TO authenticated
  USING (private.is_admin());

DROP FUNCTION IF EXISTS public.is_admin();
