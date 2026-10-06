# 06 – Príklady použitia

Všetky príklady predpokladajú:

```tsx
import { GS1Engine, ProcessBarcodeResult } from 'expo-gs1-syntax-engine';
```

---

## 1. Základný tok: inicializácia → spracovanie → uvoľnenie

```tsx
import { useEffect, useState } from 'react';
import { GS1Engine, ProcessBarcodeResult } from 'expo-gs1-syntax-engine';

async function initGS1Encoder(): Promise<GS1Engine> {
  const gs1encoder = new GS1Engine();
  await gs1encoder.init();

  // Konfigurácia inštancie cez get/set vlastnosti
  gs1encoder.permitUnknownAIs = true;
  gs1encoder.setValidationEnabled(GS1Engine.validation.RequisiteAIs, true);
  gs1encoder.includeDataTitlesInHRI = true;
  gs1encoder.permitZeroSuppressedGTINinDLuris = false;

  return gs1encoder;
}

export default function App() {
  const [encoder, setEncoder] = useState<GS1Engine | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let activeEncoder: GS1Engine | null = null;

    async function setup() {
      try {
        setLoading(true);
        activeEncoder = await initGS1Encoder();
        setEncoder(activeEncoder);
        setError('');
      } catch (err: any) {
        setError(`Chyba pri inicializácii C enginu: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }

    setup();

    // Uvoľnenie natívneho kontextu pri unmount
    return () => {
      activeEncoder?.close();
    };
  }, []);

  if (loading) return <Text>Initializujem natívny GS1 Syntax Engine...</Text>;
  if (error) return <Text>{error}</Text>;

  const handleScan = () => {
    const result: ProcessBarcodeResult = encoder!.processBarcode(
      ']d2010858000000000910ABC123\u001D99XYZ',
      'https://mydomain.sk'
    );
    console.log(result);
  };

  return <Button title="Simuluj sken" onPress={handleScan} />;
}
```

---

## 2. Vstupné formáty a ich detekcia

| Formát | Príklad vstupu | Ako je spracovaný |
|--------|----------------|------------------|
| Bracketed AI syntax | `(01)08580000000009(10)ABC123` | `setAIdataStr()` |
| Scan data (AIM) | `]d2010858000000000910ABC123\u001D99XYZ` | `setScanData()` (určí symbology) |
| Scan data s textuálnym GS | `]C101...{GS}99TESTING` | `{GS}` → `\u001D`, potom `setScanData()` |
| Raw AI syntax | `^0108580000000009^10ABC123` | `setDataStr()` |
| GS1 Digital Link URI | `https://id.gs1sk.org/01/08580000000009?11=260705` | `setDataStr()` (parsuje sa ako DL) |
| Čisté číslice dĺžky 8/12/13/14 | `8580000000009` | overenie kontrolnej číslice → `^01` + doplnenie na 14 núl |
| Iné číslice | `8580000000009454787864` | `setDataStr('^' + reťazec)` |
| Alphanumeric bez prefixu | `010003123400005410ABC123` | `setDataStr('^' + reťazec)` |
| AIM prefix `]E` / `]I` (EAN/UPC, ITF) | `]E08580000000009` | prefix sa odreže a uloží do `aimPrefix`, ďalej sa spracuje zvyšok |

---

## 3. `processBarcode()` – ukážky

### 3.1 GS1 DataMatrix (scan data)

```tsx
const r = encoder.processBarcode(']d2011231231231233310ABC123\u001D99XYZ', 'https://mydomain.sk');
console.log(r.success);      // true
console.log(r.dataStr);      // ^0112312312312333^10ABC123^99XYZ
console.log(r.symbologyName);// 'DM'
console.log(r.dlUri);        // https://mydomain.sk/01/12312312312333?10=ABC123&99=XYZ
console.log(r.hri);          // pole HRI riadkov
```

### 3.2 GS1 Digital Link URI

```tsx
const r1 = encoder.processBarcode('https://id.gs1sk.org/01/08580000000030?11=260705&17=240710');
const r2 = encoder.processBarcode('https://example.com/01/09521234543213?99=TESTING123');
const r3 = encoder.processBarcode(
  'https://id.gs1sk.org/01/08580000000030/10/cheese858?11=250630&15=291124&linkType=nutritionalInfo'
);
```

⚠️ Symbology, `symbologyName` a `scanData` budú pri DL URI `null` – ide o formát bez AIM prefixu.

### 3.3 Bracketed AI syntax

```tsx
const r = encoder.processBarcode('(01)00031234000054');
console.log(r.aiDataStr);    // (01)00031234000054
console.log(r.dataStr);      // ^0100031234000054
```

