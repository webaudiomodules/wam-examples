import { AudioWorkletGlobalScope as IAudioWorkletGlobalScope } from "sdk/src/types";
import WamExampleTemplateSynth from "./WamExampleTemplateSynth";
import WamExampleTemplateEffect from "./WamExampleTemplateEffect";

interface WebAudioControlsWidget extends HTMLElement { value: number }

export interface AudioWorkletGlobalScope extends IAudioWorkletGlobalScope {
    WamExampleTemplateSynth: typeof WamExampleTemplateSynth;
    WamExampleTemplateEffect: typeof WamExampleTemplateEffect;
    WebAudioControlsWidget: WebAudioControlsWidget;
}
