# 05 – Datové typy a enumy

Všetky typy sú exportované z hlavného modulu (`src/index.ts`) a definované v `src/ExpoGs1SyntaxEngine.types.ts`.

```ts
import {
  Symbology,
  Validation,
  InitOptions,
  BarcodeInputType,
  ProcessBarcodeResult,
  AIDataPairs,
  ParsedGS1AIData,
} from 'expo-gs1-syntax-engine';
```

---

## `InitOptions`

Parametre inicializácie natívneho enginu.

```ts
export type InitOptions = {
  syntaxDictionary?: string;
  fallbackOnSyndictError?: boolean;
  noEmbedded?: boolean;
};
```

| Pole | Typ | Default | Popis |
|------|-----|---------|-------|
| `syntaxDictionary` | `string` | `null` | Cesta k súboru **GS1 Syntax Dictionary**. Ak nie je nastavené, použije sa embedded AI tabuľka |
| `fallbackOnSyndictError` | `boolean` | `false` | Pri nemožnosti načítať `syntaxDictionary` použiť embedded AI tabuľku |
| `noEmbedded` | `boolean` | `false` | Odmietnuť embedded AI tabuľku – ak žiadna iná tabuľka nie je k dispozícii, **inicializácia zlyhá** |

**Možné stavy inicializácie (z C enginu):**

| Stav | Význam |
|------|--------|
| `SUCCESS` | Úspešná inicializácia |
| `FALLBACK_TO_EMBEDDED_TABLE` | `syntaxDictionary` sa nenačítal, použil sa embedded – dostupné cez `initFallbackWarning` |
| `FAILED_NO_MEM` | Zlyhala alokácia pamäte |
| `FAILED_NO_EMBEDDED_TABLE` | Embedded tabuľka je vypnutá (`noEmbedded`) alebo nie je kompilovaná |
| `FAILED_LOADING_SYNDICT` | `syntaxDictionary` sa nenačítal a `fallbackOnSyndictError` nie je nastavené |
| `FAILED_AI_TABLE_CORRUPT` | Embedded AI tabuľka je poškodená |

---

## `Symbology`

Enum rozpoznaných typov barcode. Hodnoty musia **presne zodpovedať** natívnej knižnici (umožňuje to `symbologyFromInt()` v Kotlin vrstve – neznáma hodnota sa mapuje na `NONE`).

| Hodnota | Názov | Popis |
|--------:|-------|-------|
| `-1` | `NONE` | Žiadna definovaná symbology |
| `0` | `DataBarOmni` | GS1 DataBar Omnidirectional |
| `1` | `DataBarTruncated` | GS1 DataBar Truncated |
| `2` | `DataBarStacked` | GS1 DataBar Stacked |
| `3` | `DataBarStackedOmni` | GS1 DataBar Stacked Omnidirectional |
| `4` | `DataBarLimited` | GS1 DataBar Limited |
| `5` | `DataBarExpanded` | GS1 DataBar Expanded (Stacked) |
| `6` | `UPCA` | UPC-A |
| `7` | `UPCE` | UPC-E |
| `8` | `EAN13` | EAN-13 |
| `9` | `EAN8` | EAN-8 |
| `10` | `GS1_128_CCA` | GS1-128 s CC-A alebo CC-B |
| `11` | `GS1_128_CCC` | GS1-128 s CC-C |
| `12` | `QR` | (GS1) QR Code |
| `13` | `DM` | (GS1) Data Matrix |
| `14` | `DotCode` | (GS1) DotCode |
| `15` | `NUMSYMS` | Počet symbology (technická hodnota) |

**Príklad:**

```ts
encoder.sym = Symbology.DM;
console.log(Symbology[encoder.sym]); // 'DM'
```

⚠️ Symbology sa **určuje len pri `scanData`** (`setScanData` / `processBarcode` s prefixom `]`). Pri iných formátoch vstupu zostáva `null`.

---

## `Validation`

Enum validačných procedúr AI. Niektoré sú *locked* (vždy zapnuté).

| Hodnota | Názov | Stav | Popis |
|--------:|-------|------|-------|
| `0` | `MutexAIs` | 🔒 locked | Vzájomne sa vylučujúce AI |
| `1` | `RequisiteAIs` | ✅ default: **zapnuté** | Povinné asociácie medzi AI (napr. AI (10) série vyžaduje AI (01)) |
| `2` | `RepeatedAIs` | 🔒 locked | Opakované AI s rovnakou hodnotou |
| `3` | `DigSigSerialKey` | 🔒 locked | Kvalifikátory serializácie musia byť prítomné s digitálnym podpisom |
| `4` | `UnknownAInotDLattr` | ✅ default: **zapnuté** | Neznáme AI nie sú povolené ako atribúty GS1 DL URI |
| `5` | `NUMVALIDATIONS` | – | Technická hodnota (počet validácií) |

Všetky hodnoty sú uvedené kvôli zachovaniu zarovnania s natívnou knižnicou.

```ts
encoder.setValidationEnabled(Validation.RequisiteAIs, false); // vypnúť povinné asociácie
const on = encoder.getValidationEnabled(Validation.RequisiteAIs);
```

⚠️ Neznáma hodnota spôsobí `IllegalArgumentException: Unknown validation value: N`.

---

## `ProcessBarcodeResult`

Výsledný objekt metód `processBarcode()` a `getEngineResultData()`.

