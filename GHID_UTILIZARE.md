# Waste Powertech OMS — Ghid de Utilizare

## Ce este acest sistem?

OMS (Operations Management System) este versiunea digitală a **Whiteboardului Vizual** folosit în producție. Înlocuiește board-ul fizic cu magnete, permițând echipelor să vadă în timp real starea fiecărui subansamblu, blocajele active și acțiunile PDCA — de pe orice dispozitiv.

---

## Cum intri în sistem

1. Deschide aplicația în browser
2. Introdu **email-ul** și **parola** primite de la administrator
3. Ești autentificat — sistemul îți afișează tabloul de bord

Dacă nu ai cont, contactează un administrator să îți creeze unul (din tab-ul **Admin**).

---

## Structura aplicației

Bara de navigare din sus conține 7 secțiuni + Admin (doar pentru admini):

| Tab | Ce găsești |
|-----|-----------|
| **Tablou de Bord** | Rezumat general: KPI-uri cheie, progres proiecte, blocaje active |
| **Proiecte** | Lista proiectelor active (WP1000-08/09/10), termene, bugete |
| **Subansambluri** | Starea fiecărui SA prin LASER → ROLAT → SUDAT → ASAMBLAT → VOPSIT |
| **Blocaje** | Blocajele active și rezolvate (echivalentul cartonașelor roșii de pe board) |
| **PDCA** | Acțiunile corective deschise (Plan-Do-Check-Act) |
| **Flux Zilnic** | Log-ul mișcărilor de subansambluri între departamente |
| **KPI Echipe** | Eficiența, calitatea, lead time-ul per echipă pe săptămâni |
| **⚙ Admin** | Creare și gestionare conturi workers *(doar admini)* |

---

## Rutina zilnică (15-20 minute, ora 08:00)

Aceasta reflectă direct **GHID WHITEBOARD** din Excel.

### Pasul 1 — Deschide **Subansambluri** (MIN 01-03: Check Status)

- Caută SA-urile din departamentul tău
- Folosește butonul **Edit** pe rândul fiecărui SA și actualizează statusul coloanei tale:
  - `Finalizat` — SA terminat în departamentul tău ✅
  - `În lucru` — SA în curs de execuție 🟡
  - `Blocat` — SA blocat, necesită intervenție ⛔
  - `Neînceput` — SA nu a ajuns încă la voi ○
  - `N/A` — nu se aplică departamentului tău
- Actualizează și **Progres %** dacă este relevant
- Apasă **Salvează**

### Pasul 2 — Verifică **Blocaje** (MIN 09-12: Blocaje)

- Dacă există un blocaj nou → apasă **+ Blocaj Nou** și completează:
  - ID (ex: `BLK-006`)
  - Data, proiectul, subansamblul
  - Departamentul afectat
  - Descrierea problemei
  - Responsabilul și impactul (MEDIU / INALT / CRITIC)
- Dacă un blocaj a fost rezolvat → apasă **✅ Rezolvat**

### Pasul 3 — Actualizează **PDCA** (MIN 13-16: PDCA Update)

- Verifică acțiunile cu termen scadent
- Dacă o acțiune a fost rezolvată → apasă **✅ Închide**
- Dacă există o problemă nouă care necesită PDCA → apasă **+ Acțiune PDCA**

### Pasul 4 — Înregistrează **Flux Zilnic** (MIN 04-08: Flux Review)

- Pentru fiecare SA care s-a mutat de la departamentul tău la altul azi:
  - Apasă **+ Mișcare Nouă**
  - Completează: data, proiect, subansamblu, de la → la, echipa

---

## Rutina săptămânală (Luni 08:30)

### Deschide **KPI Echipe**

- Apasă **+ KPI Săptămână**
- Completează pentru echipa ta:
  - Săptămâna (ex: `S-21 (Mai 26)`)
  - SA intrare / ieșire / blocate / întârziate
  - Eficiență % (SA ieșite / SA intrate × 100)
  - Lead Time mediu în ore
  - Calitate % (SA fără retucare)

---

## Codul de culori

| Culoare | Semnificație |
|---------|-------------|
| 🟢 Verde | Finalizat / Rezolvat / ≥90% |
| 🟡 Galben | În lucru / Atenție / 75-89% |
| 🔴 Roșu | Blocat / Critic / <75% |
| 🔵 Albastru | Condiționat de alt SA |
| ⬜ Gri | Neînceput / N/A |

---

## Logica de escaladare (din PDCA)

| Nivel | Cine decide | Condiție |
|-------|-------------|---------|
| **Nivel 1** | Șef echipă | Blocaj rezolvabil în <4 ore fără resurse extra |
| **Nivel 2** | Șef producție | Blocaj >4 ore SAU implică alt departament SAU aprovizionare |
| **Nivel 3** | Director general | Blocaj >1 zi SAU risc livrare proiect SAU cost suplimentar major |

---

## Administrare conturi (doar Admin)
## Administrare conturi (doar Admin)

1. Du-te la tab-ul **Admin**
2. Pentru a schimba rolul sau departamentul unui utilizator existent, apasa **Edit** pe randul lui
3. Salveaza modificarile

> Crearea conturilor noi trebuie facuta prin Supabase Dashboard sau printr-o functie backend/Edge Function protejata. Cheile privilegiate nu se pun niciodata in `.env.local` pentru frontend.

---

## Indicatori KPI de urmărit

| KPI | Descriere | Target |
|-----|-----------|--------|
| **FTT** (First Time Through) | % SA care trec prin flux fără retucare | >90% |
| **Lead Time** | Timp LASER → VOPSIT per SA | <20h |
| **WIP** | SA aflate simultan în producție per departament | max 3 |
| **Eficiență** | SA ieșite / SA intrate | >90% |
| **Calitate** | SA fără retucare | >95% |
| **OEE** | Disponibilitate × Performanță × Calitate | >85% |

---

## Întrebări frecvente

**Nu pot crea cont pentru un worker.**  
Creeaza contul din Supabase Dashboard sau foloseste o functie backend protejata, apoi seteaza rolul si departamentul din tab-ul Admin.

**Nu văd tab-ul Admin.**  
Contul tău are rol `worker`. Cere unui admin să schimbe rolul din tab-ul Admin → Edit.

**Datele nu se actualizează.**  
Încearcă să dai refresh la pagină (F5). Dacă problema persistă, verifică conexiunea la internet.

**Cum știu că am salvat corect?**  
După fiecare salvare, butonul se dezactivează câteva secunde, apoi formularul dispare și datele apar în tabel.
