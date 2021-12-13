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
/** @typedef {import('../../api').AudioWorkletProcessor} AudioWorkletProcessor */
/** @typedef {import('../../api').WamProcessor} WamProcessor */
/** @typedef {import('../../api').WamParameter} WamParameter */
/** @typedef {import('../../sdk').WamParameterInterpolator} WamParameterInterpolator */
/** @typedef {import('../../api').WamParameterInfo} WamParameterInfo */
/** @typedef {import('../../api').WamParameterInfoMap} WamParameterInfoMap */
/** @typedef {import('../../api').WamParameterData} WamParameterData */
/** @typedef {import('../../api').WamParameterDataMap} WamParameterDataMap */
/** @typedef {import('../../api').WamParameterMap} WamParameterMap */
/** @typedef {import('../../api').WamEvent} WamEvent */
/** @typedef {import('../../api').WamMidiData} WamMidiData */
/** @typedef {import('../../sdk').WamArrayRingBuffer} WamArrayRingBuffer */
/** @typedef {import('./types').WamExampleModuleScope} WamExampleModuleScope */
/** @typedef {import('./types').WamExampleProcessor} IWamExampleProcessor */
/** @typedef {typeof import('./types').WamExampleProcessor} WamExampleProcessorConstructor */
/** @typedef {import('./types').WamExampleEffect} IWamExampleEffect */
/** @typedef {import('./types').WamExampleSynth} IWamExampleSynth */

/**
 * @param {string} moduleId
 * @returns {WamExampleProcessorConstructor}
 */
