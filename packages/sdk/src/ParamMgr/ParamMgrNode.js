import DisposableAudioWorkletNode from './DisposableAudioWorkletNode';

/**
 * @typedef {{ destroy: true, mapping: ParametersMapping, buffer: true }} T
 * @typedef {{ buffer: { lock: Int32Array, paramsBuffer: Float32Array } }} F
 * @typedef {{
 * 		paramsConfig: ParametersDescriptor;
 * 		mapping: ParametersMapping;
 * 		internalParamsConfig: InternalParametersDescriptor
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
     * @memberof ParamMgrNode
     */
	constructor(context, processorId, parameterData, processorOptions) {
		super(context, processorId, {
			numberOfInputs: 0,
			numberOfOutputs: Object.keys(processorOptions.internalParamsConfig).length + 1,
			parameterData,
			processorOptions,
		});
		this.internalParamsConfig = processorOptions.internalParamsConfig;
		this.connect(context.destination, 0, 0);
		this.port.onmessage = (e) => {
			if (e.data.buffer) {
				this.$lock = e.data.buffer.lock;
				this.$paramsBuffer = e.data.buffer.paramsBuffer;
				if (this.resolve) this.resolve();
				this.resolve = undefined;
			}
		};
	}

	resolve = undefined;

	async init() {
		return new Promise((resolve) => {
			this.resolve = resolve;
			this.port.postMessage({ buffer: true });
		});
	}

	/**
	 * get the output index of a param
	 *
	 * @param {string} key param name
	 * @returns {number} output index
	 * @memberof ParamMgrNode
	 */
	getParamIndex(key) {
		const i = Object.keys(this.internalParamsConfig).indexOf(key);
		return i === -1 ? null : i;
	}

	/**
	 * Connect a param stream to an AudioParam / AudioNode
	 *
	 * @param {string} key param name
	 * @param {AudioParam | AudioNode} dest destination AudioParam / AudioNode
	 * @param {number} index connection index
	 * @memberof ParamMgrNode
	 */
	connectParam(key, dest, index) {
		const i = this.getParamIndex(key);
		if (i !== null) {
			if (typeof index === 'number') this.connect(dest, i + 1, index);
			else this.connect(dest, i + 1);
		}
	}

	/**
	 * Disonnect a param stream to an AudioParam / AudioNode
	 *
	 * @param {string} key param name
	 * @param {AudioParam | AudioNode} dest destination AudioParam / AudioNode
	 * @param {number} index connection index
	 * @memberof ParamMgrNode
	 */
	disconnectParam(key, dest, index) {
		const i = this.getParamIndex(key);
		if (i !== null) {
			if (typeof index === 'number') this.disconnect(dest, i + 1, index);
			else this.disconnect(dest, i + 1);
		}
	}

	getParamValue(key) {
		// eslint-disable-next-line no-undef
		return Atomics.load(this.$paramsBuffer, this.getParamIndex(key));
	}

	destroy() {
		this.disconnect();
		super.destroy();
	}
}
