# Waste Powertech OMS - Használati Útmutató

Ez az útmutató azt mutatja be, hogy a Waste Powertech OMS rendszert mikor, mire és hogyan érdemes használni a napi működésben.

Az alkalmazás egy helyen kezeli a projekteket, subassembly-ket, gyártási határidőket, blokkolásokat, PDCA akciókat, napi átadásokat, KPI-okat, irodai feladatokat, készletmozgásokat, felhasználókat, aktivitási naplókat és webes riportokat.

---

## 1. Belépés és fiók

Az oldal megnyitásakor két lehetőség van:

1. Jelentkezz be az adminisztrátortól kapott email címmel és jelszóval.
2. Használd a `Versiune demo` / `Demo version` gombot, ha csak kipróbálni vagy bemutatni szeretnéd a rendszert.

A jobb felső nyelvi gombbal román és angol felület között lehet váltani. Demo módból az `Exit Demo` gombbal lehet kilépni.

Ha elfelejtetted a jelszavadat, használd a jelszó-visszaállítási folyamatot. Az új jelszót a `Reset Password` oldalon lehet megadni. A jelszó és a megerősítés mezőnek egyeznie kell.

Bejelentkezés után a fejlécben látod a saját nevedet, részlegedet és profilképedet. A profilképre vagy a `My Profile` menüpontra kattintva módosíthatod a saját nevedet, részlegedet és profilképedet.

---

## 2. Szerepkörök és jogosultságok

A menüben csak azokat a modulokat látod, amelyekhez jogosultságod van. Ha egy oldal nem látható, vagy egy mentés nem elérhető, akkor valószínűleg hiányzik a megfelelő jogosultság.

| Szerepkör | Mire való |
|---|---|
| `admin` | Teljes hozzáférés, felhasználók, jogosultságok, naplók és riportok kezelése |
| `production` | Termelési modulok szerkesztése, készlet megtekintése |
| `office` | Irodai feladatok és készletmodul kezelése |
| `office_production` | Termelési és irodai modulok együtt |
| `viewer` | Megtekintés módosítás nélkül |

Az admin egyedi jogosultságokat is adhat vagy visszavonhat. Ez azt jelenti, hogy két azonos szerepkörű felhasználó között is lehet eltérés, ha valakinél egyedi engedély lett beállítva.

Demo módban a rendszer tesztadatokkal működik, és a módosítások bemutatási célra szolgálnak.

---

## 3. Gyors térkép: melyik modult mikor használd

| Modul | Mikor használd | Fő cél |
|---|---|---|
| `Dashboard` / `Tablou de Bord` | Minden nap elsőként | Gyors termelési állapotkép |
| `Projects` / `Proiecte` | Új projekt indításakor vagy projektadat módosításakor | Projektek, határidők, felelősök, órabüdzsé |
| `Subassemblies` / `Subansambluri` | Napi termelési frissítéskor | SA státuszok, progressz, gyártási lépések |
| `Planning` / `Calendar` | Napi tervezéskor és határidő-ellenőrzéskor | Overdue, upcoming, completed elemek és timeline |
| `Blockages` / `Blocaje` | Amikor egy probléma megakasztja a munkát | Blokkoló problémák rögzítése |
| `PDCA` | Ha a probléma követhető akciót igényel | Javító és megelőző intézkedések |
| `Daily Flow` / `Flux Zilnic` | Amikor egy SA átkerül egyik részlegről a másikra | Napi mozgások naplózása |
| `Team KPIs` / `KPI Echipe` | Heti vagy havi review előtt | Csapat teljesítménymutatók |
| `Tasks` / `Sarcini` | Irodai belső feladatoknál | Feladatkiadás, követés, kommentek |
| `Inventory` / `Stocuri` | Anyagok, késztermékek és mozgások követésére | Készletkezelés |
| `Logs` | Admin ellenőrzéskor | Aktivitási napló, audit, CSV export |
| `Reports` | Webes forgalmi riport készítésekor | Cloudflare látogatottsági és forgalmi riport |
| `Admin` | Felhasználó vagy jogosultság változásakor | Fiókok, szerepek, egyedi engedélyek |
| `My Profile` | Saját adatok módosításakor | Név, részleg, profilkép |

