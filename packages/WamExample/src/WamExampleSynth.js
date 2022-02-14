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
/** @typedef {import('./types').WamExampleSynth} IWamExampleSynth */
/** @typedef {typeof import('./types').WamExampleSynth} WamExampleSynthConstructor */
/** @typedef {import('./types').WamExampleLowpassFilter} IWamExampleLowpassFilter */
/** @typedef {import('./types').WamExampleDcBlockerFilter} IWamExampleDcBlockerFilter */

/**
 * @param {string} moduleId
 * @returns {WamExampleSynthConstructor}
 */
const getWamExampleSynth = (moduleId) => {

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

	/**
	 * @param {number} note
	 */
	function noteToHz(note) { return 2.0 ** ((note - 69) / 12.0) * 440.0; }

	/**
	 * Example envelope/waveshaper which both applies an amplitude envelope and
	 * alters the signal's tonal character via time-varying nonlinear gain
	 *
	 * @class
	 */
	class WamExampleEnvelopeShaper {
		/**
		 * enum for envelope segments.
		 * @readonly
		 */
		static Segment = Object.freeze({
			IDLE: 'idle',
			ATTACK: 'attack',
			SUSTAIN: 'sustain',
			RELEASE: 'release',
			CEASE: 'cease',
		});

		/**
		 * @param {number} attackMaxMs maximum duration of attack segment (ms)
		 * @param {number} levelMax maximum envelope level [0.0, 1.0]
		 * @param {number} samplesPerQuantum
		 * @param {number} sampleRate
		 */
		constructor(attackMaxMs, levelMax, samplesPerQuantum, sampleRate) {
			/** @type {typeof WamExampleEnvelopeShaper} */
			this.constructor;
			this._sampleRate = sampleRate;

			this._levelThreshold = 0.0001;
			this._levelMin = Math.max(this._levelThreshold, 1.0 - levelMax);
			this._levelMax = levelMax;
			this._levelRange = this._levelMax - this._levelMin;
			this._levelTarget = 0.0;
			this._levelCurrent = 0.0;
			this._levelInc = 0.0;

			this._attackMaxSec = attackMaxMs / 1000.0;
			this._attackMinSamples = 128;
			this._releaseMinSamples = 512;

			this._samplesPerQuantum = samplesPerQuantum;
			this._envelope = new Float32Array(samplesPerQuantum);

			this._rampIdx = 0;
			this._rampSamples = 0;
			this._segment = this.constructor.Segment.IDLE;
		}

		/**
		 * Configure envelope and trigger attack ramp. Lower intensity means lower amplitude,
		 * less linear ramps, and longer ramps. Higher intensity means higher amplitude,
		 * more linear ramps, and shorter ramps.
		 * @param {number} intensity controls amplitude and nonlinearity of envelope [0.0, 1.0]
		 */
		start(intensity) {
			intensity = Math.min(1.0, intensity + this._levelThreshold);
			const oneMinusIntensity = Math.max(this._levelThreshold, 1.0 - intensity);
			const rampSec = oneMinusIntensity * this._attackMaxSec;
			this._rampIdx = 0;
			this._rampSamples = Math.max(this._attackMinSamples, Math.round(rampSec * this._sampleRate));
			this._levelCurrent = 0.0;
			this._levelTarget = this._levelMin + this._levelRange * intensity;// * intensity
			this._levelInc = this._levelTarget / this._rampSamples;
			this._segment = this.constructor.Segment.ATTACK;
		}

		/**
		 * Trigger the release ramp
		 * @param {boolean} force whether or not to force a fast release
		 */
		stop(force) {
			// allow ramp to finish if already underway
			if (this._segment === this.constructor.Segment.CEASE) return;
			if (!force && this._segment === this.constructor.Segment.RELEASE) return;

			this._rampIdx = 0;
			this._levelTarget = 0.0;
			if (this._levelCurrent < this._levelThreshold) this._rampSamples = 0; // almost silent anyway, don't ramp
			else {
				if (force) { // fast release
					this._rampSamples = this._releaseMinSamples;
					this._segment = this.constructor.Segment.CEASE;
				} else { // normal release
					this._rampSamples *= 2;
					this._rampSamples += this._releaseMinSamples;
					this._segment = this.constructor.Segment.RELEASE;
				}
				this._levelInc = -this._levelCurrent / this._rampSamples;
			}
		}

		/**
		 * Apply envelope to the signal buffer
		 * @param {number} startSample beginning of processing slice
		 * @param {number} endSample end of processing slice
		 * @param {Float32Array} signal single-channel signal buffer
		 * @returns {boolean} whether or not the envelope is still active
		 */
		process(startSample, endSample, signal) {
			let ramping = false;
			if (this._rampIdx < this._rampSamples) {
				ramping = true;
				if ((this._levelInc < 0.0 && this._levelCurrent <= this._levelThreshold)
					|| (this._levelInc > 0.0 && this._levelCurrent >= this._levelTarget)) {
					this._levelCurrent = this._levelTarget;
					this._rampIdx = this._rampSamples;
					ramping = false;
				} else {
					const M = this._rampSamples - this._rampIdx;
					let n = startSample;
					const N = Math.min(startSample + M, endSample);
					while (n < N) {
						this._envelope[n] = this._levelCurrent;
						this._levelCurrent += this._levelInc;
						n++;
					}
					this._rampIdx += N - startSample;
					if (N < endSample) this._envelope.fill(this._levelTarget, N, endSample);
				}
			}

			if (!ramping) {
				if (this._levelTarget === 0.0) {
					this._segment = this.constructor.Segment.IDLE;
					signal.fill(0.0, startSample, endSample);
					return false;
				}
				this._segment = this.constructor.Segment.SUSTAIN;
				this._envelope.fill(this._levelTarget, startSample, endSample);
			}

			let n = startSample;
			while (n < endSample) {
				let x = signal[n] + this._levelInc;
				const sign = x >= 0 ? 1.0 : -1.0;
				const envelope = this._envelope[n];
				x *= envelope
				const xx = x * x;
				signal[n] = (sign * envelope * xx) / (1.0 + xx);
				n++;
			}
			return true;
		}
	}

	/**
	 * Example oscillator with 'clean' (regular sine) and 'dirty' (rectified sine)
	 * modes and optional phase offset.
	 *
	 * Based on Bhaskara I's sine approximation:
	 * https://en.wikipedia.org/wiki/Bhaskara_I%27s_sine_approximation_formula
	 *
	 * @class
	 */
	class WamExampleOscillator {
		/**
		 * enum for oscillator modes.
		 * @readonly
		 */
		static Mode = Object.freeze({
			IDLE: 'idle',
			CLEAN: 'clean',
			DIRTY: 'dirty',
		});

		/**
		 * @param {number} sampleRate
		 */
		constructor(sampleRate) {
			/** @type {typeof WamExampleOscillator} */
			this.constructor;
			this._sampleRate = sampleRate;
			this._mode = this.constructor.Mode.IDLE;
			this._alpha = 5 * Math.PI ** 2.0;
			this._phase = 0.0;
			this._phaseInc = 0.0;
			this._phaseMin = 0.0;
			this._phaseMax = Math.PI;
			this._phaseWidth = this._phaseMax - this._phaseMin;
			this._amplitude = 0.0;
		}

		/**
		 * Configure and start the oscillator
		 * @param {string} mode ['clean', 'dirty']
		 * @param {number} frequencyHz
		 * @param {number} gain [0.0, 1.0]
		 * @param {number} phaseOffsetNorm starting phase [0.0, 1.0]
		 */
		start(mode, frequencyHz, gain, phaseOffsetNorm = 0.0) {
			this._phase = this._phaseMin + phaseOffsetNorm * this._phaseWidth;
			while (this._phase > this._phaseMax) this._phase -= this._phaseWidth;
			while (this._phase < this._phaseMin) this._phase += this._phaseWidth;

			let frequencyNorm = frequencyHz / this._sampleRate;
			this._mode = mode;

			if (this._mode === this.constructor.Mode.DIRTY) {
				this._bias = -0.5;
				this._flip = 1.0;
				frequencyNorm *= 0.5;
			} else if (this._mode === this.constructor.Mode.CLEAN) {
				this._bias = 0.0;
				this._flip = -1.0;
			}

			this._phaseInc = this._phaseWidth * frequencyNorm;
			this._amplitude = gain * Math.min(0.5, Math.max(0.1, 0.5 - frequencyNorm)) + 0.1;
		}

		/**
		 * Fill the signal buffer with oscillator output
		 * @param {number} startSample beginning of processing slice
		 * @param {number} endSample end of processing slice
		 * @param {Float32Array} signal single-channel signal buffer
		 */
		process(startSample, endSample, signal) {
			let n = startSample;
			while (n < endSample) {
				const phase = this._phase;
				this._phase += this._phaseInc;
				if (this._phase >= this._phaseMax) {
					this._phase -= this._phaseWidth;
					this._amplitude *= this._flip;
				}
				const beta = 4.0 * phase * (Math.PI - phase);
				signal[n] = this._amplitude * ((4.0 * beta) / (this._alpha - beta) + this._bias);
				n++;
			}
		}
	}

	/**
	 * Example synth part (mono output)
	 *
	 * @class
	 */
	class WamExampleSynthPart {
		/**
		 * enum for synth part modes.
		 * @readonly
		 */
		static Mode = Object.freeze({
			...WamExampleOscillator.Mode,
			CLEANDIRTY: 'clean-dirty',
			DIRTYDIRTY: 'dirty-dirty',
			RANDOM: 'random',
		});

		/**
		 * @param {number} attackMaxMs maximum duration of envelope attack segment (ms)
		 * @param {number} levelMax maximum level of envelope [0.0, 1.0]
		 * @param {number} samplesPerQuantum
		 * @param {number} sampleRate
		 */
		constructor(attackMaxMs, levelMax, samplesPerQuantum, sampleRate) {
			/** @type {typeof WamExampleSynthPart} */
			this.constructor;
			/** @private @type {number} current sample rate */
			this._sampleRate = sampleRate;

			/** @private @type {boolean} whether or not the part is currently active */
			this._active = false;

			/** @private @type {string} current oscillator mode */
			this._mode = this.constructor.Mode.RANDOM;

			/** @private @type {Float32Array} buffer to store output from oscillator 1 */
			this._buffer1 = new Float32Array(samplesPerQuantum);

			/** @private @type {Float32Array} buffer to store output from oscillator 2 */
			this._buffer2 = new Float32Array(samplesPerQuantum);

			/** @private @type {WamExampleEnvelopeShaper} envelope shaper component */
			this._shaper = new WamExampleEnvelopeShaper(attackMaxMs, levelMax, samplesPerQuantum, sampleRate);

			/** @private @type {WamExampleOscillator} oscillator component */
			this._oscillator1 = new WamExampleOscillator(sampleRate);

			/** @private @type {WamExampleOscillator} oscillator component */
			this._oscillator2 = new WamExampleOscillator(sampleRate);

			/** @private @type {boolean} whether or not _oscillator2 is active */
			this._oscillator2Active = false;

			/** @private @type {IWamExampleLowpassFilter} lowpass filter component */
			this._lowpass1 = new WamExampleLowpassFilter();

			/** @private @type {IWamExampleLowpassFilter} lowpass filter component */
			this._lowpass2 = new WamExampleLowpassFilter();

			/** @private @type {IWamExampleDcBlockerFilter} dc blocking filter component */
			this._dcblocker = new WamExampleDcBlockerFilter();
		}

		/**
		 * Put the part into idle state
		 */
		reset() {
			this._active = false;
			this._oscillator2Active = false;
			this._lowpass1.reset();
			this._lowpass2.reset();
			this._dcblocker.reset();
		}

		/**
		 * Trigger envelope attack and start oscillator(s)
		 * @param {string} mode voice mode ['clean', 'dirty', 'clean-dirty', 'dirty-dirty']
		 * @param {number} intensity voice intensity [0.0, 1.0]
		 * @param {number} oscillatorFreqHz oscillator frequency
		 * @param {number} filterFreqHz filter frequency
		 * @param {number} phaseOffsetNorm oscillator starting phase [0.0, 1.0]
		 */
		start(mode, intensity, oscillatorFreqHz, filterFreqHz, phaseOffsetNorm = 0.0) {
			this._active = true;
			let mode1 = this.constructor.Mode.IDLE;
			let mode2 = this.constructor.Mode.IDLE;
			let gain1 = 0.0;
			let gain2 = 0.0
			let phaseOffsetNorm1 = phaseOffsetNorm;
			let phaseOffsetNorm2 = phaseOffsetNorm;

			if (mode === this.constructor.Mode.RANDOM) {
				const modeKeys = Object.keys(this.constructor.Mode);
				const modeMin = 1; // exclude IDLE
				const modeMax = modeKeys.length - 2; // exclude RANDOM
				const modeRange = modeMax - modeMin;
				mode = this.constructor.Mode[modeKeys[modeMin + Math.floor(modeRange * Math.random())]];
			}
			this._mode = mode;
			switch (mode) {
			case this.constructor.Mode.CLEAN:
				mode1 = mode;
				gain1 = 0.5;
				break;
			case this.constructor.Mode.DIRTY:
				mode1 = mode;
				gain1 = 1.0;
				break;
			case this.constructor.Mode.CLEANDIRTY:
				mode1 = this.constructor.Mode.CLEAN;
				mode2 = this.constructor.Mode.DIRTY;
				gain1 = 0.5;
				gain2 = 0.5;
				phaseOffsetNorm1 += 0.5
				phaseOffsetNorm2 += 0.25;
				break;
			case this.constructor.Mode.DIRTYDIRTY:
				mode1 = this.constructor.Mode.DIRTY;
				mode2 = this.constructor.Mode.DIRTY;
				gain1 = 0.667
				gain2 = 1.333;
				phaseOffsetNorm2 += 0.25;
				break;
			default: break;
			}

			this._shaper.start(intensity/*, this._sampleRate*/);

			this._oscillator1.start(mode1, oscillatorFreqHz, gain1, phaseOffsetNorm1);
			if (mode2 !== this.constructor.Mode.IDLE) {
				this._oscillator2.start(mode2, oscillatorFreqHz, gain2, phaseOffsetNorm2);
				this._oscillator2Active = true;
			}

			this._lowpass1.reset();
			this._lowpass2.reset();
			this._dcblocker.reset();
			this._lowpass1.update(filterFreqHz, this._sampleRate);
			this._lowpass2.update(filterFreqHz, this._sampleRate);
		}

		/**
		 * Trigger envelope release
		 * @param {boolean} force whether or not to force a fast release
		 */
		stop(force) {
			this._shaper.stop(force);
		}

		/**
		 * Add output to the signal buffer
		 * @param {number} startSample beginning of processing slice
		 * @param {number} endSample end of processing slice
		 * @param {Float32Array} signal single-channel signal buffer
		 */
		process(startSample, endSample, signal) {
			if (!this._active) return false;

			this._oscillator1.process(startSample, endSample, this._buffer1);
			if (this._oscillator2Active) {
				this._oscillator2.process(startSample, endSample, this._buffer2);
				if (this._mode === this.constructor.Mode.CLEANDIRTY) {
					let n = startSample;
					while (n < endSample) {
						this._buffer1[n] -= this._buffer2[n];
						n++;
					}
				} else { // DIRTYDIRTY
					let n = startSample;
					while (n < endSample) {
						this._buffer1[n] += this._buffer2[n];
						n++;
					}
				}
			}
			this._lowpass1.process(startSample, endSample, this._buffer1);
			this._active = this._shaper.process(startSample, endSample, this._buffer1);
			this._dcblocker.process(startSample, endSample, this._buffer1);
			this._lowpass2.process(startSample, endSample, this._buffer1);

			let n = startSample;
			while (n < endSample) {
				signal[n] += this._buffer1[n];
				n++;
			}

			return this._active;
		}
	}

	/**
	 * Example stereo synth voice
	 *
	 * @class
	 */
	class WamExampleSynthVoice {
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

			const attackMaxMs = 500.0;
			const levelMax = 0.9;

			/** @private @type {WamExampleSynthPart} part for rendering left channel */
			this._leftPart = new WamExampleSynthPart(attackMaxMs, levelMax, samplesPerQuantum, sampleRate);

			/** @private @type {WamExampleSynthPart} part for rendering right channel */
			this._rightPart = new WamExampleSynthPart(attackMaxMs, levelMax, samplesPerQuantum, sampleRate);
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
		 * @param {string} leftMode mode for voice's left channel
		 * @param {string} rightMode mode for voice's right channel
		 */
		noteOn(channel, note, velocity, leftMode, rightMode) {
			this._channel = channel;
			this._note = note;
			this._velocity = velocity;
			this._timestamp = globalThis.currentTime;
			this._active = true;
			this._deactivating = 0;

			const intensity = Math.min(0.999, (velocity + 73.0) / 200.0);

			const frequencyMaxHz = 18000.0;
			const frequencyMinHz = 20.0;
			let oscillatorFreqHz = noteToHz(note);
			oscillatorFreqHz = Math.max(Math.min(oscillatorFreqHz, frequencyMaxHz), frequencyMinHz);

			let filterFreqHz = oscillatorFreqHz + (frequencyMaxHz - oscillatorFreqHz) ** intensity;
			filterFreqHz = Math.max(Math.min(filterFreqHz, frequencyMaxHz), frequencyMinHz);

			this._leftPart.start(leftMode, intensity, oscillatorFreqHz, filterFreqHz);
			this._rightPart.start(rightMode, intensity, oscillatorFreqHz, filterFreqHz, 0.25);
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
	 * @implements {IWamExampleSynth}
	 */
	class WamExampleSynth {
		static _VoiceModes = Object.keys(WamExampleSynthPart.Mode).reduce((list, mode) => {
			if (mode !== 'IDLE') list.push(String(WamExampleSynthPart.Mode[mode]));
			return list;
		}, []);

		/**
		 * Fetch synth's params.
		 * @returns {WamParameterInfoMap}
		 */
		static generateWamParameterInfo() {
			return {
				leftVoiceMode: new WamParameterInfo('leftVoiceMode', {
					type: 'choice',
					label: 'Left Channel Waveform',
					choices: this._VoiceModes,
					defaultValue: 4, // random mode
				}),
				rightVoiceMode: new WamParameterInfo('rightVoiceMode', {
					type: 'choice',
					label: 'Right Channel Waveform',
					choices: this._VoiceModes,
					defaultValue: 4, // random mode
				}),
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
			this._numChannels = config.numChannels ?? 2;

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

			/** @private @type {WamExampleSynthVoice[]} list of allocated voices */
			this._voices = [];
			let i = 0;
			while (i < this._numVoices) {
				this._voices.push(new WamExampleSynthVoice(samplesPerQuantum, sampleRate, i));
				i++;
			}

			/** @private @type {string} waveform mode for left channel */
			this._leftVoiceMode = WamExampleSynthPart.Mode.IDLE;

			/** @private @type {string} waveform mode for right channel */
			this._rightVoiceMode = WamExampleSynthPart.Mode.IDLE;
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
			this._voices[allocatedIdx].noteOn(channel, note, velocity, this._leftVoiceMode, this._rightVoiceMode);
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
			// update parameters
			const leftVoiceModeValue = this._parameterInterpolators.leftVoiceMode.values[startSample];
			this._leftVoiceMode = this._parameterInterpolators.leftVoiceMode.info.valueString(leftVoiceModeValue);

			const rightVoiceModeValue = this._parameterInterpolators.rightVoiceMode.values[startSample];
			this._rightVoiceMode = this._parameterInterpolators.rightVoiceMode.info.valueString(rightVoiceModeValue);

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
		if (!ModuleScope.WamExampleSynth) ModuleScope.WamExampleSynth = WamExampleSynth;
	}

	return WamExampleSynth;
}

export default getWamExampleSynth;
