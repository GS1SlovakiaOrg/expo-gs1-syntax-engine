# 04 – API referencia: `GS1Engine`

Hlavná (a jediná) trieda verejného API. Všetky metódy a vlastnosti sú synchronné, pokiaľ nie je uvedené inak (`init()` je asynchrónne).

```ts
import { GS1Engine } from 'expo-gs1-syntax-engine';

const encoder = new GS1Engine();
await encoder.init();
```

## Statické členy

| Člen | Typ | Popis |
|------|-----|-------|
| `GS1Engine.symbology` | `typeof Symbology` | Enum symbology (možné použiť aj cez inštanciu) |
| `GS1Engine.validation` | `typeof Validation` | Enum validačných procedúr |

```ts
encoder.sym = GS1Engine.symbology.DM;
encoder.setValidationEnabled(GS1Engine.validation.RequisiteAIs, true);
```

## Vlastnosti

| Vlastnosť | Typ | Zápis | Popis |
|-----------|-----|-------|-------|
| `isInitialized` | `boolean` | read-only getter | `true` po úspešnom `init()`, `false` po `close()` alebo neúspešnom `init()` |
| `version` | `string` | read-only getter | Verzia knižnice – typicky **dátum buildu** C knižnice (`__DATE__`). ⚠️ Vyžaduje inicializáciu |
| `initFallbackWarning` | `string \| null` | read-only getter | Chybové hlásenie, ktoré spôsobil prechod na embedded AI tabuľku (len ak bol nastavený `fallbackOnSyndictError`). `null` = žiadny problém |
| `sym` | `Symbology` | get / set | Typ symbology; automaticky sa nastaví pri spracovaní `scanData`. Setter hádže chybu pri neplatnej hodnote |
| `addCheckDigit` | `boolean` | get / set | Režim „pridať kontrolnú číslicu“ pre EAN/UPC a GS1 DataBar. Default: `false` |
| `includeDataTitlesInHRI` | `boolean` | get / set | Či HRI obsahuje názvy (tituly) AI z GS1 General Specifications. Default: `false` |
| `permitUnknownAIs` | `boolean` | get / set | Povoliť AI, ktoré nie sú v statickej AI tabuľke. Default: `false` |
| `permitZeroSuppressedGTINinDLuris` | `boolean` | get / set | Povoliť GTIN bez potlačených núl v DL URI (legacy). Default: `false` |

> ⚠️ Každý getter najprv volá `ensureInitialized()` – pred `init()` hodí `Error`.

### Detaily vlastností

**`addCheckDigit`**
- `false` (default): vstupný reťazec musí **obsahovať** platnú kontrolnú číslicu.
- `true`: reťazec kontrolnú číslicu **nesmie obsahovať**, engine ju vygeneruje.
- Platí len pre symbology s pevnou dĺžkou dát: EAN/UPC a GS1 DataBar okrem Expanded (Stacked).

**`permitUnknownAIs`**
- Platí len pre *parsované* vstupy: bracketed AI dáta (`setAIdataStr`) a GS1 Digital Link URIs (`setDataStr`).
- ⚠️ Nebracketed (raw) element stringy s neznámymi AI **- parsovanie nie je možné** (nie je možné odlíšiť AI od hodnoty, ak nie je známa dĺžka AI).

**`permitZeroSuppressedGTINinDLuris`**
- `true` = hodnota path komponentu AI (01) môže byť GTIN-13/12/8 namiesto plného GTIN-14.
- ⚠️ Zero-suppressed GTIN sú **deprecated** – povoľujte len pre staré legacy DL URI.

## Metódy

### Prehľad

