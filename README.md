# Expo GS1 Syntax Engine

This library is an implementation of [GS1 Barcode Syntax Engine](https://github.com/gs1/gs1-syntax-engine) as an Expo native module created using [`create-expo-module`](https://docs.expo.dev/modules/native-module-tutorial/) to be used in [Expo](https://docs.expo.dev/) mobile apps and in [React Native](https://reactnative.dev/) mobile apps with installed Expo.

This project is an Expo/React Native wrapper around the [GS1 Barcode Syntax Engine](https://github.com/gs1/gs1-syntax-engine). It is an independent project and is not an official GS1 AISBL package.

Currently used GS1 Barcode Syntax Engine version: 1.4.1

## About

The library uses .java wrapper from [GS1 Barcode Syntax Engine](https://github.com/gs1/gs1-syntax-engine) that references native C code from [GS1 Barcode Syntax Engine](https://github.com/gs1/gs1-syntax-engine). This library is just a .kt and .ts wrapper around the .java [GS1 Barcode Syntax Engine](https://github.com/gs1/gs1-syntax-engine) wrapper that exposes methods from GS1Encoder.java.

All [GS1 Barcode Syntax Engine](https://github.com/gs1/gs1-syntax-engine) are exposed and ready to use and there are a few additional methods.

## Installation

### Expo

```bash
npx expo install expo-gs1-syntax-engine
```

### React Native

If you are installing this in an [existing React Native app](https://docs.expo.dev/bare/overview), make sure to [install expo](https://docs.expo.dev/bare/installing-expo-modules) in your project.

```bash
npm install expo-gs1-syntax-engine
```

## Usage Examples

1. First, import GS1Engine class and required types

```tsx
import { GS1Engine, ProcessBarcodeResult } from 'expo-gs1-syntax-engine';
```

2. Init GS1Engine class and set instance properties

```tsx
// 1. Initialization function with settings
async function initGS1Encoder(): Promise<GS1Engine> {
  const gs1encoder = new GS1Engine();
  await gs1encoder.init();

  // Configuring an instance using get/set properties
  gs1encoder.permitUnknownAIs = true;
  gs1encoder.setValidationEnabled(GS1Engine.validation.RequisiteAIs, true);
  gs1encoder.includeDataTitlesInHRI = true;
  gs1encoder.permitZeroSuppressedGTINinDLuris = false;

  return gs1encoder;
}
```

3. Initialize GS1Engine class in useEffect hook with cleanup function

```tsx
const [encoder, setEncoder] = useState<GS1Engine | null>(null);
const [loading, setLoading] = useState<boolean>(true);
const [error, setError] = useState<string>('');

// 2. Instance Lifecycle Management
useEffect(() => {
  let activeEncoder: GS1Engine | null = null;

  async function setup() {
    try {
      setLoading(true);
      // Calling init
      activeEncoder = await initGS1Encoder();
      setEncoder(activeEncoder);
      setError('');
    } catch (err: any) {
      setError(`Error initializing the C engine: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  setup();

  // Memory cleanup: When a component is unmounted, the native context is closed
  return () => {
    if (activeEncoder) {
      console.log('Freeing up GS1 Syntax Engine from C memory.');
      activeEncoder.close();
    }
  };
}, []);
```

4. Start processing data

4.1. Using the additional method processBarcode

```tsx
// gs1 datamatrix
const result3 = encoder.processBarcode(
  ']d2011231231231233310ABC123\u001D99XYZ',
  'https://mydomain.sk'
);
console.log('Processing result for gs1 datamatrix:');
console.log(result3);
```

4.2. Using the original methods

```tsx
encoder.setScanData(']d201085800000000091126071610Lot858\u001D21Serial01');
console.log('Get HRI from direct input');
const resultDirect = encoder.getHRI();
console.log(`${resultDirect}`);
console.log('Get formated engine result data');
const complexData = encoder.getEngineResultData();
console.log(complexData);
```

## Third-party software

This library includes portions of the GS1 Barcode Syntax Engine.

GS1 Barcode Syntax Engine
Copyright (c) GS1 AISBL

Licensed under the Apache License, Version 2.0.
https://www.apache.org/licenses/LICENSE-2.0

## License

MIT
