// Reexport the native module. On web, it will be resolved to ExpoGs1SyntaxEngineModule.web.ts
// and on native platforms to ExpoGs1SyntaxEngineModule.ts
import {
  InitOptions,
  Symbology,
  Validation,
  BarcodeInputType,
  ProcessBarcodeResult,
  stringKeyValPair,
} from './ExpoGs1SyntaxEngine.types';
import { GS1EncoderNativeInstance } from './ExpoGs1SyntaxEngineModule';

export { Symbology, Validation, InitOptions, BarcodeInputType, ProcessBarcodeResult };


/**
 * Main class for processing GS1 barcode data, including validation, format conversion, and generation of outputs such as GS1 Digital Link URIs and Human-Readable Interpretation text.
 * 
 * The library is thread-safe provided that each thread operates on its own
 * GS1Encoder instance. This applies also to the getters, which mutate
 * internal buffers of the native context.
 */
export class GS1Engine {
  // Accessing static enums directly through an instance or a class
  static readonly symbology = Symbology;
  static readonly validation = Validation;

  private nativeInstance: any;
  private _isInitialized = false;

  constructor() {
    // Instance of a native Kotlin class
    this.nativeInstance = new GS1EncoderNativeInstance();
  }

  /**
   * Allows to call other methods only after class was initialized
   */
  private ensureInitialized() {
    if (!this._isInitialized) {
      throw new Error('GS1 Syntax Engine instance has not been initialized. Call init() first');
    }
  }

  /**
   * Get the "is initialized" flag
   * @returns {boolean}
   */
  get isInitialized(): boolean {
    return this._isInitialized;
  }

  /**
   * Initialises a new instance of the GS1Encoder class with the given options.
   *
   * @param options initialisation options, or null for defaults
   * @throws GS1EncoderGeneralException if the library fails to initialise
   */
  async init(options: InitOptions | null = null): Promise<void> {
    if (this._isInitialized) {
      console.warn('GS1 Syntax Engine has been initialized.');
      return;
    }
    try {
      await this.nativeInstance.init(options);
      this._isInitialized = true;
    } catch (error) {
      this._isInitialized = false;
      throw error;
    }
  }

  /**
   * Get the version string of the library.
   * 
   * Returns a string containing the version of the library, typically the build date.
   *
   * @type {string}
   * @returns {string}
   */
  get version(): string {
    this.ensureInitialized();
    return this.nativeInstance.getVersion();
  }

  /**
   * If init succeeded but the C library fell back to the embedded AI
   * table because the supplied `syntaxDictionary` could not be loaded
   * (only when `fallbackOnSyndictError` was set), this carries the
   * underlying load error message. `null` on plain success.
   * @type {string|null}
   */
  get initFallbackWarning(): string | null {
    this.ensureInitialized();
    return this.nativeInstance.getInitFallbackWarning();
  }

  /**
   * Get the symbology type.
   * 
   * This might be set manually or automatically when processing scan data with {@link GS1encoder#scanData}.
   *
   * @type {Symbology}
   * @returns {Symbology}
   * @throws {GS1encoderParameterException} if the setter is provided with an invalid symbology type
   * @see {@link GS1encoder#scanData}
   * @see GS1encoder.symbology
   */
  get sym(): Symbology {
    this.ensureInitialized();
    return this.nativeInstance.getSym();
  }

  /**
   * Set the symbology type.
   * @param {Symbology} symbology
   */
  set sym(symbology: Symbology) {
    this.ensureInitialized();
    this.nativeInstance.setSym(symbology);
  }

  /**
   * Get the "add check digit" mode for EAN/UPC and GS1 DataBar symbols.
   * 
   * If false (default), then the data string must contain a valid check digit.
   * If true, then the data string must not contain a check digit as one will
   * be generated automatically.
   * 
   * This option is only valid for symbologies that accept fixed-length data,
   * specifically EAN/UPC and GS1 DataBar except Expanded (Stacked).
   *
   * @type {boolean}
   * @returns {boolean}
   * @throws {GS1encoderParameterException} if the value is invalid
   */
  get addCheckDigit(): boolean {
    this.ensureInitialized();
    return this.nativeInstance.getAddCheckDigit();
  }

