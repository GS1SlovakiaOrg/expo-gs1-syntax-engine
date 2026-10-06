# AGENTS.md – pravidlá projektu `expo-gs1-syntax-engine`

Tento súbor načítava OpenCode automaticky pri každej relácii v tomto workspace.
Rešpektuj ho ako záväzné projektové inštrukcie.

---

## 1. Povinný štartovací kontext (vykonať VŽDY na začiatku)

Pred akoukoľvek úlohou v tomto repozitári **musíš načítať kontext** v tomto poradí:

1. **[`SPECS.md`](./SPECS.md)** – aktuálny špecifikačný kontext projektu
   (identita, verzie, platformy, architektúra, API, obmedzenia, build, roadmap).
   Čítať **kompletný súbor**, nie len fragment.
2. **[`docs/README.md`](./docs/README.md)** – index dokumentácie a výber relevantnej kapitoly.
3. **Príslušná kapitola dokumentácie podľa zadania** (pozri tabuľku nižšie).

```text
SPECS.md  →  docs/README.md  →  docs/0X-*.md (podľa úlohy)  →  až potom kód
```

Ak sa **SPECS.md a dokumentácia líšia od kódu, platí kód** – ale
**aktualizuj SPECS.md aj príslušnú kapitolu `docs/`** a uveď to v zhrnutí.

### Mapa úloh → dokumentácia

| Úloha | Povinná kapitola |
|-------|------------------|
| Inštalácia, platformy, konfigurácia, autolinking | [`docs/02-instalacia-a-konfiguracia.md`](./docs/02-instalacia-a-konfiguracia.md) |
| Vrstvy modulu, sekvencie, životný cyklus, pamäť | [`docs/03-architektura.md`](./docs/03-architektura.md) |
| Práca s API triedy `GS1Engine` | [`docs/04-api-reference.md`](./docs/04-api-reference.md) |
| Typy, enumy, `ProcessBarcodeResult` | [`docs/05-datove-typy-a-enums.md`](./docs/05-datove-typy-a-enums.md) |
| Ukážky kódu, formáty vstupov, error handling | [`docs/06-priklady-pouzitia.md`](./docs/06-priklady-pouzitia.md) |
| Chyby, obmedzenia, FAQ | [`docs/07-riesenie-problemov.md`](./docs/07-riesenie-problemov.md) |
| Kotlin / Java / C / JNI / CMake, aktualizácia enginu | [`docs/08-nativna-vrstva-android.md`](./docs/08-nativna-vrstva-android.md) |
| Build skripty, testy, publikovanie, `example/` | [`docs/09-vyvoj-a-testovanie.md`](./docs/09-vyvoj-a-testovanie.md) |
| Úvod, verzie, licencie | [`docs/01-uvod-a-prehlad.md`](./docs/01-uvod-a-prehlad.md) |

Pri zmeneach týkajúcich sa `example/` sa navyše riď [`example/AGENTS.md`](./example/AGENTS.md).

---

## 2. Fakty o projekte (skôr, než začneš meniť kód)

| Fakt | Hodnota |
|------|---------|
| Typ | Expo natívny modul (obal okolo GS1 Barcode Syntax Engine **1.4.1**) |
| Verzia balíka | `0.1.8`, licencia MIT (engine Apache-2.0 / GS1 AISBL) |
| Platformy | **len Android**; iOS nie je implementované; web je len placeholder; Expo Go nepodporované |
| Vstup | `build/index.js` (builduje `tsc` z `src/`) |
| Verejné API | `GS1Engine`, `Symbology`, `Validation`, `InitOptions`, `ProcessBarcodeResult`, `AIDataPairs`, `ParsedGS1AIData`, `BarcodeInputType` |
| Jediná async funkcia | `init()` – všetko ostatné je synchronné cez bridge |
| Unit testy | ⚠️ **neexistujú** (`jest` nie je v `devDependencies`) |
| Overenie zmeny | `CI=1 npm run build` + `npm run lint` + `npx expo run:android` v `example/` |

---

## 3. Pravidlá práce s kódom

- **Nemen rozsah verejného API bez zmeny verzie** a bez záznamu v `changelog.md`.
  Zmena tvaru `aiDataPairs` a pod. je **breaking change** (porovnaj `v0.1.6`).
