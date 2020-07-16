/* eslint-disable max-len */
import ParamMgrNode from './ParamMgrNode';
import { WebAudioModule } from '../api/WamTypes';

declare class ParamMgrRegister {
	/**
	 * Get a ParamManager as an AudioWorkletNode instance
	 *
	 * @static
	 * @template P Params
	 * @template I InternalParams
     * @param {WebAudioModule} module the module instance
	 * @param {Record<string, number>} initialParamsValue initial params values
	 * @returns {Promise<ParamMgrNode>} `ParamMgrNode` instance
	 * @memberof ParamMgrRegister
	 */
	static register<P extends string = string, I extends string = string>(module: WebAudioModule, initialParamsValue: Record<P, number>): Promise<ParamMgrNode<P, I>>
}
export default ParamMgrRegister;