const getWamExampleProcessor = (moduleId) => {

	/** @type {AudioWorkletGlobalScope} */
	// @ts-ignore
	const audioWorkletGlobalScope = globalThis;
	const { registerProcessor } = audioWorkletGlobalScope;

	/** @type {WamExampleModuleScope} */
	const ModuleScope = audioWorkletGlobalScope.webAudioModules.getModuleScope(moduleId);
	const {
		RingBuffer,
		WamArrayRingBuffer,
		WamProcessor,
		WamParameterInfo,
		WamExampleSynth,
		WamExampleEffect,
	} = ModuleScope;

	const LevelsUpdatePeriodSec = 1.0 / 30.0;
	const LevelsUpdatePeriodMs = LevelsUpdatePeriodSec * 1000;

	/**
	 * `WamExample`'s `AudioWorkletProcessor`
	 *
	 * @class
	 * @extends {WamProcessor}
	 * @implements {IWamExampleProcessor}
	 */
	class WamExampleProcessor extends WamProcessor {
		/**
		 * @param {AudioWorkletNodeOptions} options
		 */
		constructor(options) {
			super(options);

			/** @private @type {IWamExampleSynth} */
			this._synth = null;

			/** @private @type {IWamExampleEffect} */
			this._effect = null;

			/** @private @type {Float32Array} */
			this._levels = new Float32Array(4);

			/** @private @type {Float32Array} */
			this._synthLevels = new Float32Array(this._levels.buffer, 0, 2);

			/** @private @type {Float32Array} */
			this._effectLevels = new Float32Array(this._levels.buffer, 2 * Float32Array.BYTES_PER_ELEMENT, 2);

			/** @private @type {number} coefficient for level smoothing */
			this._levelSmoothA = 0.667;

			/** @private @type {number} coefficient for level smoothing */
			this._levelSmoothB = 1.0 - this._levelSmoothA;

			/** @private @type {number} how often levels should be computed (ms) */
			this._levelsUpdatePeriodMs = LevelsUpdatePeriodMs;

			/** @private @type {number} how often levels should be computed (quantums) */
			this._levelsUpdateRateQuantums = Math.round((LevelsUpdatePeriodSec * globalThis.sampleRate) / this._samplesPerQuantum);

			/** @private @type {number} levels will be computed when this reaches 0 */
			this._levelsUpdateCounter = 0;

			/** @private @type {boolean} */
			this._levelsSabReady = false;
		}

		/**
		 * Fetch plugin's params.
		 * @returns {WamParameterInfoMap}
		 */
		_generateWamParameterInfo() {
			return {
				bypass: new WamParameterInfo('bypass', {
					type: 'boolean',
					label: 'Bypass',
					defaultValue: 0,
				}),
				...WamExampleSynth.generateWamParameterInfo(),
				...WamExampleEffect.generateWamParameterInfo(),
			};
		}

		/**
		 * Post-constructor initialization method.
		 */
		_initialize() {
			super._initialize();
			const synthConfig = {
				passInput: true,
			};
			this._synth = new WamExampleSynth(this._parameterInterpolators, this._samplesPerQuantum, globalThis.sampleRate,
				synthConfig);

			const effectConfig = {
				numChannels: 2,
				inPlace: true,
			};
			this._effect = new WamExampleEffect(this._parameterInterpolators, this._samplesPerQuantum, globalThis.sampleRate,
				effectConfig);

			this.port.postMessage({ levelsUpdatePeriodMs: this._levelsUpdatePeriodMs });
		}

		_configureSab() {
			super._configureSab();
			this.port.postMessage({ levelsSab: true, levelsLength: 4 });
		}

		/**
		 * @param {any} state
		 */
		_setState(state) {
			this._effect.reset();
			this._synth.reset();
			super._setState(state);
		}

		/**
		 * Messages from main thread appear here.
		 * @param {MessageEvent} message
		 */
		async _onMessage(message) {
			if (message.data.request) {
				const {
					id, request, content,
				} = message.data;
				const response = { id, response: request };
				const requestComponents = request.split('/');
				const verb = requestComponents[0];
				const noun = requestComponents[1];
				response.content = 'error';
				if (verb === 'initialize') {
					if (noun === 'levelsSab') {
						const { levelsSab } = content;

						/** @private @type {SharedArrayBuffer} */
						this._levelsSab = levelsSab;

						/** @private @type {WamArrayRingBuffer} */
						this._levelsWriter = new WamArrayRingBuffer(RingBuffer, this._levelsSab,
							this._levels.length, Float32Array);

						this._levelsSabReady = true;
						delete response.content;
						this.port.postMessage(response);
						return;
					}
				}
			}
			await super._onMessage(message);
		}

		/**
		 *
		 * @param {WamMidiData} midiData
		 */
		_onMidi(midiData) {
			/* eslint-disable no-lone-blocks */
			const bytes = midiData.bytes;
			let type = bytes[0] & 0xf0;
			const channel = bytes[0] & 0x0f;
			const data1 = bytes[1];
			const data2 = bytes[2];
			if (type === 0x90 && data2 === 0) type = 0x80;
			switch (type) {
			case 0x80: { /* note off */
				this._synth.noteOff(channel, data1, data2);
			} break;
			case 0x90: { /* note on */
				this._synth.noteOn(channel, data1, data2);
			} break;
			case 0xa0: { /* aftertouch */ } break;
			case 0xb0: { /* continuous controller */ } break;
			case 0xc0: { /* patch change */ } break;
			case 0xd0: { /* channel pressure */ } break;
			case 0xe0: { /* pitch bend */ } break;
			case 0xf0: { /* system */ } break;
			default: { /* invalid */ } break;
			}
		}

		/**
		 * Implement custom DSP here.
		 * @param {number} startSample beginning of processing slice
		 * @param {number} endSample end of processing slice
		 * @param {Float32Array[][]} inputs
		 * @param {Float32Array[][]} outputs
		 */
		_process(startSample, endSample, inputs, outputs) {
			const input = inputs[0];
			const output = outputs[0];
			if (input.length !== output.length) return;

			const bypass = !!this._parameterInterpolators.bypass.values[startSample];
			const wasBypassed = !!this._parameterInterpolators.bypass.values[0]; // good enough most of the time
			const updateLevels = bypass !== wasBypassed || this._levelsUpdateCounter === 0;
			if (updateLevels) this._levelsUpdateCounter = this._levelsUpdateRateQuantums;
			else this._levelsUpdateCounter--;

			// combine input signal and synth signal -> output
			if (!bypass) this._synth.process(startSample, endSample, input, output);
			for (let c = 0; c < output.length; ++c) {
				const x = input[c];
				const y = output[c];

				if (bypass) {
					// pass input directly to output
					let n = startSample;
					while (n < endSample) {
						y[n] = x[n];
						n++;
					}
					this._synthLevels[c] = 0.0;
					this._effectLevels[c] = 0.0;
				} else if (updateLevels) {
					let synthLevel = 0.0;
					let n = startSample;
					while (n < endSample) {
						synthLevel += Math.abs(y[n] - x[n]);
						n++;
					}
					if (Number.isNaN(synthLevel)) synthLevel = 0.0;
					this._synthLevels[c] *= this._levelSmoothA;
					this._synthLevels[c] += this._levelSmoothB * (synthLevel / this._samplesPerQuantum);
					this._synthLevels[c] = Math.min(Math.max(this._synthLevels[c], 0.0), 1.0);
				}
			}
			if (!bypass) {
				// apply effect to combination of input signal and synth signal
				this._effect.process(startSample, endSample, input, output);
				if (updateLevels) {
					for (let c = 0; c < output.length; ++c) {
						const y = output[c];
						let effectLevel = 0.0;
						let n = startSample;
						while (n < endSample) {
							effectLevel += Math.abs(y[n]);
							n++;
						}
						if (Number.isNaN(effectLevel)) effectLevel = 0.0;
						this._effectLevels[c] *= this._levelSmoothA;
						this._effectLevels[c] += this._levelSmoothB * (effectLevel / this._samplesPerQuantum);
						this._effectLevels[c] = Math.min(Math.max(this._effectLevels[c], 0.0), 1.0);
					}
				}
			}
			if (updateLevels) {
				if (this._levelsSabReady) this._levelsWriter.write(this._levels);
				else super.port.postMessage({ id: -1, levels: this._levels });
			}
		}
	}
	try {
		registerProcessor('WebAudioModuleWamExample', WamExampleProcessor);
	} catch (error) {
		console.warn(error);
	}

	return WamExampleProcessor;
}

export default getWamExampleProcessor;
