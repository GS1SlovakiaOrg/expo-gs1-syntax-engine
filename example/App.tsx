import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Button, ActivityIndicator, ScrollView } from 'react-native';
import { GS1Engine, ProcessBarcodeResult } from 'expo-gs1-syntax-engine';

type stringKeyValPair = {
  [key: string]: string;
}

interface engineResult {
  dataStr: string;
  aiDataStr: string;
  dlUri: string;
  hri: string[];
  aiDataPairs: stringKeyValPair;
  aiOrder: string[];
}


// 1. Tvoja inicializačná funkcia s nastaveniami
async function initGS1Encoder(): Promise<GS1Engine> {
  const gs1encoder = new GS1Engine();
  await gs1encoder.init();

  // Konfigurácia inštancie pomocou get/set vlastností
  gs1encoder.permitUnknownAIs = true;
  gs1encoder.setValidationEnabled(GS1Engine.validation.RequisiteAIs, true);
  gs1encoder.includeDataTitlesInHRI = true;
  gs1encoder.permitZeroSuppressedGTINinDLuris = false;

  return gs1encoder;
}

export default function App() {
  // Sem si uložíme našu vytvorenú inštanciu enkodéru
  const [encoder, setEncoder] = useState<GS1Engine | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [scanResult, setScanResult] = useState<ProcessBarcodeResult | null>(null);

  // 2. Správa životného cyklu inštancie
  useEffect(() => {
    let activeEncoder: GS1Engine | null = null;

    async function setup() {
      try {
        setLoading(true);
        // Voláme tvoju inicializáciu
        activeEncoder = await initGS1Encoder();
        setEncoder(activeEncoder);
        setError('');
      } catch (err: any) {
        setError(`Chyba pri inicializácii C engine-u: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }

    setup();

    // Čistenie pamäte: keď sa komponent unmountne, zatvoríme natívny kontext
    return () => {
      if (activeEncoder) {
        console.log('Uvoľňujem GS1Encoder z C pamäte...');
        activeEncoder.close();
      }
    };
  }, []);

  // 3. Obsluha tlačidla skenovania
  const handleScanSimulation = () => {
    if (!encoder) {
      setError('Enkodér nie je pripravený.');
      return;
    }
    console.log('---------------------------');
    console.log('---------------------------');
    console.log('---------------------------');

    // databar
    const result1 = encoder.processBarcode(']e0011231231231233310ABC123\u001D99XYZ', 'https://mojadomena.sk');
    console.log('Výsledok spracovania databar:');
    console.log(result1);

    // datamatrix
    const result2 = encoder.processBarcode(']d0011231231231233310ABC123\u001D99XYZ', 'https://mojadomena.sk');
    console.log('Výsledok spracovania datamatrix:');
    console.log(result2);

    // gs1 datamatrix
    const result4 = encoder.processBarcode(']d2011231231231233310ABC123\u001D99XYZ', 'https://mojadomena.sk');
    console.log('Výsledok spracovania gs1 datamatrix:');
    console.log(result4);

    // gs1 128
    const result5 = encoder.processBarcode(']C1010003123400005410ABC123');
    console.log('Výsledok spracovania gs1 128:');
    console.log(result5);

    // code 128
    const result8 = encoder.processBarcode(']C0010003123400005410ABC123');
    console.log('Výsledok spracovania code 128:');
    console.log(result8);

    // QR DL
    const result3 = encoder.processBarcode('https://id.gs1sk.org/01/08580000000030?11=260705&17=240710');
    console.log('Výsledok spracovania QR DL 1:');
    console.log(result3);

    // QR DL
    const result6 = encoder.processBarcode('https://example.com/01/09521234543213?99=TESTING123');
    console.log('Výsledok spracovania QR DL 2:');
    console.log(result6);

    // QR DL
    const result7 = encoder.processBarcode('https://id.gs1sk.org/01/08580000000030/10/cheese858?11=250630&15=291124&linkType=nutritionalInfo');
    console.log('Výsledok spracovania QR DL 3:');
    console.log(result7);

    
    // bez aim alfanumerické
    const result9 = encoder.processBarcode('010003123400005410ABC123');
    console.log('Výsledok spracovania bez aim alfanumerické:');
    console.log(result9);
    
    // bez aim ean13
    const result10 = encoder.processBarcode('8580000000009');
    console.log('Výsledok spracovania bez aim ean13:');
    console.log(result10);

    // bez aim ean8
    const result12 = encoder.processBarcode('85800007');
    console.log('Výsledok spracovania bez aim ean8:');
    console.log(result12);
        
    // bez aim itf14
    const result13 = encoder.processBarcode('18580000000006');
    console.log('Výsledok spracovania bez aim itf14:');
    console.log(result13);

    // bez aim numerické
    const result11 = encoder.processBarcode('8580000000009454787864');
    console.log('Výsledok spracovania bez aim numerické:');
    console.log(result11);

    // bez aim iccbba
    const result18 = encoder.processBarcode(']C0=)1BA0012345');
    console.log('Výsledok spracovania bez aim iccbba:');
    console.log(result18);

    // bez aim iccbba
    const result19 = encoder.processBarcode(']C0&)000000X245');
    console.log('Výsledok spracovania bez aim isbt:');
    console.log(result19);



    // Zavoláme našu novú ne-jednorázovú metódu nad konkrétnou inštanciou
    const result = encoder.processBarcode(']d2011231231231233310ABC123\u001D99XYZ');

    setScanResult(result);
  };


  // 3. Obsluha tlačidla skenovania
  const handleScanSimulationV2 = () => {
    if (!encoder) {
      setError('Enkodér nie je pripravený.');
      return;
    }

    // QR DL
    const result3 = getEngineResult(encoder, 'https://id.gs1sk.org/01/08580000000030?11=260705&17=240710');
    console.log('Výsledok spracovania qrdl:');
    console.log(result3);

    // QR DL
    const result4 = getEngineResult(encoder, 'https://id.gs1sk.org/01/08580000000030/10/cheese858?11=250630&15=291124&linkType=nutritionalInfo');
    console.log('Výsledok spracovania qrdl2:');
    console.log(result4);

    // itf 14
    const result41 = getEngineResult(encoder, '18580000000006');
    console.log('Výsledok spracovania itf14:');
    console.log(result41);

    // numerické
    const result42 = getEngineResult(encoder, '8580000000009454787864');
    console.log('Výsledok spracovania numerické:');
    console.log(result42);

    // ean8
    const result43 = getEngineResult(encoder, '85800007');
    console.log('Výsledok spracovania ean8:');
    console.log(result43);

    // ean13
    const result44 = getEngineResult(encoder, '8580000000009');
    console.log('Výsledok spracovania ean13:');
    console.log(result44);

    // alfanumerické
    const result45 = getEngineResult(encoder, '010003123400005410ABC123');
    console.log('Výsledok spracovania alfanumerické:');
    console.log(result45);

    // code 128
    const result46 = getEngineResult(encoder, ']C0010003123400005410ABC123');
    console.log('Výsledok spracovania code 128:');
    console.log(result46);

    // gs1 128
    const result47 = getEngineResult(encoder, ']C1010003123400005410ABC123');
    console.log('Výsledok spracovania gs1 128:');
    console.log(result47);
  };

  function getEngineResult(gs1encoder: GS1Engine, readerData: string) {
    try {
      if (readerData.startsWith('(')) {
        gs1encoder.setAIdataStr(readerData);
      } else if (readerData.startsWith(']')) {
        gs1encoder.setScanData(readerData.replace(/{GS}/g, "\u001d"));
      } else if (readerData.startsWith('^')) {
        gs1encoder.setDataStr(readerData);
      } else if (readerData.startsWith("http://") || readerData.startsWith("HTTP://") || readerData.startsWith("https://") || readerData.startsWith("HTTPS://")) {
        gs1encoder.setDataStr(readerData);
      } else if (/^\d+$/.test(readerData)) {
        if (readerData.length === 8 || readerData.length === 12 || readerData.length === 13 || readerData.length === 14) {
          const lastDigit = Number(readerData.slice(-1));
          const calcCheckDigit = calculateCheckDigit(readerData.slice(0, -1));
          if (lastDigit != calcCheckDigit) {
            console.log('Incorrect numeric check digit');
            return;
          }
          gs1encoder.setDataStr("^01" + readerData.padStart(14, '0'));

        } else {
          // ak čítačka neposúva AIM ID a reťazec obsahuje len číselné znaky
          gs1encoder.setDataStr("^" + readerData);
        }
      } else {
        // ak čítačka neposúva AIM ID a reaťazec obsahuje alfanumerické znaky
        gs1encoder.setDataStr("^" + readerData);
      }
    }
    catch (err) {
      console.log(`Error:`);
      console.log(err);
      const markup = gs1encoder.getErrMarkup();
      if (markup) {
        console.log(`AI content validation failed: ${markup.replace(/\|/g, "⧚")}`);
      }
      return;
    }

    return formatEngineResultData(gs1encoder);
  }

  function formatEngineResultData(gs1encoder: GS1Engine) {
    const resultData = { dataStr: '', aiDataStr: '', dlUri: '', hri: [''], aiDataPairs: {} as stringKeyValPair, aiOrder: [''] } as engineResult;

    resultData.dataStr = `${gs1encoder.getDataStr()}`;
    resultData.aiDataStr = `${gs1encoder.getAIdataStr()}`;
    resultData.hri = gs1encoder.getHRI();
    // resultData.dataStr = gs1encoder.dataStr;
    // resultData.aiDataStr = gs1encoder.aiDataStr;
    // resultData.hri = gs1encoder.hri;

    try {
      const dlUri = gs1encoder.getDLuri(null);
      resultData.dlUri = dlUri;
    }
    catch (err) {
      console.log(`DL error:`);
      console.log(err);
      resultData.dlUri = 'not available';
    }

    for (let index = 0; index < resultData.hri.length; index++) {
      const item = resultData.hri[index];
      const indexOpenPar = item.indexOf("(");
      const indexClosePar = item.indexOf(")");
      const aiValue = item.slice(indexOpenPar + 1, indexClosePar);
      const dataValue = item.slice(indexClosePar + 1).trim();
      resultData.aiDataPairs[`${aiValue}`] = dataValue;
      resultData.aiOrder[index] = `${aiValue}`;
    }

    return resultData;
  }

  function calculateCheckDigit(gs1String: string | number) {
    let calcSum = 0;

    `${gs1String}`.split("").reverse().forEach((char, index) => {
      if (index % 2 === 0) {
        calcSum += (Number(char) * 3);
      } else {
        calcSum += Number(char);
      }
    })
    const checkDigit = 10 - (calcSum % 10);
    return (checkDigit === 10) ? 0 : checkDigit;
  }

  // Vykreslenie loading stavu
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.statusText}>Inicializujem natívny GS1 Syntax Engine...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>GS1 OOP Engine Demo</Text>

      <Text style={styles.statusText}>
        Stav inštancie: {encoder?.isInitialized ? '🟢 Aktívna v pamäti' : '🔴 Neaktívna'}
      </Text>

      <View style={styles.buttonContainer}>
        <Button
          title="Simulovať sken čiarového kódu"
          onPress={handleScanSimulation}
          disabled={!encoder?.isInitialized}
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Sken DL"
          onPress={handleScanSimulationV2}
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
            Výsledok: {scanResult.success ? '✅ Úspech' : '❌ Zlyhanie validácie'}
          </Text>

          {scanResult.success ? (
            <>
              <Text style={styles.label}>Surové dáta (FNC1 ako ^):</Text>
              <Text style={styles.value}>{scanResult.dataStr}</Text>

              <Text style={styles.label}>Vygenerovaný GS1 Digital Link:</Text>
              <Text style={styles.value}>{scanResult.dlUri}</Text>

              <Text style={styles.label}>HRI text (Zahrnuté názvy AI vďaka includeDataTitlesInHRI):</Text>
              {scanResult.hri?.map((line, index) => (
                <Text key={index} style={styles.hriLine}>{line}</Text>
              ))}
            </>
          ) : (
            <Text style={styles.errorText}>{scanResult.error}</Text>
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



// vyrieš
//    force try to decode
//      - v index.ts




// porovnanie výsledkov:

// processBarcode
// G  {
// "aiDataStr": "(01)12312312312333(10)ABC123(99)XYZ", 
// "dataStr": "^011231231231233310ABC123^99XYZ", 
// "dlUri": "https://mojadomena.sk/01/12312312312333/10/ABC123?99=XYZ", 
// "hri": ["GTIN (01) 12312312312333", "BATCH/LOT (10) ABC123", "INTERNAL (99) XYZ"], 

// "error": null, 
// "errorMarkup": "", 
// "scanData": "]e0011231231231233310ABC12399XYZ", 
// "success": true, 
// "symbology": 5
// }


// getEngineResult
// {
// "aiDataStr": "(01)08580000000030(11)260705(17)240710", 
// "dataStr": "https://id.gs1sk.org/01/08580000000030?11=260705&17=240710", 
// "dlUri": "https://id.gs1.org/01/08580000000030?11=260705&17=240710", 
// "hri": ["GTIN (01) 08580000000030", "PROD DATE (11) 260705", "USE BY or EXPIRY (17) 240710"],

// "aiDataPairs": {"01": "08580000000030", "11": "260705", "17": "240710"}, 
// "aiOrder": ["01", "11", "17"], 
// }




// vyber medzi processBarcode a getEngineResult
// alebo vytvor ich kombináciu
// vlož to do index.ts ?
// aby z toho bola defaultná funkcia
//  - taká jednoduchá, ľahko použiteľná
// napíš README a vysvetli používanie
// vyrieš pravidlá Android Proguard/R8 (aby optimalizácia kódu neodstránila natívne JNI metódy z GS1Encoder.java), 
// priprav automatizované testy



//  LOG  Výsledok spracovania databar:
//  LOG  {"aiDataPairs": {"01": "12312312312333", "10": "ABC123", "99": "XYZ"}, "aiDataStr": "(01)12312312312333(10)ABC123(99)XYZ", "aiOrder": ["01", "10", "99"], "dataStr": "^011231231231233310ABC123^99XYZ", "dlUri": "https://mojadomena.sk/01/12312312312333/10/ABC123?99=XYZ", "error": null, "errorMarkup": "", "hri": ["GTIN (01) 12312312312333", "BATCH/LOT (10) ABC123", "INTERNAL (99) XYZ"], "success": true}

//  LOG  Výsledok spracovania datamatrix:
//  LOG  {"error": "GS1 Syntax Engine Error: Call to function 'EncoderInstance.setScanData' has been rejected.
// → Caused by: org.gs1.gs1encoders.GS1EncoderScanDataException: Unsupported symbology identifier", "success": false}

//  LOG  Výsledok spracovania gs1 datamatrix:
//  LOG  {"aiDataPairs": {"01": "12312312312333", "10": "ABC123", "99": "XYZ"}, "aiDataStr": "(01)12312312312333(10)ABC123(99)XYZ", "aiOrder": ["01", "10", "99"], "dataStr": "^011231231231233310ABC123^99XYZ", "dlUri": "https://mojadomena.sk/01/12312312312333/10/ABC123?99=XYZ", "error": null, "errorMarkup": "", "hri": ["GTIN (01) 12312312312333", "BATCH/LOT (10) ABC123", "INTERNAL (99) XYZ"], "success": true}

//  LOG  Výsledok spracovania gs1 128:
//  LOG  {"aiDataPairs": {"01": "00031234000054", "10": "ABC123"}, "aiDataStr": "(01)00031234000054(10)ABC123", "aiOrder": ["01", "10"], "dataStr": "^010003123400005410ABC123", "dlUri": "https://id.gs1.org/01/00031234000054/10/ABC123", "error": null, "errorMarkup": "", "hri": ["GTIN (01) 00031234000054", "BATCH/LOT (10) ABC123"], "success": true}

//  LOG  Výsledok spracovania code 128:
//  LOG  {"error": "GS1 Syntax Engine Error: Call to function 'EncoderInstance.setScanData' has been rejected.
// → Caused by: org.gs1.gs1encoders.GS1EncoderScanDataException: Unsupported symbology identifier", "success": false}

//  LOG  Výsledok spracovania QR DL 1:
//  LOG  {"aiDataPairs": {"01": "08580000000030", "11": "260705", "17": "240710"}, "aiDataStr": "(01)08580000000030(11)260705(17)240710", "aiOrder": ["01", "11", "17"], "dataStr": "https://id.gs1sk.org/01/08580000000030?11=260705&17=240710", "dlUri": "https://id.gs1.org/01/08580000000030?11=260705&17=240710", "error": null, "errorMarkup": "", "hri": ["GTIN (01) 08580000000030", "PROD DATE (11) 260705", "USE BY or EXPIRY (17) 240710"], "success": true}

//  LOG  Výsledok spracovania QR DL 2:
//  LOG  {"aiDataPairs": {"01": "09521234543213", "99": "TESTING123"}, "aiDataStr": "(01)09521234543213(99)TESTING123", "aiOrder": ["01", "99"], "dataStr": "https://example.com/01/09521234543213?99=TESTING123", "dlUri": "https://id.gs1.org/01/09521234543213?99=TESTING123", "error": null, "errorMarkup": "", "hri": ["GTIN (01) 09521234543213", "INTERNAL (99) TESTING123"], "success": true}

//  LOG  Výsledok spracovania QR DL 3:
//  LOG  {"aiDataPairs": {"01": "08580000000030", "10": "cheese858", "11": "250630", "15": "291124"}, "aiDataStr": "(01)08580000000030(10)cheese858(11)250630(15)291124", "aiOrder": ["01", "10", "11", "15"], "dataStr": "https://id.gs1sk.org/01/08580000000030/10/cheese858?11=250630&15=291124&linkType=nutritionalInfo", "dlUri": "https://id.gs1.org/01/08580000000030/10/cheese858?11=250630&15=291124", "error": null, "errorMarkup": "", "hri": ["GTIN (01) 08580000000030", "BATCH/LOT (10) cheese858", "PROD DATE (11) 250630", "BEST BEFORE or BEST BY (15) 291124"], "success": true}

//  LOG  Výsledok spracovania bez aim alfanumerické:
//  LOG  {"aiDataPairs": {"01": "00031234000054", "10": "ABC123"}, "aiDataStr": "(01)00031234000054(10)ABC123", "aiOrder": ["01", "10"], "dataStr": "^010003123400005410ABC123", "dlUri": "https://id.gs1.org/01/00031234000054/10/ABC123", "error": null, "errorMarkup": "", "hri": ["GTIN (01) 00031234000054", "BATCH/LOT (10) ABC123"], "success": true}

//  LOG  Výsledok spracovania bez aim ean13:
//  LOG  {"aiDataPairs": {"01": "08580000000009"}, "aiDataStr": "(01)08580000000009", "aiOrder": ["01"], "dataStr": "^0108580000000009", "dlUri": "https://id.gs1.org/01/08580000000009", "error": null, "errorMarkup": "", "hri": ["GTIN (01) 08580000000009"], "success": true}

//  LOG  Výsledok spracovania bez aim ean8:
//  LOG  {"aiDataPairs": {"01": "00000085800007"}, "aiDataStr": "(01)00000085800007", "aiOrder": ["01"], "dataStr": "^0100000085800007", "dlUri": "https://id.gs1.org/01/00000085800007", "error": null, "errorMarkup": "", "hri": ["GTIN (01) 00000085800007"], "success": true}

//  LOG  Výsledok spracovania bez aim itf14:
//  LOG  {"aiDataPairs": {"01": "18580000000006"}, "aiDataStr": "(01)18580000000006", "aiOrder": ["01"], "dataStr": "^0118580000000006", "dlUri": "https://id.gs1.org/01/18580000000006", "error": null, "errorMarkup": "", "hri": ["GTIN (01) 18580000000006"], "success": true}

//  LOG  Výsledok spracovania bez aim numerické:
//  LOG  {"error": "GS1 Syntax Engine Error: Call to function 'EncoderInstance.setDataStr' has been rejected.
// → Caused by: org.gs1.gs1encoders.GS1EncoderParameterException: No known AI is a prefix of: 8580...", "success": false}




