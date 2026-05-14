import { createContext, useContext, useState, type ReactNode } from 'react'

export type Lang = 'ro' | 'en'

const T = {
  ro: {
    lang: 'ro' as Lang,
    nav: {
      dashboard: 'Tablou de Bord', proiecte: 'Proiecte', subansambluri: 'Subansambluri',
      blocaje: 'Blocaje', pdca: 'PDCA', flux: 'Flux Zilnic', kpi: 'KPI Echipe', admin: 'Admin',
    },
    status: { active: 'Producție Activă', signOut: 'Ieșire' },
    common: {
      save: 'Salvează', cancel: 'Anulează', edit: 'Edit', close: 'Închide',
      saving: 'Se salvează...', add: 'Adaugă', create: 'Creează',
      noData: '—', records: 'înregistrări', loading: 'Se încarcă...',
    },
    dashboard: {
      eyebrow: 'Ședință Operațională Zilnică · 08:00 · 15–20 MIN',
      title: 'Tablou de Bord Operațional',
      subtitle: 'Flux: LASER → ROLAT → SUDAT → ASAMBLAT → VOPSIT',
      totalSA: 'TOTAL SUBANSAMBLURI', finalizate: 'FINALIZATE', inLucru: 'ÎN LUCRU',
      blocate: 'BLOCATE', blocateHint: 'necesită acțiune imediată',
      progresGlobal: 'PROGRES GLOBAL', proiecteActive: 'PROIECTE ACTIVE',
      blocajeDeschise: 'BLOCAJE DESCHISE', intarziate: 'ÎNTÂRZIATE',
      progresProiecte: 'PROGRES PROIECTE', heatmap: 'HEATMAP BLOCAJE × DEPARTAMENT',
      blocajeActive: 'BLOCAJE ACTIVE', actiuneImediata: 'acțiune imediată',
      colProiect: 'PROIECT', colClient: 'CLIENT', colResponsabil: 'RESPONSABIL',
      colPrioritate: 'PRIORITATE', colProgres: 'PROGRES', colStatus: 'STATUS', colBlocaje: 'BLOCAJE',
      colDept: 'DEPT', colActive: 'ACTIVE', colSubansamblu: 'SUBANSAMBLU',
      colOwner: 'OWNER', colImpact: 'IMPACT',
    },
    proiecte: {
      eyebrow: 'Registru Proiecte', title: 'Proiecte', newBtn: '+ Proiect Nou',
      formTitle: 'Proiect Nou', createBtn: 'Creează Proiect', tabelar: 'Vedere Tabelară',
      idProiect: 'ID Proiect', client: 'Client', responsabil: 'Responsabil',
      dataStart: 'Data Start', dataTarget: 'Data Target', totalSA: 'Total Subansambluri',
      bugetOre: 'Buget Ore', prioritate: 'Prioritate', status: 'Status',
      colId: 'ID', colClient: 'Client', colResponsabil: 'Responsabil',
      colPrioritate: 'Prioritate', colStart: 'Start', colTarget: 'Target',
      colSATotal: 'SA Total', colSAFinal: 'SA Final.', colProgres: 'Progres',
      colBlocaje: 'Blocaje', colStatus: 'Status',
    },
    subansambluri: {
      eyebrow: 'Tracking Subansambluri', title: 'Subansambluri',
      search: 'Caută subansamblu...', colProiect: 'Proiect', colNr: '#',
      colNume: 'Subansamblu', colStatus: 'Status', colProgres: 'Progres',
      colComentarii: 'Comentarii', empty: 'Niciun subansamblu găsit',
    },
    blocaje: {
      eyebrow: 'Registru Blocaje', title: 'Blocaje',
      subtitle: 'Orice blocare se înregistrează IMEDIAT. Fiecare blocare generează un PDCA.',
      newBtn: '+ Blocaj Nou', formTitle: 'Înregistrare Blocaj Nou', saveBtn: 'Înregistrează Blocaj',
      resolveBtn: '✅ Rezolvat', activeTitle: 'Blocaje Active', resolvedTitle: 'Blocaje Rezolvate',
      openCount: 'deschise', closedCount: 'închise',
      idBlocare: 'ID Blocare', dataDeschidere: 'Data Deschidere', proiect: 'Proiect',
      subansamblu: 'Subansamblu', departament: 'Departament', responsabil: 'Responsabil',
      descriere: 'Descriere Blocaj', impact: 'Impact', observatii: 'Observații',
      colId: 'ID', colData: 'Data', colProiect: 'Proiect', colSubansamblu: 'Subansamblu',
      colDept: 'Dept', colDescriere: 'Descriere', colResponsabil: 'Responsabil',
      colImpact: 'Impact', colZile: 'Zile', colObs: 'Observații', colStatus: 'Status',
      colRezolvat: 'Rezolvat',
      deschise: 'Blocaje Deschise', deschiseHint: 'necesită acțiune',
      rezolvate: 'Rezolvate', rezolvateHint: 'închise',
    },
    pdca: {
      eyebrow: 'Hoshin Kanri Action Tracker', title: 'PDCA',
      subtitle: 'Plan · Do · Check · Act',
      newBtn: '+ Acțiune PDCA', formTitle: 'Acțiune PDCA Nouă', saveBtn: 'Adaugă Acțiune',
      closeBtn: '✅ Închide', tableTitle: 'Acțiuni PDCA', overdueLabel: 'depășite',
      escaladare: 'Logica de Escaladare',
      idPDCA: 'ID PDCA', sursa: 'Sursă', dataDeschis: 'Data Deschis', proiect: 'Proiect',
      responsabil: 'Responsabil', termen: 'Termen', problema: 'Problemă (Plan)',
      contramasura: 'Contramasură (Do)', prioritate: 'Prioritate',
      colId: 'ID', colSursa: 'Sursă', colData: 'Data', colProiect: 'Proiect',
      colProblema: 'Problemă', colContramasura: 'Contramasură', colResponsabil: 'Responsabil',
      colTermen: 'Termen', colStatus: 'Status', colPrioritate: 'Prioritate', colZile: 'Zile',
    },
    flux: {
      eyebrow: 'Log Operațional', title: 'Flux Zilnic de Producție',
      subtitle: 'Mișcări subansambluri între departamente',
      newBtn: '+ Mișcare Nouă', formTitle: 'Înregistrare Mișcare', saveBtn: 'Înregistrează Mișcare',
      vizTitle: 'Fluxul de Producție', miscari: 'mișcări',
      data: 'Data', proiect: 'Proiect', subansamblu: 'Subansamblu',
      deLa: 'De la (Departament)', la: 'La (Departament)', echipa: 'Echipă',
      validatDe: 'Validat de', observatii: 'Observații',
      colProiect: 'Proiect', colSubansamblu: 'Subansamblu', colDeLa: 'De la',
      colLa: 'La', colEchipa: 'Echipă', colValidat: 'Validat de', colObs: 'Observații',
      empty: 'Nicio mișcare înregistrată',
    },
    kpi: {
      eyebrow: 'KPI Echipe de Producție', title: 'Performanță Echipe',
      subtitle: 'Frecvență: Săptămânal (Luni dimineața) · Review: Ședință lunară',
      newBtn: '+ KPI Săptămână', formTitle: 'Înregistrare KPI Săptămână', saveBtn: 'Salvează KPI',
      currentWeek: 'Săptămâna Curentă', eficienta: 'Eficiență', calitate: 'Calitate',
      saIesite: 'SA Ieșite', leadTime: 'Lead Time',
      chartEficienta: 'Eficiență % — Trend Săptămânal', chartLeadTime: 'Lead Time Mediu (ore) — Trend Săptămânal',
      tableTitle: 'Date Complete', blocate: 'blocate',
      saptamana: 'Săptămâna', echipa: 'Echipă', saIntrare: 'SA Intrare', saIesire: 'SA Ieșire',
      saBlocate: 'SA Blocate', saIntarziate: 'SA Întârziate', eficientaPct: 'Eficiență %',
      leadTimeH: 'Lead Time (h)', calitatePct: 'Calitate %',
      colSaptamana: 'Săptămâna', colEchipa: 'Echipă', colSAIn: 'SA In', colSAOut: 'SA Out',
      colBlocate: 'Blocate', colIntarziate: 'Întârziate', colEficienta: 'Eficiență',
      colLeadTime: 'Lead Time', colCalitate: 'Calitate',
    },
    admin: {
      eyebrow: 'Administrare Sistem', title: 'Admin Panel',
      subtitle: 'Gestionare conturi', users: 'utilizatori înregistrați',
      newBtn: '+ Cont Worker', formTitle: 'Cont Worker Nou', createBtn: 'Creează Cont',
      creating: 'Se creează...',
      email: 'Email', password: 'Parolă', fullName: 'Nume complet',
      departament: 'Departament', rol: 'Rol',
      colNume: 'Nume', colEmail: 'Email', colDept: 'Departament', colRol: 'Rol', colCreat: 'Creat la',
      ghidTitle: 'Ghid Acces',
      workerDesc: 'Acces la toate vederile. Poate înregistra mișcări, blocaje, PDCA și KPI pentru departamentul lor.',
      adminDesc: 'Acces complet + panel Admin pentru crearea și gestionarea conturilor de workers.',
    },
  },
  en: {
    lang: 'en' as Lang,
    nav: {
      dashboard: 'Dashboard', proiecte: 'Projects', subansambluri: 'Subassemblies',
      blocaje: 'Blockages', pdca: 'PDCA', flux: 'Daily Flow', kpi: 'Team KPIs', admin: 'Admin',
    },
    status: { active: 'Production Active', signOut: 'Sign Out' },
    common: {
      save: 'Save', cancel: 'Cancel', edit: 'Edit', close: 'Close',
      saving: 'Saving...', add: 'Add', create: 'Create',
      noData: '—', records: 'records', loading: 'Loading...',
    },
    dashboard: {
      eyebrow: 'Daily Operations Meeting · 08:00 · 15–20 MIN',
      title: 'Operational Dashboard',
      subtitle: 'Flow: LASER → ROLAT → SUDAT → ASAMBLAT → VOPSIT',
      totalSA: 'TOTAL SUBASSEMBLIES', finalizate: 'COMPLETED', inLucru: 'IN PROGRESS',
      blocate: 'BLOCKED', blocateHint: 'requires immediate action',
      progresGlobal: 'GLOBAL PROGRESS', proiecteActive: 'ACTIVE PROJECTS',
      blocajeDeschise: 'OPEN BLOCKAGES', intarziate: 'DELAYED',
      progresProiecte: 'PROJECT PROGRESS', heatmap: 'BLOCKAGE HEATMAP × DEPARTMENT',
      blocajeActive: 'ACTIVE BLOCKAGES', actiuneImediata: 'immediate action',
      colProiect: 'PROJECT', colClient: 'CLIENT', colResponsabil: 'OWNER',
      colPrioritate: 'PRIORITY', colProgres: 'PROGRESS', colStatus: 'STATUS', colBlocaje: 'BLOCKAGES',
      colDept: 'DEPT', colActive: 'ACTIVE', colSubansamblu: 'SUBASSEMBLY',
      colOwner: 'OWNER', colImpact: 'IMPACT',
    },
    proiecte: {
      eyebrow: 'Project Registry', title: 'Projects', newBtn: '+ New Project',
      formTitle: 'New Project', createBtn: 'Create Project', tabelar: 'Table View',
      idProiect: 'Project ID', client: 'Client', responsabil: 'Owner',
      dataStart: 'Start Date', dataTarget: 'Target Date', totalSA: 'Total Subassemblies',
      bugetOre: 'Hour Budget', prioritate: 'Priority', status: 'Status',
      colId: 'ID', colClient: 'Client', colResponsabil: 'Owner',
      colPrioritate: 'Priority', colStart: 'Start', colTarget: 'Target',
      colSATotal: 'SA Total', colSAFinal: 'SA Done', colProgres: 'Progress',
      colBlocaje: 'Blockages', colStatus: 'Status',
    },
    subansambluri: {
      eyebrow: 'Subassembly Tracking', title: 'Subassemblies',
      search: 'Search subassembly...', colProiect: 'Project', colNr: '#',
      colNume: 'Subassembly', colStatus: 'Status', colProgres: 'Progress',
      colComentarii: 'Comments', empty: 'No subassemblies found',
    },
    blocaje: {
      eyebrow: 'Blockage Registry', title: 'Blockages',
      subtitle: 'Every blockage must be logged IMMEDIATELY. Each blockage generates a PDCA.',
      newBtn: '+ New Blockage', formTitle: 'Log New Blockage', saveBtn: 'Log Blockage',
      resolveBtn: '✅ Resolved', activeTitle: 'Active Blockages', resolvedTitle: 'Resolved Blockages',
      openCount: 'open', closedCount: 'closed',
      idBlocare: 'Blockage ID', dataDeschidere: 'Open Date', proiect: 'Project',
      subansamblu: 'Subassembly', departament: 'Department', responsabil: 'Owner',
      descriere: 'Blockage Description', impact: 'Impact', observatii: 'Notes',
      colId: 'ID', colData: 'Date', colProiect: 'Project', colSubansamblu: 'Subassembly',
      colDept: 'Dept', colDescriere: 'Description', colResponsabil: 'Owner',
      colImpact: 'Impact', colZile: 'Days', colObs: 'Notes', colStatus: 'Status',
      colRezolvat: 'Resolved',
      deschise: 'Open Blockages', deschiseHint: 'requires action',
      rezolvate: 'Resolved', rezolvateHint: 'closed',
    },
    pdca: {
      eyebrow: 'Hoshin Kanri Action Tracker', title: 'PDCA',
      subtitle: 'Plan · Do · Check · Act',
      newBtn: '+ PDCA Action', formTitle: 'New PDCA Action', saveBtn: 'Add Action',
      closeBtn: '✅ Close', tableTitle: 'PDCA Actions', overdueLabel: 'overdue',
      escaladare: 'Escalation Logic',
      idPDCA: 'PDCA ID', sursa: 'Source', dataDeschis: 'Open Date', proiect: 'Project',
      responsabil: 'Owner', termen: 'Due Date', problema: 'Problem (Plan)',
      contramasura: 'Countermeasure (Do)', prioritate: 'Priority',
      colId: 'ID', colSursa: 'Source', colData: 'Date', colProiect: 'Project',
      colProblema: 'Problem', colContramasura: 'Countermeasure', colResponsabil: 'Owner',
      colTermen: 'Due Date', colStatus: 'Status', colPrioritate: 'Priority', colZile: 'Days',
    },
    flux: {
      eyebrow: 'Operational Log', title: 'Daily Production Flow',
      subtitle: 'Subassembly movements between departments',
      newBtn: '+ New Movement', formTitle: 'Log Movement', saveBtn: 'Log Movement',
      vizTitle: 'Production Flow', miscari: 'movements',
      data: 'Date', proiect: 'Project', subansamblu: 'Subassembly',
      deLa: 'From (Department)', la: 'To (Department)', echipa: 'Team',
      validatDe: 'Validated by', observatii: 'Notes',
      colProiect: 'Project', colSubansamblu: 'Subassembly', colDeLa: 'From',
      colLa: 'To', colEchipa: 'Team', colValidat: 'Validated by', colObs: 'Notes',
      empty: 'No movements logged',
    },
    kpi: {
      eyebrow: 'Production Team KPIs', title: 'Team Performance',
      subtitle: 'Frequency: Weekly (Monday morning) · Review: Monthly meeting',
      newBtn: '+ Weekly KPI', formTitle: 'Log Weekly KPI', saveBtn: 'Save KPI',
      currentWeek: 'Current Week', eficienta: 'Efficiency', calitate: 'Quality',
      saIesite: 'SA Out', leadTime: 'Lead Time',
      chartEficienta: 'Efficiency % — Weekly Trend', chartLeadTime: 'Avg Lead Time (hrs) — Weekly Trend',
      tableTitle: 'Full Data', blocate: 'blocked',
      saptamana: 'Week', echipa: 'Team', saIntrare: 'SA In', saIesire: 'SA Out',
      saBlocate: 'SA Blocked', saIntarziate: 'SA Delayed', eficientaPct: 'Efficiency %',
      leadTimeH: 'Lead Time (h)', calitatePct: 'Quality %',
      colSaptamana: 'Week', colEchipa: 'Team', colSAIn: 'SA In', colSAOut: 'SA Out',
      colBlocate: 'Blocked', colIntarziate: 'Delayed', colEficienta: 'Efficiency',
      colLeadTime: 'Lead Time', colCalitate: 'Quality',
    },
    admin: {
      eyebrow: 'System Administration', title: 'Admin Panel',
      subtitle: 'Account management', users: 'registered users',
      newBtn: '+ Worker Account', formTitle: 'New Worker Account', createBtn: 'Create Account',
      creating: 'Creating...',
      email: 'Email', password: 'Password', fullName: 'Full name',
      departament: 'Department', rol: 'Role',
      colNume: 'Name', colEmail: 'Email', colDept: 'Department', colRol: 'Role', colCreat: 'Created',
      ghidTitle: 'Access Guide',
      workerDesc: 'Access to all views. Can log movements, blockages, PDCA and KPIs for their department.',
      adminDesc: 'Full access + Admin panel for creating and managing worker accounts.',
    },
  },
}

export type Translations = typeof T.ro

interface LangContextValue {
  lang: Lang
  t: Translations
  toggle: () => void
}

const LangContext = createContext<LangContextValue>({
  lang: 'ro',
  t: T.ro,
  toggle: () => {},
})

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => (localStorage.getItem('lang') as Lang) ?? 'ro')
  const toggle = () => setLang(l => {
    const next = l === 'ro' ? 'en' : 'ro'
    localStorage.setItem('lang', next)
    return next
  })
  return <LangContext.Provider value={{ lang, t: T[lang], toggle }}>{children}</LangContext.Provider>
}

export const useLang = () => useContext(LangContext)
