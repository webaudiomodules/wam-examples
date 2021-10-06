/* eslint-disable object-curly-newline */
/* eslint-disable prefer-destructuring */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-underscore-dangle */
/* eslint-disable max-len */
/* eslint-disable no-undef */
/* eslint-disable no-plusplus */
/* eslint-disable no-bitwise */
/* eslint-disable max-classes-per-file */

/** @typedef {import('./types').AudioWorkletGlobalScope} AudioWorkletGlobalScope */

/** @type {AudioWorkletGlobalScope} */
// @ts-ignore
const audioWorkletGlobalScope = globalThis;

const twoPi = 2.0 * Math.PI;

/**
 * Example lowpass filter
 *
 * @class
 */
export class WamExampleLowpassFilter {
	constructor() {
		this._alpha = 0.0;
		this._beta = 0.0;
		this.reset();
	}

	/** Reset the filter memory */
	reset() {
		this._memoryY = 0.0;
	}

	/**
	 * Update filter coefficients based on the chosen frequency
	 * in Hz and sample rate
	 * @param {number} frequencyHz
	 * @param {number} sampleRate
	 */
	update(frequencyHz, sampleRate) {
		const wc = (twoPi * frequencyHz) / sampleRate;
		const coswc = Math.cos(wc);
		this._alpha = coswc - 1.0 + Math.sqrt(coswc * coswc - 4.0 * coswc + 3.0);
		this._beta = 1.0 - this._alpha;
	}

	/**
	 * Pass the signal buffer through the filter
	 * @param {number} startSample beginning of processing slice
	 * @param {number} endSample end of processing slice
	 * @param {Float32Array} signal single-channel signal buffer
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
export class WamExampleDcBlockerFilter {
	/**
	 * @param {number} alpha determines strength of filter [0.9, 0.999]
	 */
	constructor(alpha = 0.999) {
		this._alpha = alpha;
		this.reset();
	}

	/** Reset the filter memory */
	reset() {
		this._memoryX = 0.0;
		this._memoryY = 0.0;
	}

	/**
	 * Update the filter coefficient
	 */
	update(alpha) {
		this._alpha = alpha;
	}

	/**
	 * Pass the signal buffer through the filter
	 * @param {number} startSample beginning of processing slice
	 * @param {number} endSample end of processing slice
	 * @param {Float32Array} signal single-channel signal buffer
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

if (audioWorkletGlobalScope.AudioWorkletGlobalScope) {
	if (!audioWorkletGlobalScope.WamExampleComponents) audioWorkletGlobalScope.WamExampleComponents = {
		WamExampleLowpassFilter,
		WamExampleDcBlockerFilter
	};
}
