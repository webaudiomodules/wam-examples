import { AudioWorkletGlobalScope as IAudioWorkletGlobalScope, WamProcessor, WamArrayRingBuffer } from "sdk/src/types";
import WamExampleSynth from "./WamExampleSynth";
import WamExampleEffect from "./WamExampleEffect";
import { WamExampleDcBlockerFilter, WamExampleLowpassFilter } from "./WamExampleComponents";

interface WebAudioControlsWidget extends HTMLElement { value: number }

export interface AudioWorkletGlobalScope extends IAudioWorkletGlobalScope {
    WamProcessor: typeof WamProcessor;
    WamArrayRingBuffer: typeof WamArrayRingBuffer;
    WamExampleSynth: typeof WamExampleSynth;
    WamExampleEffect: typeof WamExampleEffect;
    WamExampleComponents: {
        WamExampleLowpassFilter: typeof WamExampleLowpassFilter
        WamExampleDcBlockerFilter: typeof WamExampleDcBlockerFilter
    };
    WebAudioControlsWidget: WebAudioControlsWidget;
}