  /**
   * Set the "add check digit" mode for EAN/UPC and GS1 DataBar symbols.
   * @param {boolean} value
   */
  set addCheckDigit(value: boolean) {
    this.ensureInitialized();
    this.nativeInstance.setAddCheckDigit(value);
  }

  /**
   * Get the "include data titles in HRI" flag.
   * 
   * When set to true, data titles from the GS1 General Specification will be
   * included in the HRI text.
   * 
   * Default: false
   *
   * @type {boolean}
   * @throws {@link GS1encoderParameterException}
   */
  get includeDataTitlesInHRI(): boolean {
    this.ensureInitialized();
    return this.nativeInstance.getIncludeDataTitlesInHRI();
  }

  /**
   * Set the "include data titles in HRI" flag.
   * @param {boolean} value
   */
  set includeDataTitlesInHRI(value: boolean) {
    this.ensureInitialized();
    this.nativeInstance.setIncludeDataTitlesInHRI(value);
  }

  /**
   * Get the "permit unknown AIs" mode.
   * 
   * If false (default), then all AIs represented by the input data must be
   * known.
   * 
   * If true, then unknown AIs (those not in this library's static AI table)
   * will be accepted.
   * 
   * Note: The option only applies to parsed input data, specifically bracketed AI data
   * supplied with {@link GS1encoder#aiDataStr} and GS1 Digital Link URIs supplied
   * with {@link GS1encoder#dataStr}. Unbracketed AI element strings containing
   * unknown AIs cannot be parsed because it is not possible to differentiate the
   * AI from its data value when the length of the AI is uncertain.
   * 
   * Default: false
   *
   * @type {boolean}
   * @throws {@link GS1encoderParameterException}
   */
  get permitUnknownAIs(): boolean {
    this.ensureInitialized();
    return this.nativeInstance.getPermitUnknownAIs();
  }

  /**
   * Set the "permit unknown AIs" mode.
   * @param {boolean} value
   */
  set permitUnknownAIs(value: boolean) {
    this.ensureInitialized();
    this.nativeInstance.setPermitUnknownAIs(value);
  }

  /**
   * Get the "permit zero-suppressed GTIN in GS1 DL URIs" mode.
   * 
   * If false (default), then the value of a path component for AI (01) must
   * be provided as a full GTIN-14.
   * 
   * If true, then the value of a path component for AI (01) may contain the
   * GTIN-14 with zeros suppressed, in the format of a GTIN-13, GTIN-12 or GTIN-8.
   * 
   * This option only applies to parsed input data, specifically GS1 Digital Link
   * URIs. Since zero-suppressed GTINs are deprecated, this option should only be
   * enabled when it is necessary to accept legacy GS1 Digital Link URIs having
   * zero-suppressed GTIN-14.
   * 
   * Default: false
   *
   * @type {boolean}
   * @throws {@link GS1encoderParameterException}
   */
  get permitZeroSuppressedGTINinDLuris(): boolean {
    this.ensureInitialized();
    return this.nativeInstance.getPermitZeroSuppressedGTINinDLuris();
  }

  /**
   * Set the "permit zero-suppressed GTIN in GS1 DL URIs" mode.
   * @param {boolean} value
   */
  set permitZeroSuppressedGTINinDLuris(value: boolean) {
    this.ensureInitialized();
    this.nativeInstance.setPermitZeroSuppressedGTINinDLuris(value);
  }

  /**
   * Get the current enabled status of the provided AI validation procedure.
   *
   * @param {Validation} validation - A validation procedure to check the status of
   * @returns {boolean} true if the AI validation procedure is currently enabled; false otherwise
   */
  getValidationEnabled(validation: Validation): boolean {
    this.ensureInitialized();
    return this.nativeInstance.getValidationEnabled(validation);
  }