| Metóda | Návratový typ | Async | Popis |
|--------|---------------|-------|-------|
| `init(options?)` | `Promise<void>` | ✅ | Inicializácia novej natívnej inštancie |
| `close()` | `void` | ❌ | Uvoľnenie natívnych zdrojov (idempotentné) |
| `getValidationEnabled(validation)` | `boolean` | ❌ | Stav danej validačnej procedúry |
| `setValidationEnabled(validation, value)` | `void` | ❌ | Zapne/vypne validačnú procedúru |
| `getDataStr()` | `string` | ❌ | Raw dáta barcode (FNC1 ako `^`) |
| `setDataStr(value)` | `void` | ❌ | Nastaví raw dáta / DL URI |
| `getAIdataStr()` | `string \| null` | ❌ | Dáta v ľudskom formáte AI syntax |
| `setAIdataStr(value)` | `void` | ❌ | Nastaví dáta v bracketed AI syntax |
| `getScanData()` | `string` | ❌ | Očakávaný sken (s AIM prefixom) |
| `setScanData(value)` | `void` | ❌ | Spracuje naskenované dáta |
| `getErrMarkup()` | `string` | ❌ | Označenie miesta chyby v AI dátach |
| `getDLuri(stem?)` | `string` | ❌ | Vygeneruje GS1 Digital Link URI |
| `getHRI()` | `string[]` | ❌ | Human-Readable Interpretation |
| `getDLignoredQueryParams()` | `string[]` | ❌ | Ignorované query parametre DL URI |
| `processBarcode(scannedData, dlStem?)` | `ProcessBarcodeResult` | ❌ | **Univerzálna** metóda – rozpozná formát a vráti kompletný výsledok |
| `getEngineResultData(dlStem?, isScannedData?, aimPrefix?)` | `ProcessBarcodeResult` | ❌ | Zostaví výsledný objekt z aktuálneho stavu enginu |
| `getErrorReason(err)` | `string` | ❌ | Vytiahne zrozumiteľnú časť chybového hlásenia |
| `parseHRIString(input)` | `ParsedGS1AIData \| null` | ❌ | Rozparsuje jeden HRI riadok na `{gs1Ai, value, name}` |
| `calculateCheckDigit(gs1String)` | `number` | ❌ | Vypočíta GS1 kontrolnú číslicu |

---

### `init(options?: InitOptions | null): Promise<void>`

Inicializuje novú inštanciu `GS1Encoder`. Predvolené nastavenie – `null` alebo vynechaný argument.

```ts
await encoder.init();
await encoder.init({ syntaxDictionary: '/data/syntax-dictionary.txt', fallbackOnSyndictError: true });
```

| Parametre | Typ | Popis |
|-----------|-----|-------|
| `options` | `InitOptions \| null` | `syntaxDictionary`, `fallbackOnSyndictError`, `noEmbedded` |

| Výnimka / správanie | Podmienka |
|---------------------|-----------|
| `Error('Failed to initialize GS1Encoder: ...')` | Zlyhanie natívnej inicializácie |
| `console.warn` + návrat | Inštancia je už inicializovaná (opakované `init()` nerobí re-inicializáciu) |

**Poznámky:**
- Po `close()` je možné `init()` zavolať znova – vytvorí sa nová natívna inštancia.
- Pri `fallbackOnSyndictError: true` a zlyhaní načítania slovníka sa použije embedded AI tabuľka; dôvod je dostupný cez `initFallbackWarning`.

---

### `close(): void`

Uvoľní natívny kontext. Volanie je **idempotentné** (opakované volanie nespôsobí chybu).

```tsx
useEffect(() => {
  const enc = new GS1Engine();
  enc.init();
  return () => enc.close();
}, []);
```

---

### `setValidationEnabled(validation: Validation, value: boolean): void`

Zapne/vypne danú validačnú procedúru AI.

| Parametre | Typ | Popis |
|-----------|-----|-------|
| `validation` | `Validation` | Identifikátor procedúry (pozri [05-datove-typy-a-enums.md](./05-datove-typy-a-enums.md)) |
| `value` | `boolean` | `true` = vynucovať validáciu (default) |

| Výnimka | Podmienka |
|---------|-----------|
| `Error` (`IllegalArgumentException`) | Neznáma hodnota validácie (`Unknown validation value: N`) |

