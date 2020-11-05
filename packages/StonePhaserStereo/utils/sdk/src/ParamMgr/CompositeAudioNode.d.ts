import { WamNode } from '../api/types';

interface CompositeAudioNode extends Omit<GainNode, keyof EventTarget>, WamNode {
    /**
     * `undefined` by default, override it for proxying the interface
     */
    _wamNode: WamNode;
    /**
     * `undefined` by default, override it after calling every `this.connect()`
     */
    _output: AudioNode;
}
declare const CompositeAudioNode: {
    prototype: CompositeAudioNode;
    new (audioContext: BaseAudioContext, options?: GainOptions): CompositeAudioNode;
};

export default CompositeAudioNode;