```ts
export type ProcessBarcodeResult = {
  success: boolean;
  error?: string | null;
  errorReason?: string | null;
  errorMarkup?: string | null;
  dataStr?: string | null;
  aiDataStr?: string | null;
  hri?: string[] | null;
  dlUri?: string | null;
  aiDataPairs?: AIDataPairs;
  aiOrder?: string[];
  symbology?: Symbology | null | undefined;
  symbologyName?: string | null | undefined;
  scanData?: string | null | undefined;
  aimPrefix?: string | null | undefined;
};
```

| Pole | Typ | Popis |
|------|-----|-------|
| `success` | `boolean` | `true` = dáta sú platné GS1 dáta (žiadna lint chyba) |
| `error` | `string \| null` | Obsah `errMarkup` alebo text výnimky; `null` pri úspechu |
| `errorReason` | `string \| null` | Zrozumiteľná príčina (text za `Caused by:`) |
| `errorMarkup` | `string \| null` | Markup označujúci vinné znaky v AI dátach |
| `dataStr` | `string \| null` | Raw dáta barcode (FNC1 znak ako `^`) |
| `aiDataStr` | `string \| null` | Dáta v bracketed AI syntax; `null` ak nie sú AI dáta |
| `hri` | `string[] \| null` | Riadky Human-Readable Interpretation |
| `dlUri` | `string \| null` | Vygenerované GS1 Digital Link URI |
| `aiDataPairs` | `AIDataPairs` | Mapovanie AI kód → `{name, value}` |
| `aiOrder` | `string[]` | Poradie AI odpovedajúce indexom v `hri` |
| `symbology` | `Symbology \| null` | Rozpoznaná symbology, **len pri scanData formáte**, inak `null` |
| `symbologyName` | `string \| null` | Názov symbology (napr. `'DM'`), **len pri scanData formáte** |
| `scanData` | `string \| null` | Normalizovaný scan data reťazec, **len pri scanData formáte** |
| `aimPrefix` | `string \| null` | Zachytený AIM prefix (`]C1`, `]d2`, …), ak bol prítomný |

### Ukážka výsledku

```json
{
  "success": true,
  "error": null,
  "errorReason": null,
  "errorMarkup": null,
  "dataStr": "^0108580000000009^10ABC123^99XYZ",
  "aiDataStr": "(01)08580000000009(10)ABC123(99)XYZ",
  "hri": [
    "GTIN (01) 08580000000009",
    "BATCH/LOT NUMBER (10) ABC123",
    "INTERNAL (99) XYZ"
  ],
  "dlUri": "https://mydomain.sk/01/08580000000009?10=ABC123&99=XYZ",
  "aiDataPairs": {
    "01": { "name": "GTIN", "value": "08580000000009" },
    "10": { "name": "BATCH/LOT NUMBER", "value": "ABC123" },
    "99": { "name": "INTERNAL", "value": "XYZ" }
  },
  "aiOrder": ["01", "10", "99"],
  "symbology": null,
  "symbologyName": null,
  "scanData": null,
  "aimPrefix": null
}
```

> Hore uvedené názvy AI (`GTIN`, `BATCH/LOT NUMBER`, …) sú ilustračné; konkrétne tituly závisia od `includeDataTitlesInHRI` a od tabuľky AI použitej enginom.

### ⚠️ Známe špecifiká `aiDataPairs` / `aiOrder`

| Situácia | Dôsledok |
|----------|----------|
| HRI riadok neobsahuje `(AI)` vo forme `NÁZOV (KÓD) HODNOTA` | Riadok sa **preskočí** (napr. oddelovač `--` pri kompozitných symboloch) |
| Hodnota AI obsahuje medzeru (napr. `(99) XYZ(TM) CORP`) | `parseHRIString()` vráti `null` → **pár sa do `aiDataPairs` nedostane** |
| Preskočený riadok | `aiOrder[index]` ostane **neinicializovaný** (dierové pole – v JSON sa prejaví ako `null`) |
| Opakovaný rovnaký AI v HRI | Kľúč v `aiDataPairs` sa **prepíše** poslednou hodnotou |

Od `v0.1.6` je hodnota páru objekt `{value, name}` (predtým bol reťazec) – **breaking change**.

---

## `AIDataPairs`

```ts
type AIDataItem = { name: string; value: string };
export type AIDataPairs = Record<string, AIDataItem>;
```

Kľúč = kód AI (napr. `"01"`), hodnota = názov AI a jeho hodnota.

---

## `ParsedGS1AIData`

Návratový typ `parseHRIString()`.

```ts
export interface ParsedGS1AIData {
  gs1Ai: string;  // kód AI, napr. "01"
  value: string;  // hodnota AI, napr. "08580000000009"
  name: string;   // názov AI z HRI, napr. "GTIN"
}
```

```ts
encoder.parseHRIString('GTIN (01) 08580000000009');
// → { gs1Ai: '01', value: '08580000000009', name: 'GTIN' }
```

---

## `BarcodeInputType`

```ts
export type BarcodeInputType = 'scanData' | 'dataStr';
```

⚠️ Typ je exportovaný, ale **vnútorný kód ho nepoužíva** – je k dispozícii pre aplikácie, ktoré si chcú typizovať voľbu vstupného formátu.

---

## Prehľad exportov

| Export | Druh |
|--------|------|
| `GS1Engine` | trieda |
| `Symbology` | enum |
| `Validation` | enum |
| `InitOptions` | type |
| `ProcessBarcodeResult` | type |
| `AIDataPairs` | type |
| `ParsedGS1AIData` | interface |
| `BarcodeInputType` | type |
