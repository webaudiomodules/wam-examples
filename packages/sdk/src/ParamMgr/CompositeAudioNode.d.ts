import ParamMgrNode from './ParamMgrNode.js';
import { WebAudioModule } from '../api/types';
import { ParamMgrOptions } from './types';

interface CompositeAudioNode extends ParamMgrNode {
    /**
     * `undefined` by default, override it after calling every `this.connect()`
     */
    _output: AudioNode;
}
declare const CompositeAudioNode: {
    prototype: CompositeAudioNode;
    new (module: WebAudioModule, options: ParamMgrOptions): CompositeAudioNode;
};

export default CompositeAudioNode;
