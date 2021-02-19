/* eslint-disable no-undef */

import { WamNode } from '../api/types';

/**
 * The `CompositeAudioNode` can be used to mixin different `AudioNode`s into single one.
 * In the `ParamMgr`'s case. the `ParamMgrNode` can be used to proxy the `WebAudioModule` interface,
 * the `_wamNode`,
 * then let other `AudioNode`s to connect to the host's audio graph, the `_output`.
 */
interface CompositeAudioNode extends Omit<GainNode, keyof EventTarget>, WamNode {
    /**
     * `undefined` by default, override it for proxying the interface
     */
    _wamNode: WamNode;
    /**
     * `undefined` by default, override it after calling every `this.connect()`
     */
    _output: AudioNode;
    readonly gain: AudioParam;
}
declare const CompositeAudioNode: {
    prototype: CompositeAudioNode;
    new (audioContext: BaseAudioContext, options?: GainOptions): CompositeAudioNode;
};

export default CompositeAudioNode;