  /**
   * Enable or disable the given AI validation procedure.
   * 
   * This determines whether certain checks are enforced when data is provided using
   * {@link GS1encoder#aiDataStr}, {@link GS1encoder#dataStr} or {@link GS1encoder#scanData}.
   * 
   * If enabled is true (default), then the corresponding validation will be enforced.
   * If enabled is false, then the corresponding validation will not be enforced.
   * 
   * Note: The option only applies to AI input data.
   *
   * @param {Validation} validation - A validation procedure to set the enabled status of
   * @param {boolean} value - true to enable the validation; false to disable
   * @returns {void}
   * @throws {GS1encoderParameterException}
   */
  setValidationEnabled(validation: Validation, value: boolean): void {
    this.ensureInitialized();
    this.nativeInstance.setValidationEnabled(validation, value);
  }

  /**
   * Get the raw data that would be directly encoded within a GS1 barcode message.
   * 
   * A "^" character at the start of the input indicates that the data is in GS1
   * Application Identifier syntax. In this case, all subsequent instances of the
   * "^" character represent the FNC1 non-data characters that are used to
   * separate fields that are not specified as being pre-defined length from
   * subsequent fields.
   * 
   * Inputs beginning with "^" will be validated against certain data syntax
   * rules for GS1 AIs. If the input is invalid then the setter will throw
   * a {@link GS1encoderParameterException}. In the case that the data is
   * unacceptable due to invalid AI content then a marked up version of the
   * offending AI can be retrieved using {@link GS1encoder#errMarkup}.
   * 
   * Note: It is strongly advised that GS1 data input is instead specified using
   * {@link GS1encoder#aiDataStr} which takes care of the AI encoding rules
   * automatically, including insertion of FNC1 characters where required. This
   * can be used for all symbologies that accept GS1 AI syntax data.
   * 
   * Inputs beginning with "http://" or "https://" will be parsed as a GS1
   * Digital Link URI during which the corresponding AI element string is
   * extracted and validated.
   * 
   * EAN/UPC, GS1 DataBar and GS1-128 support a Composite Component. The
   * Composite Component must be specified in AI syntax. It must be separated
   * from the primary linear components with a "|" character and begin with an
   * FNC1 in first position, for example:
   * 
   * encoder.dataStr = "^0112345678901231|^10ABC123^11210630";
   * 
   * 
   * The above specifies a linear component representing "(01)12345678901231"
   * together with a composite component representing "(10)ABC123(11)210630".
   * 
   * Note: For GS1 data it is simpler and less error prone to specify the input
   * in human-friendly GS1 AI syntax using {@link GS1encoder#aiDataStr}.
   *
   * @type {string}
   * @throws {@link GS1encoderParameterException} if the setter is provided with invalid data
   * @see {@link GS1encoder#aiDataStr}
   * @see {@link GS1encoder#errMarkup}
   */
  getDataStr(): string {
    this.ensureInitialized();
    return this.nativeInstance.getDataStr();
  }

  /**
   * Set the raw data that would be directly encoded within a GS1 barcode message.
   * @param {string} value
   */
  setDataStr(value: string): void {
    this.ensureInitialized();
    this.nativeInstance.setDataStr(value);
  }

  /**
   * Get the barcode data input buffer using GS1 Application Identifier syntax.
   * 
   * The input is provided in human-friendly format without FNC1 characters
   * which are inserted automatically, for example:
   * 
   * (01)12345678901231(10)ABC123(11)210630
   * 
   * This syntax harmonises the format for the input accepted by all symbologies.
   * For example, the following input is acceptable for EAN-13, UPC-A, UPC-E, any
   * variant of the GS1 DataBar family, GS1 QR Code and GS1 DataMatrix:
   * 
   * (01)00031234000054
   * 
   * The input is immediately parsed and validated against certain rules for GS1 AIs, after
   * which the resulting encoding for valid inputs is available via {@link GS1encoder#dataStr}.
   * If the input is invalid then an exception will be thrown.
   * 
   * Any "(" characters in AI element values must be escaped as "\\(" to avoid
   * conflating them with the start of the next AI.
   * 
   * For symbologies that support a composite component (all except Data Matrix, QR Code,
   * and DotCode), the data for the linear and 2D components can be separated by a
   * "|" character, for example:
   * 
   * (01)12345678901231|(10)ABC123(11)210630
   *
   * @type {string|null}
   * @throws {@link GS1encoderParameterException}
   */
  getAIdataStr(): string | null {
    this.ensureInitialized();
    return this.nativeInstance.getAIdataStr();
  }

