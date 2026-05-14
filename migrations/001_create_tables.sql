-- ============================================================
-- WASTE POWERTECH OMS — Database Schema
-- ============================================================

-- PROIECTE
CREATE TABLE IF NOT EXISTS public.proiecte (
  id              TEXT PRIMARY KEY,
  client          TEXT NOT NULL,
  responsabil     TEXT NOT NULL,
  prioritate      TEXT NOT NULL CHECK (prioritate IN ('NORMAL','RIDICAT','CRITIC')),
  data_start      TEXT,
  data_target     TEXT,
  total_sa        INTEGER NOT NULL DEFAULT 0,
  finalizate_sa   INTEGER NOT NULL DEFAULT 0,
  progres         NUMERIC(5,2) NOT NULL DEFAULT 0,
  blocaje_active  INTEGER NOT NULL DEFAULT 0,
  status          TEXT NOT NULL,
  observatii      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- SUBANSAMBLURI
CREATE TABLE IF NOT EXISTS public.subansambluri (
  id              BIGSERIAL PRIMARY KEY,
  proiect         TEXT NOT NULL REFERENCES public.proiecte(id) ON DELETE CASCADE,
  nr              INTEGER NOT NULL,
  nume            TEXT NOT NULL,
  prio            TEXT,
  status_global   TEXT NOT NULL,
  progres         TEXT NOT NULL DEFAULT '0%',
  blocat          BOOLEAN NOT NULL DEFAULT FALSE,
  intarziat       BOOLEAN NOT NULL DEFAULT FALSE,
  laser           TEXT NOT NULL DEFAULT 'Neînceput',
  rolat           TEXT NOT NULL DEFAULT 'Neînceput',
  sudat           TEXT NOT NULL DEFAULT 'Neînceput',
  asamblat        TEXT NOT NULL DEFAULT 'Neînceput',
  vopsit          TEXT NOT NULL DEFAULT 'Neînceput',
  comentarii      TEXT,
  conditionat_de  TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (proiect, nr)
);

-- BLOCAJE
CREATE TABLE IF NOT EXISTS public.blocaje (
  id                TEXT PRIMARY KEY,
  data_deschidere   TEXT NOT NULL,
  proiect           TEXT NOT NULL REFERENCES public.proiecte(id) ON DELETE CASCADE,
  subansamblu       TEXT NOT NULL,
  departament       TEXT NOT NULL,
  descriere         TEXT NOT NULL,
  responsabil       TEXT NOT NULL,
  impact            TEXT NOT NULL CHECK (impact IN ('MEDIU','INALT','CRITIC')),
  status            TEXT NOT NULL CHECK (status IN ('Deschis','Rezolvat')),
  data_rezolvare    TEXT,
  zile_deschis      INTEGER NOT NULL DEFAULT 0,
  observatii        TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- PDCA
CREATE TABLE IF NOT EXISTS public.pdca (
  id                  TEXT PRIMARY KEY,
  sursa               TEXT NOT NULL,
  data_deschis        TEXT NOT NULL,
  proiect             TEXT NOT NULL,
  problema            TEXT NOT NULL,
  contramasura        TEXT NOT NULL,
  responsabil         TEXT NOT NULL,
  termen              TEXT NOT NULL,
  status              TEXT NOT NULL,
  rezultat            TEXT,
  actiune_urmatoare   TEXT,
  prioritate          TEXT NOT NULL,
  zile_ramas          TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- FLUX_ZILNIC
CREATE TABLE IF NOT EXISTS public.flux_zilnic (
  id                BIGSERIAL PRIMARY KEY,
  data              TEXT NOT NULL,
  proiect           TEXT NOT NULL REFERENCES public.proiecte(id) ON DELETE CASCADE,
  subansamblu       TEXT NOT NULL,
  dept_origine      TEXT NOT NULL,
  dept_destinatie   TEXT NOT NULL,
  echipa            TEXT,
  validat_de        TEXT,
  ora               TEXT,
  observatii        TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- KPI_ECHIPE
CREATE TABLE IF NOT EXISTS public.kpi_echipe (
  id              BIGSERIAL PRIMARY KEY,
  saptamana       TEXT NOT NULL,
  echipa          TEXT NOT NULL,
  sa_intrare      INTEGER NOT NULL DEFAULT 0,
  sa_iesire       INTEGER NOT NULL DEFAULT 0,
  sa_blocate      INTEGER NOT NULL DEFAULT 0,
  sa_intarziate   INTEGER NOT NULL DEFAULT 0,
  eficienta       NUMERIC(5,2) NOT NULL DEFAULT 0,
  lead_time       NUMERIC(6,2) NOT NULL DEFAULT 0,
  calitate        NUMERIC(5,2) NOT NULL DEFAULT 0,
  observatii      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (saptamana, echipa)
);

-- ============================================================
-- updated_at trigger
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_proiecte') THEN
    CREATE TRIGGER set_updated_at_proiecte BEFORE UPDATE ON public.proiecte FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_subansambluri') THEN
    CREATE TRIGGER set_updated_at_subansambluri BEFORE UPDATE ON public.subansambluri FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_blocaje') THEN
    CREATE TRIGGER set_updated_at_blocaje BEFORE UPDATE ON public.blocaje FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_pdca') THEN
    CREATE TRIGGER set_updated_at_pdca BEFORE UPDATE ON public.pdca FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_kpi_echipe') THEN
    CREATE TRIGGER set_updated_at_kpi_echipe BEFORE UPDATE ON public.kpi_echipe FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;

-- ============================================================
-- Row Level Security — authenticated users can read/write all
-- ============================================================
ALTER TABLE public.proiecte      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subansambluri ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocaje       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdca          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flux_zilnic   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpi_echipe    ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'auth_all_proiecte') THEN
    CREATE POLICY auth_all_proiecte      ON public.proiecte      FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'auth_all_subansambluri') THEN
    CREATE POLICY auth_all_subansambluri ON public.subansambluri FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'auth_all_blocaje') THEN
    CREATE POLICY auth_all_blocaje       ON public.blocaje       FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'auth_all_pdca') THEN
    CREATE POLICY auth_all_pdca          ON public.pdca          FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'auth_all_flux_zilnic') THEN
    CREATE POLICY auth_all_flux_zilnic   ON public.flux_zilnic   FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'auth_all_kpi_echipe') THEN
    CREATE POLICY auth_all_kpi_echipe    ON public.kpi_echipe    FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;
