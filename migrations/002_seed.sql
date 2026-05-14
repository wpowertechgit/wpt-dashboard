-- ============================================================
-- SEED DATA
-- ============================================================

INSERT INTO public.proiecte (id, client, responsabil, prioritate, data_start, data_target, total_sa, finalizate_sa, progres, blocaje_active, status) VALUES
  ('WP1000-08', 'Client Alpha', 'Ion Popescu',   'NORMAL', '15-Ian-24', '31-Iul-24', 82, 82, 100.0, 0, 'LIVRAT'),
  ('WP1000-09', 'Client Beta',  'Maria Ionescu', 'RIDICAT','01-Apr-24', '30-Nov-24', 82, 80, 97.6,  0, 'IN LIVRARE'),
  ('WP1000-10', 'Client Gamma', 'Andrei Marin',  'CRITIC', '15-Iun-24', '31-Mar-25', 82, 67, 81.7,  3, 'BLOCAJE ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- WP1000-08 subansambluri (all finalizat)
INSERT INTO public.subansambluri (proiect, nr, nume, prio, status_global, progres, blocat, intarziat, laser, rolat, sudat, asamblat, vopsit, comentarii) VALUES
  ('WP1000-08',1,'Structura metalica','🟢','✅ FINALIZAT','100%',false,false,'Finalizat','N/A','Finalizat','Finalizat','Finalizat','OK'),
  ('WP1000-08',2,'Scara metalica','🟢','✅ FINALIZAT','100%',false,false,'Finalizat','N/A','Finalizat','Finalizat','Finalizat','OK'),
  ('WP1000-08',3,'Compactor iesire','🟢','✅ FINALIZAT','100%',false,false,'Finalizat','Finalizat','Finalizat','Finalizat','Finalizat','OK'),
  ('WP1000-08',4,'Compactor intrare','🟢','✅ FINALIZAT','100%',false,false,'Finalizat','Finalizat','Finalizat','Finalizat','Finalizat','OK'),
  ('WP1000-08',5,'Reactor superior','🟢','✅ FINALIZAT','100%',false,false,'Finalizat','Finalizat','Finalizat','Finalizat','Finalizat','OK'),
  ('WP1000-08',6,'Reactor inferior','🟢','✅ FINALIZAT','100%',false,false,'Finalizat','Finalizat','Finalizat','Finalizat','Finalizat','OK'),
  ('WP1000-08',7,'Suport reactor inferior','🟢','✅ FINALIZAT','100%',false,false,'Finalizat','N/A','Finalizat','Finalizat','Finalizat','OK'),
  ('WP1000-08',8,'Filtru Gudroane','🟢','✅ FINALIZAT','100%',false,false,'Finalizat','Finalizat','Finalizat','Finalizat','Finalizat','OK'),
  ('WP1000-08',9,'Ventori scrubber','🟢','✅ FINALIZAT','100%',false,false,'Finalizat','N/A','Finalizat','Finalizat','Finalizat','OK'),
  ('WP1000-08',10,'Rezervor metalic (racitor)','🟢','✅ FINALIZAT','100%',false,false,'Finalizat','Finalizat','Finalizat','Finalizat','Finalizat','OK'),
  ('WP1000-08',11,'Barbutoare','🟢','✅ FINALIZAT','100%',false,false,'Finalizat','N/A','Finalizat','Finalizat','Finalizat','OK'),
  ('WP1000-08',12,'Filtre','🟢','✅ FINALIZAT','100%',false,false,'Finalizat','N/A','Finalizat','Finalizat','Finalizat','OK'),
  ('WP1000-08',13,'Sistem de tevi','🟢','✅ FINALIZAT','100%',false,false,'Finalizat','N/A','Finalizat','Finalizat','N/A','OK'),
  ('WP1000-08',14,'Snec reactor superior','🟢','✅ FINALIZAT','100%',false,false,'Finalizat','N/A','Finalizat','Finalizat','Finalizat','OK'),
  ('WP1000-08',15,'Snec reactor inferior','🟢','✅ FINALIZAT','100%',false,false,'Finalizat','N/A','Finalizat','Finalizat','Finalizat','OK'),
  ('WP1000-08',16,'Snec compactor intrare','🟢','✅ FINALIZAT','100%',false,false,'Finalizat','N/A','Finalizat','Finalizat','Finalizat','OK'),
  ('WP1000-08',17,'Snec compactor iesire','🟢','✅ FINALIZAT','100%',false,false,'Finalizat','N/A','Finalizat','Finalizat','Finalizat','OK'),
  ('WP1000-08',18,'Presetupe','🟢','✅ FINALIZAT','100%',false,false,'Finalizat','N/A','Finalizat','Finalizat','Finalizat','OK'),
  ('WP1000-08',19,'Turn de racire','🟢','✅ FINALIZAT','100%',false,false,'Finalizat','Finalizat','Finalizat','Finalizat','Finalizat','OK')
ON CONFLICT (proiect, nr) DO NOTHING;

-- WP1000-09 subansambluri
INSERT INTO public.subansambluri (proiect, nr, nume, prio, status_global, progres, blocat, intarziat, laser, rolat, sudat, asamblat, vopsit, comentarii) VALUES
  ('WP1000-09',1,'Structura metalica','🟡','✅ FINALIZAT','100%',false,false,'Finalizat','N/A','Finalizat','Finalizat','Finalizat','OK'),
  ('WP1000-09',2,'Scara metalica','🟡','✅ FINALIZAT','100%',false,false,'Finalizat','N/A','Finalizat','Finalizat','Finalizat','OK'),
  ('WP1000-09',3,'Compactor iesire','🟡','✅ FINALIZAT','100%',false,false,'Finalizat','Finalizat','Finalizat','Finalizat','Finalizat','OK'),
  ('WP1000-09',4,'Compactor intrare','🟡','✅ FINALIZAT','100%',false,false,'Finalizat','Finalizat','Finalizat','Finalizat','Finalizat','OK'),
  ('WP1000-09',5,'Reactor superior','🟡','✅ FINALIZAT','100%',false,false,'Finalizat','Finalizat','Finalizat','Finalizat','Finalizat','OK'),
  ('WP1000-09',6,'Reactor inferior','🟡','✅ FINALIZAT','100%',false,false,'Finalizat','Finalizat','Finalizat','Finalizat','Finalizat','OK'),
  ('WP1000-09',7,'Suport reactor inferior','🟡','✅ FINALIZAT','100%',false,false,'Finalizat','N/A','Finalizat','Finalizat','Finalizat','OK'),
  ('WP1000-09',8,'Filtru Gudroane','🟡','✅ FINALIZAT','100%',false,false,'Finalizat','Finalizat','Finalizat','Finalizat','Finalizat','OK'),
  ('WP1000-09',9,'Ventori scrubber','🟡','✅ FINALIZAT','100%',false,false,'Finalizat','N/A','Finalizat','Finalizat','Finalizat','OK'),
  ('WP1000-09',10,'Rezervor metalic (racitor)','🟡','✅ FINALIZAT','100%',false,false,'Finalizat','Finalizat','Finalizat','Finalizat','Finalizat','OK'),
  ('WP1000-09',11,'Barbutoare','🟡','✅ FINALIZAT','100%',false,false,'Finalizat','N/A','Finalizat','Finalizat','Finalizat','OK'),
  ('WP1000-09',12,'Filtre','🟡','✅ FINALIZAT','100%',false,false,'Finalizat','N/A','Finalizat','Finalizat','Finalizat','OK'),
  ('WP1000-09',13,'Sistem de tevi','🟡','✅ FINALIZAT','100%',false,false,'Finalizat','N/A','Finalizat','Finalizat','N/A','OK'),
  ('WP1000-09',14,'Snec reactor superior','🟡','✅ FINALIZAT','100%',false,false,'Finalizat','N/A','Finalizat','Finalizat','Finalizat','OK'),
  ('WP1000-09',15,'Snec reactor inferior','🟡','✅ FINALIZAT','100%',false,false,'Finalizat','N/A','Finalizat','Finalizat','Finalizat','OK'),
  ('WP1000-09',16,'Snec compactor intrare','🟡','✅ FINALIZAT','100%',false,false,'Finalizat','N/A','Finalizat','Finalizat','Finalizat','OK'),
  ('WP1000-09',17,'Snec compactor iesire','🟡','✅ FINALIZAT','100%',false,false,'Finalizat','N/A','Finalizat','Finalizat','Finalizat','OK'),
  ('WP1000-09',18,'Presetupe','🟡','✅ FINALIZAT','100%',false,false,'Finalizat','N/A','Finalizat','Finalizat','Finalizat','OK'),
  ('WP1000-09',19,'Turn de racire','🟡','🔄 IN LUCRU','60%',false,false,'Finalizat','Finalizat','Finalizat','În lucru','Neînceput','In lucru - asamblare')
ON CONFLICT (proiect, nr) DO NOTHING;

-- WP1000-10 subansambluri
INSERT INTO public.subansambluri (proiect, nr, nume, prio, status_global, progres, blocat, intarziat, laser, rolat, sudat, asamblat, vopsit, comentarii, conditionat_de) VALUES
  ('WP1000-10',1,'Structura metalica','🔴','✅ FINALIZAT','100%',false,false,'Finalizat','N/A','Finalizat','Finalizat','Finalizat','OK',null),
  ('WP1000-10',2,'Scara metalica','🔴','✅ FINALIZAT','100%',false,false,'Finalizat','N/A','Finalizat','Finalizat','Finalizat','OK',null),
  ('WP1000-10',3,'Compactor iesire','🔴','✅ FINALIZAT','100%',false,false,'Finalizat','Finalizat','Finalizat','Finalizat','Finalizat','OK',null),
  ('WP1000-10',4,'Compactor intrare','🔴','✅ FINALIZAT','100%',false,false,'Finalizat','Finalizat','Finalizat','Finalizat','Finalizat','OK',null),
  ('WP1000-10',5,'Reactor superior','🔴','✅ FINALIZAT','100%',false,false,'Finalizat','Finalizat','Finalizat','Finalizat','Finalizat','OK',null),
  ('WP1000-10',6,'Reactor inferior','🔴','✅ FINALIZAT','100%',false,false,'Finalizat','Finalizat','Finalizat','Finalizat','Finalizat','OK',null),
  ('WP1000-10',7,'Suport reactor inferior','🔴','✅ FINALIZAT','100%',false,false,'Finalizat','N/A','Finalizat','Finalizat','Finalizat','OK',null),
  ('WP1000-10',8,'Filtru Gudroane','🔴','✅ FINALIZAT','100%',false,false,'Finalizat','Finalizat','Finalizat','Finalizat','Finalizat','OK',null),
  ('WP1000-10',9,'Ventori scrubber','🔴','⛔ BLOCAT','25%',true,false,'Finalizat','N/A','Blocat','Neînceput','Neînceput','BLOCAT – discutie tehnica necesara','Dupa: Reactor superior (SA#5)'),
  ('WP1000-10',10,'Rezervor metalic (racitor)','🔴','⛔ BLOCAT','60%',true,false,'Finalizat','Finalizat','Finalizat','Blocat','Neînceput','LIPSA componente – asteptam aprovizionare','Dupa: Structura metalica (SA#1)'),
  ('WP1000-10',11,'Barbutoare','🔴','🔄 IN LUCRU','75%',false,false,'Finalizat','N/A','Finalizat','Finalizat','În lucru','OK – la vopsit',null),
  ('WP1000-10',12,'Filtre','🔴','🔄 IN LUCRU','75%',false,false,'Finalizat','N/A','Finalizat','Finalizat','În lucru','OK – la vopsit',null),
  ('WP1000-10',13,'Sistem de tevi','🔴','⛔ BLOCAT','67%',true,false,'Finalizat','N/A','Finalizat','Blocat','N/A','BLOCAT – lipsa teava pompa de vid',null),
  ('WP1000-10',14,'Snec reactor superior','🔴','🔄 IN LUCRU','75%',false,false,'Finalizat','N/A','Finalizat','Finalizat','În lucru','OK – la vopsit',null),
  ('WP1000-10',15,'Snec reactor inferior','🔴','🔄 IN LUCRU','75%',false,false,'Finalizat','N/A','Finalizat','Finalizat','În lucru','OK – la vopsit',null),
  ('WP1000-10',16,'Snec compactor intrare','🔴','🔄 IN LUCRU','75%',false,false,'Finalizat','N/A','Finalizat','Finalizat','În lucru','OK – la vopsit',null),
  ('WP1000-10',17,'Snec compactor iesire','🔴','🔄 IN LUCRU','75%',false,false,'Finalizat','N/A','Finalizat','Finalizat','În lucru','OK – la vopsit',null),
  ('WP1000-10',18,'Presetupe','🔴','🔄 IN LUCRU','75%',false,false,'Finalizat','N/A','Finalizat','Finalizat','În lucru','OK – la vopsit',null),
  ('WP1000-10',19,'Turn de racire','🔴','🔄 IN LUCRU','60%',false,false,'Finalizat','Finalizat','Finalizat','În lucru','Neînceput','In lucru – asamblare','Dupa: Filtru Gudroane (SA#8)')
ON CONFLICT (proiect, nr) DO NOTHING;

-- BLOCAJE
INSERT INTO public.blocaje (id, data_deschidere, proiect, subansamblu, departament, descriere, responsabil, impact, status, data_rezolvare, zile_deschis, observatii) VALUES
  ('BLK-001','28-Apr-25','WP1000-10','Ventori scrubber','SUDAT','Discutie tehnica: configuratie neconfirmata cu proiectantul','Andrei Marin','INALT','Deschis',null,381,'Sudat blocat complet pe aceasta piesa'),
  ('BLK-002','30-Apr-25','WP1000-10','Rezervor metalic (racitor)','ASAMBLAT','Lipsa componente de aprovizionat – fitinguri speciale','Ion Popescu','CRITIC','Deschis',null,379,'Blocheaza montajul final'),
  ('BLK-003','02-Mai-25','WP1000-10','Sistem de tevi','ASAMBLAT','Lipsa teava pompa de vid – comanda in curs','Maria Ionescu','MEDIU','Deschis',null,377,'ETA livrare: 5 zile'),
  ('BLK-004','15-Apr-25','WP1000-09','Ventori scrubber','FINALIZAT','Discutie rezolvata – configuratie confirmata','Ion Popescu','MEDIU','Rezolvat','20-Apr-25',5,'Rezolvat in 5 zile')
ON CONFLICT (id) DO NOTHING;

-- PDCA
INSERT INTO public.pdca (id, sursa, data_deschis, proiect, problema, contramasura, responsabil, termen, status, prioritate, zile_ramas) VALUES
  ('PDCA-001','BLK-001','28-Apr-25','WP1000-10','Configuratie scrubber nevalidata – risc blocare sudura','Convocare sedinta tehnica urgenta cu proiectant si sef sudura','Andrei Marin','14-Mai-25','Deschis','INALT','DEPASIT'),
  ('PDCA-002','BLK-002','30-Apr-25','WP1000-10','Componente lipsa blocheaza asamblarea racitorului','Aprovizionare urgenta; verificare stoc intern si furnizori alternativi','Ion Popescu','12-Mai-25','Deschis','CRITIC','DEPASIT'),
  ('PDCA-003','BLK-003','02-Mai-25','WP1000-10','Teava pompa de vid lipsa – blocheaza asamblarea','Comanda plasata; confirmare ETA cu furnizor; plan alternativ','Maria Ionescu','16-Mai-25','Deschis','MEDIU','DEPASIT'),
  ('PDCA-004','OBS-01','22-Apr-25','WP1000-10','7 subansambluri la vopsit simultan – risc suprasolicitare dept','Planificare secventiala vopsit; prioritizare dupa WP10 livr. target','Andrei Marin','20-Mai-25','In analiza','MEDIU','DEPASIT'),
  ('PDCA-005','KPI-W17','25-Apr-25','TOATE','Lead time laser crescut cu 20% saptamana 17','Analiza cauze; verificare intretinere echipament laser; revizuire planificare','Ion Popescu','18-Mai-25','Deschis','SCAZUT','DEPASIT')
ON CONFLICT (id) DO NOTHING;

-- FLUX ZILNIC
INSERT INTO public.flux_zilnic (data, proiect, subansamblu, dept_origine, dept_destinatie, echipa, validat_de, observatii) VALUES
  ('06-Mai-25','WP1000-10','Barbutoare','SUDAT','ASAMBLAT','Echipa Sudat A','Mihai Lungu','Predare OK'),
  ('06-Mai-25','WP1000-10','Filtre','SUDAT','ASAMBLAT','Echipa Sudat A','Mihai Lungu','Predare OK'),
  ('07-Mai-25','WP1000-10','Snec reactor superior','ASAMBLAT','VOPSIT','Echipa Asamblare','Radu Dinu','Finalizat asamblare'),
  ('07-Mai-25','WP1000-10','Snec reactor inferior','ASAMBLAT','VOPSIT','Echipa Asamblare','Radu Dinu','Finalizat asamblare'),
  ('08-Mai-25','WP1000-09','Turn de racire','ROLAT','SUDAT','Echipa Rolat','Vasile Pop','Rolat complet'),
  ('08-Mai-25','WP1000-10','Presetupe','ASAMBLAT','VOPSIT','Echipa Asamblare','Radu Dinu','Finalizat asamblare'),
  ('09-Mai-25','WP1000-10','Turn de racire','SUDAT','ASAMBLAT','Echipa Sudat B','Gelu Soare','Sudura finalizata'),
  ('09-Mai-25','WP1000-10','Snec compactor intrare','ASAMBLAT','VOPSIT','Echipa Asamblare','Radu Dinu','Finalizat'),
  ('09-Mai-25','WP1000-10','Snec compactor iesire','ASAMBLAT','VOPSIT','Echipa Asamblare','Radu Dinu','Finalizat');

-- KPI ECHIPE
INSERT INTO public.kpi_echipe (saptamana, echipa, sa_intrare, sa_iesire, sa_blocate, sa_intarziate, eficienta, lead_time, calitate) VALUES
  ('S-17 (Apr 28)','LASER',8,7,0,0,87,14.0,96),
  ('S-17 (Apr 28)','ROLAT',4,4,0,0,100,18.0,100),
  ('S-17 (Apr 28)','SUDAT',7,5,2,0,71,24.0,88),
  ('S-17 (Apr 28)','ASAMBLAT',6,5,1,0,83,16.0,95),
  ('S-17 (Apr 28)','VOPSIT',5,5,0,0,100,20.0,97),
  ('S-18 (Mai 5)','LASER',9,9,0,0,100,12.0,98),
  ('S-18 (Mai 5)','ROLAT',3,3,0,0,100,20.0,100),
  ('S-18 (Mai 5)','SUDAT',8,6,1,0,75,22.0,90),
  ('S-18 (Mai 5)','ASAMBLAT',7,6,1,0,86,15.0,96),
  ('S-18 (Mai 5)','VOPSIT',6,6,0,0,100,18.0,98),
  ('S-19 (Mai 12)','LASER',10,8,0,0,80,13.0,97),
  ('S-19 (Mai 12)','ROLAT',2,2,0,0,100,17.0,100),
  ('S-19 (Mai 12)','SUDAT',9,7,2,0,78,20.0,91),
  ('S-19 (Mai 12)','ASAMBLAT',8,5,3,0,63,18.0,93),
  ('S-19 (Mai 12)','VOPSIT',9,9,0,0,100,16.0,100)
ON CONFLICT (saptamana, echipa) DO NOTHING;
