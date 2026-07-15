import { registerWebModule, NativeModule } from 'expo';

// ExpoGs1SyntaxEngineModule is not available on the web platform.
class ExpoGs1SyntaxEngineModule extends NativeModule<{}> {}

export default registerWebModule(ExpoGs1SyntaxEngineModule, 'ExpoGs1SyntaxEngineModule');
