import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Button, ActivityIndicator, ScrollView } from 'react-native';
import { GS1Engine, ProcessBarcodeResult } from 'expo-gs1-syntax-engine';

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

export default function App() {
  const [encoder, setEncoder] = useState<GS1Engine | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [scanResult, setScanResult] = useState<ProcessBarcodeResult | null>(null);

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

  // 3. Test scan button
  const handleScanSimulation = () => {
    if (!encoder) {
      setError('GS1 Syntax Engine is not ready.');
      return;
    }
    console.log('---------------------------');

    // databar
    const result1 = encoder.processBarcode(']e0011231231231233310ABC123\u001D99XYZ', 'https://mydomain.sk');
    console.log('Processing result for databar:');
    console.log(result1);

    // datamatrix
    const result2 = encoder.processBarcode(']d0011231231231233310ABC123\u001D99XYZ', 'https://mydomain.sk');
    console.log('Processing result for datamatrix:');
    console.log(result2);

    // gs1 datamatrix
    const result3 = encoder.processBarcode(']d2011231231231233310ABC123\u001D99XYZ', 'https://mydomain.sk');
    console.log('Processing result for gs1 datamatrix:');
    console.log(result3);

    // gs1 128
    const result4 = encoder.processBarcode(']C1010003123400005410ABC123');
    console.log('Processing result for gs1 128:');
    console.log(result4);

    // code 128
    const result5 = encoder.processBarcode(']C0010003123400005410ABC123');
    console.log('Processing result for code 128:');
    console.log(result5);

    // QR DL
    const result6 = encoder.processBarcode('https://id.gs1sk.org/01/08580000000030?11=260705&17=240710');
    console.log('Processing result for QR DL 1:');
    console.log(result6);

    // QR DL
    const result7 = encoder.processBarcode('https://example.com/01/09521234543213?99=TESTING123');
    console.log('Processing result for QR DL 2:');
    console.log(result7);

    // QR DL
    const result8 = encoder.processBarcode('https://id.gs1sk.org/01/08580000000030/10/cheese858?11=250630&15=291124&linkType=nutritionalInfo');
    console.log('Processing result for QR DL 3:');
    console.log(result8);

    // No Aim Code alphanumeric
    const result9 = encoder.processBarcode('010003123400005410ABC123');
    console.log('Processing result for No Aim Code alphanumeric:');
    console.log(result9);

    // No Aim Code numeric
    const result10 = encoder.processBarcode('8580000000009454787864');
    console.log('Processing result for No Aim Code numeric:');
    console.log(result10);

    // No Aim Code ean13
    const result11 = encoder.processBarcode('8580000000009');
    console.log('Processing result for No Aim Code ean13:');
    console.log(result11);

    // No Aim Code ean8
    const result12 = encoder.processBarcode('85800007');
    console.log('Processing result for No Aim Code ean8:');
    console.log(result12);

    // No Aim Code itf14
    const result13 = encoder.processBarcode('18580000000006');
    console.log('Processing result for No Aim Code itf14:');
    console.log(result13);

    // Aim Code ean13
    const result11a = encoder.processBarcode(']E08580000000009');
    console.log('Processing result for ean13 with AIM Code:');
    console.log(result11a);

    // Aim Code ean8
    const result12a = encoder.processBarcode(']E485800007');
    console.log('Processing result for ean8 with AIM Code:');
    console.log(result12a);

    // Aim Code itf14
    const result13a = encoder.processBarcode(']I018580000000006');
    console.log('Processing result for itf14 with AIM Code:');
    console.log(result13a); 

    // No Aim Code iccbba
    const result14 = encoder.processBarcode(']C0=)1BA0012345');
    console.log('Processing result for No Aim Code iccbba:');
    console.log(result14);

    // No Aim Code iccbba
    const result15 = encoder.processBarcode(']C0&)000000X245');
    console.log('Processing result for No Aim Code isbt:');
    console.log(result15);

    // direct method usage
    console.log('---------------------------');
    console.log('Direct method usage');
    encoder.setScanData(']d201085800000000091126071610Lot858\u001D21Serial01');
    console.log('Get HRI from direct input');
    console.log('---------------------------');
    const resultDirect = encoder.getHRI();
    console.log(`${resultDirect}`);
    const complexData = encoder.getEngineResultData();
    console.log(complexData);

    // Data displayed in View
    const result = encoder.processBarcode(']d2011231231231233310ABC123\u001D99XYZ');
    setScanResult(result);
  };

  // Displaying the loading status
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.statusText}>Initializing native GS1 Syntax Engine...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Expo GS1 Syntax Engine Demo</Text>

      <Text style={styles.statusText}>
        Instance status: {encoder?.isInitialized ? 'Active in memory' : 'Inactive'}
      </Text>

      <View style={styles.buttonContainer}>
        <Button
          title="Simulate barcode scan and log example data to console"
          onPress={handleScanSimulation}
          disabled={!encoder?.isInitialized}
        />
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {scanResult ? (
        <View style={styles.resultBox}>
          <Text style={styles.resultTitle}>
            Scan result: {scanResult.success ? 'GS1 Data' : 'Non GS1 Data'}
          </Text>

          {scanResult.success ? (
            <View>
              <Text style={styles.label}>Raw data (FNC1 as ^):</Text>
              <Text style={styles.value}>{scanResult.dataStr}</Text>

              <Text style={styles.label}>Generated GS1 Digital Link:</Text>
              <Text style={styles.value}>{scanResult.dlUri}</Text>

              <Text style={styles.label}>Output HRI (AI titles included thanks to includeDataTitlesInHRI):</Text>
              {scanResult.hri?.map((line, index) => (
                <Text key={index} style={styles.hriLine}>{line}</Text>
              ))}
            </View>
          ) : (
            <View>
              <Text style={styles.errorText}>{scanResult.error}</Text>
              <Text>Scanned data: {scanResult.error}</Text>
            </View>
          )}
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 60, alignItems: 'stretch' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  statusText: { fontSize: 14, marginBottom: 20, textAlign: 'center', color: '#555' },
  buttonContainer: { marginBottom: 20 },
  errorBox: { backgroundColor: '#ffebee', padding: 15, borderRadius: 8, marginBottom: 20 },
  errorText: { color: '#c62828', fontWeight: '500' },
  resultBox: { backgroundColor: '#f9f9f9', padding: 15, borderRadius: 8, borderWidth: 1, borderColor: '#eee' },
  resultTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15 },
  label: { fontSize: 12, fontWeight: '600', color: '#666', marginTop: 10 },
  value: { fontSize: 13, color: '#111', backgroundColor: '#eaeaea', padding: 6, borderRadius: 4, marginTop: 2, fontFamily: 'monospace' },
  hriLine: { fontSize: 13, fontFamily: 'monospace', color: '#0066cc', marginLeft: 10, marginTop: 2 },
});
