/* eslint-disable object-curly-newline */
/* eslint-disable prefer-destructuring */
/* eslint-disable class-methods-use-this */
/* eslint-disable max-len */
/* eslint-disable no-undef */
/* eslint-disable no-plusplus */
/** @typedef {import('../api/types').WamProcessor} WamProcessor */
/** @typedef {import('../api/types').WamParameterInfoMap} WamParameterInfoMap */
/** @typedef {import('../api/types').WamParameterDataMap} WamParameterValueMap */
/** @typedef {import('../api/types').WamEvent} WamEvent */
/** @typedef {import('./types').ParamMgrOptions} ParamMgrProcessorOptions */
/** @typedef {import('./TypedAudioWorklet').AudioWorkletGlobalScope} AudioWorkletGlobalScope */
/** @typedef {import('./TypedAudioWorklet').TypedAudioWorkletProcessor} AudioWorkletProcessor */
/** @template M @typedef {import('./types').MessagePortRequest<M>} MessagePortRequest */
/** @template M @typedef {import('./types').MessagePortResponse<M>} MessagePortResponse */
/** @typedef {import('./types').ParamMgrCallFromProcessor} ParamMgrCallFromProcessor */
/** @typedef {import('./types').ParamMgrCallToProcessor} ParamMgrCallToProcessor */
/** @typedef {import('./types').ParamMgrAudioWorkletOptions} ParamMgrAudioWorkletOptions */
/** @typedef {import('./types').ParametersMapping} ParametersMapping */

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
	const { AudioWorkletProcessor, registerProcessor } = audioWorkletGlobalScope;
	const supportSharedArrayBuffer = !!globalThis.SharedArrayBuffer;
	const SharedArrayBuffer = globalThis.SharedArrayBuffer || globalThis.ArrayBuffer;
	const normExp = (x, e) => (e === 0 ? x : x ** (1.5 ** -e));
	const normalizeE = (x, min, max, e = 0) => (
		min === 0 && max === 1
			? normExp(x, e)
			: normExp((x - min) / (max - min) || 0, e));
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

	/**
	 * @typedef {MessagePortRequest<ParamMgrCallToProcessor> & MessagePortResponse<ParamMgrCallFromProcessor>} MsgIn
	 * @typedef {MessagePortResponse<ParamMgrCallToProcessor> & MessagePortRequest<ParamMgrCallFromProcessor>} MsgOut
	 */
	/**
	 * `ParamMgrNode`'s `AudioWorkletProcessor`
	 *
	 * @extends {AudioWorkletProcessor<MsgIn, MsgOut>}
	 * @implements {WamProcessor}
	 * @implements {ParamMgrCallToProcessor}
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

		/**
		 * @param {ParamMgrProcessorOptions} options
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
			this.moduleId = processorId;
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
			this.buffer = new SharedArrayBuffer((this.internalParamsCount + 1) * Float32Array.BYTES_PER_ELEMENT);
			this.$lock = new Int32Array(this.buffer, 0, 1);
			this.$internalParamsBuffer = new Float32Array(this.buffer, 4, this.internalParamsCount);
			/** @type {WamEvent[]} */
			this.eventQueue = [];

			audioWorkletGlobalScope.webAudioModules.create(this);

			this.messagePortRequestId = -1;
			/** @type {Record<number, ((...args: any[]) => any)>} */
			const resolves = {};
			/** @type {Record<number, ((...args: any[]) => any)>} */
			const rejects = {};
			/**
			 * @param {keyof ParamMgrCallFromProcessor} call
			 * @param {any} args
			 */
			this.call = (call, ...args) => new Promise((resolve, reject) => {
				const id = this.messagePortRequestId--;
				resolves[id] = resolve;
				rejects[id] = reject;
				this.port.postMessage({ id, call, args });
			});
			this.handleMessage = ({ data }) => {
				const { id, call, args, value, error } = data;
				if (call) {
					/** @type {any} */
					const r = { id };
					try {
						r.value = this[call](...args);
					} catch (e) {
						r.error = e;
					}
					this.port.postMessage(r);
				} else {
					if (error) {
						if (rejects[id]) rejects[id](error);
						delete rejects[id];
						return;
					}
					if (resolves[id]) {
						resolves[id](value);
						delete resolves[id];
					}
				}
			};
			this.port.start();
			this.port.addEventListener('message', this.handleMessage);
		}

		/**
		 * @param {ParametersMapping} mapping
		 */
		setParamsMapping(mapping) {
			this.paramsMapping = mapping;
		}

		getBuffer() {
			return { lock: this.$lock, paramsBuffer: this.$internalParamsBuffer };
		}

		getCompensationDelay() {
			return 128;
		}

		/**
		 * @param {string[]} parameterIdQuery
		 */
		getParameterInfo(...parameterIdQuery) {
			if (parameterIdQuery.length === 0) parameterIdQuery = Object.keys(this.paramsConfig);
			/** @type {WamParameterInfoMap} */
			const parameterInfo = {};
			parameterIdQuery.forEach((parameterId) => {
				parameterInfo[parameterId] = this.paramsConfig[parameterId];
			});
			return parameterInfo;
		}

		/**
		 * @param {boolean} [normalized]
		 * @param {string[]} parameterIdQuery
		 */
		getParameterValues(normalized, ...parameterIdQuery) {
			if (parameterIdQuery.length === 0) parameterIdQuery = Object.keys(this.paramsConfig);
			/** @type {WamParameterValueMap} */
			const parameterValues = {};
			parameterIdQuery.forEach((parameterId) => {
				if (!(parameterId in this.paramsValues)) return;
				const { minValue, maxValue, exponent } = this.paramsConfig[parameterId];
				const value = this.paramsValues[parameterId];
				parameterValues[parameterId] = {
					id: parameterId,
					value: normalized ? normalizeE(value, minValue, maxValue, exponent) : value,
					normalized,
				};
			});
			return parameterValues;
		}

		/**
		 * @param {WamEvent[]} events
		 */
		scheduleEvents(...events) {
			this.eventQueue.push(...events);
			this.eventQueue.sort((a, b) => a.time - b.time);
		}

		get downstream() {
			const wams = new Set();
			const { graph } = audioWorkletGlobalScope.webAudioModules;
			if (!graph.has(this)) return wams;
			const outputMap = graph.get(this);
			outputMap.forEach((set) => {
				if (set) set.forEach((wam) => wams.add(wam));
			});
			return wams;
		}

		emitEvents(...events) {
			const { graph } = audioWorkletGlobalScope.webAudioModules;
			if (!graph.has(this)) return;
			const downstream = graph.get(this);
			downstream.forEach((set) => {
				if (set) set.forEach((wam) => wam.scheduleEvents(...events));
			});
		}

		clearEvents() {
			this.eventQueue = [];
		}

		lock() {
			if (globalThis.Atomics) Atomics.store(this.$lock, 0, 1);
		}

		unlock() {
			if (globalThis.Atomics) Atomics.store(this.$lock, 0, 0);
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
			const outputOffset = 1;
			this.lock();
			Object.entries(this.paramsConfig).forEach(([name, { minValue, maxValue }]) => {
				const raw = parameters[name];
				if (name in this.paramsValues) this.paramsValues[name] = raw[raw.length - 1]; // Store to local temporary
				if (!this.paramsMapping[name]) return; // No need to output
				Object.entries(this.paramsMapping[name]).forEach(([targetName, targetMapping]) => {
					const j = this.internalParams.indexOf(targetName);
					if (j === -1) return;
					const intrinsicValue = this.internalParamsMinValues[j]; // Output will be added to target intrinsicValue
					const { sourceRange, targetRange } = targetMapping;
					const [sMin, sMax] = sourceRange;
					const [tMin, tMax] = targetRange;
					let out;
					if (minValue !== tMin || maxValue !== tMax
							|| minValue !== sMin || maxValue !== sMax) { // need to calculate with mapping
						out = raw.map((v) => {
							const mappedValue = mapValue(v, minValue, maxValue, sMin, sMax, tMin, tMax);
							return mappedValue - intrinsicValue;
						});
					} else if (intrinsicValue) { // need to correct with intrinsicValue
						out = raw.map((v) => v - intrinsicValue);
					} else { // No need to modify
						out = raw;
					}
					if (out.length === 1) outputs[j + outputOffset][0].fill(out[0]);
					else outputs[j + outputOffset][0].set(out);
					this.$internalParamsBuffer[j] = out[0]; // eslint-disable-line prefer-destructuring
				});
			});
			this.unlock();
			if (!this.supportSharedArrayBuffer) {
				this.call('setBuffer', { lock: this.$lock, paramsBuffer: this.$internalParamsBuffer });
			}
			const { currentTime } = audioWorkletGlobalScope;
			let $event;
			for ($event = 0; $event < this.eventQueue.length; $event++) {
				const event = this.eventQueue[$event];
				if (event.time && event.time > currentTime) break;
				this.call('dispatchWamEvent', event);
			}
			if ($event) this.eventQueue.splice(0, $event);
			return true;
		}

		destroy() {
			audioWorkletGlobalScope.webAudioModules.destroy(this);
			this.destroyed = true;
			this.port.close();
		}
	}
	try {
		registerProcessor(processorId, ParamMgrProcessor);
	} catch (error) {
		// eslint-disable-next-line no-console
		console.warn(error);
	}
};
export default processor;
