/* eslint-disable object-curly-newline */
/* eslint-disable prefer-destructuring */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-underscore-dangle */
/* eslint-disable max-len */
/* eslint-disable no-undef */
/* eslint-disable no-plusplus */
/* eslint-disable no-bitwise */
/* eslint-disable max-classes-per-file */

const twoPi = 2.0 * Math.PI;
function noteToHz(note) { return 2.0 ** ((note - 69) / 12.0) * 440.0; }

/**
 * Example lowpass filter
 *
 * @class
 */
class WamExampleLowpassFilter {
	constructor() {
		this._memoryY = 0.0;
		this._alpha = 0.0;
		this._beta = 0.0;
	}

	/**
	 * Prepare the filter by resetting internal memory and computing
	 * coefficients based on the chosen frequency in Hz and sample rate
	 * @param {number} frequencyHz
	 * @param {number} sampleRate
	 */
	start(frequencyHz, sampleRate) {
		this._memoryY = 0.0;
		const wc = (twoPi * frequencyHz) / sampleRate;
		const coswc = Math.cos(wc);
		this._alpha = coswc - 1.0 + Math.sqrt(coswc * coswc - 4.0 * coswc + 3.0);
		this._beta = 1.0 - this._alpha;
	}

	/**
	 * Pass the signal buffer through the filter
	 * @param {number} startSample beginning of processing slice
	 * @param {number} endSample end of processing slice
	 * @param {Float32Array[]} signal single-channel signal buffer
	 */
	process(startSample, endSample, signal) {
		let n = startSample;
		while (n < endSample) {
			const x = signal[n];
			const y = this._alpha * x + this._beta * this._memoryY;
			this._memoryY = y;
			signal[n] = y;
			n++;
		}
	}
}

/**
 * Example DC-blocking filter with adjustable strength parameter
 *
 * @class
 */
class WamExampleDcBlockerFilter {
	/**
	 * @param {number} alpha determines strength of filter [0.9, 0.999]
	 */
	constructor(alpha = 0.999) {
		this._memoryX = 0.0;
		this._memoryY = 0.0;
		this._alpha = alpha;
	}

	/**
	 * Prepare the filter by resetting internal memory
	 */
	start() {
		this._memoryX = 0.0;
		this._memoryY = 0.0;
	}

	/**
	 * Pass the signal buffer through the filter
	 * @param {number} startSample beginning of processing slice
	 * @param {number} endSample end of processing slice
	 * @param {Float32Array[]} signal single-channel signal buffer
	 */
	process(startSample, endSample, signal) {
		let n = startSample;
		while (n < endSample) {
			const x = signal[n];
			const y = x - this._memoryX + this._alpha * this._memoryY;
			this._memoryX = x;
			this._memoryY = y;
			signal[n] = y;
			n++;
		}
	}
}

/**
 * Example envelope/waveshaper which both applies an amplitude envelope and
 * alters the signal's tonal character via time-varying nonlinear gain
 *
 * @class
 */
class WamExampleEnvelopeShaper {
	/**
	 * @param {number} maxAttackMs maximum duration of attack segment (ms)
	 * @param {number} samplesPerQuantum
	 * @param {number} sampleRate
	 */
	constructor(maxAttackMs, samplesPerQuantum, sampleRate) {
		this._sampleRate = sampleRate;

		this._targetLevel = 0.0;
		this._currentLevel = 0.0;
		this._gainInc = 0.0;

		this._maxAttackSec = maxAttackMs / 1000.0;

		this._envelope = new Float32Array(samplesPerQuantum);
		this._gain = 0.0;

		this._rampIdx = 0;
		this._rampDurSamples = 0;
	}

	/**
	 * Configure envelope and trigger attack ramp. Lower intensity means lower amplitude,
	 * less linear ramps, and longer ramps. Higher intensity means higher amplitude,
	 * more linear ramps, and shorter ramps.
	 * @param {number} intensity controls amplitude and nonlinearity of envelope [0.0, 1.0]
	 */
	start(intensity) {
		const rampSec = (1.0 - intensity) * this._maxAttackSec;
		this._rampIdx = 0;
		this._rampDurSamples = Math.round(32 + rampSec * this._sampleRate);
		this._currentLevel = 0.0;
		this._targetLevel = intensity;
		this._makeupGain = 1.0 + (2.0 * Math.exp(2.0 - intensity)) / Math.exp(intensity);
		this._gainInc = this._targetLevel / this._rampDurSamples;
	}