⚠️ Platí len pre **AI vstupné dáta** (vstupy cez `setAIdataStr`, `setDataStr`, `setScanData`).
⚠️ `MutexAIs`, `RepeatedAIs` a `DigSigSerialKey` sú *locked* – sú vždy zapnuté, pokus o vypnutie nemá zmysel.

#### `getValidationEnabled(validation: Validation): boolean`

Vráti aktuálny stav procedúry.

---

### `setDataStr(value: string): void` / `getDataStr(): string`

**Raw dáta barcode** – tak, ako by boli zakódované v symbole.

- Začiatok `^` = GS1 AI syntax, každé ďalšie `^` = FNC1 (oddeľovač polí).
- Vstup začínajúci `http://` / `https://` sa parsuje ako **GS1 Digital Link URI**.
- Kompozitný komponent sa oddeľuje `|` a začína FNC1 na prvej pozícii:
  `^0112345678901231|^10ABC123^11210630`

```ts
encoder.setDataStr('^0112345678901231^10ABC123^11210630');
console.log(encoder.getDataStr());   // ^0112345678901231^10ABC123^11210630
```

| Výnimka | Podmienka |
|---------|-----------|
| `GS1EncoderParameterException` | Neplatné AI dáta (chýbajúce/nesprávne linter pravidlo) |
| `NullPointerException` | `value === null` |

⚠️ `getDataStr()` vracia náhľad bufferu, ktorý platí do najbližšieho `setDataStr` / `setAIdataStr` / `setScanData`. Ak potrebujete trvalú kópiu, uložte si ju do premennej.

---

### `setAIdataStr(value: string): void` / `getAIdataStr(): string | null`

**Bracketed (ľudský) AI syntax** – bez FNC1 znakov, tie engine vloží automaticky.

```ts
encoder.setAIdataStr('(01)12345678901231(10)ABC123(11)210630');
console.log(encoder.getAIdataStr()); // (01)12345678901231(10)ABC123(11)210630
```

- Formát je jednotný pre všetky symbology: EAN-13, UPC-A, UPC-E, GS1 DataBar, GS1 QR Code, GS1 DataMatrix…
- Kompozitné symbology (všetky okrem Data Matrix, QR Code a DotCode) podporujú oddeľovač `|`:
  `(01)12345678901231|(10)ABC123(11)210630`
- ⚠️ Zátvorky vo **hodnotách** AI musia byť escapeované ako `\\(`.

| Výnimka | Podmienka |
|---------|-----------|
| `GS1EncoderParameterException` | Neplatný vstup (syntax / linter) |
| `NullPointerException` | `value === null` |

`getAIdataStr()` vráti `null`, ak dáta nie sú AI dáta.

---

### `setScanData(value: string): void` / `getScanData(): string`

**Spracovanie naskenovaných dát** s AIM symbology identifier prefixom.

- `setScanData` nastaví vstupný buffer a **určí symbology** (`sym`).
- `getScanData` vráti reťazec, ktorý by mal scanner vrátiť pre dané dáta (s AIM prefixom).

```ts
encoder.setScanData(']C1011231231231233310ABC123{GS}99TESTING');
// {GS} = ASCII 29 (GS) – povolený aj ako textuálny zástupca
const expected = encoder.getScanData();
```

| Výnimka | Podmienka |
|---------|-----------|
| `GS1EncoderScanDataException` | Neplatné scan data, alebo (pri čítaní) nemožno reprezentovať dáta v zvolenej symbology |

⚠️ AIM prefix **neurčuje symbológiu jednoznačne** – napr. GS1-128 Composite zdieľa prefix s rodinou GS1 DataBar, preto bude detegovaný ako DataBar.

---

### `getErrMarkup(): string`

Vracia označenú (markup) verziu AI, ktoré spôsobilo zlyhanie validácie.

- Znaky zodpovedné za chybu sú obklopené `|`; ak to nemá význam, celá hodnota AI je obklopená `|`.
- Prázdny reťazec = žiadna lint chyba.

