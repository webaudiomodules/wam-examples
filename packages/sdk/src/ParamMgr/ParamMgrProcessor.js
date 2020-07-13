/* eslint-disable prefer-destructuring */
/* eslint-disable class-methods-use-this */
/* eslint-disable max-len */
/* eslint-disable no-undef */
/* eslint-disable no-plusplus */
/** @typedef { import('sdk/src/api/WamTypes').WamProcessor } WamProcessor */
/** @typedef { import('sdk/src/api/WamTypes').WamParameterInfoMap } WamParameterInfoMap */
/** @typedef { import('sdk/src/api/WamTypes').WamParameterValueMap } WamParameterValueMap */
/** @template O @typedef { import('sdk/src/api/WamTypes').TypedAudioWorkletNodeOptions<O> } TypedAudioWorkletNodeOptions */
/** @typedef { import('sdk/src/api/WamTypes').WamMessagePortData } WamMessagePortData */
/** @typedef { import('sdk/src/api/WamTypes').WamNodeFunctionMap } WamNodeFunctionMap */
/** @typedef { import('sdk/src/api/WamTypes').WamNodeOptions } WamNodeOptions */
/** @typedef { import('sdk/src/api/WamTypes').AudioWorkletGlobalScope } AudioWorkletGlobalScope */

/**
 * Main function to stringify as a worklet.
 *
 * @param {string} processorId processor identifier
 * @param {WamParameterInfoMap} paramsConfig parameterDescriptors
 */
