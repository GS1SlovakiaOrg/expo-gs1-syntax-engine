export type BarcodeInputType = 'scanData' | 'dataStr';

/**
 * General "string":string type
 */
export type stringKeyValPair = {
  [key: string]: string;
};

/**
 * Data structure returned by processBarcode method 
 * (general method to process barcode data strings in multiple formats)
 */
export type ProcessBarcodeResult = {
  success: boolean;
  error?: string | null;
  errorReason?: string | null;
  errorMarkup?: string | null;
  dataStr?: string | null;
  aiDataStr?: string | null;
  hri?: string[] | null;
  dlUri?: string | null;
  aiDataPairs?: stringKeyValPair;
  aiOrder?: string[];
  symbology?: Symbology | null | undefined;
  symbologyName?: string | null | undefined;
  scanData?: string | null | undefined;
  aimPrefix?: string | null | undefined;
};

/**
 * Recognised GS1 barcode formats ("symbologies") for processing scan data.
 * 
 * This enum defines all supported GS1 barcode symbology types that can be used
 * with the encoder. Each symbology has specific characteristics and use cases.
 */
export enum Symbology {
  NONE = -1,
  DataBarOmni = 0,
  DataBarTruncated = 1,
  DataBarStacked = 2,
  DataBarStackedOmni = 3,
  DataBarLimited = 4,
  DataBarExpanded = 5,
  UPCA = 6,
  UPCE = 7,
  EAN13 = 8,
  EAN8 = 9,
  GS1_128_CCA = 10,
  GS1_128_CCC = 11,
  QR = 12,
  DM = 13,
  DotCode = 14,
  NUMSYMS = 15,
}

/**
 * Optional AI validation procedures that may be applied to detect invalid inputs.
 * 
 * These validation procedures are applied when AI data is provided using
 * {setAIdataStr(String)}, {setDataStr(String)} or {setScanData(String)}.
 * 
 * Note: Some validation procedures are "locked" (always enabled and cannot be modified).
 * All validation procedures are listed to maintain correct enum value alignment with the native library.
 */
export enum Validation {
  MutexAIs = 0,
  RequisiteAIs = 1,
  RepeatedAIs = 2,
  DigSigSerialKey = 3,
  UnknownAInotDLattr = 4,
  NUMVALIDATIONS = 5,
}

/**
 * Initialisation options for the GS1Encoder.
 * New setters may be added in future versions without breaking existing code.
 */
export type InitOptions = {
  syntaxDictionary?: string;
  fallbackOnSyndictError?: boolean;
  noEmbedded?: boolean;
};