---

## 4. Ajánlott napi rutin

### Reggel, műszak vagy napi meeting elején

1. Nyisd meg a `Dashboard` oldalt.
2. Nézd meg a globális állapotot: összes SA, kész, folyamatban, blokkolt, késésben.
3. Ellenőrizd a projektprogresszt és a department heatmapet.
4. Nyisd meg a `Planning` oldalt, és nézd meg az `Overdue` és `Upcoming` elemeket.
5. Ha van nyitott blokkolás, menj a `Blockages` oldalra.
6. Ha vannak saját nyitott feladataid, nézd meg a `Tasks` oldalt vagy az aktív feladat panelt.

### Munka közben

1. A `Subassemblies` oldalon frissítsd a valós státuszt.
2. Ha egy SA átment a következő részlegre, rögzítsd a mozgást a `Daily Flow` oldalon.
3. Ha probléma van, azonnal nyiss `Blockage` bejegyzést, vagy állítsd az SA-t `BLOCAT` állapotra.
4. Ha a probléma intézkedést igényel, hozz létre vagy frissíts PDCA akciót.
5. Ha anyag érkezik vagy fogy, rögzítsd a készletmozgást az `Inventory` modulban.

### Nap végén

1. Ellenőrizd, hogy minden elkészült SA-nál ki van-e töltve a `Done` dátum.
2. Ellenőrizd, hogy minden lezárt gyártási lépésnél megvan-e a megfelelő `... Done` dátum.
3. Zárd le a megoldott blokkolásokat.
4. Frissítsd az irodai feladatok státuszát, ha érintett vagy.
5. Admin felhasználóként szükség esetén nézd át a `Logs` oldalt.

---

## 5. Dashboard

Ezt az oldalt gyors helyzetképhez használd.

Itt látod:

- az összes subassembly számát
- a kész, folyamatban lévő, blokkolt és késő elemeket
- projektek progresszét
- aktív blokkolásokat
- department heatmapet

Használat:

1. Nézd meg, melyik projekt áll rosszul vagy csúszik.
2. Nézd meg, hol van sok blokkolás.
3. Döntsd el, melyik modulba kell továbbmenni: `Subassemblies`, `Planning`, `Blockages` vagy `PDCA`.

---

## 6. Projects

Új projektet vagy projektadatot itt kell kezelni.

Fontos mezők:

- `ID Proiect`: projektazonosító, például `WP1000-11`
- `Client`: ügyfél
- `Responsabil`: felelős
- `Data Start`: projekt kezdete
- `Data Target`: tervezett célhatáridő
- `Data Finalizare`: tényleges lezárás dátuma
- `Total Subansambluri`: SA darabszám
- `Buget Ore`: tervezett órakeret
- `Prioritate`: `NORMAL`, `RIDICAT`, `CRITIC`
- `Status`: `IN PRODUCTIE`, `IN LIVRARE`, `LIVRAT`, `BLOCAJE ACTIVE`

Új projekt létrehozása:

1. Kattints a `+ Proiect Nou` gombra.
2. Töltsd ki az ID-t, ügyfelet, felelőst és dátumokat.
3. Állítsd be a prioritást és státuszt.
4. Mentsd el.

Fontos: új projekt létrehozásakor a rendszer előkészíti a standard subassembly listát a termelés követéséhez.

---

## 7. Subassemblies

Ez a napi termelési munka fő oldala.

A követett gyártási lánc:

`PROIECTARE -> LASER -> VIROLAT -> SUDAT -> ASAMBLAT -> VOPSIT`

Megjegyzés: az adatbázisban a `VIROLAT` lépés technikai mezőneve előfordulhat `rolat` néven, de a felületen `VIROLAT` néven kell értelmezni.

Itt lehet:

- keresni subassembly név alapján
- projektre szűrni
- szűrni `ALL`, `FINALIZAT`, `IN LUCRU`, `BLOCAT` státusz szerint
- frissíteni a globális státuszt
- frissíteni a progresszt
- gyors progresszt választani: `0%`, `25%`, `50%`, `75%`, `100%`
- dátumokat tölteni
- részlegenként státuszt állítani
- megjegyzést írni
- gyorsan készre zárni egy SA-t a `Finalizat` gombbal
- visszaállítani egy SA-t a `Reset` gombbal, ha hibásan lett lezárva vagy blokkolva

