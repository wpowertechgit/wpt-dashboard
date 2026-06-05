# Waste Powertech OMS - Ghid de Utilizare

Acest ghid explica ce face site-ul Waste Powertech OMS, cand se foloseste fiecare modul si ce trebuie actualizat in lucru zilnic.

Aplicatia centralizeaza starea proiectelor, fluxul subansamblurilor, blocajele, actiunile PDCA, miscarile zilnice, KPI-urile, sarcinile de birou si stocurile.

---

## 1. Intrare in aplicatie

La deschidere ai doua variante:

1. Te autentifici cu emailul si parola primite de la administrator.
2. Apesi `Versiune demo` daca vrei sa vezi aplicatia fara cont.

Butonul de limba schimba interfata intre romana si engleza. Din Demo Mode iesi cu `Exit Demo`.

---

## 2. Roluri si permisiuni

In meniu vezi doar modulele pentru care ai permisiune.

| Rol | La ce este folosit |
|---|---|
| `admin` | Acces complet, gestionare utilizatori si permisiuni |
| `production` | Module de productie, inventar in mod citire |
| `office` | Sarcini de birou si modul de stocuri |
| `office_production` | Acces combinat la productie si birou |
| `viewer` | Vizualizare fara modificari |

Daca nu vezi un modul sau nu poti salva, probabil contul tau nu are permisiunea necesara. Cere verificare de la administrator.

---

## 3. Harta rapida: ce modul folosesti si cand

| Modul | Cand il folosesti | Scop principal |
|---|---|---|
| `Tablou de Bord` / `Dashboard` | Primul ecran in fiecare zi | Vedere rapida asupra productiei |
| `Proiecte` / `Projects` | Cand pornesti sau modifici un proiect | Proiecte, termene, responsabili |
| `Subansambluri` / `Subassemblies` | Pentru actualizarea zilnica in productie | Statusuri SA, finalizare rapida, reset si etape de productie |
| `Calendar` | Pentru planificare si verificarea termenelor | Due, overdue, completed |
| `Blocaje` / `Blockages` | Cand o problema opreste sau incetineste lucrul | Inregistrarea problemelor blocante |
| `PDCA` | Cand problema necesita actiune | Actiuni corective si preventive |
| `Flux Zilnic` / `Daily Flow` | Cand un SA trece intre departamente | Jurnalul miscarilor zilnice |
| `KPI Echipe` / `Team KPIs` | Inainte de review-ul saptamanal | Indicatori de performanta pe echipe |
| `Sarcini` / `Tasks` | Pentru sarcini interne de birou | Atribuire si urmarire task-uri |
| `Stocuri` / `Inventory` | Pentru materiale, produse finite si miscari | Gestiune stocuri |
| `Admin` | Cand schimbi utilizatori sau permisiuni | Conturi, roluri, permisiuni |

---

## 4. Rutina recomandata de lucru

### Dimineata, la inceput de schimb sau meeting

1. Deschide `Dashboard`.
2. Verifica starea globala: total SA, finalizate, in lucru, blocate, intarziate.
3. Verifica progresul pe proiecte si heatmap-ul pe departamente.
4. Deschide `Calendar` si verifica elementele `Overdue` si `Upcoming`.
5. Daca exista blocaje deschise, intra in `Blockages`.

### In timpul zilei

1. In `Subassemblies`, actualizeaza statusul real.
2. Daca un SA trece in departamentul urmator, noteaza miscarea in `Daily Flow`.
3. Daca apare o problema, creeaza imediat un `Blockage`.
4. Daca problema cere actiune urmaribila, creeaza sau actualizeaza PDCA.

### La finalul zilei

1. Verifica daca fiecare SA terminat are completat `Done`.
2. Verifica daca fiecare etapa finalizata are data corecta: `PROIECTARE Done`, `LASER Done`, `VIROLAT Done`, `SUDAT Done`, `ASAMBLAT Done`, `VOPSIT Done`.
3. Inchide blocajele rezolvate.
4. Actualizeaza statusul sarcinilor de birou, daca esti implicat.

---

## 5. Dashboard

Acesta este ecranul pentru o vedere rapida asupra productiei.

Iti arata:

- numarul total de subansambluri
- cate sunt finalizate, in lucru, blocate sau intarziate
- progresul pe proiecte
- blocajele active
- heatmap-ul pe departamente

Cum il folosesti:

