# 09 – Vývoj a testovanie

## Štruktúra repozitára

```
expo-gs1-syntax-engine/
├── src/                              # TypeScript API (100 % verejného API)
│   ├── index.ts                      # trieda GS1Engine + exporty
│   ├── ExpoGs1SyntaxEngine.types.ts  # enumy a typy
│   ├── ExpoGs1SyntaxEngineModule.ts  # requireNativeModule (native)
│   └── ExpoGs1SyntaxEngineModule.web.ts  # registerWebModule (web placeholder)
├── android/                          # natívna časť (Kotlin + Java + C) – pozri 08
├── build/                            # výstup tsc (main: build/index.js)
├── example/                          # príkladová Expo aplikácia
├── internal/module_scripts/          # build skripty (Node)
├── docs/                             # táto dokumentácia
├── expo-module.config.json           # registrácia modulu (platforms: android)
├── package.json
├── tsconfig.json                     # rootDir: ./src, outDir: ./build, strict
├── eslint.config.cjs
├── .prettierrc
├── README.md, changelog.md, LICENSE, NOTICE
```

---

## npm skripty

| Skript | Príkaz | Popis |
|--------|--------|-------|
| `npm run build` | `node internal/module_scripts/build.js` | Spustí `tsc`; na TTY (lokálne, bez CI) automaticky pridá `--watch` |
| `npm run build -- <args>` | – | Argumenty sa prenášajú do `tsc` (napr. `npm run build -- --noEmit`) |
| `npm run clean` | `node internal/module_scripts/clean.js` | Zmaže `build/` |
| `npm run lint` | `eslint src/` | Lint TypeScript zdrojov |
| `npm test` | `node internal/module_scripts/test.js` | Spustí `jest` ⚠️ **jest nie je nainštalovaný** (odstránený vo `v0.1.6`) |
| `npm run prepare` | `node internal/module_scripts/prepare.js` | Zmaže `build/` a spustí `tsc` (volá sa pred publikáciou) |
| `npm run open:android` | `node internal/module_scripts/open-android.js` | Otvorí `example/android` v Android Studio |
| `npm run open:ios` | `node internal/module_scripts/open-ios.js` | Otvorí iOS projekt ⚠️ v repozitári `example/ios` neexistuje |

### Poznámky ku skriptom

- Skripty podporujú **subtargety** `plugin`, `cli`, `utils`, `scripts` (dedičstvo šablóny `create-expo-module`). V tomto projekte **neexistujú** – pri volaní `build <subtarget>` sa build preskočí s hlásením `tsconfig.json not found in ...`.
- `build.js` pridáva `--watch`, pokiaľ bežíš v termináli a nie si v CI (`process.stdout.isTTY && !process.env.CI && !process.env.EXPO_NONINTERACTIVE`).
- Pre produkčný build použiť **neinteraktívne**: `CI=1 npm run build` (resp. premenná `EXPO_NONINTERACTIVE=1`).

## Formátovanie a lint

`.prettierrc`:

```json
{
  "printWidth": 100,
  "tabWidth": 2,
  "singleQuote": true,
  "bracketSameLine": true,
  "trailingComma": "es5",
  "jsxSingleQuote": false
}
```

`eslint.config.cjs` (flat config):

```js
module.exports = defineConfig([
  { ignores: ['build'], extends: '@react-native-community', rules: { 'prettier/prettier': 0 } },
  ...universe,      // eslint-config-universe/flat/native
  ...universeWeb,   // eslint-config-universe/flat/web
]);
```

⚠️ Konfigurácia rozširuje `@react-native-community`, ktoré **nie je uvedené v `devDependencies`** – ak `npm run lint` zlyhá, ide o chýbajúcu túto konfiguráciu (doplniť alebo odstrániť z `extends`).

---

## Build TypeScript

`tsconfig.json`:

| Voľba | Hodnota | Poznámka |
|-------|---------|----------|
| `rootDir` | `./src` | |
| `outDir` | `./build` | `main`/`types` v `package.json` ukazujú sem |
| `strict` | `true` | |
| `declaration`, `declarationMap`, `sourceMap` | `true` | |
| `module` / `moduleResolution` | `esnext` / `bundler` | |
| `target` | `esnext` | |
| `noUnusedLocals` | `true` | |

Obsah `build/` sa **publikuje** (nie je v `.npmignore`), `src/` ostáva v balíku tiež (kvôli mapám a čitateľnosti).

---

## Príkladová aplikácia (`example/`)

Minimalistická Expo aplikácia, ktorá preberá modul priamo z nadriadeného priečinka.

| Súbor | Obsah |
|-------|-------|
| `example/App.tsx` | Demo: init inštancie, tlačidlo na simuláciu skenu, zobrazenie výsledku |
| `example/index.ts` | Vstupný bod |
| `example/app.json` | Konfigurácia Expo app (ikony, splash) |
| `example/assets/*.png` | Ikonky aplikácie: `icon.png`, `splash-icon.png`, `favicon.png`, `android-icon-foreground.png`, `android-icon-background.png`, `android-icon-monochrome.png` (brandové obrázky, obsah nie je pre funkciu relevantný) |
| `example/AGENTS.md` / `CLAUDE.md` | Inštrukcie pre AI nástroje (odkazujú na `AGENTS.md`) |