  /**
   * Set the barcode data input buffer using GS1 Application Identifier syntax.
   * @param {string} value
   */
  setAIdataStr(value: string): void {
    this.ensureInitialized();
    this.nativeInstance.setAIdataStr(value);
  }

  /**
   * Process scan data received from a barcode reader or return the expected scan data string.
   * 
   * Setting: Process normalised scan data received from a barcode reader with
   * reporting of AIM symbology identifiers enabled to extract the message data and perform
   * syntax checks in the case of GS1 Digital Link and AI data input.
   * 
   * This function will process scan data (such as the output of a barcode reader) and process
   * the received data, setting the data input buffer to the message received and setting the
   * selected symbology to something that is able to carry the received data.
   * 
   * Note: In some instances the symbology determined by this library will not match
   * that of the image that was scanned. The AIM symbology identifier prefix of the
   * scan data does not always uniquely identify the symbology that was scanned.
   * For example GS1-128 Composite symbols share the same symbology identifier as
   * the GS1 DataBar family, and will therefore be detected as such.
   * 
   * A literal "|" character may be included in the scan data to indicate the
   * separation between the first and second messages that would be transmitted
   * by a reader that is configured to return the composite component when
   * reading EAN/UPC symbols.
   * 
   * Example scan data input: ]C1011231231231233310ABC123{GS}99TESTING
   * where {GS} represents ASCII character 29.
   * 
   * Getting: Returns the string that should be returned by scanners when reading a
   * symbol that is an instance of the selected symbology and contains the same input data.
   * 
   * The output will be prefixed with the appropriate AIM symbology identifier.
   *
   * @type {string}
   * @throws {@link GS1encoderScanDataException} when getting, if no symbology is
   * selected or the current data cannot be represented in the selected symbology
   */
  getScanData(): string {
    this.ensureInitialized();
    return this.nativeInstance.getScanData();
  }

  /**
   * @param {string} value
   * @throws {@link GS1encoderScanDataException} when setting, if the scan data is invalid
   */
  setScanData(value: string): void {
    this.ensureInitialized();
    this.nativeInstance.setScanData(value);
  }

  /**
   * Get the error markup generated when parsing AI data fails due to a linting failure.
   * 
   * When a setter function returns false (indicating an error), if that failure is due to
   * AI-based data being invalid, a marked up instance of the AI that failed will be generated.
   * 
   * Where it is meaningful to identify offending characters in the input data, these characters
   * will be surrounded by "|" characters. Otherwise the entire AI value will be surrounded by
   * "|" characters.
   *
   * @type {string}
   * @returns {string}
   */
  getErrMarkup(): string {
    this.ensureInitialized();
    return this.nativeInstance.getErrMarkup();
  }

  /**
   * Get a GS1 Digital Link URI that represents the AI-based input data.
   * 
   * This method converts AI-based input data into a GS1 Digital Link URI format.
   * 
   * Example: (01)12345678901231(10)ABC123(11)210630 with stem
   * https://id.example.com/stem might produce:
   * https://id.example.com/stem/01/12345678901231?10=ABC123&11=210630
   *
   * @param {string|null} stem - A URI "stem" used as a prefix for the URI. If null, the GS1 canonical stem (https://id.gs1.org/) will be used
   * @returns {string} a string representing the GS1 Digital Link URI for the input data
   * @throws {GS1encoderDigitalLinkException}
   */
  getDLuri(stem: string | null = null): string {
    this.ensureInitialized();
    return this.nativeInstance.getDLuri(stem);
  }

