import {requireNativeModule } from 'expo';

const NativeModule = requireNativeModule('ExpoGs1SyntaxEngine');

export const GS1EncoderNativeInstance = NativeModule.EncoderInstance;
