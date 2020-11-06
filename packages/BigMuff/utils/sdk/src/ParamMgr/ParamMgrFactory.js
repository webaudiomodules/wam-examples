/* eslint-disable object-curly-newline */
/* eslint-disable max-len */
import AudioWorkletRegister from './AudioWorkletRegister.js';
import processor from './ParamMgrProcessor.js';
import ParamMappingConfigurator from './ParamConfigurator.js';
import ParamMgrNode from './ParamMgrNode.js';
/** @typedef { import('../api/types').WebAudioModule } WebAudioModule */
/** @typedef { import('./types').ParametersMappingConfiguratorOptions } ParametersMappingConfiguratorOptions */
/** @typedef { import('./types').ParamMgrOptions } ParamMgrOptions */

export default class ParamMgrFactory {
	/**
	 * @param {WebAudioModule} module
	 * @param {ParametersMappingConfiguratorOptions} [optionsIn = {}]
	 */
	static async create(module, optionsIn = {}) {
		const { audioContext, moduleId: processorId, instanceId } = module;
		const { paramsConfig, paramsMapping, internalParamsConfig } = new ParamMappingConfigurator(optionsIn);
		const initialParamsValue = Object.entries(paramsConfig)
			.reduce((currentParams, [name, { defaultValue }]) => {
				currentParams[name] = defaultValue;
				return currentParams;
			}, {});
		const serializableParamsConfig = Object.entries(paramsConfig)
			.reduce((currentParams, [name, { id, label, type, defaultValue, minValue, maxValue, discreteStep, exponent, choices, units }]) => {
				currentParams[name] = { id, label, type, defaultValue, minValue, maxValue, discreteStep, exponent, choices, units };
				return currentParams;
			}, {});
		await AudioWorkletRegister.register(processorId, processor, audioContext.audioWorklet, serializableParamsConfig);
		/** @type {ParamMgrOptions} */
		const options = {
			internalParamsConfig,
			parameterData: initialParamsValue,
			processorOptions: {
				paramsConfig,
				paramsMapping,
				internalParamsMinValues: Object.values(internalParamsConfig)
					.map((config) => Math.max(0, config?.minValue || 0)),
				internalParams: Object.keys(internalParamsConfig),
				instanceId,
				processorId,
			},
		};
		const node = new ParamMgrNode(module, options);
		await node.initialize();
		return node;
	}
}
