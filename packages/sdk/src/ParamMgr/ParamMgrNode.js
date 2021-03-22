/* eslint-disable no-underscore-dangle */
/* eslint-disable object-curly-newline */
/* eslint-disable max-len */
/* eslint-disable no-undef */
/* eslint-disable prefer-destructuring */

import MgrAudioParam from './MgrAudioParam.js';

/** @typedef {import('../api/types').WebAudioModule} WebAudioModule */
/** @typedef {import('../api/types').WamNode} WamNode */
/** @typedef {import('../api/types').WamParameterDataMap} WamParameterValueMap */
/** @typedef {import('../api/types').WamEvent} WamEvent */
/** @typedef {import('./types').ParamMgrOptions} ParamMgrOptions */
/** @typedef {import('./types').ParamMgrCallFromProcessor} ParamMgrCallFromProcessor */
/** @typedef {import('./types').ParamMgrCallToProcessor} ParamMgrCallToProcessor */
/** @typedef {import('./types').ParamMgrNodeMsgIn} ParamMgrNodeMsgIn */
/** @typedef {import('./types').ParamMgrNodeMsgOut} ParamMgrNodeMsgOut */
/** @typedef {import('./types').ParamMgrNode} IParamMgrNode */

/** @type {typeof import('./TypedAudioWorklet').TypedAudioWorkletNode} */
// @ts-ignore
const AudioWorkletNode = globalThis.AudioWorkletNode;

/**
 * @extends {AudioWorkletNode<ParamMgrNodeMsgIn, ParamMgrNodeMsgOut>}
 * @implements {IParamMgrNode}
 */