- **Všetky nové natívne funkcie** pridávaj vo všetkých vrstvách v poradí:
  C API → `gs1encoders_wrap.c` (JNI) → `GS1Encoder.java` → `ExpoGs1SyntaxEngineModule.kt` → `src/index.ts` → `src/ExpoGs1SyntaxEngine.types.ts`
  (checklist v [`docs/08-nativna-vrstva-android.md`](./docs/08-nativna-vrstva-android.md)).
- **Enum hodnoty** (`Symbology`, `Validation`) musia zostať zhodné v C, Java a TypeScript.
- Každý člen `GS1Engine` volá najprv `ensureInitialized()`; `close()` ostáva idempotentné.
- **Nepridávaj iOS/Web podporu „na papier“** – najprv reálna implementácia, potom `platforms` v `expo-module.config.json`.
- Nedotýkaj sa `android/src/main/c-lib/**` okrem kontrolovanej aktualizácie enginu
  (postup v [`docs/08-nativna-vrstva-android.md`](./docs/08-nativna-vrstva-android.md)).
- Príkladová aplikácia berie modul cez `"expo": { "autolinking": { "nativeModulesDir": ".." } }` – nemeň tento odkaz na vzdialenú verziu.

## 4. Pravidlá práce s dokumentáciou

- Dokumentácia je v slovenčine; **názvy API, typov, enumov a kód ostávajú anglické**.
- Tabuľky a diagramy píš vo formáte **Mermaid** (overený syntaktický tvar použitý v `docs/`).
- Pri akejkoľvek zmene správania, API, verzie, podpory platforiem alebo známeho obmedzenia:
  1. aktualizuj **`SPECS.md`** (príslušná kapitola),
  2. aktualizuj dotknutú kapitolu v **`docs/`**,
  3. ak ide o zmeny správania, dopíš **`changelog.md`**.
- Obrázky v `example/assets/` (`icon.png`, `splash-icon.png`, `favicon.png`, `android-icon-*.png`)
  sú len brandové – **ich obsah ignoruj**, prípadne uvádzaj len názvy súborov.
- Nevyhadzuj existujúce upozornenia ⚠️ bez overenia, že obmedzenie naozaj pominulo.

---

## 5. Príkaz „Aktualizuj dokumentáciu“ (povinný kontrolný postup)

Keď používateľ pošle príkaz **„Aktualizuj dokumentáciu“** (alebo ekvivalent:
*aktualizuj docs*, *zosynchronizuj dokumentáciu*, *prejdi dokumentáciu*,
*update documentation*), **nesmieš len tak prepísať súbory**. Musíš najprv vykonať
porovnaciu kontrolu súborov dokumentácie a súborov projektu a dokumentáciu
aktualizovať **len tam, kde to kontrola odôvodní**.

### 5.1 Súbory podliehajúce kontrole

| Skupina | Súbory |
|---------|--------|
| **DOC** (dokumentácia) | `SPECS.md`, `docs/**/*.md`, `changelog.md`, `README.md`, tento `AGENTS.md` |
| **SRC** (projekt) | `src/**`, `android/**` (Kotlin, Java, C, CMake, `build.gradle`), `example/**` (okrem `example/assets/*`), `internal/module_scripts/**`, `package.json`, `expo-module.config.json`, `tsconfig.json`, `eslint.config.cjs`, `.npmignore` |

⚠️ `android/src/main/c-lib/**` je externý GS1 engine – ak sa zmenil, ide o **vysoký dopad** (pozri kapitolu 10 `SPECS.md`).

### 5.2 Postup kontroly (vykonať presne v tomto poradí)

1. **Zozbieraj časy poslednej zmeny** oboch skupín (primárne cez Git, nie cache):
   ```bash
   git status --porcelain                       # neuložené / novo pridané / zmazané súbory
   git log -1 --format=%cI -- <subor>           # dátum posledného commitu súboru
   git diff --name-only <doc-commit> -- .       # zmenené súbory od poslednej zmeny dokumentácie
   ```
   Záložne (fallback) časové pečiatky súborov, Windows/PowerShell:
   ```powershell
   Get-ChildItem -Recurse src, android, example, internal -File |
     Sort-Object LastWriteTime -Descending | Select-Object -First 20 FullName, LastWriteTime
   Get-Item SPECS.md, changelog.md, README.md, AGENTS.md, docs/*.md |
     Sort-Object LastWriteTime -Descending | Select-Object FullName, LastWriteTime
   ```