Legfontosabb mezők:

- `Status Global`: teljes SA állapota
- `Progres`: százalékos haladás
- `Start`: mikor indult az SA
- `Due`: mikorra kell készen lennie
- `Done`: mikor lett ténylegesen kész
- `PROIECTARE Done`, `LASER Done`, `VIROLAT Done`, `SUDAT Done`, `ASAMBLAT Done`, `VOPSIT Done`: részlegenkénti lezárás dátuma
- `Comentarii`: megjegyzés

Helyes használat:

1. Keresd meg a projektet és az SA-t.
2. Kattints az `Edit` gombra.
3. Állítsd be a valós státuszt.
4. Frissítsd a progresszt kézzel vagy a gyors gombokkal.
5. Töltsd ki a releváns dátumokat.
6. Állítsd be részlegenként, hogy `Neinceput`, `In lucru`, `Finalizat`, `Blocat` vagy `N/A`.
7. Mentsd.

Gyors `Finalizat` használata:

1. Csak akkor kattints a `Finalizat` gombra, ha az SA ténylegesen teljesen kész.
2. A rendszer `100%` progresszre állítja, kitölti a hiányzó részleglezárási dátumokat a mai nappal, és a globális státuszt készre állítja.
3. Ellenőrizd utána, hogy a dátumok a valóságot tükrözik-e.

`Reset` használata:

1. Edit módban kattints a `Reset` gombra, ha egy SA-t vissza kell nyitni.
2. A rendszer visszaállítja `IN LUCRU`, `0%`, nem blokkolt állapotra.
3. A részleg státuszok `Neinceput` értékre kerülnek, a lezárási dátumok törlődnek.

Blokkolás fontos szabálya:

Ha egy SA-t `BLOCAT` globális státuszra állítasz, a rendszer automatikusan létrehozhat egy nyitott `Blockage` bejegyzést. A blokk részlege az első `Blocat` részleg alapján lesz meghatározva; ha nincs ilyen részleg, `GENERAL` lesz. Blokkolás előtt mindig írd be a pontos okot a `Comentarii` mezőbe.

Fontos: ha egy SA elkészült, a `Done` dátumot is ki kell tölteni, nem elég csak a státuszt készre állítani.

---

## 8. Planning

A `Planning` oldal a határidők, befejezések, késések és timeline áttekintésére való.

Itt látod:

- `Overdue`: lejárt határidejű, de még nem lezárt elemek
- `Upcoming`: hamarosan esedékes elemek
- `Recently completed`: nemrég lezárt elemek
- projektek, subassembly-k és jogosultságtól függően feladatok idővonalát
- vízszintes timeline nézetet görgetéssel és zoommal

Használd:

- reggel prioritásállításhoz
- meeting közben késések áttekintésére
- hét végén lead time elemzéshez
- irodai feladatok határidőinek ellenőrzéséhez, ha van `view_tasks` jogosultságod

Ha valami késésben van, ellenőrizd a `Projects`, `Subassemblies` vagy `Tasks` oldalon a kapcsolódó dátumokat.

---

## 9. Blockages

Minden olyan problémát itt kell rögzíteni, amely megállítja vagy lassítja a termelést.

Új blokkolás mezői:

- `ID Blocare`: például `BLK-005`
- `Data Deschidere`: mikor nyílt
- `Proiect`: érintett projekt
- `Subansamblu`: érintett SA
- `Departament`: `PROIECTARE`, `LASER`, `VIROLAT`, `SUDAT`, `ASAMBLAT`, `VOPSIT` vagy automatikus blokk esetén `GENERAL`
- `Responsabil`: felelős személy
- `Descriere Blocaj`: pontos probléma
- `Impact`: `MEDIU`, `INALT`, `CRITIC`
- `Observatii`: megjegyzés

Mikor rögzítsd:

- ha hiányzik anyag vagy alkatrész
- ha műszaki döntésre kell várni
- ha egy részleg nem tud továbbdolgozni
- ha a blokk határidőt veszélyeztet

