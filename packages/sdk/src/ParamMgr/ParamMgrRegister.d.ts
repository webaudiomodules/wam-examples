/* eslint-disable max-len */
import { WebAudioModule } from '../api/types';
import { ParamMgrOptions, ParametersMappingConfiguratorOptions } from './types';

declare class ParamMgrRegister {
	/**
	 * Get a ParamManager as an AudioWorkletNode instance
	 *
     * @param {WebAudioModule} module the module instance
	 * @param {number} [numberOfInputs = 1]
	 * @param {ParametersMappingConfiguratorOptions} [optionsIn = {}]
	 */
	static register(module: WebAudioModule, numberOfInputs?: number, optionsIn?: ParametersMappingConfiguratorOptions): Promise<ParamMgrOptions>;
}
export default ParamMgrRegister;
