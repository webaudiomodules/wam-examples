import WebAudioPlugin from "./WebAudioPlugin";

interface CompositeAudioNode extends GainNode {
    _input: GainNode;
    _output: GainNode;
    gain: any;
    createNodes(): Promise<void>;
    connectNodes(): void;
    setup(): Promise<void>;
}
declare const CompositeAudioNode: {
    prototype: CompositeAudioNode;
    new (audioContext: BaseAudioContext, options?: { plugin?: WebAudioPlugin }): CompositeAudioNode;
};

export default CompositeAudioNode;
