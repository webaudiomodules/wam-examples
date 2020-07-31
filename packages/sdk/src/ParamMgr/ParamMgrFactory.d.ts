/* eslint-disable max-len */
import { WebAudioModule } from '../api/types';
import ParamMgrNode from './ParamMgrNode.js';
import { ParametersMappingConfiguratorOptions } from './types';

declare class ParamMgrFactory {
	/**
	 * Get a ParamManager as an AudioWorkletNode instance
	 *
     * @param {WebAudioModule} module the module instance
	 * @param {ParametersMappingConfiguratorOptions} [optionsIn = {}]
	 */
	static create<Params extends string = string, InternalParams extends string = string>(module: WebAudioModule, optionsIn?: ParametersMappingConfiguratorOptions): Promise<ParamMgrNode<Params, InternalParams>>;
}
export default ParamMgrFactory;
