# Waste Powertech OMS - Használati Útmutató

Ez az útmutató azt magyarázza el, hogy a Waste Powertech OMS oldalt mikor, mire és hogyan kell használni a napi működésben.

Az alkalmazás célja, hogy egy helyen lásd a projektek állapotát, a subassembly-k gyártási útját, a blokkoló problémákat, a PDCA akciókat, a napi mozgásokat, a KPI-okat, az irodai feladatokat és a készleteket.

---

## 1. Belépés

Az oldal megnyitásakor két lehetőség van:

1. Jelentkezz be az adminisztrátortól kapott email címmel és jelszóval.
2. Használd a `Versiune demo` / `Demo version` gombot, ha csak kipróbálni vagy bemutatni szeretnéd a rendszert.

A jobb felső nyelvi gombbal román és angol felület között lehet váltani. Demo módból az `Exit Demo` gombbal lehet kilépni.

---

## 2. Szerepkörök és jogosultságok

A menüben csak azokat a modulokat látod, amelyekhez jogosultságod van.

| Szerepkör | Mire való |
|---|---|
| `admin` | Teljes hozzáférés, felhasználók és jogosultságok kezelése |
| `production` | Termelési modulok kezelése, készlet megtekintése |
| `office` | Irodai feladatok és készletmodul kezelése |
| `office_production` | Termelési és irodai modulok együtt |
| `viewer` | Megtekintés, módosítás nélkül |

Ha nem látsz egy menüpontot vagy nem tudsz menteni, valószínűleg nincs hozzá jogosultságod. Ilyenkor adminisztrátort kell kérni.

---

## 3. Gyors térkép: melyik modult mikor használd

| Modul | Mikor használd | Fő cél |
|---|---|---|
| `Tablou de Bord` / `Dashboard` | Minden nap elsőként | Gyors állapotkép a termelésről |
| `Proiecte` / `Projects` | Új projekt indításakor vagy projektadat módosításakor | Projektek, határidők, felelősök |
| `Subansambluri` / `Subassemblies` | Napi termelési frissítéskor | Subassembly státuszok és gyártási lépések |
| `Calendar` | Napi tervezéskor és határidő-ellenőrzéskor | Due, overdue, completed elemek |
| `Blocaje` / `Blockages` | Amint egy probléma megakasztja a munkát | Blokkoló problémák rögzítése |
| `PDCA` | Ha a probléma akciót igényel | Javító/megelőző intézkedések követése |
| `Flux Zilnic` / `Daily Flow` | Amikor egy SA átkerül egyik részlegről a másikra | Napi mozgások naplózása |
| `KPI Echipe` / `Team KPIs` | Heti review előtt | Csapat teljesítménymutatók |
| `Sarcini` / `Tasks` | Irodai belső feladatoknál | Feladatkiadás és követés |
| `Stocuri` / `Inventory` | Anyagok, késztermékek és mozgások követésére | Készletkezelés |
| `Admin` | Felhasználó vagy jogosultság változásakor | Fiókok, szerepek, jogosultságok |

---

## 4. Ajánlott napi rutin

### Reggel, műszak vagy napi meeting elején

1. Nyisd meg a `Dashboard` oldalt.
2. Nézd meg a globális állapotot: összes SA, kész, folyamatban, blokkolt, késésben.
3. Ellenőrizd a projektprogresszt és a department heatmapet.
4. Nyisd meg a `Calendar` oldalt, és nézd meg az `Overdue` és `Upcoming` elemeket.
5. Ha van nyitott blokkolás, menj a `Blockages` oldalra.

### Munka közben

1. A `Subassemblies` oldalon frissítsd a valós státuszt.
2. Ha egy SA átment a következő részlegre, rögzítsd a mozgást a `Daily Flow` oldalon.
3. Ha probléma van, azonnal nyiss `Blockage` bejegyzést.
4. Ha a probléma intézkedést igényel, hozz létre vagy frissíts PDCA akciót.

### Nap végén

1. Ellenőrizd, hogy minden elkészült SA-nál ki van-e töltve a `Done` dátum.
2. Ellenőrizd, hogy minden lezárt gyártási lépésnél megvan-e a megfelelő `Laser Done`, `Rolat Done`, `Sudat Done`, `Asamblat Done`, `Vopsit Done` dátum.
3. Zárd le a megoldott blokkolásokat.
4. Frissítsd az irodai feladatok státuszát, ha érintett vagy.

---

## 5. Dashboard

Ezt az oldalt gyors helyzetképhez használd.

Itt látod:

- összes subassembly számát
- kész, folyamatban lévő, blokkolt és késő elemeket
- projektek progresszét
- aktív blokkolásokat
- department heatmapet

Használat:

1. Nézd meg, melyik projekt áll rosszul.
2. Nézd meg, hol van sok blokkolás.
3. Döntsd el, melyik modulba kell továbbmenni: `Subassemblies`, `Calendar`, `Blockages` vagy `PDCA`.

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

A gyártási lánc:

`LASER -> ROLAT -> SUDAT -> ASAMBLAT -> VOPSIT`

Itt lehet:

- keresni subassembly név alapján
- szűrni `ALL`, `FINALIZAT`, `IN LUCRU`, `BLOCAT` státusz szerint
- frissíteni a globális státuszt
- frissíteni a progresszt
- dátumokat tölteni
- részlegenként státuszt állítani
- megjegyzést írni

