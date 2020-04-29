import WebAudioPlugin from "./WebAudioPlugin";
import { LoadPluginOptions } from "./Loader";

interface CompositeAudioNode extends GainNode {
    _input: GainNode;
    _output: GainNode;
    gain: AudioParam;
    createNodes(): void;
    connectNodes(): void;
    setup(): void;
}
declare const CompositeAudioNode: {
    prototype: CompositeAudioNode;
    new (audioContext: BaseAudioContext, options?: { plugin?: WebAudioPlugin }): CompositeAudioNode;
};

export default CompositeAudioNode;
