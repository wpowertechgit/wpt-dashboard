// Static demo data from WastePowertech_OMS_1.xlsx

export const DEMO = {
  proiecte: [
    { id: 'WP1000-08', client: 'Client Alpha', responsabil: 'Ion Popescu', prioritate: 'NORMAL', data_start: '15-Ian-24', data_target: '31-Iul-24', data_done: '2024-07-29', total_sa: 82, finalizate_sa: 82, progres: 100.0, blocaje_active: 0, status: 'LIVRAT', buget_ore: 1640, ore_consumate: 1598 },
    { id: 'WP1000-09', client: 'Client Beta', responsabil: 'Maria Ionescu', prioritate: 'RIDICAT', data_start: '01-Apr-24', data_target: '30-Nov-24', data_done: '', total_sa: 82, finalizate_sa: 80, progres: 97.6, blocaje_active: 0, status: 'IN LIVRARE', buget_ore: 1640, ore_consumate: 1601 },
    { id: 'WP1000-10', client: 'Client Gamma', responsabil: 'Andrei Marin', prioritate: 'CRITIC', data_start: '15-Iun-24', data_target: '31-Mar-25', data_done: '', total_sa: 82, finalizate_sa: 67, progres: 81.7, blocaje_active: 3, status: 'BLOCAJE ACTIVE', buget_ore: 1640, ore_consumate: 1340 },
  ],

  subansambluri: [
    // WP1000-08 - all finalizat
    ...Array.from({ length: 19 }, (_, i) => ({
      id: i + 1, proiect: 'WP1000-08', nr: i + 1,
      nume: ['Subassembly 01','Subassembly 02','Subassembly 03','Subassembly 04','Subassembly 05','Subassembly 06','Subassembly 07','Subassembly 08','Subassembly 09','Subassembly 10','Subassembly 11','Subassembly 12','Subassembly 13','Subassembly 14','Subassembly 15','Subassembly 16','Subassembly 17','Subassembly 18','Subassembly 19'][i],
      prio: '🟢', status_global: 'completed', progres: '100%', blocat: false, intarziat: false,
      laser: 'Finalizat', rolat: [2,9,11,12,13,17,18,14,15,16].includes(i+1) ? 'N/A' : 'Finalizat',
      sudat: 'Finalizat', asamblat: 'Finalizat', vopsit: i+1 === 13 ? 'N/A' : 'Finalizat',
	      data_start: '2024-01-15', data_due: '2024-02-15', data_done: '2024-02-12',
	      laser_done: '2024-01-18', rolat_done: [2,9,11,12,13,17,18,14,15,16].includes(i+1) ? '' : '2024-01-22', sudat_done: '2024-01-28', asamblat_done: '2024-02-05', vopsit_done: i+1 === 13 ? '' : '2024-02-12',
	      comentarii: 'OK', conditionat_de: null,
	    })),
    // WP1000-09
    ...Array.from({ length: 18 }, (_, i) => ({
      id: 100 + i + 1, proiect: 'WP1000-09', nr: i + 1,
      nume: ['Subassembly 01','Subassembly 02','Subassembly 03','Subassembly 04','Subassembly 05','Subassembly 06','Subassembly 07','Subassembly 08','Subassembly 09','Subassembly 10','Subassembly 11','Subassembly 12','Subassembly 13','Subassembly 14','Subassembly 15','Subassembly 16','Subassembly 17','Subassembly 18'][i],
      prio: '🟡', status_global: 'completed', progres: '100%', blocat: false, intarziat: false,
      laser: 'Finalizat', rolat: 'N/A', sudat: 'Finalizat', asamblat: 'Finalizat', vopsit: 'Finalizat',
	      data_start: '2024-04-01', data_due: '2024-05-10', data_done: '2024-05-07',
	      laser_done: '2024-04-04', rolat_done: '', sudat_done: '2024-04-15', asamblat_done: '2024-04-24', vopsit_done: '2024-05-07',
	      comentarii: 'OK', conditionat_de: null,
	    })),
	    { id: 119, proiect: 'WP1000-09', nr: 19, nume: 'Subassembly 19', prio: '🟡', status_global: 'inProgress', progres: '60%', blocat: false, intarziat: false, laser: 'Finalizat', rolat: 'Finalizat', sudat: 'Finalizat', asamblat: 'În lucru', vopsit: 'Neînceput', data_start: '2024-10-01', data_due: '2024-11-20', data_done: '', laser_done: '2024-10-06', rolat_done: '2024-10-14', sudat_done: '2024-10-22', asamblat_done: '', vopsit_done: '', comentarii: 'In lucru - asamblare', conditionat_de: null },
    // WP1000-10
    { id: 201, proiect: 'WP1000-10', nr: 1, nume: 'Subassembly 01', prio: '🔴', status_global: 'completed', progres: '100%', blocat: false, intarziat: false, laser: 'Finalizat', rolat: 'N/A', sudat: 'Finalizat', asamblat: 'Finalizat', vopsit: 'Finalizat', comentarii: 'OK', conditionat_de: null },
    { id: 202, proiect: 'WP1000-10', nr: 2, nume: 'Subassembly 02', prio: '🔴', status_global: 'completed', progres: '100%', blocat: false, intarziat: false, laser: 'Finalizat', rolat: 'N/A', sudat: 'Finalizat', asamblat: 'Finalizat', vopsit: 'Finalizat', comentarii: 'OK', conditionat_de: null },
    { id: 203, proiect: 'WP1000-10', nr: 3, nume: 'Subassembly 03', prio: '🔴', status_global: 'completed', progres: '100%', blocat: false, intarziat: false, laser: 'Finalizat', rolat: 'Finalizat', sudat: 'Finalizat', asamblat: 'Finalizat', vopsit: 'Finalizat', comentarii: 'OK', conditionat_de: null },
    { id: 204, proiect: 'WP1000-10', nr: 4, nume: 'Subassembly 04', prio: '🔴', status_global: 'completed', progres: '100%', blocat: false, intarziat: false, laser: 'Finalizat', rolat: 'Finalizat', sudat: 'Finalizat', asamblat: 'Finalizat', vopsit: 'Finalizat', comentarii: 'OK', conditionat_de: null },
    { id: 205, proiect: 'WP1000-10', nr: 5, nume: 'Subassembly 05', prio: '🔴', status_global: 'completed', progres: '100%', blocat: false, intarziat: false, laser: 'Finalizat', rolat: 'Finalizat', sudat: 'Finalizat', asamblat: 'Finalizat', vopsit: 'Finalizat', comentarii: 'OK', conditionat_de: null },
    { id: 206, proiect: 'WP1000-10', nr: 6, nume: 'Subassembly 06', prio: '🔴', status_global: 'completed', progres: '100%', blocat: false, intarziat: false, laser: 'Finalizat', rolat: 'Finalizat', sudat: 'Finalizat', asamblat: 'Finalizat', vopsit: 'Finalizat', comentarii: 'OK', conditionat_de: null },
    { id: 207, proiect: 'WP1000-10', nr: 7, nume: 'Subassembly 07', prio: '🔴', status_global: 'completed', progres: '100%', blocat: false, intarziat: false, laser: 'Finalizat', rolat: 'N/A', sudat: 'Finalizat', asamblat: 'Finalizat', vopsit: 'Finalizat', comentarii: 'OK', conditionat_de: null },
    { id: 208, proiect: 'WP1000-10', nr: 8, nume: 'Subassembly 08', prio: '🔴', status_global: 'completed', progres: '100%', blocat: false, intarziat: false, laser: 'Finalizat', rolat: 'Finalizat', sudat: 'Finalizat', asamblat: 'Finalizat', vopsit: 'Finalizat', comentarii: 'OK', conditionat_de: null },
    { id: 209, proiect: 'WP1000-10', nr: 9, nume: 'Subassembly 09', prio: '🔴', status_global: 'blocked', progres: '25%', blocat: true, intarziat: false, laser: 'Finalizat', rolat: 'N/A', sudat: 'Blocat', asamblat: 'Neînceput', vopsit: 'Neînceput', comentarii: 'BLOCAT – discutie tehnica necesara', conditionat_de: 'Dupa: Subassembly 05 (SA#5)' },
    { id: 210, proiect: 'WP1000-10', nr: 10, nume: 'Subassembly 10', prio: '🔴', status_global: 'blocked', progres: '60%', blocat: true, intarziat: false, laser: 'Finalizat', rolat: 'Finalizat', sudat: 'Finalizat', asamblat: 'Blocat', vopsit: 'Neînceput', comentarii: 'LIPSA componente – asteptam aprovizionare', conditionat_de: 'Dupa: Subassembly 01 (SA#1)' },
    { id: 211, proiect: 'WP1000-10', nr: 11, nume: 'Subassembly 11', prio: '🔴', status_global: 'inProgress', progres: '75%', blocat: false, intarziat: false, laser: 'Finalizat', rolat: 'N/A', sudat: 'Finalizat', asamblat: 'Finalizat', vopsit: 'În lucru', comentarii: 'OK – la vopsit', conditionat_de: null },
    { id: 212, proiect: 'WP1000-10', nr: 12, nume: 'Subassembly 12', prio: '🔴', status_global: 'inProgress', progres: '75%', blocat: false, intarziat: false, laser: 'Finalizat', rolat: 'N/A', sudat: 'Finalizat', asamblat: 'Finalizat', vopsit: 'În lucru', comentarii: 'OK – la vopsit', conditionat_de: null },
    { id: 213, proiect: 'WP1000-10', nr: 13, nume: 'Subassembly 13', prio: '🔴', status_global: 'blocked', progres: '67%', blocat: true, intarziat: false, laser: 'Finalizat', rolat: 'N/A', sudat: 'Finalizat', asamblat: 'Blocat', vopsit: 'N/A', comentarii: 'BLOCAT – lipsa teava pompa de vid', conditionat_de: null },
    { id: 214, proiect: 'WP1000-10', nr: 14, nume: 'Subassembly 14', prio: '🔴', status_global: 'inProgress', progres: '75%', blocat: false, intarziat: false, laser: 'Finalizat', rolat: 'N/A', sudat: 'Finalizat', asamblat: 'Finalizat', vopsit: 'În lucru', comentarii: 'OK – la vopsit', conditionat_de: null },
    { id: 215, proiect: 'WP1000-10', nr: 15, nume: 'Subassembly 15', prio: '🔴', status_global: 'inProgress', progres: '75%', blocat: false, intarziat: false, laser: 'Finalizat', rolat: 'N/A', sudat: 'Finalizat', asamblat: 'Finalizat', vopsit: 'În lucru', comentarii: 'OK – la vopsit', conditionat_de: null },
    { id: 216, proiect: 'WP1000-10', nr: 16, nume: 'Subassembly 16', prio: '🔴', status_global: 'inProgress', progres: '75%', blocat: false, intarziat: false, laser: 'Finalizat', rolat: 'N/A', sudat: 'Finalizat', asamblat: 'Finalizat', vopsit: 'În lucru', comentarii: 'OK – la vopsit', conditionat_de: null },
    { id: 217, proiect: 'WP1000-10', nr: 17, nume: 'Subassembly 17', prio: '🔴', status_global: 'inProgress', progres: '75%', blocat: false, intarziat: false, laser: 'Finalizat', rolat: 'N/A', sudat: 'Finalizat', asamblat: 'Finalizat', vopsit: 'În lucru', comentarii: 'OK – la vopsit', conditionat_de: null },
    { id: 218, proiect: 'WP1000-10', nr: 18, nume: 'Subassembly 18', prio: '🔴', status_global: 'inProgress', progres: '75%', blocat: false, intarziat: false, laser: 'Finalizat', rolat: 'N/A', sudat: 'Finalizat', asamblat: 'Finalizat', vopsit: 'În lucru', comentarii: 'OK – la vopsit', conditionat_de: null },
    { id: 219, proiect: 'WP1000-10', nr: 19, nume: 'Subassembly 19', prio: '🔴', status_global: 'inProgress', progres: '60%', blocat: false, intarziat: false, laser: 'Finalizat', rolat: 'Finalizat', sudat: 'Finalizat', asamblat: 'În lucru', vopsit: 'Neînceput', comentarii: 'In lucru – asamblare', conditionat_de: 'Dupa: Subassembly 08 (SA#8)' },
  ],

  blocaje: [
    { id: 'BLK-001', data_deschidere: '28-Apr-25', proiect: 'WP1000-10', subansamblu: 'Subassembly 09', departament: 'SUDAT', descriere: 'Discutie tehnica: configuratie neconfirmata cu proiectantul', responsabil: 'Andrei Marin', impact: 'INALT', status: 'Deschis', data_rezolvare: null, zile_deschis: 16, observatii: 'Sudat blocat complet pe aceasta piesa' },
    { id: 'BLK-002', data_deschidere: '30-Apr-25', proiect: 'WP1000-10', subansamblu: 'Subassembly 10', departament: 'ASAMBLAT', descriere: 'Lipsa componente de aprovizionat – fitinguri speciale', responsabil: 'Ion Popescu', impact: 'CRITIC', status: 'Deschis', data_rezolvare: null, zile_deschis: 14, observatii: 'Blocheaza montajul final' },
    { id: 'BLK-003', data_deschidere: '02-Mai-25', proiect: 'WP1000-10', subansamblu: 'Subassembly 13', departament: 'ASAMBLAT', descriere: 'Lipsa teava pompa de vid – comanda in curs', responsabil: 'Maria Ionescu', impact: 'MEDIU', status: 'Deschis', data_rezolvare: null, zile_deschis: 12, observatii: 'ETA livrare: 5 zile' },
    { id: 'BLK-004', data_deschidere: '15-Apr-25', proiect: 'WP1000-09', subansamblu: 'Subassembly 09', departament: 'SUDAT', descriere: 'Discutie rezolvata – configuratie confirmata', responsabil: 'Ion Popescu', impact: 'MEDIU', status: 'Rezolvat', data_rezolvare: '20-Apr-25', zile_deschis: 5, observatii: 'Rezolvat in 5 zile' },
  ],

  pdca: [
    { id: 'PDCA-001', sursa: 'BLK-001', data_deschis: '28-Apr-25', proiect: 'WP1000-10', problema: 'Configuratie scrubber nevalidata – risc blocare sudura', contramasura: 'Convocare sedinta tehnica urgenta cu proiectant si sef sudura', responsabil: 'Andrei Marin', termen: '14-Mai-25', status: 'Deschis', prioritate: 'INALT', zile_ramas: 'DEPASIT' },
    { id: 'PDCA-002', sursa: 'BLK-002', data_deschis: '30-Apr-25', proiect: 'WP1000-10', problema: 'Componente lipsa blocheaza asamblarea racitorului', contramasura: 'Aprovizionare urgenta; verificare stoc intern si furnizori alternativi', responsabil: 'Ion Popescu', termen: '12-Mai-25', status: 'Deschis', prioritate: 'CRITIC', zile_ramas: 'DEPASIT' },
    { id: 'PDCA-003', sursa: 'BLK-003', data_deschis: '02-Mai-25', proiect: 'WP1000-10', problema: 'Teava pompa de vid lipsa – blocheaza asamblarea', contramasura: 'Comanda plasata; confirmare ETA cu furnizor; plan alternativ', responsabil: 'Maria Ionescu', termen: '16-Mai-25', status: 'Deschis', prioritate: 'MEDIU', zile_ramas: 'DEPASIT' },
    { id: 'PDCA-004', sursa: 'OBS-01', data_deschis: '22-Apr-25', proiect: 'WP1000-10', problema: '7 subansambluri la vopsit simultan – risc suprasolicitare dept', contramasura: 'Planificare secventiala vopsit; prioritizare dupa WP10 livr. target', responsabil: 'Andrei Marin', termen: '20-Mai-25', status: 'In analiza', prioritate: 'MEDIU', zile_ramas: 'DEPASIT' },
    { id: 'PDCA-005', sursa: 'KPI-W17', data_deschis: '25-Apr-25', proiect: 'TOATE', problema: 'Lead time laser crescut cu 20% saptamana 17', contramasura: 'Analiza cauze; verificare intretinere echipament laser; revizuire planificare', responsabil: 'Ion Popescu', termen: '18-Mai-25', status: 'Deschis', prioritate: 'SCAZUT', zile_ramas: 'DEPASIT' },
  ],

  flux_zilnic: [
    { id: 1, data: '06-Mai-25', proiect: 'WP1000-10', subansamblu: 'Subassembly 11', dept_origine: 'SUDAT', dept_destinatie: 'ASAMBLAT', echipa: 'Echipa Sudat A', validat_de: 'Mihai Lungu', observatii: 'Predare OK' },
    { id: 2, data: '06-Mai-25', proiect: 'WP1000-10', subansamblu: 'Subassembly 12', dept_origine: 'SUDAT', dept_destinatie: 'ASAMBLAT', echipa: 'Echipa Sudat A', validat_de: 'Mihai Lungu', observatii: 'Predare OK' },
    { id: 3, data: '07-Mai-25', proiect: 'WP1000-10', subansamblu: 'Subassembly 14', dept_origine: 'ASAMBLAT', dept_destinatie: 'VOPSIT', echipa: 'Echipa Asamblare', validat_de: 'Radu Dinu', observatii: 'Finalizat asamblare' },
    { id: 4, data: '07-Mai-25', proiect: 'WP1000-10', subansamblu: 'Subassembly 15', dept_origine: 'ASAMBLAT', dept_destinatie: 'VOPSIT', echipa: 'Echipa Asamblare', validat_de: 'Radu Dinu', observatii: 'Finalizat asamblare' },
    { id: 5, data: '08-Mai-25', proiect: 'WP1000-09', subansamblu: 'Subassembly 19', dept_origine: 'ROLAT', dept_destinatie: 'SUDAT', echipa: 'Echipa Rolat', validat_de: 'Vasile Pop', observatii: 'Rolat complet' },
    { id: 6, data: '08-Mai-25', proiect: 'WP1000-10', subansamblu: 'Subassembly 18', dept_origine: 'ASAMBLAT', dept_destinatie: 'VOPSIT', echipa: 'Echipa Asamblare', validat_de: 'Radu Dinu', observatii: 'Finalizat asamblare' },
    { id: 7, data: '09-Mai-25', proiect: 'WP1000-10', subansamblu: 'Subassembly 19', dept_origine: 'SUDAT', dept_destinatie: 'ASAMBLAT', echipa: 'Echipa Sudat B', validat_de: 'Gelu Soare', observatii: 'Sudura finalizata' },
    { id: 8, data: '09-Mai-25', proiect: 'WP1000-10', subansamblu: 'Subassembly 16', dept_origine: 'ASAMBLAT', dept_destinatie: 'VOPSIT', echipa: 'Echipa Asamblare', validat_de: 'Radu Dinu', observatii: 'Finalizat' },
    { id: 9, data: '09-Mai-25', proiect: 'WP1000-10', subansamblu: 'Subassembly 17', dept_origine: 'ASAMBLAT', dept_destinatie: 'VOPSIT', echipa: 'Echipa Asamblare', validat_de: 'Radu Dinu', observatii: 'Finalizat' },
  ],

  kpi_echipe: [
    { id: 1, saptamana: 'S-17 (Apr 28)', echipa: 'LASER', sa_intrare: 8, sa_iesire: 7, sa_blocate: 0, sa_intarziate: 0, eficienta: 87, lead_time: 14, calitate: 96 },
    { id: 2, saptamana: 'S-17 (Apr 28)', echipa: 'ROLAT', sa_intrare: 4, sa_iesire: 4, sa_blocate: 0, sa_intarziate: 0, eficienta: 100, lead_time: 18, calitate: 100 },
    { id: 3, saptamana: 'S-17 (Apr 28)', echipa: 'SUDAT', sa_intrare: 7, sa_iesire: 5, sa_blocate: 2, sa_intarziate: 0, eficienta: 71, lead_time: 24, calitate: 88 },
    { id: 4, saptamana: 'S-17 (Apr 28)', echipa: 'ASAMBLAT', sa_intrare: 6, sa_iesire: 5, sa_blocate: 1, sa_intarziate: 0, eficienta: 83, lead_time: 16, calitate: 95 },
    { id: 5, saptamana: 'S-17 (Apr 28)', echipa: 'VOPSIT', sa_intrare: 5, sa_iesire: 5, sa_blocate: 0, sa_intarziate: 0, eficienta: 100, lead_time: 20, calitate: 97 },
    { id: 6, saptamana: 'S-18 (Mai 5)', echipa: 'LASER', sa_intrare: 9, sa_iesire: 9, sa_blocate: 0, sa_intarziate: 0, eficienta: 100, lead_time: 12, calitate: 98 },
    { id: 7, saptamana: 'S-18 (Mai 5)', echipa: 'ROLAT', sa_intrare: 3, sa_iesire: 3, sa_blocate: 0, sa_intarziate: 0, eficienta: 100, lead_time: 20, calitate: 100 },
    { id: 8, saptamana: 'S-18 (Mai 5)', echipa: 'SUDAT', sa_intrare: 8, sa_iesire: 6, sa_blocate: 1, sa_intarziate: 0, eficienta: 75, lead_time: 22, calitate: 90 },
    { id: 9, saptamana: 'S-18 (Mai 5)', echipa: 'ASAMBLAT', sa_intrare: 7, sa_iesire: 6, sa_blocate: 1, sa_intarziate: 0, eficienta: 86, lead_time: 15, calitate: 96 },
    { id: 10, saptamana: 'S-18 (Mai 5)', echipa: 'VOPSIT', sa_intrare: 6, sa_iesire: 6, sa_blocate: 0, sa_intarziate: 0, eficienta: 100, lead_time: 18, calitate: 98 },
    { id: 11, saptamana: 'S-19 (Mai 12)', echipa: 'LASER', sa_intrare: 10, sa_iesire: 8, sa_blocate: 0, sa_intarziate: 0, eficienta: 80, lead_time: 13, calitate: 97 },
    { id: 12, saptamana: 'S-19 (Mai 12)', echipa: 'ROLAT', sa_intrare: 2, sa_iesire: 2, sa_blocate: 0, sa_intarziate: 0, eficienta: 100, lead_time: 17, calitate: 100 },
    { id: 13, saptamana: 'S-19 (Mai 12)', echipa: 'SUDAT', sa_intrare: 9, sa_iesire: 7, sa_blocate: 2, sa_intarziate: 0, eficienta: 78, lead_time: 20, calitate: 91 },
    { id: 14, saptamana: 'S-19 (Mai 12)', echipa: 'ASAMBLAT', sa_intrare: 8, sa_iesire: 5, sa_blocate: 3, sa_intarziate: 0, eficienta: 63, lead_time: 18, calitate: 93 },
    { id: 15, saptamana: 'S-19 (Mai 12)', echipa: 'VOPSIT', sa_intrare: 9, sa_iesire: 9, sa_blocate: 0, sa_intarziate: 0, eficienta: 100, lead_time: 16, calitate: 100 },
  ],
}
