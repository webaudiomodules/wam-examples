import AudioWorkletRegister from './AudioWorkletRegister';
import ParamMgrNode from './ParamMgrNode';
import WebAudioPlugin from '../WebAudioPlugin';

declare class ParamMgrRegister extends AudioWorkletRegister {
	/**
	 * Get a ParamManager as an AudioWorkletNode instance
	 *
	 * @static
	 * @template P Params
	 * @template I InternalParams
     * @param {WebAudioPlugin} plugin the plugin instance
	 * @param {Record<string, number>} initialParamsValue initial params values
	 * @returns {Promise<ParamMgrNode>} `ParamMgrNode` instance
	 * @memberof ParamMgrRegister
	 */
	static async getNode<P extends string = string, I extends string = string>(plugin: WebAudioPlugin<any, P, I>, initialParamsValue: Record<P, number>): Promise<ParamMgrNode<P, I>>
}
export default ParamMgrRegister;
