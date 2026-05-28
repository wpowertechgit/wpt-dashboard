import type { Lang } from './i18n'

type PageInfoKey = 'login' | 'dashboard' | 'projects' | 'subassemblies' | 'planning' | 'blockages' | 'pdca' | 'dailyFlow' | 'kpi' | 'admin'

const INFO: Record<Lang, Record<PageInfoKey, string[]>> = {
  ro: {
    login: [
      'Aceasta este intrarea securizata in sistemul operational WPT.',
      'Dupa autentificare, rolul contului decide daca poti doar consulta datele sau poti si modifica inregistrari.',
      'Daca nu ai cont sau parola, cere acces de la administrator.',
    ],
    dashboard: [
      'Aceasta pagina este vederea rapida pentru sedinta operationala zilnica.',
      'Arata progresul proiectelor, cate subansambluri sunt finalizate, in lucru, blocate sau intarziate.',
      'Heatmap-ul arata unde sunt blocaje pe departamente, ca echipa sa stie unde trebuie actionat prima data.',
    ],
    projects: [
      'Aici se creeaza si se urmaresc proiectele principale.',
      'Fiecare proiect are client, responsabil, prioritate, date tinta, buget de ore si progres agregat.',
      'Cand un proiect nou este creat, sistemul pregateste lista standard de subansambluri pentru urmarirea productiei.',
    ],
    subassemblies: [
      'Aceasta pagina urmareste fiecare subansamblu prin fluxul LASER, ROLAT, SUDAT, ASAMBLAT si VOPSIT.',
      'Statusurile pe departamente arata unde se afla lucrarea si unde este blocata.',
      'Datele de start, termen si finalizare ajuta la calculul lead time-ului si la identificarea intarzierilor.',
    ],
    planning: [
      'Calendarul grupeaza termenele, finalizarile si elementele intarziate pe zile.',
      'Foloseste datele din proiecte si subansambluri pentru a arata ce urmeaza si ce are nevoie de atentie.',
      'Este util pentru planificarea zilnica si pentru verificarea lead time-ului.',
    ],
    blockages: [
      'Aici se inregistreaza problemele care opresc sau intarzie productia.',
      'Un blocaj contine proiectul, subansamblul, departamentul, responsabilul si impactul.',
      'Blocajele active raman vizibile pana cand sunt rezolvate, apoi se muta in lista de blocaje inchise.',
    ],
    pdca: [
      'PDCA transforma problemele si blocajele in actiuni urmaribile.',
      'Plan defineste problema, Do descrie contramasura, Check verifica rezultatul, iar Act inchide sau escaladeaza actiunea.',
      'Foloseste termene si prioritati ca sa vezi rapid actiunile depasite sau critice.',
    ],
    dailyFlow: [
      'Fluxul zilnic este jurnalul miscarilor de subansambluri intre departamente.',
      'Fiecare miscare noteaza proiectul, subansamblul, departamentul sursa, departamentul destinatie si cine a validat.',
      'Ajuta echipa sa inteleaga ce a avansat in productie in fiecare zi.',
    ],
    kpi: [
      'Pagina KPI masoara performanta saptamanala pe echipe/departamente.',
      'Urmareste intrari, iesiri, blocaje, intarzieri, eficienta, lead time si calitate.',
      'Graficele arata tendintele in timp, iar tabelul pastreaza datele complete pentru analiza.',
    ],
    admin: [
      'Admin Panel este folosit pentru gestionarea conturilor si rolurilor.',
      'Adminii pot crea conturi si pot schimba rolul sau departamentul unui utilizator.',
      'Rolul controleaza accesul la modificari: adminii pot scrie date, workerii consulta datele operationale.',
    ],
  },
  en: {
    login: [
      'This is the secure entry point for the WPT operational system.',
      'After sign-in, your account role decides whether you can only view data or also change records.',
      'If you do not have an account or password, ask an administrator for access.',
    ],
    dashboard: [
      'This page is the quick view for the daily operations meeting.',
      'It shows project progress and how many subassemblies are completed, in progress, blocked, or delayed.',
      'The heatmap shows where blockages exist by department, so the team knows where to act first.',
    ],
    projects: [
      'This is where main projects are created and tracked.',
      'Each project has a client, owner, priority, target dates, hour budget, and aggregate progress.',
      'When a new project is created, the system prepares the standard subassembly list for production tracking.',
    ],
    subassemblies: [
      'This page tracks each subassembly through LASER, ROLAT, SUDAT, ASAMBLAT, and VOPSIT.',
      'Department statuses show where the work currently sits and where it is blocked.',
      'Start, due, and done dates help calculate lead time and identify delays.',
    ],
    planning: [
      'The calendar groups due dates, completions, and overdue work by day.',
      'It uses project and subassembly dates to show what is coming next and what needs attention.',
      'Use it for daily planning and lead-time checks.',
    ],
    blockages: [
      'This page records problems that stop or delay production.',
      'A blockage stores the project, subassembly, department, owner, and impact.',
      'Active blockages remain visible until resolved, then move into the closed list.',
    ],
    pdca: [
      'PDCA turns problems and blockages into trackable actions.',
      'Plan defines the problem, Do describes the countermeasure, Check verifies the result, and Act closes or escalates.',
      'Due dates and priorities help surface overdue or critical actions quickly.',
    ],
    dailyFlow: [
      'Daily Flow is the movement log for subassemblies moving between departments.',
      'Each movement records the project, subassembly, source department, destination department, and validator.',
      'It helps the team understand what advanced in production each day.',
    ],
    kpi: [
      'Team KPIs measure weekly performance by department/team.',
      'They track input, output, blockages, delays, efficiency, lead time, and quality.',
      'Charts show trends over time, while the table keeps the full data for review.',
    ],
    admin: [
      'The Admin Panel manages accounts and roles.',
      'Admins can create accounts and change a user role or department.',
      'The role controls write access: admins can change data, workers can view operational data.',
    ],
  },
}

export function pageInfo(lang: Lang, key: PageInfoKey): string[] {
  return INFO[lang][key]
}