2. **Porovnaj**: nájdi súbory **SRC zmenené neskôr ako dokumentácia**
   (`najnovší SRC > najnovší DOC`, resp. výsledok `git diff` od posledného DOC commitu).
3. **Rozhodnutie:**
   - **Žiadny SRC nie je novší** → dokumentácia je aktuálna. **Nič nemeň**; oznám len výsledok kontroly (protokol z 5.3).
   - **Sú (aj len pridané/odstránené)** → pokračuj krokom 4.
4. **Analyzuj zmeny** – pre každý zmenený SRC súbor si prečítaj obsah (pri Gite `git diff <commit> -- <subor>`) a vyhodnoť dopad podľa mapy:

   | Zmenená oblasť (SRC) | Čo treba aktualizovať (DOC) |
   |----------------------|-----------------------------|
   | `src/index.ts` (API, správanie) | `docs/04-api-reference.md`, `docs/06-priklady-pouzitia.md`, `SPECS.md` kap. 5–6, `changelog.md` |
   | `src/ExpoGs1SyntaxEngine.types.ts` | `docs/05-datove-typy-a-enums.md`, `SPECS.md` kap. 5 |
   | `ExpoGs1SyntaxEngineModule.kt` | `docs/08-nativna-vrstva-android.md`, `docs/03-architektura.md`, `SPECS.md` kap. 4 |
   | `GS1Encoder.java` / `GS1Encoder*Exception.java` | `docs/08-nativna-vrstva-android.md`, `docs/04-api-reference.md` |
   | `c-lib/**`, `gs1encoders_wrap.c`, `CMakeLists.txt` | `docs/08-nativna-vrstva-android.md`, `SPECS.md` kap. 1 (verzia enginu), 4, 10; `docs/01-uvod-a-prehlad.md` |
   | `expo-module.config.json`, `android/build.gradle` | `docs/02-instalacia-a-konfiguracia.md`, `SPECS.md` kap. 3 |
   | `package.json` (verzia, skripty, závislosti) | `SPECS.md` kap. 1, 3, 10; `docs/09-vyvoj-a-testovanie.md`; `changelog.md` |
   | `internal/module_scripts/**`, `eslint.config.cjs`, `tsconfig.json`, `.prettierrc` | `docs/09-vyvoj-a-testovanie.md`, `SPECS.md` kap. 10 |
   | `example/**` (okrem `assets`) | `docs/06-priklady-pouzitia.md`, `docs/09-vyvoj-a-testovanie.md` |
   | `example/assets/*` | **žiadny dopad** – brandové obrázky, obsah ignorovať |
5. **Zapracuj zmeny len do odôvodnených súborov** v poradí: `SPECS.md` → príslušná kapitola `docs/` → `changelog.md` (ak sa zmenilo správanie/verzia). Nič, čo kontrola neodôvodnila, neprepisuj.
6. **Znova over** Git stav / pečiatky, že dokumentácia je už **novšia ako SRC**.
7. **Vykonaj checklist** z kapitoly 6 a do zhrnutia uveď protokol kontroly.

### 5.3 Povinný výstup – protokol kontroly

```text
Kontrola dokumentácie (príkaz „Aktualizuj dokumentáciu“):
- Najnovší zmenený súbor projektu: <cesta> (<čas / commit>)
- Najnovší zmenený dokument:       <cesta> (<čas / commit>)
- Výsledok: dokumentácia aktuálna | dokumentácia aktualizovaná
- Skontrolované: SRC = <počet>, DOC = <počet>
- Analyzované zmeny: <zoznam súborov + stručný dopad>
- Aktualizované súbory: <zoznam alebo „žiadne“>
- Preskočené bez dopadu: <napr. example/assets/*>
```

---

## 6. Overenie pred odovzdaním

- [ ] `SPECS.md` načítaný a po zmene **aktuálny**
- [ ] dotknutá kapitola `docs/` načítaná a po zmene **aktuálna**
- [ ] `CI=1 npm run build` prejde bez chýb
- [ ] `npm run lint` bez nových chýb (pozri známy problém s `@react-native-community` v [`docs/09-vyvoj-a-testovanie.md`](./docs/09-vyvoj-a-testovanie.md))
- [ ] `changelog.md` doplnené pri zmene API/správania
- [ ] v zhrnutí uvedené, ktoré súbory dokumentácie boli aktualizované