```ts
try {
  encoder.setAIdataStr('(11)211313');
} catch (e) {
  console.log(encoder.getErrMarkup()); // napr. (11) |211313|
}
```

---

### `getDLuri(stem?: string | null): string`

Generuje **GS1 Digital Link URI** z aktuálnych AI dát.

| Parametre | Typ | Popis |
|-----------|-----|-------|
| `stem` | `string \| null` | Prefix URI. `null` (default) = kanonický GS1 stem `https://id.gs1.org/` |

```ts
encoder.setAIdataStr('(01)12345678901231(10)ABC123(11)210630');
encoder.getDLuri('https://id.example.com/stem');
// → https://id.example.com/stem/01/12345678901231?10=ABC123&11=210630
```

| Výnimka | Podmienka |
|---------|-----------|
| `GS1EncoderDigitalLinkException` | Neplatný vstup (napr. chýbajúca povinná AI pre DL) |

---

### `getHRI(): string[]`

Vracia pole riadkov **Human-Readable Interpretation**.

- Pre kompozitné symboly sa medzi lineárnu a 2D časť vkladá riadok `--`.
- Pri `includeDataTitlesInHRI = true` obsahujú riadky aj názov AI.

Vstup: `^011231231231233310ABC123|^99XYZ(TM) CORP`

```
(01) 12312312312333
(10) ABC123
--
(99) XYZ(TM) CORP
```

---

### `getDLignoredQueryParams(): string[]`

Vracia **necislové (ignorované) query parametre** z GS1 Digital Link URI.

Vstup: `https://a/01/12312312312333/22/ABC?name=Donald%2dDuck&99=ABC&testing&type=cartoon`

Výstup: `['name=Donald%2dDuck', 'testing', 'type=cartoon']`

⚠️ Reťazce **nie sú URI-dekódované** – slúžia na to, aby ste videli, ktoré časti URI boli ignorované.

---

### `processBarcode(scannedData: string, dlStem?: string | null): ProcessBarcodeResult`

**Univerzálna metóda pridávaná týmto modulom** (nie je súčasťou pôvodného GS1 API). Rozpozná formát vstupu, nastaví správny setter a vráti kompletný výsledok.

**Detekcia formátu:**

| Podmienka | Akcia | `symbology` vo výsledku |
|-----------|-------|--------------------------|
| prefix `]E` alebo `]I` | prefix sa **odreže** a uloží do `aimPrefix`, pokračuje sa podľa zvyšku | `null` |
| prefix `(` | `setAIdataStr()` | `null` |
| prefix `]` | `aimPrefix = 1. až 3. znak`, `{GS}` → `\u001D`, `setScanData()` | určená symbology |
| prefix `^` | `setDataStr()` | `null` |
| `http://`, `https://`, `HTTP://`, `HTTPS://` | `setDataStr()` (DL URI) | `null` |
| len číslice, dĺžka 8/12/13/14 | overenie **kontrolnej číslice**; potom `setDataStr('^01' + padStart(14, '0'))` | `null` |
| iné číslice | `setDataStr('^' + reťazec)` | `null` |
| iné (alphanumeric) | `setDataStr('^' + reťazec)` | `null` |

| Parametre | Typ | Popis |
|-----------|-----|-------|
| `scannedData` | `string` | Naskenované/zadané dáta |
| `dlStem` | `string \| null` | Prefix pre DL URI (default `https://id.gs1.org`) |

**Návrat:** `ProcessBarcodeResult` – pozri [05-datove-typy-a-enums.md](./05-datove-typy-a-enums.md).

Chyby **nehádže** – vracia `{success: false, error, errorReason}`.

⚠️ Pri čisto číselnom vstupe dĺžky 8/12/13/14 so zlou kontrolnou číslicou vracia špecifickú chybu `Incorrect numeric check digit` bez volania natívneho enginu.

---

