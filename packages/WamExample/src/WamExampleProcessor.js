/* eslint-disable object-curly-newline */
/* eslint-disable prefer-destructuring */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-underscore-dangle */
/* eslint-disable max-len */
/* eslint-disable no-undef */
/* eslint-disable no-plusplus */

/** @typedef { import('../../sdk/src/api/types').AudioWorkletGlobalScope } AudioWorkletGlobalScope */
/** @typedef { import('../../sdk/src/api/types').AudioWorkletProcessor } AudioWorkletProcessor */
/** @typedef { import('../../sdk/src/api/types').WamNodeOptions } WamNodeOptions */
/** @typedef { import('../../sdk/src/api/types').WamParameter } WamParameter */
/** @typedef { import('../../sdk/src/api/types').WamParameterInfo } WamParameterInfo */
/** @typedef { import('../../sdk/src/api/types').WamParameterInfoMap } WamParameterInfoMap */
/** @typedef { import('../../sdk/src/api/types').WamParameterData } WamParameterData */
/** @typedef { import('../../sdk/src/api/types').WamParameterDataMap } WamParameterDataMap */
/** @typedef { import('../../sdk/src/api/types').WamParameterMap } WamParameterMap */
/** @typedef { import('../../sdk/src/api/types').WamEvent } WamEvent */
/** @typedef { import('.,/../sdk/src/WamParameterInterpolator') } WamParameterInterpolator */

/**
 * A WamEvent and corresponding message id used to trigger callbacks
 * on the main thread once the event has been processed.
 * @typedef {Object} PendingWamEvent
 * @property {number} id
 * @property {WamEvent} event
*/

/**
 * A range of sample indices and corresponding list of simultaneous
 * WamEvents to be processed at the beginning of the slice.
 * @typedef {Object} ProcessingSlice
 * @property {[number, number]} range
 * @property {WamEvent[]} events
 */

/**
 * @typedef {Object} WamParameterInterpolatorMap
 * @property {string} id
 * @property {WamParameterInterpolator} interpolator
 */

/** @type {AudioWorkletGlobalScope & globalThis} */
// @ts-ignore
const {
	// @ts-ignore
	WamProcessor,
	// @ts-ignore
	WamParameterInfo,
	registerProcessor,
} = globalThis;
const supportSharedArrayBuffer = !!globalThis.SharedArrayBuffer;

/**
 * `WamExample`'s `AudioWorkletProcessor`
 *
 * @extends {WamProcessor}
 */
class WamExampleProcessor extends WamProcessor {
	/**
	 * Fetch plugin's params.
	 * @returns {WamParameterInfoMap}
	 */
	static generateWamParameterInfo() {
		return {
			bypass: new WamParameterInfo('bypass', {
				type: 'boolean',
				label: 'Bypass',
				defaultValue: 1,
			}),
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

	/**
	 * @param {AudioWorkletNodeOptions} options
	 */
	constructor(options) {
		super(options);
		this.destroyed = false;
		this.supportSharedArrayBuffer = supportSharedArrayBuffer;
		const {
			moduleId,
			instanceId,
		} = options.processorOptions;
		this.moduleId = moduleId;
		this.instanceId = instanceId;

		if (!this._parameterInterpolators) {
			/** @property {WamParameterInterpolatorMap} _parameterInterpolators */
			this._parameterInterpolators = {};
		}

		if (globalThis.WamProcessors) globalThis.WamProcessors[instanceId] = this;
		else globalThis.WamProcessors = { [instanceId]: this };

		super.port.start();
	}

	// /**
	//  * @param {WamEvent} event
	//  */
	// scheduleEvent(event) {
	// 	this.eventQueue.push(event);
	// 	this.eventQueue.sort((a, b) => b.time - a.time).reverse();
	// }

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

		const bypass = this._parameterInterpolators.bypass.values;
		const gain = this._parameterInterpolators.gain.values;
		for (let c = 0; c < output.length; ++c) {
			const x = input[c];
			const y = output[c];
			if (bypass[startSample]) {
				for (let n = startSample; n < endSample; ++n) {
					y[n] = x[n];
				}
			} else {
				for (let n = startSample; n < endSample; ++n) {
					y[n] = x[n] * gain[n];
				}
			}
		}
	}

	destroy() {
		this.destroyed = true;
		super.port.close();
	}
}
try {
	registerProcessor('WebAudioModuleWamExample', WamExampleProcessor);
} catch (error) {
	console.warn(error);
}