1. Verifica ce proiect are progres slab sau blocaje.
2. Verifica departamentele unde apar blocaje repetate.
3. Intra apoi in `Subassemblies`, `Calendar`, `Blockages` sau `PDCA` pentru actiune.

---

## 6. Projects

Aici creezi proiecte noi sau modifici datele proiectelor existente.

Campuri importante:

- `ID Proiect`: identificator proiect, de exemplu `WP1000-11`
- `Client`: clientul
- `Responsabil`: persoana responsabila
- `Data Start`: data de start
- `Data Target`: termenul planificat
- `Data Finalizare`: data reala de inchidere
- `Total Subansambluri`: numar SA
- `Buget Ore`: buget de ore
- `Prioritate`: `NORMAL`, `RIDICAT`, `CRITIC`
- `Status`: `IN PRODUCTIE`, `IN LIVRARE`, `LIVRAT`, `BLOCAJE ACTIVE`

Creare proiect:

1. Apasa `+ Proiect Nou`.
2. Completeaza ID-ul, clientul, responsabilul si datele.
3. Seteaza prioritatea si statusul.
4. Salveaza.

Important: la crearea unui proiect nou, sistemul pregateste lista standard de subansambluri pentru urmarirea productiei.

---

## 7. Subassemblies

Acesta este ecranul operational principal pentru productie.

Fluxul urmarit este:

`PROIECTARE -> LASER -> VIROLAT -> SUDAT -> ASAMBLAT -> VOPSIT`

Nota: in baza de date etapa `VIROLAT` poate aparea tehnic ca `rolat`, dar in interfata trebuie citita ca `VIROLAT`.

Aici poti:

- cauta dupa numele subansamblului
- filtra dupa proiect
- filtra dupa `ALL`, `FINALIZAT`, `IN LUCRU`, `BLOCAT`
- actualiza statusul global
- actualiza progresul
- alege rapid progresul: `0%`, `25%`, `50%`, `75%`, `100%`
- completa date
- seta statusuri pe departamente
- scrie comentarii
- finaliza rapid un SA cu `Finalizat`
- readuce un SA in lucru cu `Reset`

Campuri importante:

- `Status Global`: starea generala a SA-ului
- `Progres`: progres procentual
- `Start`: cand a inceput SA-ul
- `Due`: cand trebuie terminat
- `Done`: cand a fost terminat real
- `PROIECTARE Done`, `LASER Done`, `VIROLAT Done`, `SUDAT Done`, `ASAMBLAT Done`, `VOPSIT Done`: date de finalizare pe etapa
- `Comentarii`: observatii

Folosire corecta:

1. Gaseste proiectul si SA-ul.
2. Apasa `Edit`.
3. Seteaza statusul real.
4. Actualizeaza progresul manual sau cu butoanele rapide.
5. Completeaza datele relevante.
6. Seteaza statusul pe departamente: `Neinceput`, `In lucru`, `Finalizat`, `Blocat` sau `N/A`.
7. Salveaza.

Folosire rapida `Finalizat`:

1. Apasa `Finalizat` doar daca SA-ul este complet terminat in realitate.
2. Sistemul seteaza progresul la `100%`, completeaza datele lipsa pe etape cu data curenta si seteaza statusul global ca finalizat.
3. Foloseste acest buton doar cand toate etapele necesare sunt inchise.

Folosire `Reset`:

1. In modul `Edit`, apasa `Reset` daca SA-ul trebuie redeschis.
2. Sistemul il readuce in `IN LUCRU`, `0%`, fara blocaj.
3. Statusurile pe departamente revin la `Neinceput`, iar datele de finalizare se sterg.

Regula importanta pentru blocaje:

Daca setezi un SA pe `BLOCAT`, sistemul poate crea automat un `Blockage` deschis. Departamentul se ia din prima etapa marcata `Blocat`; daca nu exista etapa blocata, apare `GENERAL`. Inainte de salvare, scrie cauza clar in `Comentarii`.

Important: daca un SA este terminat, completeaza si `Done`, nu doar statusul textual.

---

## 8. Calendar

Calendarul este folosit pentru verificarea termenelor si lead time.

Aici vezi:

- `Overdue`: elemente cu termen depasit si neinchise
- `Upcoming`: elemente care urmeaza sa ajunga la termen
- `Recently completed`: elemente inchise recent
- vedere lunara
- timeline pentru proiecte si subansambluri

Foloseste-l:

- dimineata pentru prioritizare
- in meeting pentru verificarea intarzierilor
- la final de saptamana pentru analiza lead time

