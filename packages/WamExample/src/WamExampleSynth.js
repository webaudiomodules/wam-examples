/* eslint-disable object-curly-newline */
/* eslint-disable prefer-destructuring */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-underscore-dangle */
/* eslint-disable max-len */
/* eslint-disable no-undef */
/* eslint-disable no-plusplus */
/* eslint-disable no-bitwise */
/* eslint-disable max-classes-per-file */

/** @typedef { import('./WamExampleComponents').WamExampleComponents } WamExampleComponents */

/** @type {AudioWorkletGlobalScope & globalThis} */
// @ts-ignore
const {
	// @ts-ignore
	WamExampleComponents,
} = globalThis;

const {
	WamExampleLowpassFilter,
	WamExampleDcBlockerFilter,
} = WamExampleComponents;

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
	 * @enum {string}
	 */
	static Segment = Object.freeze({
		IDLE: 'idle',
		ATTACK: 'attack',
		SUSTAIN: 'sustain',
		RELEASE: 'release',
		CEASE: 'cease',
	});

	/**
	 * @param {number} maxAttackMs maximum duration of attack segment (ms)
	 * @param {number} maxLevel maximum envelope level
	 * @param {number} samplesPerQuantum
	 * @param {number} sampleRate
	 */
	constructor(maxAttackMs, maxLevel, samplesPerQuantum, sampleRate) {
		this._sampleRate = sampleRate;

		this._thresholdLevel = 0.000001;
		this._maxLevel = maxLevel;
		this._targetLevel = 0.0;
		this._currentLevel = 0.0;
		this._levelInc = 0.0;

		this._maxAttackSec = maxAttackMs / 1000.0;
		this._minAttackSamples = 32;
		this._minReleaseSamples = 256;

		this._samplesPerQuantum = samplesPerQuantum;
		this._envelope = new Float32Array(samplesPerQuantum);

		this._rampIdx = 0;
		this._rampDurSamples = 0;
		this._segment = this.constructor.Segment.IDLE;
	}

	/**
	 * Configure envelope and trigger attack ramp. Lower intensity means lower amplitude,
	 * less linear ramps, and longer ramps. Higher intensity means higher amplitude,
	 * more linear ramps, and shorter ramps.
	 * @param {number} intensity controls amplitude and nonlinearity of envelope [0.0, 1.0]
	 */
	start(intensity) {
		intensity = Math.min(1.0, intensity + this._thresholdLevel);
		const rampSec = (1.0 - intensity) * this._maxAttackSec;
		this._rampIdx = 0;
		this._rampDurSamples = Math.max(this._minAttackSamples, Math.round(rampSec * this._sampleRate));
		this._currentLevel = 0.0;
		this._targetLevel = intensity * this._maxLevel; // Attenuating here to keep output under control
		this._makeupGain = (1.0 + (2.0 * Math.exp(2.0 - intensity)) / Math.exp(intensity));
		this._levelInc = this._targetLevel / this._rampDurSamples;
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
		this._targetLevel = 0.0;
		if (this._currentLevel < this._thresholdLevel) this._rampDurSamples = 0; // almost silent anyway, don't ramp
		else {
			if (force) { // fast release
				this._rampDurSamples = this._minReleaseSamples;
				this._segment = this.constructor.Segment.CEASE;
			} else { // normal release
				this._rampDurSamples *= 2;
				this._segment = this.constructor.Segment.RELEASE;
			}
			this._levelInc = -this._currentLevel / this._rampDurSamples;
		}
	}

	/**
	 * Apply envelope to the signal buffer
	 * @param {number} startSample beginning of processing slice
	 * @param {number} endSample end of processing slice
	 * @param {Float32Array[]} signal single-channel signal buffer
	 * @returns {boolean} whether or not the envelope is still active
	 */
	process(startSample, endSample, signal) {
		let ramping = false;
		if (this._rampIdx < this._rampDurSamples) {
			ramping = true;
			if ((this._levelInc < 0.0 && this._currentLevel <= this._thresholdLevel)
				|| (this._levelInc > 0.0 && this._currentLevel >= this._targetLevel)) {
				this._currentLevel = this._targetLevel;
				this._rampIdx = this._rampDurSamples;
				ramping = false;
			} else {
				const M = this._rampDurSamples - this._rampIdx;
				let n = startSample;
				const N = Math.min(startSample + M, endSample);
				while (n < N) {
					this._envelope[n] = this._currentLevel;
					this._currentLevel += this._levelInc;
					n++;
				}
				this._rampIdx += N - startSample;
				if (N < endSample) this._envelope.fill(this._targetLevel, N, endSample);
			}
		}

		if (!ramping) {
			if (this._targetLevel === 0.0) {
				this._segment = this.constructor.Segment.IDLE;
				signal.fill(0.0, startSample, endSample);
				return false;
			}
			this._segment = this.constructor.Segment.SUSTAIN;
			this._envelope.fill(this._targetLevel, startSample, endSample);
		}

		let n = startSample;
		while (n < endSample) {
			let x = signal[n] + this._levelInc;
			const envelope = this._envelope[n];
			const sign = x >= 0 ? 1.0 : -1.0;
			x *= envelope * this._makeupGain;
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
	 * @enum {string}
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
	 * @param {number} phaseOffsetNorm starting phase [0.0, 1.0]
	 */
	start(mode, frequencyHz, phaseOffsetNorm = 0.0) {
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
		this._amplitude = Math.min(0.7, Math.max(0.1, 0.7 - frequencyNorm)) + 0.2;
	}

	/**
	 * Fill the signal buffer with oscillator output
	 * @param {number} startSample beginning of processing slice
	 * @param {number} endSample end of processing slice
	 * @param {Float32Array[]} signal single-channel signal buffer
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
	 * @enum {string}
	 */
	static Mode = Object.freeze({
		...WamExampleOscillator.Mode,
		CLEANDIRTY: 'clean-dirty',
		DIRTYDIRTY: 'dirty-dirty',
		RANDOM: 'random',
	});

	/**
	 * @param {number} maxAttackMs maximum duration of envelope attack segment (ms)
	 * @param {number} maxLevel maximum level of envelope
	 * @param {number} samplesPerQuantum
	 * @param {number} sampleRate
	 */
	constructor(maxAttackMs, maxLevel, samplesPerQuantum, sampleRate) {
		/** @property {number} _sampleRate current sample rate */
		this._sampleRate = sampleRate;

		/** @property {boolean} _active whether or not the part is currently active */
		this._active = false;

		/** @property {Float32Array} _buffer1 buffer to store output from oscillator 1 */
		this._buffer1 = new Float32Array(samplesPerQuantum);

		/** @property {Float32Array} _buffer2 buffer to store output from oscillator 2 */
		this._buffer2 = new Float32Array(samplesPerQuantum);

		/** @property {WamExampleEnvelopeShaper} _shaper envelope shaper component */
		this._shaper = new WamExampleEnvelopeShaper(maxAttackMs, maxLevel, samplesPerQuantum, sampleRate);

		/** @property {WamExampleOscillator} _oscillator1 oscillator component */
		this._oscillator1 = new WamExampleOscillator(sampleRate);

		/** @property {WamExampleOscillator} _oscillator2 oscillator component */
		this._oscillator2 = new WamExampleOscillator(sampleRate);

		/** @property {boolean} _oscillator2Active whether or not _oscillator2 is active */
		this._oscillator2Active = false;

		/** @property {WamExampleLowpassFilter} _lowpass1 lowpass filter component */
		this._lowpass1 = new WamExampleLowpassFilter();

		/** @property {WamExampleLowpassFilter} _lowpass2 lowpass filter component */
		this._lowpass2 = new WamExampleLowpassFilter();

		/** @property {WamExampleDcBlockerFilter} _dcblocker dc blocking filter component */
		this._dcblocker = new WamExampleDcBlockerFilter();
	}

	/**
	 * Put the part into idle state
	 */
	reset() {
		this._active = false;
		this._oscillator2Active = false;
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

		if (mode === this.constructor.Mode.RANDOM) {
			const modeKeys = Object.keys(this.constructor.Mode);
			const modeMin = 1; // exclude IDLE
			const modeMax = modeKeys.length - 2; // exclude RANDOM
			const modeRange = modeMax - modeMin;
			mode = this.constructor.Mode[modeKeys[modeMin + Math.floor(modeRange * Math.random())]];
		}
		switch (mode) {
		case this.constructor.Mode.CLEAN:
			mode1 = mode;
			break;
		case this.constructor.Mode.DIRTY:
			mode1 = mode;
			break;
		case this.constructor.Mode.CLEANDIRTY:
			mode1 = this.constructor.Mode.CLEAN;
			mode2 = this.constructor.Mode.DIRTY;
			break;
		case this.constructor.Mode.DIRTYDIRTY:
			mode1 = this.constructor.Mode.DIRTY;
			mode2 = this.constructor.Mode.DIRTY;
			break;
		default: break;
		}

		this._shaper.start(intensity, this._sampleRate);

		this._oscillator1.start(mode1, oscillatorFreqHz, phaseOffsetNorm);
		if (mode2 !== this.constructor.Mode.IDLE) {
			this._oscillator2.start(mode2, oscillatorFreqHz, phaseOffsetNorm + 0.25);
			this._oscillator2Active = true;
		}

		this._lowpass1.start(filterFreqHz, this._sampleRate);
		this._lowpass2.start(filterFreqHz, this._sampleRate);
		this._dcblocker.start();
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
	 * @param {Float32Array[]} signal single-channel signal buffer
	 */
	process(startSample, endSample, signal) {
		if (!this._active) return false;

		this._oscillator1.process(startSample, endSample, this._buffer1);
		if (this._oscillator2Active) {
			this._oscillator2.process(startSample, endSample, this._buffer2);
			let n = startSample;
			while (n < endSample) {
				this._buffer1[n] -= this._buffer2[n];
				n++;
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
		/** @property {number} _numChannels just two (stereo) */
		this._numChannels = 2;

		/** @property {number} _sampleRate current sample rate */
		this._sampleRate = sampleRate;

		/** @property {number} idx unique int to identify voice */
		this.idx = voiceIdx;

		/** @property {number} channel current MIDI channel (when active) */
		this.channel = -1;

		/** @property {number} note current MIDI note (when active) */
		this.note = -1;

		/** @property {number} velocity current MIDI velocity (when active) */
		this.velocity = -1;

		/** @property {number} timestamp time corresponding to when current note began (when active) */
		this.timestamp = -1;

		/** @property {boolean} active whether or not the voice is currently active */
		this.active = false;

		const maxAttackMs = 500.0;
		const maxLevel = 0.5;

		/** @property {WamExampleSynthPart} _leftPart part for rendering left channel */
		this._leftPart = new WamExampleSynthPart(maxAttackMs, maxLevel, samplesPerQuantum, sampleRate);

		/** @property {WamExampleSynthPart} _rightPart part for rendering right channel */
		this._rightPart = new WamExampleSynthPart(maxAttackMs, maxLevel, samplesPerQuantum, sampleRate);
	}

	/**
	 * Check if the voice is on the channel and note
	 * @param {number} channel MIDI channel number
	 * @param {number} note MIDI note number
	 * @returns {boolean}
	*/
	matches(channel, note) {
		return this.channel === channel && this.note === note;
	}

	/**
	 * Put the voice into idle state
	 */
	reset() {
		this.channel = -1;
		this.note = -1;
		this.velocity = -1;
		this.timestamp = -1;
		this.active = false;

		this._leftPart.reset();
		this._rightPart.reset();
	}

	/**
	 * Trigger the attack of a new note
	 * @param {number} channel MIDI channel number
	 * @param {number} note MIDI note number
	 * @param {number} velocity MIDI velocity number
	 * @param {WamExampleSynthPart.Mode} leftMode mode for voice's left channel
	 * @param {WamExampleSynthPart.Mode} rightMode mode for voice's right channel
	 */
	noteOn(channel, note, velocity, leftMode, rightMode) {
		this.channel = channel;
		this.note = note;
		this.velocity = velocity;
		this.timestamp = globalThis.currentTime;
		this.active = true;
		this.deactivating = 0;

		const intensity = 0.5 + 0.5 * ((velocity + 1) / 128.0);

		const nyquist = this._sampleRate / 2.0;
		const maxFrequencyHz = 0.9 * nyquist;
		const minFrequencyHz = 20.0;
		let oscillatorFreqHz = noteToHz(note);
		oscillatorFreqHz = Math.max(Math.min(oscillatorFreqHz, maxFrequencyHz), minFrequencyHz);

		let filterFreqHz = oscillatorFreqHz * (1.0 + (2.0 * intensity * intensity) * Math.log(nyquist / oscillatorFreqHz));
		filterFreqHz = Math.max(Math.min(filterFreqHz, maxFrequencyHz), minFrequencyHz);

		this._leftPart.start(leftMode, intensity, oscillatorFreqHz, filterFreqHz);
		this._rightPart.start(rightMode, intensity, oscillatorFreqHz, filterFreqHz, 0.75);
	}

	/**
	 * Trigger the release of an active note
	 * @param {number} channel MIDI channel number
	 * @param {number} note MIDI note number
	 * @param {number} velocity MIDI velocity number
	 * @param {boolean} force whether or not to force a fast release
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
		if (!this.active) return false;

		const leftActive = this._leftPart.process(startSample, endSample, outputs[0]);
		const rightActive = this._rightPart.process(startSample, endSample, outputs[1]);

		this.active = (leftActive || rightActive);
		return this.active;
	}
}

/**
 * Example polyphonic stereo synth.
 *
 * @class
 */
export default class WamExampleSynth {
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
			}),
			rightVoiceMode: new WamParameterInfo('rightVoiceMode', {
				type: 'choice',
				label: 'Right Channel Waveform',
				choices: this._VoiceModes,
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
		/** @property {number} _numChannels just two (stereo) */
		this._numChannels = 2;

		/** @property {number} _numVoices number of voices allocated */
		this._numVoices = config.numVoices ?? 16;

		/** @property {boolean} _passInput whether or not to add the input to the synth's output */
		this._passInput = config.passInput ?? false;

		/** @property {WamParameterInfoMap} _parameterInfo */
		// @ts-ignore
		this._parameterInfo = this.constructor.generateWamParameterInfo();

		/** @property {WamParameterInterpolatorMap} _parameterInterpolators */
		this._parameterInterpolators = {};
		Object.keys(this._parameterInfo).forEach((parameterId) => {
			this._parameterInterpolators[parameterId] = parameterInterpolators[parameterId];
		});

		/** @property {UInt8Array} _voiceStates array of voice state flags */
		this._voiceStates = new Uint8Array(this._numVoices);
		this._voiceStates.fill(0);

		/** @property {WamExampleSynthVoice[]} _voices list of allocated voices */
		this._voices = [];
		let i = 0;
		while (i < this._numVoices) {
			this._voices.push(new WamExampleSynthVoice(samplesPerQuantum, sampleRate, i));
			i++;
		}

		/** @property {WamExampleSynthPart.Mode} _leftVoiceMode waveform mode for left channel */
		this._leftVoiceMode = WamExampleSynthPart.Mode.IDLE;

		/** @property {WamExampleSynthPart.Mode} _rightVoiceMode waveform mode for right channel */
		this._rightVoiceMode = WamExampleSynthPart.Mode.IDLE;
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

// @ts-ignore
if (globalThis instanceof AudioWorkletGlobalScope) {
	globalThis.WamExampleSynth = WamExampleSynth;
}
