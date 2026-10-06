# 03 – Architektúra

## Prehľad vrstiev

Modul má štyri hlavné vrstvy (posledná C vrstva je ďalej rozdelená na JNI most a samotný engine). Každá vrstva rieši len svoju úlohu a prevádza volania o úroveň nižšie.

```mermaid
flowchart TB
    subgraph L1["1 – TypeScript API (src/)"]
        direction LR
        INDEX["index.ts<br/>trieda GS1Engine"]
        TYPES["ExpoGs1SyntaxEngine.types.ts<br/>enumy a typy"]
        NATMOD["ExpoGs1SyntaxEngineModule.ts<br/>requireNativeModule(...)"]
        WEB["ExpoGs1SyntaxEngineModule.web.ts<br/>registerWebModule – placeholder"]
    end

    subgraph L2["2 – Expo Modules API (Kotlin)"]
        KOTLIN["ExpoGs1SyntaxEngineModule.kt<br/>ModuleDefinition + Class(EncoderInstance)"]
        SHARED["EncoderInstance : SharedObject<br/>drží referenciu na GS1Encoder"]
    end

    subgraph L3["3 – Java wrapper (org.gs1.gs1encoders)"]
        JENC["GS1Encoder.java<br/>+ výnimky: General / Parameter /<br/>ScanData / DigitalLink"]
    end

    subgraph L4["4 – Natívna C knižnica"]
        JNI["gs1encoders_wrap.c<br/>JNI funkcie gs1encoder*JNI"]
        C["gs1encoders.c – API a stav<br/>ai.c, dl.c, scandata.c, syn.c<br/>syntax/gs1syntaxdictionary.c + lint_*.c"]
        SO["libgs1encoders.so<br/>CMake ≥ 3.22"]
    end

    INDEX --> NATMOD
    TYPES --> INDEX
    NATMOD -->|"new EncoderInstance()"| KOTLIN
    WEB -.->|"web platforma (nefunkčná)"| KOTLIN
    KOTLIN --> SHARED
    SHARED --> JENC
    JENC -->|"static native metódy"| JNI
    JNI --> C
    C --> SO
```

| Vrstva | Súbory | Úloha |
|--------|--------|-------|
| TypeScript | `src/index.ts`, `src/ExpoGs1SyntaxEngine.types.ts`, `src/ExpoGs1SyntaxEngineModule.ts` | Verejné API, kontrola stavu (`ensureInitialized`), zostavenie výsledného objektu, detekcia formátu vstupu |
| Expo (Kotlin) | `android/.../ExpoGs1SyntaxEngineModule.kt` | Registrácia modulu, prevod int ↔ enum, správa životného cyklu zdieľovaného objektu |
| Java | `android/.../GS1Encoder.java` + `GS1Encoder*Exception.java` | Typovo bezpečné API nad JNI, prevod chýb natívnej knižnice na výnimky |
| C (JNI) | `android/src/main/cpp/gs1encoders_wrap.c` | Marshalling reťazcov/boolov medzi Java a C |
| C (engine) | `android/src/main/c-lib/**` | Samotný GS1 Barcode Syntax Engine: parsovanie, linter, HRI, DL URI |

## Volanie API – sekvencia

### Inicializácia

```mermaid
sequenceDiagram
    autonumber
    participant JS as JS: GS1Engine
    participant NM as Expo native module
    participant KT as Kotlin: EncoderInstance
    participant JV as Java: GS1Encoder
    participant C as C: libgs1encoders.so

    JS->>NM: new EncoderInstance() (konštruktor)
    JS->>NM: await init(options)
    NM->>KT: AsyncFunction("init")
    KT->>KT: instance.encoder?.close() (uvoľnenie starej inštancie)
    KT->>JV: new GS1Encoder(InitOptions)
    JV->>C: gs1encoderInitExJNI(options, errMsg)
    C-->>JV: ctx (handle) alebo 0 + chyba
    JV-->>KT: inštancia / GS1EncoderGeneralException
    KT-->>JS: Promise resolved
    JS->>JS: _isInitialized = true
```

### Spracovanie skenu (`processBarcode`)

```mermaid
sequenceDiagram
    autonumber
    participant U as Používateľ
    participant G as GS1Engine (TS)
    participant N as Native (Kotlin/Java/C)

    U->>G: processBarcode(data, dlStem?)
    G->>G: detekcia formátu vstupu
    G->>N: setScanData / setAIdataStr / setDataStr
    N-->>G: OK alebo výnimka
    G->>N: getErrMarkup(), getHRI(), getDataStr(),<br/>getAIdataStr(), getDLuri(stem), getScanData()
    N-->>G: hodnoty
    G->>G: parseHRIString() pre každý HRI riadok
    G-->>U: ProcessBarcodeResult
```

> ⚠️ `getHRI()`, `getDataStr()`, `getDLuri()` sú **synchronné** volania cez bridge. `init()` je jediná `AsyncFunction`.

## Tok dát: formáty, ktoré engine pozná

