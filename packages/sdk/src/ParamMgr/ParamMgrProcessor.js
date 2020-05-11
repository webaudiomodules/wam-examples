/* eslint-disable no-plusplus */
/**
 * Main function to stringify as a worklet.
 *
 * @param {string} processorId processor identifier
 * @param {ParametersDescriptor} paramsConfig parameterDescriptors
 */
const processor = (processorId, paramsConfig) => {
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
			const { paramsMapping, internalParams, instanceId } = options.processorOptions;
			this.processorId = processorId;
			this.paramsConfig = paramsConfig;
			this.paramsMapping = paramsMapping;
			this.internalParams = internalParams;
			this.internalParamsCount = this.internalParams.length;
			this.buffer = new SharedArrayBuffer( // eslint-disable-line no-undef
				(this.internalParamsCount + 1) * Float32Array.BYTES_PER_ELEMENT,
			);
			this.$lock = new Int32Array(this.buffer, 0, 1);
			this.$paramsBuffer = new Float32Array(this.buffer, 4, this.internalParamsCount);
			// eslint-disable-next-line no-undef
			if (!globalThis.WebAudioPluginParams) globalThis.WebAudioPluginParams = {};
			const { WebAudioPluginParams } = globalThis; // eslint-disable-line no-undef
			WebAudioPluginParams[instanceId] = {
				internalParams,
				lock: this.$lock,
				paramsBuffer: this.$paramsBuffer,
				outputs: [],
			};
			this.exposed = WebAudioPluginParams[instanceId];
			this.port.onmessage = (e) => {
				if (e.data.destroy) this.destroy();
				else if (e.data.paramsMapping) this.paramsMapping = e.data.paramsMapping;
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
			Object.entries(this.paramsConfig).forEach(([name, { minValue, maxValue }]) => {
				if (!this.paramsMapping[name]) return;
				const raw = parameters[name];
				Object.entries(this.paramsMapping[name]).forEach(([targetName, targetMapping]) => {
					const i = this.internalParams.indexOf(targetName) + 1;
					if (!i) return;
					const { sourceRange, targetRange } = targetMapping;
					const [sMin, sMax] = sourceRange;
					const [tMin, tMax] = targetRange;
					let out;
					if (minValue !== tMin || maxValue !== tMax
							|| minValue !== sMin || maxValue !== sMax) {
						out = new Float32Array(raw.length);
						for (let j = 0; j < raw.length; j++) {
							out[j] = mapValue(raw[j], minValue, maxValue, sMin, sMax, tMin, tMax);
						}
					} else {
						out = raw;
					}
					if (out.length === 1) outputs[i][0].fill(out[0]);
					else outputs[i][0].set(out);
					this.exposed.outputs[i - 1] = outputs[i][0]; // eslint-disable-line prefer-destructuring
					this.$paramsBuffer[i - 1] = out[0]; // eslint-disable-line prefer-destructuring
				});
			});
			this.unlock();
			this.exposed.frame = currentFrame; // eslint-disable-line no-undef
			return true;
		}

		destroy() {
			this.destroyed = true;
		}
	}
	registerProcessor(processorId, ParamMgrProcessor);
};
export default processor;
