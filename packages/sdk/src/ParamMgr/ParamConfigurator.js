/* eslint-disable max-len */
/* eslint-disable no-underscore-dangle */
/** @typedef {import('../api/types').WamParameterConfiguration} WamParameterConfiguration */
/** @typedef {import('../api/types').WamParameterInfoMap} WamParameterInfoMap */
/** @typedef {import('./types').ParametersMapping} ParametersMapping */
/** @typedef {import('./types').InternalParametersDescriptor} InternalParametersDescriptor */
/** @typedef {import('./types').ParametersMappingConfiguratorOptions} ParametersMappingConfiguratorOptions */

import WamParameterInfo from '../WamParameterInfo.js';

export default class ParamMappingConfigurator {
	/**
	 * @param {ParametersMappingConfiguratorOptions} [options = {}]
	 */
	constructor(options = {}) {
		const { paramsConfig, paramsMapping, internalParamsConfig } = options;
		this._paramsConfig = paramsConfig;
		this._paramsMapping = paramsMapping;
		this._internalParamsConfig = internalParamsConfig;
	}

	/**
	 * @private
	 * @type {Record<string, WamParameterConfiguration>}
	 */
	_paramsConfig = undefined;

	/**
	 * Auto-completed `paramsConfig`:
	 *
	 * if no `paramsConfig` is defined while initializing, this will be be filled from the internalParamsConfig;
	 *
	 * if a parameter is not fully configured, the incompleted properties will have the same value as in the internalParamsConfig.
	 *
	 * @type {WamParameterInfoMap}
	 */
	get paramsConfig() {
		const { internalParamsConfig } = this;
		return Object.entries(this._paramsConfig || internalParamsConfig)
			.reduce((configs, [id, config]) => {
				const internalParam = internalParamsConfig[id];
				configs[id] = new WamParameterInfo(id, {
					...config,
					defaultValue: config.defaultValue ?? internalParam?.defaultValue,
					minValue: config.minValue ?? internalParam?.minValue,
					maxValue: config.maxValue ?? internalParam?.maxValue,
				});
				return configs;
			}, {});
	}

	/**
	 * @private
	 * @type {InternalParametersDescriptor}
	 */
	_internalParamsConfig = undefined;

	/**
	 * Auto-completed configuration of the `internalParamsConfig`
	 *
	 * Internal Parameters Config contains all the automatable parameters' information.
	 *
	 * An automatable parameter could be a `WebAudio` `AudioParam`
	 * or a config with an `onChange` callback that will be called while the value has been changed.
	 *
	 * @type {InternalParametersDescriptor}
	 */
	get internalParamsConfig() {
		return Object.entries(this._internalParamsConfig || {})
			.reduce((configs, [name, config]) => {
				if (config instanceof AudioParam) configs[name] = config;
				else {
					const defaultConfig = {
						minValue: 0,
						maxValue: 1,
						defaultValue: 0,
						automationRate: 30,
					};
					configs[name] = { ...defaultConfig, ...config };
				}
				return configs;
			}, {});
	}

	/**
	 * @private
	 * @type {ParametersMapping}
	 */
	_paramsMapping = {}

	/**
	 * Auto-completed `paramsMapping`,
	 * the mapping can be omitted while initialized,
	 * but is useful when an exposed param (in the `paramsConfig`) should automate
	 * several internal params (in the `internalParamsConfig`) or has a different range there.
	 *
	 * If a parameter is present in both `paramsConfig` and `internalParamsConfig` (or the `paramsConfig` is not configured),
	 * a map of this parameter will be there automatically, if not declared explicitly.
	 *
	 * @type {ParametersMapping}
	 */
	get paramsMapping() {
		const declared = this._paramsMapping || {};
		const externalParams = this.paramsConfig;
		const internalParams = this.internalParamsConfig;
		return Object.entries(externalParams)
			.reduce((mapping, [name, { minValue, maxValue }]) => {
				const sourceRange = [minValue, maxValue];
				const defaultMapping = { sourceRange, targetRange: [...sourceRange] };
				if (declared[name]) {
					const declaredTargets = Object.entries(declared[name])
						.reduce((targets, [targetName, targetMapping]) => {
							if (internalParams[targetName]) {
								targets[targetName] = { ...defaultMapping, ...targetMapping };
							}
							return targets;
						}, {});
					mapping[name] = declaredTargets;
				} else if (internalParams[name]) {
					mapping[name] = { [name]: { ...defaultMapping } };
				}
				return mapping;
			}, {});
	}
}
