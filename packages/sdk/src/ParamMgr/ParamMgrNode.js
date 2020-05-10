import DisposableAudioWorkletNode from './DisposableAudioWorkletNode';

const normExp = (x, e) => (e === 0 ? x : x ** (1.5 ** -e));
const denormExp = (x, e) => (e === 0 ? x : x ** (1.5 ** e));
const normalize = (x, min, max, e = 0) => (
	min === 0 && max === 1
		? normExp(x, e)
		: normExp((x - min) / (max - min) || 0, e));
const denormalize = (x, min, max, e = 0) => (
	min === 0 && max === 1
		? denormExp(x, e)
		: denormExp(x, e) * (max - min) + min
);

/**
 * @typedef {{ destroy: true, mapping: ParametersMapping, buffer: true }} T
 * @typedef {{ buffer: { lock: Int32Array, paramsBuffer: Float32Array } }} F
 * @typedef {{
 * 		paramsConfig: ParametersDescriptor;
 * 		mapping: ParametersMapping;
 * 		internalParams: string[]
 * }} O
 */
/**
 * @export
 * @class ParamMgrNode
 * @extends {DisposableAudioWorkletNode<F, T, string, O>}
 */
export default class ParamMgrNode extends DisposableAudioWorkletNode {
	/**
     * Creates an instance of ParamMgrNode.
     *
     * @param {BaseAudioContext} context AudioContext
     * @param {string} processorId Processor identifier
	 * @param {Record<string, number>} parameterData parameters initial values map
     * @param {O} processorOptions
     * @param {import('../WebAudioPlugin').default} plugin the plugin instance
	 * @param {InternalParametersDescriptor} internalParamsConfig
     * @memberof ParamMgrNode
     */
	constructor(context, processorId, parameterData, processorOptions, plugin, internalParamsConfig) {
		super(context, processorId, {
			numberOfInputs: 0,
			numberOfOutputs: processorOptions.internalParams.length + 1,
			parameterData,
			processorOptions,
		});
		this.plugin = plugin;
		this.paramsConfig = processorOptions.paramsConfig;
		this.internalParams = processorOptions.internalParams;
		this.internalParamsConfig = internalParamsConfig;
		this.$prevParamsBuffer = new Float32Array(this.internalParams.length);
		this.paramsChangeCanDispatch = new Set(this.internalParams);
		this.paramsUpdateCheckFnRef = [];
		this.connect(context.destination, 0, 0);
		this.port.onmessage = (e) => {
			if (e.data.buffer) {
				this.$lock = e.data.buffer.lock;
				this.$paramsBuffer = e.data.buffer.paramsBuffer;
				Object.entries(this.internalParamsConfig).forEach(([name, config], i) => {
					if (config instanceof AudioParam) {
						config.value = 0;
						this.connect(config, i + 1);
					} else {
						this.requestDispatchIParamChange(name);
					}
				});
				if (this.resolve) this.resolve(this);
				this.resolve = undefined;
			}
		};
		this.plugin.on('change:paramsMapping', (mapping) => {
			this.port.postMessage({ mapping });
		});
	}

	resolve = undefined;

	async initialize() {
		return new Promise((resolve) => {
			this.resolve = resolve;
			this.port.postMessage({ buffer: true });
		});
	}

