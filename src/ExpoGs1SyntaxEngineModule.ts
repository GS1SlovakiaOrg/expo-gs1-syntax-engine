import { requireNativeModule } from 'expo';

// declare class ExpoGs1SyntaxEngineModule extends NativeModule<{}> {}

// export default requireNativeModule<ExpoGs1SyntaxEngineModule>('ExpoGs1SyntaxEngine');

const NativeModule = requireNativeModule('ExpoGs1SyntaxEngine');

export const GS1EncoderNativeInstance = NativeModule.EncoderInstance;