### 3.4 Číselný vstup (GTIN)

```tsx
const ok = encoder.processBarcode('8580000000009');   // EAN-13, platná kontrolná číslica
console.log(ok.success);                              // true
console.log(ok.dataStr);                              // ^0108580000000009 (doplnené nulami na 14 znakov)

const bad = encoder.processBarcode('8580000000000');  // zlá kontrolná číslica
console.log(bad.success);                             // false
console.log(bad.error);                               // 'Incorrect numeric check digit'
console.log(bad.errorReason);                         // 'Unknown error'
```

| Dĺžka vstupu | Správanie |
|--------------|-----------|
| 8, 12, 13 alebo 14 | Berie sa ako GTIN – **overí sa kontrolná číslica**, potom sa zakóduje ako AI (01) s doplnením nulami na 14 znakov |
| iná (len číslice) | Zakóduje sa ako raw dáta prefixom `^` |

### 3.5 Ostatné symbology

```tsx
encoder.processBarcode(']e0010858000000000910ABC123\u001D99XYZ'); // GS1 DataBar
encoder.processBarcode(']d0010858000000000910ABC123\u001D99XYZ'); // Data Matrix (ne-GS1)
encoder.processBarcode(']C1010003123400005410ABC123');            // GS1-128
encoder.processBarcode(']C0010003123400005410ABC123');            // Code 128
```

### 3.6 EAN/UPC/ITF s AIM prefixom

```tsx
encoder.processBarcode(']E08580000000009');   // EAN-13
encoder.processBarcode(']E485800007');        // EAN-8
encoder.processBarcode(']I018580000000006');  // ITF-14
```

Engine nevie spracovať `]E` a `]I` priamo – prefix sa odstráni a výsledok `aimPrefix` sa uloží vo výsledku (`']E0'`, `']I0'`). ⚠️ `symbology` zostane `null`.

### 3.7 Kompozitné symboly a jednotlivé merateľné jednotky

```tsx
encoder.processBarcode(']d20108580000000009310100012310ABC123'); // NET WEIGHT (kg)
encoder.processBarcode(']d20108580000000009311100014710ABC123'); // LENGTH (m)
encoder.processBarcode(']d20108580000000009341000025610ABC123'); // LENGTH (in), log
encoder.processBarcode(']d20108580000000009363500005110ABC123'); // VOLUME (gal (US)), log
encoder.processBarcode(']d20108580000000009360000001110ABC123'); // NET VOLUME (qt (US))
```

### 3.8 Špeciálne prvky (ICCBBA / ISBT)

```tsx
encoder.processBarcode(']C0=)1BA0012345');
encoder.processBarcode(']C0&)000000X245');
```

---

## 4. Nízkoúrovňové API (pôvodné metódy enginu)

Ak potrebujete mať kontrolu nad jednotlivými krokmi:

```tsx
encoder.setScanData(']d201085800000000091126071610Lot858\u001D21Serial01');

const hri = encoder.getHRI();
console.log(`${hri}`);               // (01) 08580000000009 / (11) 260716 / (10) Lot858 / (21) Serial01

const complex = encoder.getEngineResultData();   // plný ProcessBarcodeResult
console.log(complex);
```

Ďalšie možnosti:

```tsx
// Ručné nastavenie vstupu
encoder.setAIdataStr('(01)12345678901231(10)ABC123(11)210630');
encoder.setDataStr('^0112345678901231^10ABC123^11210630');

// Výstupy
console.log(encoder.getDataStr());             // raw (FNC1 ako ^)
console.log(encoder.getAIdataStr());           // zátvorkový formát
console.log(encoder.getHRI());                 // pole HRI riadkov
console.log(encoder.getDLuri('https://id.example.com'));
console.log(encoder.getDLignoredQueryParams());
console.log(encoder.getScanData());            // očakávaný výstup skenera
console.log(encoder.getErrMarkup());           // markup chyby ('' ak žiadna)

// Stav
console.log(encoder.sym);
console.log(encoder.isInitialized);
console.log(encoder.version);
console.log(encoder.initFallbackWarning);
```

---

## 5. Generovanie GS1 Digital Link URI

```tsx
encoder.setAIdataStr('(01)12345678901231(10)ABC123(11)210630');

encoder.getDLuri();                              // kanonický stem
// → https://id.gs1.org/01/12345678901231?10=ABC123&11=210630

encoder.getDLuri('https://id.example.com/stem');
// → https://id.example.com/stem/01/12345678901231?10=ABC123&11=210630
```