	/**
	 * @param {string} name
	 * @memberof ParamMgrNode
	 */
	requestDispatchIParamChange = (name) => {
		if (!this.paramsChangeCanDispatch.has(name)) return;
		const rate = this.internalParamsConfig[name].automationRate;
		if (typeof rate !== 'number' || !rate) return;
		const interval = 1000 / rate;
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
			this.plugin.emit(`change:internalParam:${name}`, cur, prev);
			this.$prevParamsBuffer[i] = cur;
			this.paramsChangeCanDispatch.delete(name);
		}
	}

	/**
	 * get the output index of an internal param
	 *
	 * @param {string} name param name
	 * @returns {number} output index
	 * @memberof ParamMgrNode
	 */
	getIParamIndex(name) {
		const i = this.internalParams.indexOf(name);
		return i === -1 ? null : i;
	}

	/**
	 * Connect an internal param stream to an AudioParam / AudioNode
	 *
	 * @param {string} name param name
	 * @param {AudioParam | AudioNode} dest destination AudioParam / AudioNode
	 * @param {number} index connection index
	 * @memberof ParamMgrNode
	 */
	connectIParam(name, dest, index) {
		const i = this.getIParamIndex(name);
		if (i !== null) {
			if (typeof index === 'number') this.connect(dest, i + 1, index);
			else this.connect(dest, i + 1);
		}
	}

	/**
	 * Disonnect an internal param stream to an AudioParam / AudioNode
	 *
	 * @param {string} name param name
	 * @param {AudioParam | AudioNode} dest destination AudioParam / AudioNode
	 * @param {number} index connection index
	 * @memberof ParamMgrNode
	 */
	disconnectIParam(name, dest, index) {
		const i = this.getIParamIndex(name);
		if (i !== null) {
			if (typeof index === 'number') this.disconnect(dest, i + 1, index);
			else this.disconnect(dest, i + 1);
		}
	}

	getIParamValue(name) {
		const i = this.getIParamIndex(name);
		return i !== null ? this.$paramsBuffer[i] : null;
	}

	getIParamsValues() {
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
		Object.entries(values).forEach(([k, v]) => {
			this.setParamValue(k, v);
		});
	}

	getNormalizedParamValue(name) {
		const v = this.getParamValue(name);
		if (v === null) return null;
		const { minValue, maxValue, exponent } = this.paramsConfig[name];
		return normalize(v, minValue, maxValue, exponent);
	}

	setNormalizedParamValue(name, value) {
		const param = this.parameters.get(name);
		if (!param) return;
		const { minValue, maxValue, exponent } = this.paramsConfig[name];
		param.value = denormalize(value, minValue, maxValue, exponent);
	}

	setParamValueAtTime(name, value, startTime) {
		const param = this.parameters.get(name);
		if (!param) return null;
		return param.setValueAtTime(value, startTime);
	}

	setNormalizedParamValueAtTime(name, value, startTime) {
		const param = this.parameters.get(name);
		if (!param) return null;
		const { minValue, maxValue, exponent } = this.paramsConfig[name];
		return param.setValueAtTime(denormalize(value, minValue, maxValue, exponent), startTime);
	}

	linearRampToParamValueAtTime(name, value, endTime) {
		const param = this.parameters.get(name);
		if (!param) return null;
		return param.linearRampToValueAtTime(value, endTime);
	}

	linearRampToNormalizedParamValueAtTime(name, value, endTime) {
		const param = this.parameters.get(name);
		if (!param) return null;
		const { minValue, maxValue, exponent } = this.paramsConfig[name];
		return param.linearRampToValueAtTime(denormalize(value, minValue, maxValue, exponent), endTime);
	}

	exponentialRampToParamValueAtTime(name, value, endTime) {
		const param = this.parameters.get(name);
		if (!param) return null;
		return param.exponentialRampToValueAtTime(value, endTime);
	}

	exponentialRampToNormalizedParamValueAtTime(name, value, endTime) {
		const param = this.parameters.get(name);
		if (!param) return null;
		const { minValue, maxValue, exponent } = this.paramsConfig[name];
		return param.exponentialRampToValueAtTime(
			denormalize(value, minValue, maxValue, exponent), endTime,
		);
	}

	setParamTargetAtTime(name, target, startTime, timeConstant) {
		const param = this.parameters.get(name);
		if (!param) return null;
		return param.setTargetAtTime(target, startTime, timeConstant);
	}

	setNormalizedParamTargetAtTime(name, target, startTime, timeConstant) {
		const param = this.parameters.get(name);
		if (!param) return null;
		const { minValue, maxValue, exponent } = this.paramsConfig[name];
		return param.setTargetAtTime(
			denormalize(target, minValue, maxValue, exponent), startTime, timeConstant,
		);
	}

	setParamValueCurveAtTime(name, values, startTime, duration) {
		const param = this.parameters.get(name);
		if (!param) return null;
		return param.setValueCurveAtTime(values, startTime, duration);
	}

	setNormalizedParamValueCurveAtTime(name, valuesIn, startTime, duration) {
		const param = this.parameters.get(name);
		if (!param) return null;
		const { minValue, maxValue, exponent } = this.paramsConfig[name];
		const values = Array.from(valuesIn).map((v) => denormalize(v, minValue, maxValue, exponent));
		return param.setValueCurveAtTime(values, startTime, duration);
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

	destroy() {
		this.disconnect();
		this.paramsUpdateCheckFnRef.forEach((ref) => {
			if (typeof ref === 'number') window.clearTimeout(ref);
		});
		super.destroy();
	}
}