const processor = (processorId, paramsConfig) => {
	/** @type {AudioWorkletGlobalScope} */
	// @ts-ignore
	const audioWorkletGlobalScope = globalThis;
	const supportSharedArrayBuffer = !!globalThis.SharedArrayBuffer;
	const SharedArrayBuffer = globalThis.SharedArrayBuffer || globalThis.ArrayBuffer;
	const normExp = (x, e) => (e === 0 ? x : x ** (1.5 ** -e));
	const denormExp = (x, e) => (e === 0 ? x : x ** (1.5 ** e));
	const normalizeE = (x, min, max, e = 0) => (
		min === 0 && max === 1
			? normExp(x, e)
			: normExp((x - min) / (max - min) || 0, e));
	const denormalizeE = (x, min, max, e = 0) => (
		min === 0 && max === 1
			? denormExp(x, e)
			: denormExp(x, e) * (max - min) + min
	);
	const normalize = (x, min, max) => (min === 0 && max === 1 ? x : (x - min) / (max - min) || 0);
	const denormalize = (x, min, max) => (min === 0 && max === 1 ? x : x * (max - min) + min);
	const mapValue = (x, eMin, eMax, sMin, sMax, tMin, tMax) => (
		denormalize(
			normalize(
				normalize(
					Math.min(sMax, Math.max(sMin, x)),
					eMin,
					eMax,
				),
				normalize(sMin, eMin, eMax),
				normalize(sMax, eMin, eMax),
			),
			tMin,
			tMax,
		)
	);
	const { AudioWorkletProcessor, registerProcessor } = audioWorkletGlobalScope;

	/**
	 * @typedef {Partial<WamMessagePortData> & Record<string, any>} T
	 * @typedef {Partial<WamMessagePortData> & Record<string, any>} F
	 * @typedef {{
	 * 		paramsConfig: WamParameterInfoMap;
	 * 		paramsMapping: ParametersMapping;
	 * 		internalParamsMinValues: number[];
	 * 		internalParams: string[];
	 * 		instanceId: string;
	 * }} O
	 */
	/**
	 * `ParamMgrNode`'s `AudioWorkletProcessor`
	 *
	 * @class ParamMgrProcessor
	 * @extends {AudioWorkletProcessor<T, F>}
	 * @implements {WamProcessor}
	 */
	class ParamMgrProcessor extends AudioWorkletProcessor {
		static get parameterDescriptors() {
			return Object.entries(paramsConfig).map(([name, { defaultValue, minValue, maxValue }]) => ({
				name,
				defaultValue,
				minValue,
				maxValue,
			}));
		}

		static generateWamParameterInfo() {
			return paramsConfig;
		}

		/**
		 * @param {TypedAudioWorkletNodeOptions<O> & WamNodeOptions} options
		 * @memberof ParamMgrProcessor
		 */
		constructor(options) {
			super(options);
			this.destroyed = false;
			this.supportSharedArrayBuffer = supportSharedArrayBuffer;
			const {
				paramsMapping,
				internalParamsMinValues,
				internalParams,
				instanceId,
			} = options.processorOptions;
			this.processorId = processorId;
			this.instanceId = instanceId;
			this.internalParamsMinValues = internalParamsMinValues;
			this.paramsConfig = paramsConfig;
			this.paramsMapping = paramsMapping;
			/** @type {Record<string, number>} */
			this.paramsValues = {};
			Object.entries(paramsConfig).forEach(([name, { defaultValue }]) => {
				this.paramsValues[name] = defaultValue;
			});
			this.internalParams = internalParams;
			this.internalParamsCount = this.internalParams.length;
			this.buffer = new SharedArrayBuffer(
				(this.internalParamsCount + 1) * Float32Array.BYTES_PER_ELEMENT,
			);
			this.$lock = new Int32Array(this.buffer, 0, 1);
			this.$internalParamsBuffer = new Float32Array(this.buffer, 4, this.internalParamsCount);
			this.port.onmessage = (e) => {
				const { id, call, args } = e.data;
				const r = { id };
				try {
					r.value = this[call](...args);
				} catch (error) {
					r.error = error;
				}
				this.port.postMessage(r);
				if (e.data.destroy) this.destroy();
				else if (e.data.paramsMapping) this.paramsMapping = e.data.paramsMapping;
				else if (e.data.buffer) {
					this.port.postMessage({ buffer: { lock: this.$lock, paramsBuffer: this.$internalParamsBuffer } });
				}
			};
		}

		getCompensationDelay() {
			return 128;
		}

		/**
		 * @param {string | string[]} [parameterIdQuery]
		 */
		getParameterInfo(parameterIdQuery) {
			if (!parameterIdQuery) parameterIdQuery = Object.keys(this.paramsConfig);
			else if (typeof parameterIdQuery === 'string') parameterIdQuery = [parameterIdQuery];
			/** @type {WamParameterInfoMap} */
			const parameterInfo = {};
			parameterIdQuery.forEach((parameterId) => {
				parameterInfo[parameterId] = this.paramsConfig[parameterId];
			});
			return parameterInfo;
		}

		/**
		 * @param {boolean} [normalized]
		 * @param {string | string[]} [parameterIdQuery]
		 */
		getParameterValues(normalized, parameterIdQuery) {
			if (!parameterIdQuery) parameterIdQuery = Object.keys(this.paramsConfig);
			else if (typeof parameterIdQuery === 'string') parameterIdQuery = [parameterIdQuery];
			/** @type {WamParameterValueMap} */
			const parameterValues = {};
			parameterIdQuery.forEach((parameterId) => {
				const parameter = this.$internalParamsBuffer[parameterId];
				if (!parameter) return;
				parameterValues[parameterId] = {
					id: parameterId,
					value: normalized ? parameter.normalizedValue : parameter.value,
					normalized,
				};
			});
		}

		lock() {
			if (globalThis.Atomics) Atomics.store(this.$lock, 0, 1); // eslint-disable-line no-undef
		}

		unlock() {
			if (globalThis.Atomics) Atomics.store(this.$lock, 0, 0); // eslint-disable-line no-undef
		}

		/**
		 * Main process
		 *
		 * @param {Float32Array[][]} inputs
		 * @param {Float32Array[][]} outputs
		 * @param {Record<string, Float32Array>} parameters
		 * @memberof ParamMgrProcessor
		 */
		process(inputs, outputs, parameters) {
			if (this.destroyed) return false;
			this.lock();
			Object.entries(this.paramsConfig).forEach(([name, { minValue, maxValue }]) => {
				const raw = parameters[name];
				if (name in this.paramsValues) this.paramsValues[name] = raw[raw.length - 1];
				if (!this.paramsMapping[name]) return;
				Object.entries(this.paramsMapping[name]).forEach(([targetName, targetMapping]) => {
					const j = this.internalParams.indexOf(targetName);
					if (j === -1) return;
					const intrinsicValue = this.internalParamsMinValues[j];
					const { sourceRange, targetRange } = targetMapping;
					const [sMin, sMax] = sourceRange;
					const [tMin, tMax] = targetRange;
					let out;
					if (minValue !== tMin || maxValue !== tMax
							|| minValue !== sMin || maxValue !== sMax) {
						out = raw.map((v) => {
							const mappedValue = mapValue(v, minValue, maxValue, sMin, sMax, tMin, tMax);
							return mappedValue - intrinsicValue;
						});
					} else if (intrinsicValue) {
						out = raw.map((v) => v - intrinsicValue);
					} else {
						out = raw;
					}
					if (out.length === 1) outputs[j + 1][0].fill(out[0]);
					else outputs[j + 1][0].set(out);
					this.$internalParamsBuffer[j] = out[0]; // eslint-disable-line prefer-destructuring
				});
			});
			this.unlock();
			if (!this.supportSharedArrayBuffer) {
				this.port.postMessage({ buffer: { lock: this.$lock, paramsBuffer: this.$internalParamsBuffer } });
			}
			return true;
		}

		destroy() {
			this.destroyed = true;
		}
	}
	registerProcessor(processorId, ParamMgrProcessor);
};
export default processor;