Spätný smer (parsujúci DL URI):

```tsx
const r = encoder.processBarcode(
  'https://id.gs1sk.org/01/12312312312333/22/ABC?name=Donald%2dDuck&99=ABC&testing&type=cartoon'
);
console.log(encoder.getDLignoredQueryParams());
// ['name=Donald%2dDuck', 'testing', 'type=cartoon']
```

---

## 6. Ošetrenie chýb

### 6.1 `processBarcode()` – chyby nevyhadzuje

```tsx
const r = encoder.processBarcode(invalidInput);

if (!r.success) {
  console.log('Chyba:', r.error);        // markup / text chyby
  console.log('Príčina:', r.errorReason);// zrozumiteľná príčina
}
```

### 6.2 Nízkoúrovňové API – výnimky

```tsx
try {
  encoder.setAIdataStr('(11)211313');    // neplatný dátum (mesiac 13)
} catch (e) {
  console.log('Chyba:', (e as Error).message);
  console.log('Miesto chyby:', encoder.getErrMarkup());  // napr. (11) |211313|
  console.log('Príčina:', encoder.getErrorReason(e));
}
```

### 6.3 Inicializácia

```tsx
try {
  const enc = new GS1Engine();
  await enc.init({ syntaxDictionary: '/data/bad-path.txt' });  // bez fallbacku
} catch (e) {
  console.error('Failed to initialize GS1Encoder:', e);
}
```

```tsx
// S fallbackom na embedded AI tabuľku
const enc = new GS1Engine();
await enc.init({ syntaxDictionary: '/data/bad-path.txt', fallbackOnSyndictError: true });
console.warn(enc.initFallbackWarning); // dôvod, prečo sa použil embedded
```

---

## 7. Konfigurácia validácií a režimov

```tsx
// Vypnúť povinné asociácie AI (napr. pri laxnejšom spracovaní)
encoder.setValidationEnabled(GS1Engine.validation.RequisiteAIs, false);

// Povoliť neznáme AI (len pre bracketed AI a DL URI)
encoder.permitUnknownAIs = true;

// HRI s názvami AI
encoder.includeDataTitlesInHRI = true;
// → ['GTIN (01) 08580000000009', ...] namiesto ['(01) 08580000000009', ...]

// Legacy DL URI so zero-suppressed GTIN
encoder.permitZeroSuppressedGTINinDLuris = true;

// EAN/UPC/DataBar: engine doplní kontrolnú číslicu sám
encoder.addCheckDigit = true;
encoder.setAIdataStr('(01)0003123400005');  // bez kontrolnej číslice
```

---

## 8. Použitie pomocných metód modulu

```tsx
// Kontrolná číslica
const cd = encoder.calculateCheckDigit('858000000000');  // 9

// Rozparsovanie HRI riadka
const parsed = encoder.parseHRIString('GTIN (01) 08580000000009');
// { gs1Ai: '01', value: '08580000000009', name: 'GTIN' }

// Zrozumiteľná príčina chyby
console.log(encoder.getErrorReason(someError));
```

---

## 9. Zobrazenie výsledku v UI (príklad z `example/App.tsx`)

```tsx
{scanResult ? (
  <View>
    <Text>Stav: {scanResult.success ? 'GS1 dáta' : 'NeGS1 dáta'}</Text>

    {scanResult.success ? (
      <>
        <Text>Raw data (FNC1 ako ^): {scanResult.dataStr}</Text>
        <Text>GS1 Digital Link: {scanResult.dlUri}</Text>
        <Text>HRI:</Text>
        {scanResult.hri?.map((line, i) => <Text key={i}>{line}</Text>)}
      </>
    ) : (
      <Text>{scanResult.error}</Text>
    )}
  </View>
) : null}
```

---

## 10. Checklist pre produkčné použitie

- [ ] Inštanciu vytvorte v `useEffect` a **vždy** ju zavrite v cleanup funkcii.
- [ ] Nezdieľajte jednu inštanciu medzi vláknami (thread safety = 1 inštancia / vlákno).
- [ ] Pred volaním API skontrolujte `isInitialized` (alebo ošetrte výnimku).
- [ ] Spracovávajte `success === false` – `processBarcode` nehádže error.
- [ ] Ak potrebujete symbology, vstup musí byť vo formáte **scan data** (prefix `]`).
- [ ] Pri HRI počítajte s tým, že hodnoty AI s medzerami sa nedostanú do `aiDataPairs`.
- [ ] Overujte `aimPrefix` – pri `]E`/`]I` vstupoch symbology nebude určená.
