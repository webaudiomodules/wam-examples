import { WamSDKBaseModuleScope, WamParameterInterpolatorMap } from "../../sdk";
import { WamParameterInfoMap, WamProcessor } from "../../api";

interface WebAudioControlsWidget extends HTMLElement { value: number }

export interface WamExampleTemplateModuleScope extends WamSDKBaseModuleScope {
    WamExampleTemplateSynth?: typeof WamExampleTemplateSynth;
    WamExampleTemplateEffect?: typeof WamExampleTemplateEffect;
    WebAudioControlsWidget?: WebAudioControlsWidget;
}

export interface WamExampleTemplateProcessor extends WamProcessor {}

export const WamExampleTemplateProcessor: {
    prototype: WamExampleTemplateProcessor;
    new (options: AudioWorkletNodeOptions): WamExampleTemplateProcessor;
};

export interface WamExampleTemplateSynthConfig {
    numChannels?: number;
    numVoices?: number;
    passInput?: boolean;
}

export interface WamExampleTemplateSynth {
    reset(): void;
    noteOn(channel: number, note: number, velocity: number): void;
    noteOff(channel: number, note: number, velocity: number): void;
    noteEnd(voiceIdx: number): void;
    process(startSample: number, endSample: number, inputs: Float32Array[], outputs: Float32Array[]): void;
}

export const WamExampleTemplateSynth: {
    prototype: WamExampleTemplateEffect;
    generateWamParameterInfo(): WamParameterInfoMap;
    new (parameterInterpolators: WamParameterInterpolatorMap, samplesPerQuantum: number, sampleRate: number, config: WamExampleTemplateSynthConfig): WamExampleTemplateSynth;
}

export interface WamExampleTemplateEffectConfig {
    numChannels?: number;
    inPlace?: boolean;
}

export interface WamExampleTemplateEffect {
    reset(): void;
    process(startSample: number, endSample: number, inputs: Float32Array[], outputs: Float32Array[]): void;
}

export const WamExampleTemplateEffect: {
    prototype: WamExampleTemplateEffect;
    generateWamParameterInfo(): WamParameterInfoMap;
    new (parameterInterpolators: WamParameterInterpolatorMap, samplesPerQuantum: number, sampleRate: number, config: WamExampleTemplateEffectConfig): WamExampleTemplateEffect;
}