Megoldáskor kattints a `Rezolvat` gombra. A lezárt bejegyzés átkerül a megoldott blokkolások közé.

Fontos: ha a `Subassemblies` oldalon egy SA-t `BLOCAT` állapotba teszel, a rendszer külön `Blockage` rekordot is nyithat. Ilyenkor ellenőrizd a `Blockages` oldalon, hogy az automatikusan létrejött bejegyzés elég pontos-e.

---

## 10. PDCA

A PDCA a problémákból követhető akciókat készít.

A PDCA jelentése:

- `Plan`: probléma meghatározása
- `Do`: ellenintézkedés
- `Check`: eredmény ellenőrzése
- `Act`: lezárás vagy további intézkedés

Új PDCA akció mezői:

- `ID PDCA`: például `PDCA-006`
- `Sursa`: forrás, például `BLK-001`
- `Data Deschis`: nyitás dátuma
- `Proiect`: érintett projekt vagy `TOATE`
- `Responsabil`: felelős
- `Termen`: határidő
- `Problema (Plan)`: probléma
- `Contramasura (Do)`: ellenintézkedés
- `Prioritate`: `SCAZUT`, `MEDIU`, `INALT`, `CRITIC`

Használd PDCA-t, ha:

- a blokkolás nem oldható meg azonnali egyszerű lépéssel
- ismétlődő problémáról van szó
- felelőst és határidőt kell adni
- vezetői review-ban követni kell az intézkedést

---

## 11. Daily Flow

Ez a napi gyártási mozgások naplója.

Itt rögzítsd, ha egy subassembly átkerül egyik részlegről a másikra, például:

- `PROIECTARE -> LASER`
- `LASER -> VIROLAT`
- `VIROLAT -> SUDAT`
- `SUDAT -> ASAMBLAT`
- `ASAMBLAT -> VOPSIT`

Mezők:

- `Data`: dátum
- `Proiect`: projekt
- `Subansamblu`: SA neve
- `De la`: induló részleg
- `La`: célrészleg
- `Echipa`: csapat
- `Validat de`: ki validálta
- `Observatii`: megjegyzés

Használd minden tényleges átadásnál. Ez segít visszanézni, mikor és hol haladt a termelés.

---

## 12. Team KPIs

A KPI oldalt heti teljesítményrögzítésre és review-ra használd.

Fő mezők:

- `Saptamana`: hét megnevezése, például `S-20 (Mai 19)`
- `Echipa`: részleg/csapat
- `SA Intrare`: beérkező SA-k száma
- `SA Iesire`: kimenő vagy kész SA-k száma
- `SA Blocate`: blokkolt SA-k száma
- `SA Intarziate`: késő SA-k száma
- `Eficienta %`: hatékonyság
- `Lead Time (h)`: átlagos átfutási idő órában
- `Calitate %`: minőségi mutató

Mikor használd:

- hét elején az előző hét lezárására
- havi review előtt
- trendek és szűk keresztmetszetek keresésére

---

## 13. Tasks

Ez az irodai feladatkezelő.

Két fő nézet van:

- `Sarcinile mele` / `My Tasks`: neked kiosztott feladatok
- `Create de mine` / `Created by Me`: általad létrehozott feladatok

Új feladat mezői:

- `Titlu`: rövid cím
- `Descriere`: részletes leírás
- `Atribuie catre`: felelős
- `Prioritate`: `LOW`, `NORMAL`, `HIGH`, `URGENT`
- `Termen`: határidő

Feladat kezelése:

1. Nyisd meg a feladatot a táblázatból.
2. Állítsd a státuszt: `TODO`, `IN_PROGRESS`, `DONE`.
3. Írj kommentet, ha egyeztetés vagy kiegészítés kell.
4. Törölni csak a létrehozó vagy a megfelelő jogosultságú felhasználó tud.

Az aktív feladat panel bejelentkezett felhasználóknál automatikusan megjelenhet. Ez a saját, még nem kész feladatokat mutatja, kiemeli a lejártakat, és gyors lezárást is enged megjegyzéssel.

---

## 14. Inventory

A készletmodul alapanyagok és késztermékek követésére való.

Két tab van:

- `Materii Prime` / `Raw Materials`
- `Produse Finite` / `Finished Goods`