	/**
	 * Trigger the release ramp
	 */
	stop() {
		this._targetLevel = 0.0;
		this._rampIdx = 0;
		this._rampDurSamples *= 2;
		this._gainInc *= -0.5;
	}

	/**
	 * Apply nonlinear scaling to the signal buffer
	 * @param {number} startSample beginning of processing slice
	 * @param {number} endSample end of processing slice
	 * @param {Float32Array[]} signal single-channel signal buffer
	 * @returns {boolean} whether or not the envelope is still active
	 */
	process(startSample, endSample, signal) {
		if (this._rampIdx < this._rampDurSamples) {
			const M = this._rampDurSamples - this._rampIdx;
			let n = startSample;
			const N = Math.min(startSample + M, endSample);
			while (n < N) {
				this._envelope[n] = this._currentLevel;
				this._currentLevel += this._gainInc;
				this._rampIdx++;
				n++;
			}
			if ((this._gainInc < 0.0 && this._currentLevel <= 0.0)
				|| (this._gain_inc > 0.0 && this._currentLevel >= this._targetLevel)) {
				this._currentLevel = this._targetLevel;
				this._rampIdx = this._rampDurSamples;
			}
			if (N < endSample) this._envelope.fill(this._targetLevel, N, endSample);
		} else if (this._targetLevel === 0.0) {
			signal.fill(0.0, startSample, endSample);
			return false;
		} else this._envelope.fill(this._targetLevel, startSample, endSample);

		let n = startSample;
		while (n < endSample) {
			let x = signal[n] + this._gainInc;
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
	 * @param {number} sampleRate
	 */
	constructor(sampleRate) {
		this._sampleRate = sampleRate;

		this._alpha = 5 * Math.PI ** 2.0;
		this._phase = 0.0;
		this._phaseInc = 0.0;
		this._phaseMin = 0.0;
		this._phaseMax = Math.PI;
		this._phaseWidth = this._phaseMax - this._phaseMin;
		this._gain = 0.0;
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
		if (this._mode === 'dirty') {
			this._bias = -0.5;
			this._flip = 1.0;
			frequencyNorm *= 0.5;
		} else if (this._mode === 'clean') {
			this._bias = 0.0;
			this._flip = -1.0;
		}

		this._phaseInc = this._phaseWidth * frequencyNorm;
		this._gain = Math.min(0.7, Math.max(0.1, 0.7 - frequencyNorm)) + 0.2;
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
				this._gain *= this._flip;
			}
			const beta = 4.0 * phase * (Math.PI - phase);
			signal[n] = this._gain * ((4.0 * beta) / (this._alpha - beta) + this._bias);
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
	static numModes = 4;

	/**
	 * @param {number} maxAttackMs maximum duration of envelope attack segment (ms)
	 * @param {number} samplesPerQuantum
	 * @param {number} sampleRate
	 */
	constructor(maxAttackMs, samplesPerQuantum, sampleRate) {
		/** @property {number} _sampleRate current sample rate */
		this._sampleRate = sampleRate;

		/** @property {boolean} _active whether or not the part is currently active */
		this._active = false;

		/** @property {Float32Array} _buffer1 buffer to store output from oscillator 1 */
		this._buffer1 = new Float32Array(samplesPerQuantum);

		/** @property {Float32Array} _buffer2 buffer to store output from oscillator 2 */
		this._buffer2 = new Float32Array(samplesPerQuantum);

		/** @property {WamExampleEnvelopeShaper} _shaper envelope shaper component */
		this._shaper = new WamExampleEnvelopeShaper(maxAttackMs, samplesPerQuantum, sampleRate);

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
		this._dcblocker = new WamExampleDcBlockerFilter(0.999);
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
	 * @param {number} mode voice mode [0, 3]
	 * @param {number} intensity voice intensity [0.0, 1.0]
	 * @param {number} oscillatorFreqHz oscillator frequency
	 * @param {number} filterFreqHz filter frequency
	 * @param {number} phaseOffsetNorm oscillator starting phase [0.0, 1.0]
	 */
	start(mode, intensity, oscillatorFreqHz, filterFreqHz, phaseOffsetNorm = 0.0) {
		this._active = true;
		let mode1 = null;
		let mode2 = null;
		switch (mode) {
		case 0:
			mode1 = 'clean';
			break;
		case 1:
			mode1 = 'dirty';
			break;
		case 2:
			mode1 = 'clean';
			mode2 = 'dirty';
			break;
		case 3:
			mode1 = 'dirty';
			mode2 = 'dirty';
			break;
		default: break;
		}

		this._shaper.start(intensity, this._sampleRate);

		this._oscillator1.start(mode1, oscillatorFreqHz, phaseOffsetNorm);
		if (mode2) {
			this._oscillator2.start(mode2, oscillatorFreqHz, phaseOffsetNorm + 0.25);
			this._oscillator2Active = true;
		}

		this._lowpass1.start(filterFreqHz, this._sampleRate);
		this._lowpass2.start(filterFreqHz, this._sampleRate);
		this._dcblocker.start();
	}

	/**
	 * Trigger envelope release
	 */
	stop() {
		this._shaper.stop();
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
 * Example synth voice (stereo output)
 *
 * @class
 */
class WamExampleSynthVoice {
	/**
	 * @param {number} voiceIdx unique int to identify voice
	 * @param {number} samplesPerQuantum
	 * @param {number} sampleRate
	 */
	constructor(voiceIdx, samplesPerQuantum, sampleRate) {
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

		/** @property {WamExampleSynthPart} _leftPart part for rendering left channel */
		this._leftPart = new WamExampleSynthPart(maxAttackMs, samplesPerQuantum, sampleRate);

		/** @property {WamExampleSynthPart} _rightPart part for rendering right channel */
		this._rightPart = new WamExampleSynthPart(maxAttackMs, samplesPerQuantum, sampleRate);
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
	 */
	noteOn(channel, note, velocity) {
		this.channel = channel;
		this.note = note;
		this.velocity = velocity;
		this.timestamp = globalThis.currentTime;
		this.active = true;

		const intensity = 0.5 + 0.5 * ((velocity + 1) / 128.0);

		const nyquist = this._sampleRate / 2.0;
		const maxFrequencyHz = 0.9 * nyquist;
		const minFrequencyHz = 20.0;
		let oscillatorFreqHz = noteToHz(note);
		oscillatorFreqHz = Math.max(Math.min(oscillatorFreqHz, maxFrequencyHz), minFrequencyHz);

		let filterFreqHz = oscillatorFreqHz * (1.0 + (2.0 * intensity * intensity) * Math.log(nyquist / oscillatorFreqHz));
		filterFreqHz = Math.max(Math.min(filterFreqHz, maxFrequencyHz), minFrequencyHz);

		const leftMode = Math.floor(WamExampleSynthPart.numModes * Math.random());
		const rightMode = Math.floor(WamExampleSynthPart.numModes * Math.random());

		this._leftPart.start(leftMode, intensity, oscillatorFreqHz, filterFreqHz);
		this._rightPart.start(rightMode, intensity, oscillatorFreqHz, filterFreqHz, 0.75);
	}

	/**
	 * Trigger the release of an active note
	 * @param {number} channel MIDI channel number
	 * @param {number} note MIDI note number
	 * @param {number} velocity MIDI velocity number
	 */
	// eslint-disable-next-line no-unused-vars
	noteOff(channel, note, velocity) {
		this._leftPart.stop();
		this._rightPart.stop();
	}

	/**
	 * Add output from each part to the output buffers
	 * @param {number} startSample beginning of processing slice
	 * @param {number} endSample end of processing slice
	 * @param {Float32Array[][]} input
	 * @param {Float32Array[][]} output
	 * @returns {boolean} whether or not the voice is still active
	 */
	process(startSample, endSample, input, output) {
		if (!this.active) return false;

		const leftOutput = output[0];
		const rightOutput = output[1];

		const leftActive = this._leftPart.process(startSample, endSample, leftOutput);
		const rightActive = this._rightPart.process(startSample, endSample, rightOutput);

		this.active = (leftActive || rightActive);
		return this.active;
	}
}

/**
 * Example polyphonic synth
 *
 * @class
 */
export default class WamExampleSynth {
	/**
	 * @param {number} numVoices how many voices to allocate
	 * @param {number} samplesPerQuantum
	 * @param {number} sampleRate
	 */
	constructor(numVoices, samplesPerQuantum, sampleRate) {
		/** @property {number} _numVoices number of voices allocated */
		this._numVoices = numVoices;

		/** @property {UInt8Array} _voiceStates array of voice state flags */
		this._voiceStates = new Uint8Array(numVoices);
		this._voiceStates.fill(0);

		/** @property {WamExampleSynthVoice[]} _voices list of allocated voices */
		this._voices = [];
		let i = 0;
		while (i < this._numVoices) {
			this._voices.push(new WamExampleSynthVoice(i, samplesPerQuantum, sampleRate));
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
	 * @param {Float32Array[][]} inputs
	 * @param {Float32Array[][]} outputs
	 */
	process(startSample, endSample, inputs, outputs) {
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
