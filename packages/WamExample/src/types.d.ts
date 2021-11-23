import { WamSDKBaseModuleScope, WamParameterInterpolatorMap } from "../../sdk";
import { WamParameterInfoMap, WamProcessor } from "../../api";

interface WebAudioControlsWidget extends HTMLElement { value: number }

export interface WamExampleModuleScope extends WamSDKBaseModuleScope {
    WamExampleSynth?: typeof WamExampleSynth;
    WamExampleEffect?: typeof WamExampleEffect;
    WamExampleComponents?: {
        WamExampleLowpassFilter?: typeof WamExampleLowpassFilter
        WamExampleDcBlockerFilter?: typeof WamExampleDcBlockerFilter
    };
    WebAudioControlsWidget?: WebAudioControlsWidget;
}

export interface WamExampleProcessor extends WamProcessor {}

export const WamExampleProcessor: {
    prototype: WamExampleProcessor;
    new (options: AudioWorkletNodeOptions): WamExampleProcessor;
};

export interface WamExampleSynthConfig {
    numChannels?: number;
    numVoices?: number;
    passInput?: boolean;
}

export interface WamExampleSynth {
    reset(): void;
    noteOn(channel: number, note: number, velocity: number): void;
    noteOff(channel: number, note: number, velocity: number): void;
    noteEnd(voiceIdx: number): void;
    process(startSample: number, endSample: number, inputs: Float32Array[], outputs: Float32Array[]): void;
}

export const WamExampleSynth: {
    prototype: WamExampleEffect;
    generateWamParameterInfo(): WamParameterInfoMap;
    new (parameterInterpolators: WamParameterInterpolatorMap, samplesPerQuantum: number, sampleRate: number, config: WamExampleSynthConfig): WamExampleSynth;
}

export interface WamExampleEffectConfig {
    numChannels?: number;
    inPlace?: boolean;
    lowpassFrequencyHz?: number;
}

export interface WamExampleEffect {
    reset(): void;
    process(startSample: number, endSample: number, inputs: Float32Array[], outputs: Float32Array[]): void;
}

export const WamExampleEffect: {
    prototype: WamExampleEffect;
    generateWamParameterInfo(): WamParameterInfoMap;
    new (parameterInterpolators: WamParameterInterpolatorMap, samplesPerQuantum: number, sampleRate: number, config: WamExampleEffectConfig): WamExampleEffect;
}

export interface WamExampleComponent {
    reset(): void;
    process(startSample: number, endSample: number, signal: Float32Array): void;
}

export interface WamExampleLowpassFilter extends WamExampleComponent {
    update(frequencyHz: number, sampleRate: number): void;
}

export const WamExampleLowpassFilter: {
    prototype: WamExampleLowpassFilter;
    new (): WamExampleLowpassFilter;
}

export interface WamExampleDcBlockerFilter extends WamExampleComponent {
    update(alpha: number): void;
}

export const WamExampleDcBlockerFilter: {
    prototype: WamExampleDcBlockerFilter;
    new (alpha?: number): WamExampleDcBlockerFilter;
}