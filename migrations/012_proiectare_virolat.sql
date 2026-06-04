-- Migration 012: Add Proiectare zone + rename ROLAT → VIROLAT in stored text

-- 1. Add proiectare columns to subansambluri
ALTER TABLE subansambluri
  ADD COLUMN IF NOT EXISTS proiectare TEXT DEFAULT 'Neinceput',
  ADD COLUMN IF NOT EXISTS proiectare_done DATE;

-- 2. Rename ROLAT → VIROLAT in flux_zilnic
UPDATE flux_zilnic SET dept_origine   = 'VIROLAT' WHERE dept_origine   = 'ROLAT';
UPDATE flux_zilnic SET dept_destinatie = 'VIROLAT' WHERE dept_destinatie = 'ROLAT';

-- 3. Rename ROLAT → VIROLAT in blocaje
UPDATE blocaje SET departament = 'VIROLAT' WHERE departament = 'ROLAT';

-- 4. Rename ROLAT → VIROLAT in kpi_echipe
UPDATE kpi_echipe SET echipa = 'VIROLAT' WHERE echipa = 'ROLAT';
