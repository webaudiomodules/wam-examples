import { AudioWorkletGlobalScope as IAudioWorkletGlobalScope, WamProcessor, WamArrayRingBuffer } from "../../sdk";
import getWamExampleSynth from "./WamExampleSynth";
import getWamExampleEffect from "./WamExampleEffect";
import getWamExampleComponents from "./WamExampleComponents";

export interface WebAudioControlsWidget extends HTMLElement { value: number; }
export type WamExampleComponents = ReturnType<typeof getWamExampleComponents>;
export const WamExampleDcBlockerFilter: WamExampleComponents["WamExampleDcBlockerFilter"];
export interface WamExampleDcBlockerFilter extends InstanceType<WamExampleComponents["WamExampleDcBlockerFilter"]> {}
export const WamExampleLowpassFilter: WamExampleComponents["WamExampleLowpassFilter"];
export interface WamExampleLowpassFilter extends InstanceType<WamExampleComponents["WamExampleLowpassFilter"]> {}
export const WamExampleEffect: ReturnType<typeof getWamExampleEffect>;
export interface WamExampleEffect extends InstanceType<ReturnType<typeof getWamExampleEffect>> {}
export const WamExampleSynth: ReturnType<typeof getWamExampleSynth>;
export interface WamExampleSynth extends InstanceType<ReturnType<typeof getWamExampleSynth>> {}
export interface AudioWorkletGlobalScope extends IAudioWorkletGlobalScope {
    WamProcessor: typeof WamProcessor;
    WamArrayRingBuffer: typeof WamArrayRingBuffer;
    WamExampleSynth: typeof WamExampleSynth;
    WamExampleEffect: typeof WamExampleEffect;
    WamExampleComponents: WamExampleComponents;
}
