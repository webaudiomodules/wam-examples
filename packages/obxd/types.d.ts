import { AudioWorkletGlobalScope as IAudioWorkletGlobalScope, WamProcessor } from 'sdk/src/types';

export interface WasmProcessor extends WamProcessor {}

export const WasmProcessor: {
    prototype: WasmProcessor;
    new (options: AudioWorkletNodeOptions): WasmProcessor;
} & Pick<typeof WamProcessor, "parameterDescriptors" | "generateWamParameterInfo">;;

export interface AudioWorkletGlobalScope extends IAudioWorkletGlobalScope {
    WasmProcessor: typeof WasmProcessor;
}