Legfontosabb mezők:

- `Status Global`: teljes SA állapota
- `Progres`: százalékos haladás
- `Start`: mikor indult az SA
- `Due`: mikorra kell kész lennie
- `Done`: mikor lett kész ténylegesen
- `Laser Done`, `Rolat Done`, `Sudat Done`, `Asamblat Done`, `Vopsit Done`: részlegenkénti lezárás dátuma
- `Comentarii`: megjegyzés

Helyes használat:

1. Keresd meg a projektet és az SA-t.
2. Kattints az `Edit` gombra.
3. Állítsd be a valós státuszt.
4. Frissítsd a progresszt.
5. Töltsd ki a releváns dátumokat.
6. Állítsd be részlegenként, hogy `Neînceput`, `În lucru`, `Finalizat`, `Blocat` vagy `N/A`.
7. Mentsd.

Fontos szabály: ha egy SA elkészült, a `Done` dátumot is ki kell tölteni, nem elég csak a státuszt készre állítani.

---

## 8. Calendar

A naptár a határidők és a lead time ellenőrzésére való.

Itt látod:

- `Overdue`: lejárt határidejű, de még nem lezárt elemek
- `Upcoming`: hamarosan esedékes elemek
- `Recently completed`: nemrég lezárt elemek
- havi naptárnézetet
- timeline nézetet projektekhez és subassembly-khez

Használd:

- reggel prioritásállításhoz
- meeting közben késések áttekintésére
- hét végén lead time elemzéshez

Ha valami késésben van, ellenőrizd a `Subassemblies` oldalon a `Due` és `Done` dátumokat.

---

## 9. Blockages

Minden olyan problémát itt kell rögzíteni, amely megállítja vagy lassítja a termelést.

Új blokkolás mezői:

- `ID Blocare`: például `BLK-005`
- `Data Deschidere`: mikor nyílt
- `Proiect`: érintett projekt
- `Subansamblu`: érintett SA
- `Departament`: `LASER`, `ROLAT`, `SUDAT`, `ASAMBLAT`, `VOPSIT`
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

- `LASER -> ROLAT`
- `ROLAT -> SUDAT`
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

A KPI oldalt heti teljesítményrögzítésre használd.

Fő mezők:

- `Saptamana`: hét megnevezése, például `S-20 (Mai 19)`
- `Echipa`: részleg/csapat
- `SA Intrare`: beérkező SA-k száma
- `SA Iesire`: kimenő/kész SA-k száma
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

Két nézet van:

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

## 15. Admin

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

## 16. Dátumok és lead time szabályok

A rendszer akkor tud jól tervezni és mérni, ha a dátumok pontosak.

Mindig töltsd ki:

- projekt `Data Start`
- projekt `Data Target`
- projekt `Data Finalizare`, amikor ténylegesen lezárult
- SA `Start`
- SA `Due`
- SA `Done`
- részlegenkénti `... Done` dátumok

Ez alapján lehet látni:

- melyik projekt csúszik
- melyik SA van késésben
- hol áll meg a folyamat
- mennyi a valós lead time
- melyik részleg okoz szűk keresztmetszetet

---

## 17. Mit mikor kell frissíteni

| Esemény | Mit frissíts |
|---|---|
| Új projekt indul | `Projects` |
| SA munkába kerül | `Subassemblies` -> `Start`, részleg státusz |
| SA határideje ismert | `Subassemblies` -> `Due` |
| SA továbbmegy másik részlegre | `Daily Flow` és `Subassemblies` |
| Egy részleg befejezte a munkát | megfelelő `... Done` dátum |
| SA teljesen kész | `Status Global`, `Progres`, `Done` |
| Blokkoló probléma keletkezik | `Blockages` |
| Blokkolás intézkedést igényel | `PDCA` |
| Blokkolás megoldódik | `Blockages` -> `Rezolvat` |
| Heti mutatók készülnek | `Team KPIs` |
| Irodai feladat keletkezik | `Tasks` |
| Anyag érkezik vagy fogy | `Inventory` |
| Új ember kap hozzáférést | `Admin` |

---

## 18. Gyakori problémák

### Nem látok egy menüpontot

Nincs hozzá jogosultságod. Kérj adminisztrátori ellenőrzést.

### Valami overdue, pedig szerintem kész

Ellenőrizd, hogy a `Done` dátum is ki van-e töltve, nem csak a státusz.

### Nem jelenik meg adat a Calendar oldalon

Ellenőrizd a projekt és SA dátummezőket: `Data Start`, `Data Target`, `Start`, `Due`, `Done`.

### Nem tudok menteni

Lehet, hogy csak megtekintési jogod van. Ellenőriztesd a szerepkört vagy egyedi jogosultságot.

### A készlet rossznak tűnik

Nézd meg az adott tétel `Log` nézetét, és ellenőrizd a bevételezés, kiadás és korrekció tranzakciókat.

---

## 19. Aranyszabály

A rendszer annyira pontos, amennyire a napi adatok pontosak.

Mindig ugyanazon a napon rögzítsd:

- valós státusz
- valós dátum
- valós blokkolás
- valós átadás
- valós készletmozgás

Ha ez az öt dolog naprakész, az OMS használható lesz napi döntésekhez, projektprioritáshoz, lead time méréshez és csapat review-hoz.