export default class ParamMgrNode extends AudioWorkletNode {
	/**
     * @param {WebAudioModule} module
     * @param {ParamMgrOptions} options
     */
	constructor(module, options) {
		super(module.audioContext, module.moduleId, {
			numberOfInputs: 0,
			numberOfOutputs: 1 + options.processorOptions.internalParams.length,
			parameterData: options.parameterData,
			processorOptions: options.processorOptions,
		});
		const { processorOptions, internalParamsConfig } = options;
		this.initialized = false;
		this.module = module;
		this.paramsConfig = processorOptions.paramsConfig;
		this.internalParams = processorOptions.internalParams;
		this.internalParamsConfig = internalParamsConfig;
		this.$prevParamsBuffer = new Float32Array(this.internalParams.length);
		this.paramsChangeCanDispatch = new Set(this.internalParams);
		this.paramsUpdateCheckFnRef = [];
		Object.entries(this.getParams()).forEach(([name, param]) => {
			Object.setPrototypeOf(param, MgrAudioParam.prototype);
			param.info = this.paramsConfig[name];
		});

		/** @type {Record<number, ((...args: any[]) => any)>} */
		const resolves = {};
		/** @type {Record<number, ((...args: any[]) => any)>} */
		const rejects = {};
		/**
		 * @param {keyof ParamMgrCallToProcessor} call
		 * @param {any} args
		 */
		this.call = (call, ...args) => new Promise((resolve, reject) => {
			const id = performance.now();
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
	 * @returns {ReadonlyMap<string, MgrAudioParam>}
	 */
	get parameters() {
		// @ts-ignore
		return super.parameters;
	}

	get processorId() {
		return this.module.moduleId;
	}

	get instanceId() {
		return this.module.instanceId;
	}

	async initialize() {
		/** @type {ReturnType<ParamMgrCallToProcessor['getBuffer']>} */
		const response = await this.call('getBuffer');
		const { lock, paramsBuffer } = response;
		this.$lock = lock;
		this.$paramsBuffer = paramsBuffer;
		const offset = 1;
		Object.entries(this.internalParamsConfig).forEach(([name, config], i) => {
			if (this.context.state === 'suspended') this.$paramsBuffer[i] = config.defaultValue;
			if (config instanceof AudioParam) {
				try {
					config.automationRate = 'a-rate';
				} finally {
					config.value = Math.max(0, config.minValue);
					this.connect(config, offset + i);
				}
			} else if (config instanceof AudioNode) {
				this.connect(config, offset + i);
			} else {
				this.requestDispatchIParamChange(name);
			}
		});
		this.connect(this.module.audioContext.destination, 0, 0);
		this.initialized = true;
		return this;
	}

	/**
	 * @param {ReturnType<ParamMgrCallToProcessor['getBuffer']>} buffer
	 */
	setBuffer({ lock, paramsBuffer }) {
		this.$lock = lock;
		this.$paramsBuffer = paramsBuffer;
	}

	setParamsMapping(paramsMapping) {
		return this.call('setParamsMapping', paramsMapping);
	}

	getCompensationDelay() {
		return this.call('getCompensationDelay');
	}

	getParameterInfo(...parameterIdQuery) {
		return this.call('getParameterInfo', ...parameterIdQuery);
	}

	getParameterValues(normalized, ...parameterIdQuery) {
		return this.call('getParameterValues', normalized, ...parameterIdQuery);
	}

	/**
	 * @param {WamEvent[]} events
	 */
	scheduleEvents(...events) {
		events.forEach((event) => {
			if (event.type === 'automation') {
				const { time } = event;
				const { id, normalized, value } = event.data;
				const audioParam = this.getParam(id);
				if (!audioParam) return;
				if (audioParam.info.type === 'float') {
					if (normalized) audioParam.linearRampToNormalizedValueAtTime(value, time);
					else audioParam.linearRampToValueAtTime(value, time);
				} else {
					// eslint-disable-next-line no-lonely-if
					if (normalized) audioParam.setNormalizedValueAtTime(value, time);
					else audioParam.setValueAtTime(value, time);
				}
			}
		});
		this.call('scheduleEvents', ...events);
	}

	clearEvents() {
		this.call('clearEvents');
	}

	/**
	 * @param {WamEvent} event
	 */
	dispatchWamEvent(event) {
		this.dispatchEvent(new CustomEvent(event.type, { detail: event }));
	}

	/**
	 * @param {WamParameterValueMap} parameterValues
	 */
	async setParameterValues(parameterValues) {
		Object.keys(parameterValues).forEach((parameterId) => {
			const parameterUpdate = parameterValues[parameterId];
			const parameter = this.parameters.get(parameterId);
			if (!parameter) return;
			if (!parameterUpdate.normalized) parameter.value = parameterUpdate.value;
			else parameter.normalizedValue = parameterUpdate.value;
		});
	}

	getState() {
		return this.getParameterValues();
	}

	setState(state) {
		return this.setParameterValues(state);
	}

	convertTimeToFrame(time) {
		return Math.round(time * this.context.sampleRate);
	}

	convertFrameToTime(frame) {
		return frame / this.context.sampleRate;
	}

	/**
	 * @param {string} name
	 */
	requestDispatchIParamChange = (name) => {
		if (!this.paramsChangeCanDispatch.has(name)) return;
		const config = this.internalParamsConfig[name];
		if (!('onChange' in config)) return;
		const { automationRate, onChange } = config;
		if (typeof automationRate !== 'number' || !automationRate) return;
		const interval = 1000 / automationRate;
		const i = this.internalParams.indexOf(name);
		if (i === -1) return;
		if (i >= this.internalParams.length) return;
		if (typeof this.paramsUpdateCheckFnRef[i] === 'number') {
			window.clearTimeout(this.paramsUpdateCheckFnRef[i]);
		}
		this.paramsUpdateCheckFnRef[i] = window.setTimeout(() => {
			this.paramsUpdateCheckFnRef[i] = undefined;
			this.paramsChangeCanDispatch.add(name);
			this.requestDispatchIParamChange(name);
		}, interval);
		const prev = this.$prevParamsBuffer[i];
		const cur = this.$paramsBuffer[i];
		if (cur !== prev) {
			onChange(cur, prev);
			this.$prevParamsBuffer[i] = cur;
			this.paramsChangeCanDispatch.delete(name);
		}
	}

	/**
	 * @param {string} name
	 */
	getIParamIndex(name) {
		const i = this.internalParams.indexOf(name);
		return i === -1 ? null : i;
	}

	/**
	 * @param {string} name
	 * @param {AudioParam | AudioNode} dest
	 * @param {number} index
	 */
	connectIParam(name, dest, index) {
		const offset = 1;
		const i = this.getIParamIndex(name);
		if (i !== null) {
			if (dest instanceof AudioNode) {
				if (typeof index === 'number') this.connect(dest, offset + i, index);
				else this.connect(dest, offset + i);
			} else {
				this.connect(dest, offset + i);
			}
		}
	}

	/**
	 * @param {string} name
	 * @param {AudioParam | AudioNode} dest
	 * @param {number} index
	 */
	disconnectIParam(name, dest, index) {
		const offset = 1;
		const i = this.getIParamIndex(name);
		if (i !== null) {
			if (dest instanceof AudioNode) {
				if (typeof index === 'number') this.disconnect(dest, offset + i, index);
				else this.disconnect(dest, offset + i);
			} else {
				this.disconnect(dest, offset + i);
			}
		}
	}

	getIParamValue(name) {
		const i = this.getIParamIndex(name);
		return i !== null ? this.$paramsBuffer[i] : null;
	}

	getIParamsValues() {
		/** @type {Record<string, number>} */
		const values = {};
		this.internalParams.forEach((name, i) => {
			values[name] = this.$paramsBuffer[i];
		});
		return values;
	}

	getParam(name) {
		return this.parameters.get(name) || null;
	}

	getParams() {
		// @ts-ignore
		return Object.fromEntries(this.parameters);
	}

	getParamValue(name) {
		const param = this.parameters.get(name);
		if (!param) return null;
		return param.value;
	}

	setParamValue(name, value) {
		const param = this.parameters.get(name);
		if (!param) return;
		param.value = value;
	}

	getParamsValues() {
		/** @type {Record<string, number>} */
		const values = {};
		this.parameters.forEach((v, k) => {
			values[k] = v.value;
		});
		return values;
	}

	/**
	 * @param {Record<string, number>} values
	 */
	setParamsValues(values) {
		if (!values) return;
		Object.entries(values).forEach(([k, v]) => {
			this.setParamValue(k, v);
		});
	}

	getNormalizedParamValue(name) {
		const param = this.parameters.get(name);
		if (!param) return null;
		return param.normalizedValue;
	}

	setNormalizedParamValue(name, value) {
		const param = this.parameters.get(name);
		if (!param) return;
		param.normalizedValue = value;
	}

	getNormalizedParamsValues() {
		const values = {};
		this.parameters.forEach((v, k) => {
			values[k] = this.getNormalizedParamValue(k);
		});
		return values;
	}

	setNormalizedParamsValues(values) {
		if (!values) return;
		Object.entries(values).forEach(([k, v]) => {
			this.setNormalizedParamValue(k, v);
		});
	}

	setParamValueAtTime(name, value, startTime) {
		const param = this.parameters.get(name);
		if (!param) return null;
		return param.setValueAtTime(value, startTime);
	}

	setNormalizedParamValueAtTime(name, value, startTime) {
		const param = this.parameters.get(name);
		if (!param) return null;
		return param.setNormalizedValueAtTime(value, startTime);
	}

	linearRampToParamValueAtTime(name, value, endTime) {
		const param = this.parameters.get(name);
		if (!param) return null;
		return param.linearRampToValueAtTime(value, endTime);
	}

	linearRampToNormalizedParamValueAtTime(name, value, endTime) {
		const param = this.parameters.get(name);
		if (!param) return null;
		return param.linearRampToNormalizedValueAtTime(value, endTime);
	}

	exponentialRampToParamValueAtTime(name, value, endTime) {
		const param = this.parameters.get(name);
		if (!param) return null;
		return param.exponentialRampToValueAtTime(value, endTime);
	}

	exponentialRampToNormalizedParamValueAtTime(name, value, endTime) {
		const param = this.parameters.get(name);
		if (!param) return null;
		return param.exponentialRampToNormalizedValueAtTime(value, endTime);
	}

	setParamTargetAtTime(name, target, startTime, timeConstant) {
		const param = this.parameters.get(name);
		if (!param) return null;
		return param.setTargetAtTime(target, startTime, timeConstant);
	}

	setNormalizedParamTargetAtTime(name, target, startTime, timeConstant) {
		const param = this.parameters.get(name);
		if (!param) return null;
		return param.setNormalizedTargetAtTime(target, startTime, timeConstant);
	}

	setParamValueCurveAtTime(name, values, startTime, duration) {
		const param = this.parameters.get(name);
		if (!param) return null;
		return param.setValueCurveAtTime(values, startTime, duration);
	}

	setNormalizedParamValueCurveAtTime(name, values, startTime, duration) {
		const param = this.parameters.get(name);
		if (!param) return null;
		return param.setNormalizedValueCurveAtTime(values, startTime, duration);
	}

	cancelScheduledParamValues(name, cancelTime) {
		const param = this.parameters.get(name);
		if (!param) return null;
		return param.cancelScheduledValues(cancelTime);
	}

	cancelAndHoldParamAtTime(name, cancelTime) {
		const param = this.parameters.get(name);
		if (!param) return null;
		return param.cancelAndHoldAtTime(cancelTime);
	}

	/**
	 * @param {WamNode} to
	 * @param {number} [output]
	 */
	connectEvents(to, output) {
		if (!to.module?.isWebAudioModule) return;
		this.call('connectEvents', to.instanceId, output);
	}

	/**
	 * @param {WamNode} [to]
	 * @param {number} [output]
	 */
	disconnectEvents(to, output) {
		if (to && !to.module?.isWebAudioModule) return;
		this.call('disconnectEvents', to?.instanceId, output);
	}

	async destroy() {
		this.disconnect();
		this.paramsUpdateCheckFnRef.forEach((ref) => {
			if (typeof ref === 'number') window.clearTimeout(ref);
		});
		await this.call('destroy');
		this.port.close();
	}
}
