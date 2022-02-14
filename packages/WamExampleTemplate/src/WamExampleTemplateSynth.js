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
/** @typedef {import('./types').WamExampleTemplateSynth} IWamExampleTemplateSynth */
/** @typedef {typeof import('./types').WamExampleTemplateSynth} WamExampleTemplateSynthConstructor */

/**
 * @param {string} [moduleId]
 * @returns {WamExampleTemplateSynthConstructor}
 */
 const getWamExampleTemplateSynth = (moduleId) => {

	/** @type {AudioWorkletGlobalScope} */
	// @ts-ignore
	const audioWorkletGlobalScope = globalThis;

	/** @type {WamExampleTemplateModuleScope} */
	const ModuleScope = audioWorkletGlobalScope.webAudioModules.getModuleScope(moduleId);
	const { WamParameterInfo } = ModuleScope;

	/**
	 * @param {number} note
	 */
	function noteToHz(note) { return 2.0 ** ((note - 69) / 12.0) * 440.0; }

	/**
	 * Template for synth part (mono output)
	 *
	 * @class
	 */
	class WamExampleTemplateSynthPart {
		/**
		 * @param {number} samplesPerQuantum
		 * @param {number} sampleRate
		 */
		constructor(samplesPerQuantum, sampleRate) {
			/** @private @type {number} current sample rate */
			this._sampleRate = sampleRate;

			/** @private @type {number} current gain */
			this._gain = 0.0;

			/** @private @type {boolean} whether or not the part is currently active */
			this._active = false;
		}

		/**
		 * Put the part into idle state
		 */
		reset() {
			this._active = false;
		}

		/**
		 * Trigger envelope attack and start oscillator(s)
		 * (add arguments as needed for your processing code)
		 */
		start(gain) {
			this._active = true;
			// your code here
			this._gain = gain * 0.1;
		}

		/**
		 * Trigger envelope release
		 * @param {boolean} force whether or not to force a fast release
		 */
		stop(force) {
			// your code here
			this._active = false;
		}

		/**
		 * Add output to the signal buffer
		 * @param {number} startSample beginning of processing slice
		 * @param {number} endSample end of processing slice
		 * @param {Float32Array} signal single-channel signal buffer
		 */
		process(startSample, endSample, signal) {
			if (!this._active) return false;

			let n = startSample;
			while (n < endSample) {
				// your processing code here
				signal[n] += this._gain * (Math.random() - 0.5);
				n++;
			}

			return this._active;
		}
	}

	/**
	 * Template for stereo synth voice
	 *
	 * @class
	 */
	class WamExampleTemplateSynthVoice {
		/**
		 * @param {number} samplesPerQuantum
		 * @param {number} sampleRate
		 * @param {number} voiceIdx unique int to identify voice
		 */
		constructor(samplesPerQuantum, sampleRate, voiceIdx) {
			/** @private @type {number} just two (stereo) */
			this._numChannels = 2;

			/** @private @type {number} current sample rate */
			this._sampleRate = sampleRate;

			/** @private @type {number} current MIDI channel (when active) */
			this._channel = -1;

			/** @private @type {number} current MIDI note (when active) */
			this._note = -1;

			/** @private @type {number} current MIDI velocity (when active) */
			this._velocity = -1;

			/** @private @type {number} time corresponding to when current note began (when active) */
			this._timestamp = -1;

			/** @private @type {boolean} whether or not the voice is currently active */
			this._active = false;

			/** @private @type {number} counter to track number of times note-off has been received */
			this._deactivating = 0;

			/** @private @type {WamExampleTemplateSynthPart} part for rendering left channel */
			this._leftPart = new WamExampleTemplateSynthPart(samplesPerQuantum, sampleRate);

			/** @private @type {WamExampleTemplateSynthPart} part for rendering right channel */
			this._rightPart = new WamExampleTemplateSynthPart(samplesPerQuantum, sampleRate);
		}

		// read-only properties
		get channel() { return this._channel; }
		get note() { return this._note; }
		get velocity() { return this._velocity; }
		get timestamp() { return this._timestamp; }
		get active() { return this._active; }

		/**
		 * Check if the voice is on the channel and note
		 * @param {number} channel MIDI channel number
		 * @param {number} note MIDI note number
		 * @returns {boolean}
		*/
		matches(channel, note) {
			return this._channel === channel && this._note === note;
		}

		/**
		 * Put the voice into idle state
		 */
		reset() {
			this._channel = -1;
			this._note = -1;
			this._velocity = -1;
			this._timestamp = -1;
			this._active = false;
			this._deactivating = 0;

			this._leftPart.reset();
			this._rightPart.reset();
		}

		/**
		 * Trigger the attack of a new note
		 * @param {number} channel MIDI channel number
		 * @param {number} note MIDI note number
		 * @param {number} velocity MIDI velocity number
		 */
		noteOn(channel, note, velocity) {
			this._channel = channel;
			this._note = note;
			this._velocity = velocity;
			this._timestamp = globalThis.currentTime;
			this._active = true;
			this._deactivating = 0;
			const gain = this.velocity / 127;

			this._leftPart.start(gain);
			this._rightPart.start(gain);
		}

		/**
		 * Trigger the release of an active note
		 * @param {number} channel MIDI channel number
		 * @param {number} note MIDI note number
		 * @param {number} velocity MIDI velocity number
		 */
		// eslint-disable-next-line no-unused-vars
		noteOff(channel, note, velocity) {
			this._deactivating += 1;
			const force = this._deactivating > 2;
			this._leftPart.stop(force);
			this._rightPart.stop(force);
		}

		/**
		 * Add output from each part to the output buffers
		 * @param {number} startSample beginning of processing slice
		 * @param {number} endSample end of processing slice
		 * @param {Float32Array[]} inputs
		 * @param {Float32Array[]} outputs
		 * @returns {boolean} whether or not the voice is still active
		 */
		process(startSample, endSample, inputs, outputs) {
			if (!this._active) return false;

			const leftActive = this._leftPart.process(startSample, endSample, outputs[0]);
			const rightActive = this._rightPart.process(startSample, endSample, outputs[1]);

			this._active = (leftActive || rightActive);
			return this._active;
		}
	}

	/**
	 * Example polyphonic stereo synth.
	 *
	 * @class
	 * @implements {IWamExampleTemplateSynth}
	 */
	class WamExampleTemplateSynth {
		/**
		 * Fetch synth's params.
		 * @returns {WamParameterInfoMap}
		 */
		static generateWamParameterInfo() {
			return {
				// your synth parameters here
			};
		}

		/**
		 * @param {WamParameterInterpolatorMap} parameterInterpolators
		 * @param {number} samplesPerQuantum
		 * @param {number} sampleRate
		 * @param {Object} config optional config object
		 */
		/* eslint-disable-next-line no-unused-vars */
		constructor(parameterInterpolators, samplesPerQuantum, sampleRate, config = {}) {
			/** @private @type {number} just two (stereo) */
			this._numChannels = 2;

			/** @private @type {number} number of voices allocated */
			this._numVoices = config.numVoices ?? 16;

			/** @private @type {boolean} whether or not to add the input to the synth's output */
			this._passInput = config.passInput ?? false;

			/** @private @type {WamParameterInfoMap} */
			// @ts-ignore
			this._parameterInfo = this.constructor.generateWamParameterInfo();

			/** @private @type {WamParameterInterpolatorMap} */
			this._parameterInterpolators = {};
			Object.keys(this._parameterInfo).forEach((parameterId) => {
				this._parameterInterpolators[parameterId] = parameterInterpolators[parameterId];
			});

			/** @private @type {Uint8Array} array of voice state flags */
			this._voiceStates = new Uint8Array(this._numVoices);
			this._voiceStates.fill(0);

			/** @private @type {WamExampleTemplateSynthVoice[]} list of allocated voices */
			this._voices = [];
			let i = 0;
			while (i < this._numVoices) {
				this._voices.push(new WamExampleTemplateSynthVoice(samplesPerQuantum, sampleRate, i));
				i++;
			}
		}

		/** Put all voices into idle state */
		reset() {
			this._voiceStates.fill(0);
			let i = 0;
			while (i < this._numVoices) {
				this._voices[i].reset();
				i++;
			}
		}

		/**
		 * Start a new voice on the channel and note
		 * @param {number} channel MIDI channel number
		 * @param {number} note MIDI note number
		 * @param {number} velocity MIDI velocity number
		 */
		noteOn(channel, note, velocity) {
			/* stop any matching voices */
			this.noteOff(channel, note, velocity);

			/* start an idle voice, stealing the eldest active one if necessary */
			let oldestTimestamp = globalThis.currentTime;
			let oldestIdx = 0;
			let allocatedIdx = -1;
			let i = 0;
			while (i < this._numVoices) {
				if (this._voiceStates[i] === 0) {
					allocatedIdx = i;
					break;
				}
				if (this._voices[i].timestamp <= oldestTimestamp) {
					oldestTimestamp = this._voices[i].timestamp;
					oldestIdx = i;
				}
				i++;
			}
			if (allocatedIdx === -1) {
				/* no idle voices, steal the oldest one */
				this.noteEnd(oldestIdx);
				allocatedIdx = oldestIdx;
			}
			this._voiceStates[allocatedIdx] = 1;
			this._voices[allocatedIdx].noteOn(channel, note, velocity);
		}

		/**
		 * Stop active voices on the channel and note
		 * @param {number} channel MIDI channel number
		 * @param {number} note MIDI note number
		 * @param {number} velocity MIDI velocity number
		 */
		noteOff(channel, note, velocity) {
			/* stop all matching voices */
			let i = 0;
			while (i < this._numVoices) {
				if (this._voiceStates[i] === 1 && this._voices[i].matches(channel, note)) {
					this._voices[i].noteOff(channel, note, velocity);
				}
				i++;
			}
		}

		/**
		 * Terminate a voice
		 * @param {number} voiceIdx the index of the ending voice
		 */
		noteEnd(voiceIdx) {
			/* update voice state */
			this._voiceStates[voiceIdx] = 0;
			this._voices[voiceIdx].reset();
		}

		/**
		 * Add output from all active voices to the output buffers
		 * @param {number} startSample beginning of processing slice
		 * @param {number} endSample end of processing slice
		 * @param {Float32Array[]} inputs
		 * @param {Float32Array[]} outputs
		 */
		process(startSample, endSample, inputs, outputs) {
			// copy input if applicable
			if (this._passInput) {
				for (let c = 0; c < this._numChannels; ++c) {
					let n = startSample;
					while (n < endSample) {
						outputs[c][n] = inputs[c][n];
						n++;
					}
				}
			}

			// render active voices
			let i = 0;
			while (i < this._numVoices) {
				if (this._voiceStates[i] === 1) {
					const stillActive = this._voices[i].process(startSample, endSample, inputs, outputs);
					if (!stillActive) this.noteEnd(i);
				}
				i++;
			}
		}
	}

	if (audioWorkletGlobalScope.AudioWorkletProcessor) {
		if (!ModuleScope.WamExampleTemplateSynth) ModuleScope.WamExampleTemplateSynth = WamExampleTemplateSynth;
	}

	return WamExampleTemplateSynth;
 }

 export default getWamExampleTemplateSynth