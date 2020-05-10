/* eslint-disable no-plusplus */
/**
 * Main function to stringify as a worklet.
 *
 * @param {string} processorID processor identifier
 * @param {ParametersDescriptor} paramsConfig parameterDescriptors
 */
const processor = (processorID, paramsConfig) => {
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
	const mapValue = (x, eMin, eMax, eExp, sMin, sMax, tMin, tMax) => (
		denormalize(
			normalize(
				normalize(
					Math.min(sMax, Math.max(sMin, x)),
					eMin,
					eMax,
					eExp,
				),
				normalize(sMin, eMin, eMax),
				normalize(sMax, eMin, eMax),
			),
			tMin,
			tMax,
		)
	);

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
	 * `ParamMgrNode`'s `AudioWorkletProcessor`
	 *
	 * @class ParamMgrProcessor
	 * @extends {AudioWorkletProcessor<T, F>}
	 */
	class ParamMgrProcessor extends AudioWorkletProcessor {
		/**
		 * Here describes plugin external parameters as it is
		 *
		 * @readonly
		 * @static
		 * @memberof ParamMgrProcessor
		 */
		static get parameterDescriptors() {
			return Object.entries(paramsConfig).map(([name, { defaultValue, minValue, maxValue }]) => ({
				name,
				defaultValue,
				minValue,
				maxValue,
			}));
		}

		/**
		 * @param {TypedAudioWorkletNodeOptions<O>} options
		 * @memberof ParamMgrProcessor
		 */
		constructor(options) {
			super(options);
			this.destroyed = false;
			const { mapping, internalParamsConfig } = options.processorOptions;
			this.paramsConfig = paramsConfig;
			this.mapping = mapping;
			this.internalParamsConfig = internalParamsConfig;
			this.internalParamsCount = Object.keys(this.internalParamsConfig).length;
			this.buffer = new SharedArrayBuffer( // eslint-disable-line no-undef
				(this.internalParamsCount + 1) * Float32Array.BYTES_PER_ELEMENT,
			);
			this.$lock = new Int32Array(this.buffer, 0, 1);
			this.$paramsBuffer = new Float32Array(this.buffer, 4, this.internalParamsCount);
			this.port.onmessage = (e) => {
				if (e.data.destroy) this.destroy();
				else if (e.data.mapping) this.mapping = e.data.mapping;
				else if (e.data.buffer) {
					this.port.postMessage({ buffer: { lock: this.$lock, paramsBuffer: this.$paramsBuffer } });
				}
			};
		}

		lock() {
			return Atomics.store(this.$lock, 0, 1); // eslint-disable-line no-undef
		}

		unlock() {
			return Atomics.store(this.$lock, 0, 0); // eslint-disable-line no-undef
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
			Object.entries(this.paramsConfig).forEach(([name, { minValue, maxValue, exponent }]) => {
				if (!this.mapping[name]) return;
				const raw = parameters[name];
				Object.entries(this.mapping[name]).forEach(([targetName, targetMapping]) => {
					const i = Object.keys(this.internalParamsConfig).indexOf(targetName) + 1;
					if (!i) return;
					const { sourceRange, targetRange } = targetMapping;
					const [sMin, sMax] = sourceRange;
					const [tMin, tMax] = targetRange;
					let out;
					if (minValue !== tMin || maxValue !== tMax
							|| minValue !== sMin || maxValue !== sMax || exponent !== 0) {
						out = new Float32Array(raw.length);
						for (let j = 0; j < raw.length; j++) {
							out[j] = mapValue(raw[j], minValue, maxValue, exponent, sMin, sMax, tMin, tMax);
						}
					} else {
						out = raw;
					}
					if (out.length === 1) outputs[i][0].fill(out[0]);
					else outputs[i][0].set(out);
					this.$paramsBuffer[i - 1] = out[0]; // eslint-disable-line no-undef, prefer-destructuring
				});
			});
			this.unlock();
			return true;
		}

		destroy() {
			this.destroyed = true;
		}
	}
	registerProcessor(processorID, ParamMgrProcessor);
};
export default processor;