  /**
   * Get the Human-Readable Interpretation ("HRI") text for the current data input buffer.
   * 
   * For composite symbols, a separator "--" will be included in the array to distinguish
   * between the linear and 2D components.
   * 
   * Example output for ^011231231231233310ABC123|^99XYZ(TM) CORP:
   * 
   * (01) 12312312312333
   * (10) ABC123
   * --
   * (99) XYZ(TM) CORP
   * 
   *
   * @type {string[]}
   * @returns {string[]}
   */
  getHRI(): string[] {
    this.ensureInitialized();
    return this.nativeInstance.getHRI();
  }

  /**
   * Get the non-numeric (ignored) query parameters from a GS1 Digital Link URI.
   * 
   * For example, if the input data buffer contains:
   * https://a/01/12312312312333/22/ABC?name=Donald%2dDuck&amp;99=ABC&amp;testing&amp;type=cartoon
   * Then this property returns: name=Donald%2dDuck, testing, type=cartoon
   * 
   * The returned strings are not URI decoded. The expected use for this property is to
   * present which sections of a given GS1 Digital Link URI have been ignored.
   *
   * @type {string[]}
   * @returns {string[]}
   */
  getDLignoredQueryParams(): string[] {
    this.ensureInitialized();
    return this.nativeInstance.getDLignoredQueryParams();
  }

  /**
   * General method to process barcode data strings in multiple formats.
   * Can handle Bracketed AI element strings, Unbracketed AI element strings, GS1 Digital Link URIs and Scan data.
   * 
   * Returns all GS1 Syntax Engine data and adds additional data:
   *  - aiDataPairs - GS1 AI Data Pairs object with "GS1 AI" : "Value" pairs
   *  - aiOrder - GS1 AIs ordered array
   *  - symbologyName - Symbology name from Symbology enum
   * 
   * Return object may include 3 properties with null as a value (symbology, symbologyName, scanData). 
   * That is when provided string is not set as scanData with setScanData. Without scanData format the symbology can not be determined.
   * 
   * @param scannedData Scanned string that should be processed
   * @param dlStem a URI "stem" used as a prefix for the URI. If null, the GS1 canonical stem (https://id.gs1.org/) will be used
   * @returns {ProcessBarcodeResult}
   */
  processBarcode(scannedData: string, dlStem: string | null = null): ProcessBarcodeResult {
    try {
      this.ensureInitialized();
      let isScannedData = false;

      if (scannedData.startsWith('(')) {
        this.nativeInstance.setAIdataStr(scannedData);
      } else if (scannedData.startsWith(']')) {
        isScannedData = true;
        this.nativeInstance.setScanData(scannedData.replace(/{GS}/g, '\u001d'));
      } else if (scannedData.startsWith('^')) {
        this.nativeInstance.setDataStr(scannedData);
      } else if (
        scannedData.startsWith('http://') ||
        scannedData.startsWith('HTTP://') ||
        scannedData.startsWith('https://') ||
        scannedData.startsWith('HTTPS://')
      ) {
        this.nativeInstance.setDataStr(scannedData);
      } else if (/^\d+$/.test(scannedData)) {
        if (
          scannedData.length === 8 ||
          scannedData.length === 12 ||
          scannedData.length === 13 ||
          scannedData.length === 14
        ) {
          const lastDigit = Number(scannedData.slice(-1));
          const calcCheckDigit = this.calculateCheckDigit(scannedData.slice(0, -1));
          if (lastDigit != calcCheckDigit) {
            return {
              success: false,
              error: 'Incorrect numeric check digit',
            };
          }
          this.nativeInstance.setDataStr('^01' + scannedData.padStart(14, '0'));
        } else {
          // no AIM ID and numeric only string
          // force try to decode
          this.nativeInstance.setDataStr('^' + scannedData);
        }
      } else {
        // no AIM ID and alphanumeric string
        // force try to decode
        this.nativeInstance.setDataStr('^' + scannedData);
      }

      return this.getEngineResultData(dlStem, isScannedData);
    } catch (e: any) {
      return {
        success: false,
        error: `GS1 Syntax Engine Error: ${e?.message ?? 'Unknown error'}`,
      };
    }
  }

