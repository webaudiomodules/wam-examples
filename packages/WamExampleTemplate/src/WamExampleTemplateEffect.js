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
/** @typedef {import('./types').WamExampleTemplateModuleScope} WamExampleTemplateModuleScope */
/** @typedef {import('./types').WamExampleTemplateEffect} IWamExampleTemplateEffect */
/** @typedef {typeof import('./types').WamExampleTemplateEffect} WamExampleTemplateEffectConstructor */
/** @typedef {import('./types').WamExampleTemplateEffectConfig} WamExampleTemplateEffectConfig */

/**
 * @param {string} [moduleId]
 * @returns {WamExampleTemplateEffectConstructor}
 */
 const getWamExampleTemplateEffect = (moduleId) => {

	/** @type {AudioWorkletGlobalScope} */
	// @ts-ignore
	const audioWorkletGlobalScope = globalThis;

	/** @type {WamExampleTemplateModuleScope} */
	const ModuleScope = audioWorkletGlobalScope.webAudioModules.getModuleScope(moduleId);
	const { WamParameterInfo } = ModuleScope;

	/**
	 * Example effect template
	 *
	 * @class
	 * @implements {IWamExampleTemplateEffect}
	 */
	class WamExampleTemplateEffect {
		/**
		 * Fetch effect's params.
		 * @returns {WamParameterInfoMap}
		 */
		static generateWamParameterInfo() {
			return {
				// your effect parameters here
				gain: new WamParameterInfo('gain', {
					type: 'float',
					label: 'Gain',
					defaultValue: 1.0,
					minValue: 0.0,
					maxValue: 2.0,
					exponent: 0.5,
				}),
			};
		}

		reset() {
			
		}

		/**
		 * @param {WamParameterInterpolatorMap} parameterInterpolators
		 * @param {number} samplesPerQuantum
		 * @param {number} sampleRate
		 * @param {Object} config optional config object
		 */
		constructor(parameterInterpolators, samplesPerQuantum, sampleRate, config = {}) {
			/** @private @type {number} number of input/output channels */
			this._numChannels = config.numChannels ?? 2;

			/** @private @type {boolean} whether to process the output in-place, ignoring input */
			this._inPlace = config.inPlace ?? false;

			/** @private @type {Float32Array[]} scratch buffers */
			this._buffers = [];

			/** @private @type {WamParameterInfoMap} */
			// @ts-ignore
			this._parameterInfo = this.constructor.generateWamParameterInfo();

			/** @private @type {WamParameterInterpolatorMap} */
			this._parameterInterpolators = {};
			Object.keys(this._parameterInfo).forEach((parameterId) => {
				this._parameterInterpolators[parameterId] = parameterInterpolators[parameterId];
			});

			if (!this._inPlace) {
				for (let c = 0; c < this._numChannels; ++c) {
					this._buffers.push(new Float32Array(samplesPerQuantum));
				}
			}
			// your effect initialization code here
		}

		/**
		 * Apply the effect
		 * @param {number} startSample beginning of processing slice
		 * @param {number} endSample end of processing slice
		 * @param {Float32Array[]} inputs
		 * @param {Float32Array[]} outputs
		 */
		process(startSample, endSample, inputs, outputs) {

			if (this._inPlace) this._buffers = outputs;
			for (let c = 0; c < this._numChannels; ++c) {
				if (!this._inPlace) this._buffers[c].set(inputs[c]); // preserve input buffer
	[]
				const input = this._buffers[c];
				const output = outputs[c];
				let n = startSample;
				while (n < endSample) {
					// your effect processing code here
					const gain = this._parameterInterpolators.gain.values[n];
					const x = input[n];
					const y = gain * x;
					output[n] = y;
					n++;
				}
			}
		}
	}

	if (audioWorkletGlobalScope.AudioWorkletProcessor) {
		if (!ModuleScope.WamExampleTemplateEffect) ModuleScope.WamExampleTemplateEffect = WamExampleTemplateEffect;
	}

	return WamExampleTemplateEffect;
 }

 export default getWamExampleTemplateEffect;