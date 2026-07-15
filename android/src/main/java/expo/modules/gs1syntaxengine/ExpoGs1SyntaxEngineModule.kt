package expo.modules.gs1syntaxengine

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record
import expo.modules.kotlin.sharedobjects.SharedObject

import org.gs1.gs1encoders.GS1Encoder
import org.gs1.gs1encoders.GS1EncoderDigitalLinkException
import org.gs1.gs1encoders.GS1EncoderParameterException
import org.gs1.gs1encoders.GS1EncoderScanDataException
import java.io.IOException

class NativeInitOptions : Record {
  @Field var syntaxDictionary: String? = null
  @Field var fallbackOnSyndictError: Boolean = false
  @Field var noEmbedded: Boolean = false
}

// A class that implements SharedObject, which Expo passes as a reference
class EncoderInstance : SharedObject() {
  var encoder: GS1Encoder? = null
  
  fun getOrThrow(): GS1Encoder {
    return encoder ?: throw IllegalStateException("GS1Encoder instance has not been initialized. Call init() first.")
  }

  override fun deallocate() {
    encoder?.close()
    encoder = null
  }
}

class ExpoGs1SyntaxEngineModule : Module() {
  
  private fun symbologyFromInt(value: Int): GS1Encoder.Symbology {
    return GS1Encoder.Symbology.values().firstOrNull { it.value == value } 
      ?: GS1Encoder.Symbology.NONE
  }

  private fun validationFromInt(value: Int): GS1Encoder.Validation {
    return GS1Encoder.Validation.values().firstOrNull { it.value == value }
      ?: throw IllegalArgumentException("Unknown validation value: $value")
  }

  override fun definition() = ModuleDefinition {
    Name("ExpoGs1SyntaxEngine")

    // Registering a Class in the Expo Modules API
    Class(EncoderInstance::class) {
      
      Constructor {
        EncoderInstance()
      }

      // The first parameter of every lambda must be our instance (named, for example, 'instance')
      AsyncFunction("init") { instance: EncoderInstance, options: NativeInitOptions? ->
        try {
          instance.encoder?.close()
          
          val initOptions = options?.let {
            GS1Encoder.InitOptions().apply {
              it.syntaxDictionary?.let { path -> setSyntaxDictionary(path) }
              setFallbackOnSyndictError(it.fallbackOnSyndictError)
              setNoEmbedded(it.noEmbedded)
            }
          }
          
          instance.encoder = GS1Encoder(initOptions)
        } catch (e: Exception) {
          throw Exception("Failed to initialize GS1Encoder: ${e.message}", e)
        }
      }

      Function("getVersion") { instance: EncoderInstance ->
        instance.getOrThrow().version
      }

      Function("getInitFallbackWarning") { instance: EncoderInstance ->
        instance.getOrThrow().initFallbackWarning
      }

      Function("getSym") { instance: EncoderInstance ->
        instance.getOrThrow().sym.value
      }

      Function("setSym") { instance: EncoderInstance, value: Int ->
        instance.getOrThrow().sym = symbologyFromInt(value)
      }

      Function("getAddCheckDigit") { instance: EncoderInstance ->
        instance.getOrThrow().addCheckDigit
      }

      Function("setAddCheckDigit") { instance: EncoderInstance, value: Boolean ->
        instance.getOrThrow().addCheckDigit = value
      }

      Function("getIncludeDataTitlesInHRI") { instance: EncoderInstance ->
        instance.getOrThrow().includeDataTitlesInHRI
      }

      Function("setIncludeDataTitlesInHRI") { instance: EncoderInstance, value: Boolean ->
        instance.getOrThrow().includeDataTitlesInHRI = value
      }

      Function("getPermitUnknownAIs") { instance: EncoderInstance ->
        instance.getOrThrow().permitUnknownAIs
      }

      Function("setPermitUnknownAIs") { instance: EncoderInstance, value: Boolean ->
        instance.getOrThrow().permitUnknownAIs = value
      }

      Function("getPermitZeroSuppressedGTINinDLuris") { instance: EncoderInstance ->
        instance.getOrThrow().permitZeroSuppressedGTINinDLuris
      }

      Function("setPermitZeroSuppressedGTINinDLuris") { instance: EncoderInstance, value: Boolean ->
        instance.getOrThrow().permitZeroSuppressedGTINinDLuris = value
      }

      Function("getValidationEnabled") { instance: EncoderInstance, validationValue: Int ->
        val validation = validationFromInt(validationValue)
        instance.getOrThrow().getValidationEnabled(validation)
      }

      Function("setValidationEnabled") { instance: EncoderInstance, validationValue: Int, value: Boolean ->
        val validation = validationFromInt(validationValue)
        instance.getOrThrow().setValidationEnabled(validation, value)
      }

      Function("getDataStr") { instance: EncoderInstance ->
        instance.getOrThrow().dataStr
      }

      Function("setDataStr") { instance: EncoderInstance, value: String ->
        instance.getOrThrow().dataStr = value
      }

      Function("getAIdataStr") { instance: EncoderInstance ->
        instance.getOrThrow().aIdataStr
      }

      Function("setAIdataStr") { instance: EncoderInstance, value: String ->
        instance.getOrThrow().aIdataStr = value
      }

      Function("getScanData") { instance: EncoderInstance ->
        instance.getOrThrow().scanData
      }

      Function("setScanData") { instance: EncoderInstance, value: String ->
        instance.getOrThrow().scanData = value
      }

      Function("getErrMarkup") { instance: EncoderInstance ->
        instance.getOrThrow().errMarkup
      }

      Function("getDLuri") { instance: EncoderInstance, stem: String? ->
        instance.getOrThrow().getDLuri(stem)
      }

      Function("getHRI") { instance: EncoderInstance ->
        instance.getOrThrow().hri
      }

      Function("getDLignoredQueryParams") { instance: EncoderInstance ->
        instance.getOrThrow().dLignoredQueryParams
      }

      Function("close") { instance: EncoderInstance ->
        instance.encoder?.close()
        instance.encoder = null
      }
    }
  }
}