### `getEngineResultData(dlStem?, isScannedData?, aimPrefix?): ProcessBarcodeResult`

Zostaví výsledný objekt z **aktuálneho stavu** enginu (použite po ručnom `set*` volaní alebo po `processBarcode`).

| Parametre | Typ | Default | Popis |
|-----------|-----|---------|-------|
| `dlStem` | `string \| null` | `'https://id.gs1.org'` | Prefix DL URI |
| `isScannedData` | `boolean` | `false` | Či vstup pochádza zo `setScanData` – určuje, či sa vyplnia `symbology`, `symbologyName`, `scanData` |
| `aimPrefix` | `string \| null` | `null` | AIM prefix zachytený z vstupu |

**Postup vnútri metódy:**

1. prečíta `getErrMarkup()` → `success = (errMarkup je prázdny)`
2. prečíta `getHRI()` a každý riadok rozparsuje cez `parseHRIString()` → `aiDataPairs` + `aiOrder`
3. doplní `dataStr`, `aiDataStr`, `dlUri`
4. ak `isScannedData === true`, doplní `symbology`, `symbologyName`, `scanData`
5. doplní `aimPrefix`

⚠️ Pri výnimke počas čítania vracia `{success: false, error: 'GS1 Syntax Engine Error: ...', errorReason}`.

---

### `getErrorReason(err: any): string`

Extrahuje zrozumiteľnú časť hlásenia z verbose chyby enginu – konkrétne text **za posledným `Caused by:`**.

```ts
encoder.getErrorReason(new Error('... Caused by: GS1EncoderParameterException: Invalid AI'));
// → 'Invalid AI'
```

Ak `err.message` neexistuje, vracia `'Unknown error'`.

---

### `parseHRIString(input: string): ParsedGS1AIData | null`

Rozparsuje jeden HRI riadok na objekt.

```ts
encoder.parseHRIString('GTIN (01) 08580000000009');
// { gs1Ai: '01', value: '08580000000009', name: 'GTIN' }
```

Použitý vzor: `^(.*?)\s*\((\d+)\)\s*(\S+)$`

| Návrat | Podmienka |
|--------|-----------|
| `null` | Riadok nezodpovedá vzoru (napr. oddelovač `--`, prázdny riadok, alebo **hodnota obsahujúca medzeru**) |

⚠️ `(\S+)` znamená, že **hodnota AI nesmie obsahovať medzery** – napr. HRI riadok `(99) XYZ(TM) CORP` sa **neparsovaný** a do `aiDataPairs` sa nedostane.

---

### `calculateCheckDigit(gs1String: string | number): number`

Vypočíta GS1 kontrolnú číslicu (modul 10, váha 3/1).

```ts
encoder.calculateCheckDigit('858000000000');  // → 9  (EAN-13: 8580000000009)
encoder.calculateCheckDigit(1234567890123);   // → pracuje aj s číslom
```

Algoritmus: reťazec (bez kontrolnej číslice) sa otočí zprava doľava a znaky na **párnych indexoch po otočení** (t.j. tie, ktoré ležia najbližšie k budúcej kontrolnej číslici) sa násobia 3, zvyšné ostávajú s váhou 1. Výsledok: `10 − (súčet mod 10)`, pri `10` je výsledok `0`.

---

## Chybové typy na JS strane

Modul **nedefinuje vlastné výnimky**. Všetky natívne výnimky prichádzajú ako štandardný `Error`:

| Správca | Príklad hlásenia |
|---------|------------------|
| TS guard | `GS1 Syntax Engine instance has not been initialized. Call init() first` |
| Kotlin init | `Failed to initialize GS1Encoder: ...` |
| Java ctx check | `GS1Encoder instance has been closed` |
| C engine (cez Java) | text s `Caused by: ...` – rozoberá `getErrorReason()` |

Nízkoúrovňové API **throws**; vysokoúrovňové `processBarcode()` a `getEngineResultData()` chyby **catches** a vracia vo výsledku.