Artikelnél rögzíthető:

- név
- SKU
- kategória
- mértékegység
- rendelkezésre álló mennyiség
- minimum készletszint
- költség/egység
- beszállító
- lokáció
- megjegyzés

Műveletek:

- `+`: bevételezés
- `-`: kiadás
- `Ajustare`: készletkorrekció
- `Log`: tranzakciók története
- `Edit`: cikk szerkesztése

Ha a készlet a minimum alá esik, az elem `Stoc redus` / `Low stock` jelzést kap.

---

## 15. Notifications

A felső sávban található értesítési ikon a felhasználóhoz kapcsolódó üzeneteket mutatja.

Itt láthatod például:

- újonnan kiosztott feladatokat
- rendszer- vagy email-értesítéseket
- még olvasatlan eseményeket

Használat:

1. Kattints az értesítési ikonra.
2. Nézd meg az olvasatlan tételeket.
3. Jelöld olvasottnak az egyes értesítéseket, vagy használd az összes olvasottra állítását.

Demo módban az értesítési funkció nem jelenik meg ugyanúgy, mint valódi bejelentkezésnél.

---

## 16. Logs

A `Logs` oldal admin ellenőrzésre és audit célra szolgál.

Itt látható:

- ki jelentkezett be vagy ki
- milyen rekord jött létre, módosult vagy törlődött
- feladat-, készlet-, PDCA-, blokk- és riportesemények
- rendszeresemények, email és értesítési események

Funkciók:

- keresés felhasználó, művelet vagy rekord címke alapján
- szűrés művelettípus szerint
- szűrés entitástípus szerint
- `Export CSV`
- napló törlése vagy teljes törlés, ha van `delete_logs` jogosultság

Fontos: a napló törlése audit szempontból érzékeny művelet. Csak akkor törölj, ha erre belső szabály vagy admin döntés van.

---

## 17. Reports

A `Reports` oldal a Cloudflare webes forgalmi adataiból készít riportot.

Itt beállítható:

- `Last 7 days`
- `Last 30 days`
- egyedi kezdő és záró dátum

A riportban látható:

- `Unique Visitors`
- `Page Views`
- `Total Requests`
- `Bandwidth`
- `Threats Blocked`
- napi bontás
- országok szerinti forgalmi megoszlás, ha van adat

Használat:

1. Válassz időszakot.
2. Kattints a `Generate Report` gombra.
3. Ellenőrizd az összesítő kártyákat és táblázatokat.
4. Ha kell, használd a `Download PDF` gombot.

A riport csak akkor működik, ha a Cloudflare riport funkcióhoz szükséges backend és jogosultság be van állítva.

---

## 18. Admin

Az admin oldal felhasználók és jogosultságok kezelésére való.

Admin teendők:

- új fiók létrehozása
- email, jelszó, teljes név, részleg és szerepkör beállítása
- meglévő felhasználó részlegének vagy szerepének módosítása
- egyedi jogosultságok hozzáadása vagy visszavonása

Új felhasználó létrehozása:

1. Kattints a `+ Cont Nou` gombra.
2. Add meg az emailt és jelszót.
3. Add meg a teljes nevet.
4. Válaszd ki a részleget.
5. Válaszd ki a szerepkört.
6. Mentsd.

Jogosultság szerkesztése:

1. A felhasználónál kattints a `Perm.` gombra.
2. Pipáld be vagy vedd ki a szükséges engedélyeket.
3. A `Reseteaza la rol` visszaállítja az alap szerepkör szerinti jogokat.
4. Mentsd a jogosultságokat.

---

## 19. My Profile

A `My Profile` oldalon minden bejelentkezett felhasználó saját adatait kezelheti.

Módosítható:

- teljes név
- részleg
- profilkép

Profilkép feltöltése:

1. Kattints az `Upload Photo` gombra.
2. Válassz JPG, PNG vagy WebP képet.
3. Várd meg a feltöltést.
4. Kattints a `Save Changes` gombra.

Az email cím itt csak megjelenik, nem szerkeszthető.

---

## 20. Dátumok és lead time szabályok

A rendszer akkor tud jól tervezni és mérni, ha a dátumok pontosak.

Mindig töltsd ki:

