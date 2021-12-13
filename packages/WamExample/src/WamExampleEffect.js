/* eslint-disable object-curly-newline */
/* eslint-disable prefer-destructuring */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-underscore-dangle */
/* eslint-disable max-len */
/* eslint-disable no-undef */
/* eslint-disable no-plusplus */
/* eslint-disable no-bitwise */
/* eslint-disable max-classes-per-file */

/** @typedef {import('../../api').AudioWorkletGlobalScope} AudioWorkletGlobalScope */
/** @typedef {import('../../api').WamParameterInfoMap} WamParameterInfoMap */
/** @typedef {import('../../sdk').WamParameterInterpolatorMap} WamParameterInterpolatorMap */
/** @typedef {import('./types').WamExampleModuleScope} WamExampleModuleScope */
/** @typedef {import('./types').WamExampleEffect} IWamExampleEffect */
/** @typedef {typeof import('./types').WamExampleEffect} WamExampleEffectConstructor */
/** @typedef {import('./types').WamExampleEffectConfig} WamExampleEffectConfig */
/** @typedef {import('./types').WamExampleLowpassFilter} IWamExampleLowpassFilter */
/** @typedef {import('./types').WamExampleDcBlockerFilter} IWamExampleDcBlockerFilter */

/**
 * @param {string} moduleId
 * @returns {WamExampleEffectConstructor}
 */
 const getWamExampleEffect = (moduleId) => {

	/** @type {AudioWorkletGlobalScope} */
	// @ts-ignore
	const audioWorkletGlobalScope = globalThis;

	/** @type {WamExampleModuleScope} */
	const ModuleScope = audioWorkletGlobalScope.webAudioModules.getModuleScope(moduleId);
	const {
		WamParameterInfo,
		WamExampleComponents,
	} = ModuleScope;

	const {
		WamExampleLowpassFilter,
		WamExampleDcBlockerFilter,
	} = WamExampleComponents;

	const piByTwo = Math.PI / 2;

	/**
	 * Example drive effect.
	 *
	 * Based on Bhaskara I's sine approximation:
	 * https://en.wikipedia.org/wiki/Bhaskara_I%27s_sine_approximation_formula
	 *
	 * @class
	 */
	class WamExampleDrive {
		/**
		 * Fetch params.
		 * @returns {WamParameterInfoMap}
		 */
		static generateWamParameterInfo() {
			return {
				drive: new WamParameterInfo('drive', {
					type: 'float',
					label: 'Drive',
					defaultValue: 0.0,
					minValue: 0.0,
					maxValue: 1.0,
					exponent: 1.0,
				}),
			};
		}

		/**
		 * @param {WamParameterInterpolatorMap} parameterInterpolators
		 * @param {number} samplesPerQuantum
		 * @param {number} sampleRate
		 * @param {WamExampleEffectConfig} config optional config object
		 */
		/* eslint-disable-next-line no-unused-vars */
		constructor(parameterInterpolators, samplesPerQuantum, sampleRate, config) {
			/** @private @type {number} number of input/output channels */
			this._numChannels = config.numChannels ?? 2;

			/** @private @type {WamParameterInfoMap} */
			this._parameterInfo = WamExampleDrive.generateWamParameterInfo();

			/** @private @type {WamParameterInterpolatorMap} */
			this._parameterInterpolators = {};
			Object.keys(this._parameterInfo).forEach((parameterId) => {
				this._parameterInterpolators[parameterId] = parameterInterpolators[parameterId];
			});

			/** @private @type {boolean} whether or not drive parameter is changing */
			this._driveDone = false;

			/** @private @type {Float32Array} values for mapped parameter 'dirty' */
			this._dirty = new Float32Array(samplesPerQuantum);

			/** @private @type {Float32Array} values for mapped parameter 'clean' */
			this._clean = new Float32Array(samplesPerQuantum);

			/** @private @type {Float32Array} feedback memory for each channel */
			this._memory1 = new Float32Array(this._numChannels);

			/** @private @type {Float32Array} feedback memory for each channel */
			this._memory2 = new Float32Array(this._numChannels);

			// dsp constants
			this._alpha = 5 * Math.PI ** 2.0;
			this._phiMin = 0;
			this._phiMax = Math.PI;
			this._phiWidth = this._phiMax - this._phiMin;
		}

		/** Restore initial state */
		reset() {
			this._driveDone = false;
			this._memory1.fill(0);
			this._memory2.fill(0);
		}

		/**
		 * Apply the effect
		 * @param {number} startSample beginning of processing slice
		 * @param {number} endSample end of processing slice
		 * @param {Float32Array[]} inputs
		 * @param {Float32Array[]} outputs
		 */
		process(startSample, endSample, inputs, outputs) {
			// parameter mapping
			const driveDone = this._parameterInterpolators.drive.done;
			if (!driveDone || !this._driveDone) {
				let n = startSample;
				while (n < endSample) {
					let dirty = this._parameterInterpolators.drive.values[n];
					dirty += 0.1;
					dirty /= 1.1;
					dirty = 1.0 - dirty;
					dirty *= dirty;
					dirty = 1.0 - dirty;
					this._dirty[n] = dirty;

					const clean = 1.0 - dirty;
					this._clean[n] = clean * clean;
					n++;
				}
				this._driveDone = driveDone;
			}

			// processing
			for (let c = 0; c < this._numChannels; ++c) {
				const input = inputs[c];
				const output = outputs[c];
				let n = startSample;
				while (n < endSample) {
					const dirty = this._dirty[n];
					const clean = this._clean[n];
					const x = input[n];
					const gain = (0.067 + clean) * dirty;
					const sign = x >= 0 ? gain : -gain;

					let phi = (piByTwo + piByTwo * dirty) * this._phiWidth * x;
					while (phi > this._phiMax) {
						phi -= this._phiWidth;
					}
					while (phi < this._phiMin) {
						phi += this._phiWidth;
					}

					const beta = (2.0 + 6.0 * dirty) * phi * (this._phiMax - phi);
					const y = sign * ((4.0 * beta) / (this._alpha - beta)) + clean * this._memory1[c];
					output[n] = y - dirty * clean * this._memory2[c];

					this._memory2[c] = this._memory1[c];
					this._memory1[c] = clean * x - dirty * y;
					n++;
				}
			}
		}
	}

	/**
	 * Example effect
	 *
	 * @class
	 * @implements {IWamExampleEffect}
	 */
	class WamExampleEffect {
		/**
		 * Fetch effect's params.
		 * @returns {WamParameterInfoMap}
		 */
		static generateWamParameterInfo() {
			return {
				...WamExampleDrive.generateWamParameterInfo(),
			};
		}

		/**
		 * @param {WamParameterInterpolatorMap} parameterInterpolators
		 * @param {number} samplesPerQuantum
		 * @param {number} sampleRate
		 * @param {WamExampleEffectConfig} config optional config object
		 */
		constructor(parameterInterpolators, samplesPerQuantum, sampleRate, config = {}) {
			/** @private @type {number} number of input/output channels */
			this._numChannels = config.numChannels ?? 2;

			/** @private @type {boolean} whether to process the output in-place, ignoring input */
			this._inPlace = config.inPlace ?? false;

			/** @private @type {Float32Array[]} scratch buffers for prefiltering */
			this._buffers = [];

			const lowpassFrequencyHz = config.lowpassFrequencyHz ?? 12000.0;
			/** @private @type {IWamExampleLowpassFilter[]} lowpass filter components */
			this._lowpasses = [];

			/** @private @type {IWamExampleDcBlockerFilter[]} dc blocking filter components */
			this._dcblockers = [];

			for (let c = 0; c < this._numChannels; ++c) {
				if (!this._inPlace) this._buffers.push(new Float32Array(samplesPerQuantum));

				this._lowpasses.push(new WamExampleLowpassFilter());
				this._lowpasses[c].update(lowpassFrequencyHz, sampleRate);

				this._dcblockers.push(new WamExampleDcBlockerFilter());
			}

			if (!config.numChannels) config.numChannels = this._numChannels;

			/** @private @type {WamExampleDrive} drive component */
			this._drive = new WamExampleDrive(parameterInterpolators, samplesPerQuantum, sampleRate, config);
		}

		/** Restore initial state */
		reset() {
			for (let c = 0; c < this._numChannels; ++c) {
				this._lowpasses[c].reset();
				this._dcblockers[c].reset();
			}
			this._drive.reset();
		}

		/**
		 * Apply the effect
		 * @param {number} startSample beginning of processing slice
		 * @param {number} endSample end of processing slice
		 * @param {Float32Array[]} inputs
		 * @param {Float32Array[]} outputs
		 */
		process(startSample, endSample, inputs, outputs) {
			// lowpasses process in place
			if (this._inPlace) this._buffers = outputs;
			for (let c = 0; c < this._numChannels; ++c) {
				if (!this._inPlace) this._buffers[c].set(inputs[c]); // preserve input buffer
				this._lowpasses[c].process(startSample, endSample, this._buffers[c]);
			}

			// drive processes its input to its output
			this._drive.process(startSample, endSample, this._buffers, outputs);

			// dcblockers process in place
			for (let c = 0; c < this._numChannels; ++c) {
				this._dcblockers[c].process(startSample, endSample, outputs[c]);
			}
		}
	}

	if (audioWorkletGlobalScope.AudioWorkletProcessor) {
		if (!ModuleScope.WamExampleEffect) ModuleScope.WamExampleEffect = WamExampleEffect;
	}

	return WamExampleEffect;
 }

 export default getWamExampleEffect;