Daca ceva apare intarziat, verifica in `Subassemblies` campurile `Due` si `Done`.

---

## 9. Blockages

Aici inregistrezi orice problema care opreste sau incetineste productia.

Campuri pentru blocaj nou:

- `ID Blocare`: de exemplu `BLK-005`
- `Data Deschidere`: cand s-a deschis
- `Proiect`: proiectul afectat
- `Subansamblu`: SA afectat
- `Departament`: `PROIECTARE`, `LASER`, `VIROLAT`, `SUDAT`, `ASAMBLAT`, `VOPSIT` sau `GENERAL`
- `Responsabil`: persoana responsabila
- `Descriere Blocaj`: problema exacta
- `Impact`: `MEDIU`, `INALT`, `CRITIC`
- `Observatii`: note

Cand il inregistrezi:

- daca lipseste material sau componenta
- daca se asteapta o decizie tehnica
- daca un departament nu poate continua
- daca termenul este in risc

Cand se rezolva, apasa `Rezolvat`. Blocajul trece in lista de blocaje rezolvate.

Important: daca blocajul a fost creat automat din `Subassemblies`, verifica in `Blockages` daca descrierea, responsabilul si impactul sunt suficient de clare.

---

## 10. PDCA

PDCA transforma problemele in actiuni urmaribile.

PDCA inseamna:

- `Plan`: definirea problemei
- `Do`: contramasura
- `Check`: verificarea rezultatului
- `Act`: inchidere sau actiune urmatoare

Campuri pentru actiune noua:

- `ID PDCA`: de exemplu `PDCA-006`
- `Sursa`: sursa, de exemplu `BLK-001`
- `Data Deschis`: data deschiderii
- `Proiect`: proiectul afectat sau `TOATE`
- `Responsabil`: responsabil
- `Termen`: termen limita
- `Problema (Plan)`: problema
- `Contramasura (Do)`: contramasura
- `Prioritate`: `SCAZUT`, `MEDIU`, `INALT`, `CRITIC`

Foloseste PDCA cand:

- blocajul nu se rezolva printr-un pas simplu imediat
- problema este recurenta
- trebuie responsabil si termen
- actiunea trebuie urmarita in review

---

## 11. Daily Flow

Acesta este jurnalul miscarilor zilnice in productie.

Inregistreaza aici cand un subansamblu trece de la un departament la altul, de exemplu:

- `PROIECTARE -> LASER`
- `LASER -> VIROLAT`
- `VIROLAT -> SUDAT`
- `SUDAT -> ASAMBLAT`
- `ASAMBLAT -> VOPSIT`

Campuri:

- `Data`: data
- `Proiect`: proiect
- `Subansamblu`: numele SA
- `De la`: departamentul sursa
- `La`: departamentul destinatie
- `Echipa`: echipa
- `Validat de`: cine a validat
- `Observatii`: note

Foloseste acest modul la fiecare predare reala. Ajuta echipa sa vada cand si unde a avansat productia.

---

## 12. Team KPIs

Pagina KPI este folosita pentru performanta saptamanala.

Campuri principale:

- `Saptamana`: de exemplu `S-20 (Mai 19)`
- `Echipa`: departament/echipa
- `SA Intrare`: SA intrate
- `SA Iesire`: SA iesite/finalizate
- `SA Blocate`: SA blocate
- `SA Intarziate`: SA intarziate
- `Eficienta %`: eficienta
- `Lead Time (h)`: timp mediu de trecere
- `Calitate %`: indicator de calitate

Foloseste pagina:

- la inceput de saptamana pentru inchiderea saptamanii trecute
- inainte de review lunar
- pentru trenduri si blocaje recurente

---

## 13. Tasks

Acesta este modulul pentru sarcini interne de birou.

Exista doua vederi:

- `Sarcinile mele` / `My Tasks`: sarcini atribuite tie
- `Create de mine` / `Created by Me`: sarcini create de tine

Campuri pentru sarcina noua:

- `Titlu`: titlu scurt
- `Descriere`: descriere detaliata
- `Atribuie catre`: responsabil
- `Prioritate`: `LOW`, `NORMAL`, `HIGH`, `URGENT`
- `Termen`: data limita

Gestionare sarcina:

1. Deschide sarcina din tabel.
2. Seteaza statusul: `TODO`, `IN_PROGRESS`, `DONE`.
3. Adauga comentariu daca este nevoie de clarificare.
4. Stergerea este disponibila pentru creator sau utilizator cu permisiune potrivita.

---

## 14. Inventory