### Spustenie

```bash
cd example
npm install
npx expo start          # dev server
npx expo run:android    # natívny development build (vyžaduje sa pre modul)
npm run android         # ekvivalent expo run:android
npm run ios             # ⚠️ modul pre iOS nie je implementovaný
npm run web             # ⚠️ web je len placeholder
```

`package.json` príkladovej aplikácie:

```json
{
  "dependencies": { "expo-gs1-syntax-engine": "file:.." },
  "expo": { "autolinking": { "nativeModulesDir": ".." } }
}
```

Vďaka `nativeModulesDir: ".."` Expo autolinking nájde `expo-module.config.json` v koreni repozitára a prelinkuje Android knižnicu.

### Otvorenie natívnych projektov

```bash
npm run open:android    # otvorí example/android v Android Studio
npm run open:ios        # len ak existuje example/ios (momentálne nie)
```

`open-android.js` hľadá Android Studio podľa `process.platform` (macOS `open -a`, Linux viacero bežných ciest + `ANDROID_STUDIO`, Windows `studio64.exe`).

---

## Testovanie

| Typ | Stav |
|-----|------|
| Unit testy JS | ⚠️ **Nie sú prítomné** – `jest` bol odstránený vo `v0.1.6`, skript `npm test` zlyhá |
| Testy C enginu | Sú v `android/src/main/c-lib/` (`gs1encoders-test.c`, `syntax/gs1syntaxdictionary-test.c`, fuzzery) – bežia na desktopi cez `Makefile`/`.vcxproj`, **nie cez Android build** |
| Manuálne testovanie | `example/App.tsx` – tlačidlo „Simulate barcode scan“ vypíše výsledok do konzoly a zobrazí ho v UI |

### Odporúčaný manuálny smoke test

1. `npm run build` (skontrolovať, že `tsc` prejde bez chýb).
2. `npm run lint`.
3. `cd example && npm install && npx expo run:android`.
4. Spustiť aplikáciu, stlačiť tlačidlo skenu a overiť:
   - `success: true`
   - `dataStr`, `dlUri`, `hri` vyplnené
   - po unmount konzolovú hlášku o uvoľnení (resp. žiadny únik pamäte pri opakovanom spustení).

---

## Publikovanie na npm

| Aspekt | Hodnota |
|--------|---------|
| Meno | `expo-gs1-syntax-engine` |
| Verzia | `0.1.8` |
| `main` / `types` | `build/index.js` / `build/index.d.ts` |
| `exports` | `"."` → `./build/index.js`, `./build/index.d.ts` |
| `prepare` | vyčistí a znova postaví `build/` |
| Licencia | MIT |

`.npmignore` **vylučuje**: skryté priečinky, `*.tgz`, `__mocks__`, `__tests__`, `/internal/module_scripts/`, `/example/`, `node_modules`, `android/build`, `android/.cxx`, `android/src/test`, `android/src/androidTest`, `ios/Pods`, `ios/build`.

**Zahŕňa** teda: `build/`, `src/`, `android/` (vrátane C zdrojov a `build.gradle`), konfiguračné súbory, dokumentáciu.

### Postup vydania

```bash
1. Aktualizovať verziu v package.json + changelog.md npm version patch/minor/major #1.0.1/1.1.0/2.0.0
2. CI=1 npm run build          # produkčný build bez --watch
3. npm run lint
4. npm pack --dry-run          # overiť obsah balíka
5. npm publish
```

---

## Roadmap / možné rozšírenia

| Téma | Čo treba urobiť |
|------|-----------------|
| Podpora **iOS** | Vytvoriť `ios/`, Java wrapper previesť na Swift/ObjC, JNI nahradiť (alebo použiť rovnaký C zdroj cez modul), pridať `"ios"` do `platforms` v `expo-module.config.json` |
| **Web** (WASM) | C kód už obsahuje `__EMSCRIPTEN__` vetvy – teoreticky postačuje emscripten build + napojenie na `registerWebModule` |
| **Unit testy** | Vrátiť `jest` (+ `@testing-library/react-native`) a pokryť `processBarcode`, `parseHRIString`, `calculateCheckDigit`, `getErrorReason` |
| Podpora `validateAIassociations` | Zastaralé API – radšej `setValidationEnabled(Validation.RequisiteAIs, ...)` |

---

## Užitočné odkazy

- Dokumentácia Expo Modules API (SDK 57): <https://docs.expo.dev/versions/v57.0.0/>
- `expo` package (requireNativeModule, registerWebModule, SharedObject): <https://docs.expo.dev/versions/v57.0.0/sdk/expo/>
- GS1 Barcode Syntax Engine: <https://github.com/gs1/gs1-syntax-engine>
- GS1 General Specifications (AI tabuľka): <https://www.gs1.org/standards>
- Príkladová aplikácia: <https://github.com/GS1SlovakiaOrg/expo-gs1-s-e-example>
