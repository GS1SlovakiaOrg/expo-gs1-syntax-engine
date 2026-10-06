# Dokumentácia – expo-gs1-syntax-engine

Tento priečinok obsahuje kompletnú dokumentáciu Expo / React Native modulu **expo-gs1-syntax-engine** (verzia balíka `0.1.8`, GS1 Barcode Syntax Engine `1.4.1`).

Modul je natívny (Expo) modul pre platformu **Android**, ktorý obaľuje [GS1 Barcode Syntax Engine](https://github.com/gs1/gs1-syntax-engine) (verzia **1.4.1**) a poskytuje validáciu, parsovanie a konverziu dát z GS1 čiarových kódov priamo z JavaScriptu.

> Nezávislý projekt. **Nie je oficiálny balík GS1 AISBL.** Poskytovaný „as-is“ bez záruky podpory.

## Obsah dokumentácie

| # | Súbor | Obsah |
|---|-------|-------|
| 1 | [01-uvod-a-prehlad.md](./01-uvod-a-prehlad.md) | Čo modul robí, rozsah funkcií, verzie, licencie |
| 2 | [02-instalacia-a-konfiguracia.md](./02-instalacia-a-konfiguracia.md) | Inštalácia, požiadavky, podpora platforiem, konfigurácia |
| 3 | [03-architektura.md](./03-architektura.md) | Vrstvy modulu, tok dát, životný cyklus, správa pamäte (mermaid) |
| 4 | [04-api-reference.md](./04-api-reference.md) | Úplná referencia API triedy `GS1Engine` |
| 5 | [05-datove-typy-a-enums.md](./05-datove-typy-a-enums.md) | Typy, enumy a štruktúra výsledku `ProcessBarcodeResult` |
| 6 | [06-priklady-pouzitia.md](./06-priklady-pouzitia.md) | Príklady použitia, vstupné formáty, ošetrenie chýb |
| 7 | [07-riesenie-problemov.md](./07-riesenie-problemov.md) | Riešenie problémov, časté chyby, obmedzenia, FAQ |
| 8 | [08-nativna-vrstva-android.md](./08-nativna-vrstva-android.md) | Kotlin, Java a C vrstva, JNI, CMake, aktualizácia engine |
| 9 | [09-vyvoj-a-testovanie.md](./09-vyvoj-a-testovanie.md) | Štruktúra repozitára, build skripty, príklad aplikácie, publikovanie |

## Rýchly štart

```tsx
import { GS1Engine } from 'expo-gs1-syntax-engine';

const encoder = new GS1Engine();
await encoder.init();

const result = encoder.processBarcode(']d2010858000000000910ABC123\u001D99XYZ');
console.log(result.hri);        // HRI riadky
console.log(result.dlUri);      // GS1 Digital Link URI
console.log(result.aiDataPairs);// páry AI : hodnota

encoder.close();                // uvoľnenie natívnej pamäte
```

Podrobnosti: [06-priklady-pouzitia.md](./06-priklady-pouzitia.md).

## Konvencie v dokumentácii

- **Kód, názvy API, typy a enumy** zostávajú v pôvodnej (anglickej) podobe – sú prevzaté z implementácie.
- **Tabuľky a diagramy** sú vo formáte [Mermaid](https://mermaid.js.org/).
- Označenie **⚠️** znamená obmedzenie alebo úskalie, ktoré nie je zrejmé z API.
- Odkazy typu `{@link ...}` v pôvodných komentároch kódu sú v dokumentácii nahradené bežnými odkazmi na metódy.

## Poznámka k obrázkom

Repositár obsahuje iba brandové obrázky príkladovej aplikácie (`example/assets/icon.png`, `example/assets/splash-icon.png`, `example/assets/favicon.png`, `example/assets/android-icon-*.png`). Ich obsah nie je pre funkciu modulu relevantný; v dokumentácii sú uvedené len ich názvy.

## Zdroje informácií

- **Špecifikačný kontext projektu: [`../SPECS.md`](../SPECS.md)**
- Zdrojový kód: `src/` (TypeScript), `android/` (Kotlin + Java + C)
- Pôvodná dokumentácia projektu: [`README.md`](../README.md)
- História zmien: [`changelog.md`](../changelog.md)
- Ukážková aplikácia: [`example/`](../example/)