Modulul de inventar urmareste materii prime si produse finite.

Exista doua taburi:

- `Materii Prime` / `Raw Materials`
- `Produse Finite` / `Finished Goods`

Pentru un articol poti inregistra:

- denumire
- SKU
- categorie
- unitate de masura
- cantitate disponibila
- stoc minim
- cost/unitate
- furnizor
- locatie
- note

Operatiuni:

- `+`: receptie
- `-`: eliberare
- `Ajustare`: corectie stoc
- `Log`: istoricul tranzactiilor
- `Edit`: editare articol

Daca stocul scade sub minim, articolul primeste marcaj `Stoc redus` / `Low stock`.

---

## 15. Admin

Pagina Admin este folosita pentru utilizatori si permisiuni.

Actiuni admin:

- creare cont nou
- setare email, parola, nume complet, departament si rol
- modificare rol sau departament pentru utilizator existent
- adaugare sau revocare permisiuni individuale

Creare utilizator:

1. Apasa `+ Cont Nou`.
2. Introdu emailul si parola.
3. Introdu numele complet.
4. Alege departamentul.
5. Alege rolul.
6. Salveaza.

Editare permisiuni:

1. La utilizator, apasa `Perm.`.
2. Bifeaza sau debifeaza permisiunile necesare.
3. `Reseteaza la rol` revine la permisiunile standard ale rolului.
4. Salveaza permisiunile.

---

## 16. Reguli pentru date si lead time

Sistemul poate planifica si masura corect doar daca datele sunt corecte.

Completeaza consecvent:

- proiect `Data Start`
- proiect `Data Target`
- proiect `Data Finalizare`, cand este inchis real
- SA `Start`
- SA `Due`
- SA `Done`
- datele `... Done` pe departamente

Pe baza lor poti vedea:

- ce proiect intarzie
- ce SA este intarziat
- unde se opreste fluxul
- care este lead time-ul real
- ce departament creeaza blocaj

---

## 17. Ce actualizezi si cand

| Eveniment | Ce actualizezi |
|---|---|
| Porneste un proiect nou | `Projects` |
| SA intra in lucru | `Subassemblies` -> `Start`, status departament |
| Termenul SA este cunoscut | `Subassemblies` -> `Due` |
| SA trece la alt departament | `Daily Flow` si `Subassemblies` |
| Un departament termina etapa | data `... Done` corespunzatoare |
| SA este complet gata | buton `Finalizat` sau `Status Global`, `Progres`, `Done` |
| SA a fost inchis/blocat gresit | `Subassemblies` -> `Edit` -> `Reset`, apoi date corecte |
| Apare problema blocanta | `Subassemblies` -> `BLOCAT` si/sau `Blockages` |
| Blocajul necesita actiune | `PDCA` |
| Blocajul se rezolva | `Blockages` -> `Rezolvat` |
| Se pregatesc indicatorii saptamanali | `Team KPIs` |
| Apare sarcina de birou | `Tasks` |
| Intra sau iese material | `Inventory` |
| Un om nou primeste acces | `Admin` |

---

## 18. Probleme frecvente

### Nu vad un modul

Nu ai permisiunea necesara. Cere verificare de la administrator.

### Ceva apare overdue, desi este gata

Verifica daca `Done` este completat, nu doar statusul.

Daca ai folosit `Finalizat`, verifica si datele pe etape. Sistemul poate completa datele lipsa cu data curenta.

### Nu apar date in Calendar

Verifica datele din `Projects` si `Subassemblies`: `Data Start`, `Data Target`, `Start`, `Due`, `Done`.

### Nu pot salva

Este posibil sa ai doar drept de vizualizare. Cere verificarea rolului sau a permisiunilor individuale.

### Am pus un SA pe BLOCAT si a aparut un blockage nou

Este comportament intentionat. Statusul blocat din `Subassemblies` poate crea automat un blocaj deschis ca problema sa nu se piarda din urmarirea zilnica.

### Stocul pare gresit

Deschide `Log` pentru articolul respectiv si verifica receptiile, eliberarile si ajustarile.

---

## 19. Regula de aur

Aplicatia este utila doar daca reflecta realitatea din productie in aceeasi zi.

Inregistreaza in aceeasi zi:

- status real
- date reale
- blocaje reale
- predari reale
- miscari reale de stoc

Daca aceste cinci lucruri sunt actualizate constant, OMS devine util pentru decizii zilnice, prioritizare proiecte, masurare lead time si review de echipa.