  /**
   * Get formated GS1 Syntax Engine data
   * 
   * Gets all GS1 Syntax Engine data and adds additional data:
   *  - aiDataPairs - GS1 AI Data Pairs object with "GS1 AI" : "Value" pairs
   *  - aiOrder - GS1 AIs ordered array
   *  - symbologyName - Symbology name from Symbology enum
   * 
   * Return object may include 3 properties with null as a value (symbology, symbologyName, scanData). 
   * That is when provided string is not set as scanData with setScanData. Without scanData format the symbology can not be determined.
   * 
   * @param dlStem a URI "stem" used as a prefix for the URI. If null, the GS1 canonical stem (https://id.gs1.org/) will be used
   * @param isScannedData is provided string a scanData string?
   * @returns {ProcessBarcodeResult}
   */
  getEngineResultData(dlStem: string | null = null, isScannedData: boolean = false): ProcessBarcodeResult {
    try {
      const stem = dlStem ?? 'https://id.gs1.org';
      const errMarkup = this.nativeInstance.getErrMarkup();
      const hasError = errMarkup !== null && errMarkup !== '';
      const customDataFormats = { hri: [''], aiDataPairs: {} as stringKeyValPair, aiOrder: [''] };
      customDataFormats.hri = this.nativeInstance.getHRI();

      for (let index = 0; index < customDataFormats.hri.length; index++) {
        const item = customDataFormats.hri[index];
        const indexOpenPar = item.indexOf('(');
        const indexClosePar = item.indexOf(')');
        const aiValue = item.slice(indexOpenPar + 1, indexClosePar);
        const dataValue = item.slice(indexClosePar + 1).trim();
        customDataFormats.aiDataPairs[`${aiValue}`] = dataValue;
        customDataFormats.aiOrder[index] = `${aiValue}`;
      }

      return {
        success: !hasError,
        error: hasError ? errMarkup : null,
        errorMarkup: errMarkup,
        dataStr: this.nativeInstance.getDataStr(),
        aiDataStr: this.nativeInstance.getAIdataStr(),
        hri: customDataFormats.hri,
        dlUri: this.nativeInstance.getDLuri(stem),
        aiDataPairs: customDataFormats.aiDataPairs,
        aiOrder: customDataFormats.aiOrder,
        symbology: (isScannedData === true) ? this.sym : null,
        symbologyName: (isScannedData === true) ? Symbology[this.sym] : null,
        scanData: (isScannedData === true) ? this.nativeInstance.getScanData() : null,
      };
    } catch (e: any) {
      return {
        success: false,
        error: `GS1 Syntax Engine Error: ${e?.message ?? 'Unknown error'}`,
      };
    }
  }

  /**
   * Calculate GS1 check digit
   * @param gs1String GS1 string without check digit
   * @returns {number} Calculated check digit
   */
  calculateCheckDigit(gs1String: string | number): number {
    let calcSum = 0;

    `${gs1String}`
      .split('')
      .reverse()
      .forEach((char, index) => {
        if (index % 2 === 0) {
          calcSum += Number(char) * 3;
        } else {
          calcSum += Number(char);
        }
      });
    const checkDigit = 10 - (calcSum % 10);
    return checkDigit === 10 ? 0 : checkDigit;
  }

  /**
   * Releases the resources associated with this encoder instance.
   * 
   * This method is called automatically when used with try-with-resources.
   * Closing is idempotent; any other method called on a closed instance
   * throws {@link IllegalStateException}.
   */
  close(): void {
    this.nativeInstance.close();
    this._isInitialized = false;
  }
}