- projekt `Data Start`
- projekt `Data Target`
- projekt `Data Finalizare`, amikor ténylegesen lezárult
- SA `Start`
- SA `Due`
- SA `Done`
- részlegenkénti `... Done` dátumok
- feladat `Termen`, ha irodai taskról van szó

Ez alapján lehet látni:

- melyik projekt csúszik
- melyik SA van késésben
- melyik feladat lejárt
- hol áll meg a folyamat
- mennyi a valós lead time
- melyik részleg okoz szűk keresztmetszetet

---

## 21. Mit mikor kell frissíteni

| Esemény | Mit frissíts |
|---|---|
| Új projekt indul | `Projects` |
| SA munkába kerül | `Subassemblies` -> `Start`, részleg státusz |
| SA határideje ismert | `Subassemblies` -> `Due` |
| SA továbbmegy másik részlegre | `Daily Flow` és `Subassemblies` |
| Egy részleg befejezte a munkát | megfelelő `... Done` dátum |
| SA teljesen kész | `Finalizat` gyorsgomb vagy `Status Global`, `Progres`, `Done` |
| SA hibásan lett zárva vagy blokkolva | `Subassemblies` -> `Edit` -> `Reset`, majd helyes adatok |
| Blokkoló probléma keletkezik | `Subassemblies` -> `BLOCAT` és/vagy `Blockages` |
| Blokkolás intézkedést igényel | `PDCA` |
| Blokkolás megoldódik | `Blockages` -> `Rezolvat` |
| Heti mutatók készülnek | `Team KPIs` |
| Irodai feladat keletkezik | `Tasks` |
| Feladat elkészül | `Tasks` vagy aktív feladat panel -> `DONE` |
| Anyag érkezik vagy fogy | `Inventory` |
| Új ember kap hozzáférést | `Admin` |
| Audit vagy ellenőrzés kell | `Logs` |
| Webes forgalmi riport kell | `Reports` |
| Saját név, részleg vagy kép változik | `My Profile` |

---

## 22. Gyakori problémák

### Nem látok egy menüpontot

Nincs hozzá jogosultságod. Kérj adminisztrátori ellenőrzést.

### Valami overdue, pedig szerintem kész

Ellenőrizd, hogy a `Done` dátum is ki van-e töltve, nem csak a státusz.

Ha a gyors `Finalizat` gombbal zártad, nézd meg, hogy minden részlegnél megfelelő-e a lezárási dátum. A rendszer a hiányzó dátumokat a lezárás napjával töltheti ki.

### Nem jelenik meg adat a Planning oldalon

Ellenőrizd a projekt, SA és feladat dátummezőket: `Data Start`, `Data Target`, `Start`, `Due`, `Done`, `Termen`.

### Nem tudok menteni

Lehet, hogy csak megtekintési jogod van. Ellenőriztesd a szerepkört vagy egyedi jogosultságot.

### Blokkoltra állítottam egy SA-t, és megjelent egy új blockage

Ez szándékos működés. A `Subassemblies` blokk státusza automatikusan nyitott blokkolás rekordot hozhat létre, hogy a probléma ne vesszen el a napi követésben.

### A készlet rossznak tűnik

Nézd meg az adott tétel `Log` nézetét, és ellenőrizd a bevételezés, kiadás és korrekció tranzakciókat.

### Nem jön létre riport

Ellenőrizd, hogy van-e `view_reports` jogosultságod, és hogy a Cloudflare riport funkció be van-e állítva a backendben.

### Nem látok értesítéseket

Az értesítések csak valódi bejelentkezett felhasználónál működnek teljesen. Ellenőrizd, hogy be vagy-e jelentkezve, és van-e hozzád kapcsolódó új esemény.

---

## 23. Aranyszabály

A rendszer annyira pontos, amennyire a napi adatok pontosak.

Mindig ugyanazon a napon rögzítsd:

- valós státusz
- valós dátum
- valós blokkolás
- valós átadás
- valós készletmozgás
- valós feladatállapot

Ha ezek naprakészek, az OMS használható lesz napi döntésekhez, projektprioritáshoz, lead time méréshez, csapat review-hoz, auditáláshoz és vezetői riportokhoz.
