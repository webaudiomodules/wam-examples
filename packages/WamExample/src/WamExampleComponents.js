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

/**
 * Example lowpass filter
 *
 * @class
 */
export class WamExampleLowpassFilter {
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
export class WamExampleDcBlockerFilter {
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

// @ts-ignore
if (globalThis instanceof AudioWorkletGlobalScope) {
	if (!globalThis.WamExampleComponents) globalThis.WamExampleComponents = {};
	globalThis.WamExampleComponents.WamExampleLowpassFilter = WamExampleLowpassFilter;
	globalThis.WamExampleComponents.WamExampleDcBlockerFilter = WamExampleDcBlockerFilter;
}
