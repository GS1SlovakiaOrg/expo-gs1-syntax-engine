import { NativeModule, requireNativeModule } from 'expo';

declare class ExpoGs1SyntaxEngineModule extends NativeModule<{}> {}

export default requireNativeModule<ExpoGs1SyntaxEngineModule>('ExpoGs1SyntaxEngine');
