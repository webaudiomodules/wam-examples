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
 * @typedef {{ destroy: true, paramsMapping: ParametersMapping, buffer: true }} T
 * @typedef {{ buffer: { lock: Int32Array, paramsBuffer: Float32Array } }} F
 * @typedef {{
 * 		paramsConfig: ParametersDescriptor;
 * 		paramsMapping: ParametersMapping;
 * 		internalParams: string[];
 * 		instanceId: string;
 * }} O
 */
/**
 * @export
 * @class ParamMgrNode
 * @extends {DisposableAudioWorkletNode<F, T, string, O>}
 */
export default class ParamMgrNode extends DisposableAudioWorkletNode {
	/**
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
					if (this.context.state === 'suspended') this.$paramsBuffer[i] = config.defaultValue;
					if (config instanceof AudioParam || config instanceof AudioNode) {
						config.value = 0;
						this.connect(config, i + 1);
					} else {
						if (config.onChange) this.plugin.on(`change:internalParam:${name}`, config.onChange);
						this.requestDispatchIParamChange(name);
					}
				});
				if (this.resolve) this.resolve(this);
				this.resolve = undefined;
			}
		};
		this.plugin.on('change:paramsMapping', (paramsMapping) => {
			this.port.postMessage({ paramsMapping });
		});
	}

	resolve = undefined;

	async initialize() {
		return new Promise((resolve) => {
			this.resolve = resolve;
			this.port.postMessage({ buffer: true });
		});
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
		const i = this.getIParamIndex(name);
		if (i !== null) {
			if (typeof index === 'number') this.connect(dest, i + 1, index);
			else this.connect(dest, i + 1);
		}
	}

	/**
	 * @param {string} name
	 * @param {AudioParam | AudioNode} dest
	 * @param {number} index
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
		this.plugin.emit('automation', 'value', name, value);
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
		if (!values) return;
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

	setNormalizedParamValue(name, valueIn) {
		const param = this.parameters.get(name);
		if (!param) return;
		const { minValue, maxValue, exponent } = this.paramsConfig[name];
		const value = denormalize(valueIn, minValue, maxValue, exponent);
		this.plugin.emit('automation', 'value', name, value);
		param.value = value;
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
		this.plugin.emit('automation', 'setValueAtTime', name, value, startTime);
		return param.setValueAtTime(value, startTime);
	}

	setNormalizedParamValueAtTime(name, valueIn, startTime) {
		const param = this.parameters.get(name);
		if (!param) return null;
		const { minValue, maxValue, exponent } = this.paramsConfig[name];
		const value = denormalize(valueIn, minValue, maxValue, exponent);
		this.plugin.emit('automation', 'setValueAtTime', name, value, startTime);
		return param.setValueAtTime(value, startTime);
	}

	linearRampToParamValueAtTime(name, value, endTime) {
		const param = this.parameters.get(name);
		if (!param) return null;
		this.plugin.emit('automation', 'linearRampToValueAtTime', name, value, endTime);
		return param.linearRampToValueAtTime(value, endTime);
	}

	linearRampToNormalizedParamValueAtTime(name, valueIn, endTime) {
		const param = this.parameters.get(name);
		if (!param) return null;
		const { minValue, maxValue, exponent } = this.paramsConfig[name];
		const value = denormalize(valueIn, minValue, maxValue, exponent);
		this.plugin.emit('automation', 'linearRampToValueAtTime', name, value, endTime);
		return param.linearRampToValueAtTime(value, endTime);
	}

	exponentialRampToParamValueAtTime(name, value, endTime) {
		const param = this.parameters.get(name);
		if (!param) return null;
		this.plugin.emit('automation', 'exponentialRampToValueAtTime', name, value, endTime);
		return param.exponentialRampToValueAtTime(value, endTime);
	}

	exponentialRampToNormalizedParamValueAtTime(name, valueIn, endTime) {
		const param = this.parameters.get(name);
		if (!param) return null;
		const { minValue, maxValue, exponent } = this.paramsConfig[name];
		const value = denormalize(valueIn, minValue, maxValue, exponent);
		this.plugin.emit('automation', 'exponentialRampToValueAtTime', name, value, endTime);
		return param.exponentialRampToValueAtTime(value, endTime);
	}

	setParamTargetAtTime(name, target, startTime, timeConstant) {
		const param = this.parameters.get(name);
		if (!param) return null;
		this.plugin.emit('automation', 'setTargetAtTime', name, target, startTime, timeConstant);
		return param.setTargetAtTime(target, startTime, timeConstant);
	}

	setNormalizedParamTargetAtTime(name, targetIn, startTime, timeConstant) {
		const param = this.parameters.get(name);
		if (!param) return null;
		const { minValue, maxValue, exponent } = this.paramsConfig[name];
		const target = denormalize(targetIn, minValue, maxValue, exponent);
		this.plugin.emit('automation', 'setTargetAtTime', name, target, startTime, timeConstant);
		return param.setTargetAtTime(target, startTime, timeConstant);
	}

	setParamValueCurveAtTime(name, values, startTime, duration) {
		const param = this.parameters.get(name);
		if (!param) return null;
		this.plugin.emit('automation', 'setValueCurveAtTime', name, values, startTime, duration);
		return param.setValueCurveAtTime(values, startTime, duration);
	}

	setNormalizedParamValueCurveAtTime(name, valuesIn, startTime, duration) {
		const param = this.parameters.get(name);
		if (!param) return null;
		const { minValue, maxValue, exponent } = this.paramsConfig[name];
		const values = Array.from(valuesIn).map((v) => denormalize(v, minValue, maxValue, exponent));
		this.plugin.emit('automation', 'setValueCurveAtTime', name, values, startTime, duration);
		return param.setValueCurveAtTime(values, startTime, duration);
	}

	cancelScheduledParamValues(name, cancelTime) {
		const param = this.parameters.get(name);
		if (!param) return null;
		this.plugin.emit('automation', 'cancelScheduledValues', name, cancelTime);
		return param.cancelScheduledValues(cancelTime);
	}

	cancelAndHoldParamAtTime(name, cancelTime) {
		const param = this.parameters.get(name);
		if (!param) return null;
		this.plugin.emit('automation', 'cancelAndHoldAtTime', name, cancelTime);
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
