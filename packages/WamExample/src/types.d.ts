import { AudioWorkletGlobalScope as IAudioWorkletGlobalScope } from "sdk/src/types";
import WamExampleSynth from "./WamExampleSynth";
import WamExampleEffect from "./WamExampleEffect";
import { WamExampleDcBlockerFilter, WamExampleLowpassFilter } from "./WamExampleComponents";

export interface AudioWorkletGlobalScope extends IAudioWorkletGlobalScope {
    WamExampleSynth: typeof WamExampleSynth;
    WamExampleEffect: typeof WamExampleEffect;
    WamExampleComponents: {
        WamExampleLowpassFilter: typeof WamExampleLowpassFilter
        WamExampleDcBlockerFilter: typeof WamExampleDcBlockerFilter
    }
}
