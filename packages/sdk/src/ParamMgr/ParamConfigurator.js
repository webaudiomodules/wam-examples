/* eslint-disable max-len */
/* eslint-disable no-underscore-dangle */
/** @typedef { import('../api/WamTypes').WamParameterConfiguration } WamParameterConfiguration */
/** @typedef { import('../api/WamTypes').WamParameterInfoMap } WamParameterInfoMap */
/** @typedef { import('./types').ParametersMapping } ParametersMapping */
/** @typedef { import('./types').InternalParametersDescriptor } InternalParametersDescriptor */
/** @typedef { import('./types').ParametersMappingConfiguratorOptions } ParametersMappingConfiguratorOptions */

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