```mermaid
flowchart LR
    IN["Naskenovaný / zadaný reťazec"] --> D{"detekcia prefixu"}

    D -->|"prefix: zátvorka"| A["Bracketed AI syntax<br/>(01)12345678901231(10)ABC123"]
    D -->|"prefix: znak ]"| B["Scan data (AIM prefix)<br/>]C101...{GS}99..."]
    D -->|"prefix: znak ^"| C["Raw AI syntax<br/>^0112345678901231^10ABC123"]
    D -->|"http:// alebo https://"| E["GS1 Digital Link URI"]
    D -->|"číslice 8/12/13/14"| F["GTIN (overenie kontrolnej číslice)<br/>→ ^01 + doplnenie nulami na 14"]
    D -->|"iné číslice"| G["Raw: ^ + reťazec"]
    D -->|"iné"| H["Raw: ^ + reťazec"]

    A --> OUT["getEngineResultData()"]
    B --> OUT
    C --> OUT
    E --> OUT
    F --> OUT
    G --> OUT
    H --> OUT
    OUT --> R["ProcessBarcodeResult"]
```

Konkrétne príklady vstupov: [06-priklady-pouzitia.md](./06-priklady-pouzitia.md).

## Transformácia dát v engine

```mermaid
flowchart TB
    subgraph VSTUPY["Vstupné formáty"]
        S1["Scan data<br/>]d2010858...{GS}99XYZ"]
        S2["Bracketed AI<br/>(01)08580000000009(10)ABC123"]
        S3["Raw AI<br/>^0108580000000009^10ABC123"]
        S4["DL URI<br/>https://id.gs1.org/01/08580000000009"]
    end

    S1 --> N1["dataStr (FNC1 = ^)<br/>aiDataStr (zátvorky)<br/>sym (typ symbology)"]
    S2 --> N2["dataStr<br/>aiDataStr"]
    S3 --> N3["dataStr<br/>aiDataStr"]
    S4 --> N4["dataStr<br/>aiDataStr<br/>DL ignored query params"]

    N1 --> VY["Výstupy"]
    N2 --> VY
    N3 --> VY
    N4 --> VY

    VY --> O1["getHRI() → pole riadkov"]
    VY --> O2["getDLuri(stem) → DL URI"]
    VY --> O3["getErrMarkup() → označená chyba"]
    VY --> O4["getScanData() → očakávaný sken"]
```

## Životný cyklus inštancie

```mermaid
stateDiagram-v2
    [*] --> Neuinicializovana: new GS1Engine()
    Neuinicializovana --> Inicializovana: await init(options)
    Neuinicializovana --> Neuinicializovana: init() zlyhal
    Inicializovana --> Inicializovana: init() (2. krát) → console.warn, návrat
    Inicializovana --> Zatvorena: close()
    Zatvorena --> Inicializovana: await init()
    Zatvorena --> [*]: GC / deallocate()

    note right of Neuinicializovana
        Volanie akéhokoľvek API okrem init()
        a close() hádže Error:
        "GS1 Syntax Engine instance has not
        been initialized. Call init() first"
    end note

    note right of Zatvorena
        Natívny kontext je uvoľnený.
        Ďalšie volania hádže Error
        (poisťuje Java ctx() check).
    end note
```

### Pravidlá životného cyklu

| Situácia | Správanie |
|----------|-----------|
| `init()` pred zavolaním | `Error: GS1 Syntax Engine instance has not been initialized. Call init() first` |
| Opakované `init()` | `console.warn('GS1 Syntax Engine has been initialized.')`, **bez re-inicializácie**, návrat |
| `init()` po `close()` | opäť inicializuje (nová natívna inštancia) |
| `close()` | idempotentné; natívne `encoder.close()` + `_isInitialized = false` |
| Volanie API po `close()` | `Error` (istí Java `ctx()` kontrolou: `GS1Encoder instance has been closed`) |
| Garbage collection zdieľaného objektu | Kotlin `EncoderInstance.deallocate()` automaticky zavolá `encoder?.close()` |

## Správa pamäte

```mermaid
flowchart LR
    A["JS: new GS1Engine()"] --> B["SharedObject EncoderInstance"]
    B --> C["Java: GS1Encoder.ctx = handle<br/>(dlhý celočíselný identifikátor)"]
    C --> D["C: gs1_encoder *ctx<br/>(alokovaný engineom)"]

    E["close()"] -->|"encoder.close(); encoder = null"| B
    F["GC / release()"] -->|"deallocate()"| B
    D -->|"gs1_encoder_free(ctx)"| G["uvoľnená pamäť"]
```

**Odporúčaný vzor** (z `example/App.tsx`): vytvorenie inštancie v `useEffect`, uvoľnenie v cleanup funkcii:

```tsx
useEffect(() => {
  let activeEncoder: GS1Engine | null = null;

  async function setup() {
    activeEncoder = await initGS1Encoder();
    setEncoder(activeEncoder);
  }
  setup();

  return () => {
    activeEncoder?.close();   // uvoľnenie natívneho kontextu
  };
}, []);
```

⚠️ Bez `close()` zostane C kontext alokovaný až do GC natívneho objektu – pri opakovanom vytváraní inštancií to môže viesť k úniku pamäte.

## Chybové modely na hraniciach vrstiev

```mermaid
flowchart TB
    CERR["C engine: chybový stav + gs1_encoder_getErrMsg()"] --> J1
    J1["Java: false / null návratová hodnota"] --> J2["throw GS1Encoder*Exception(getErrMsg())"]
    J2 --> K["Kotlin: výnimka preruší Function"]
    K --> T["Expo: propaguje ako JS Error<br/>(hlásenie obsahuje 'Caused by: ...')"]
    T --> P["TS: catch → ProcessBarcodeResult<br/>{success:false, error, errorReason}"]
    P --> U["getErrorReason() vyberie text za 'Caused by:'"]
```

Detaily: [07-riesenie-problemov.md](./07-riesenie-problemov.md).
