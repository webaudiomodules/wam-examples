/** @typedef { import('./WamTypes').WamParameterSet } WamParameterSet */
/** @typedef { import('./WamTypes').WamEvent } WamEvent */

/* eslint-disable no-undef */
/* eslint-disable no-empty-function */
/* eslint-disable no-unused-vars */
/* eslint-disable no-plusplus */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-underscore-dangle */
/* eslint-disable lines-between-class-members */

// OC: IMO existing typings for AudioWorkletProcessor are too generic/uninformative
export default class WamProcessor extends AudioWorkletProcessor {
	/**
	 * @param {AudioWorkletNodeOptions} options
	 */
	constructor(options) {
		super(options);
		const {
			processorId,
			instanceId,
			params,
		} = options.processorOptions;

		/** @type {string} processorId */
		this.processorId = processorId;
		/** @type {string} instanceId */
		this.instanceId = instanceId;
		/** @type {WamParameterSet} _params */
		this._params = params;
		/** @type {number} _compensationDelay */
		this._compensationDelay = 0;
		/** @type {boolean} _destroyed */
		this._destroyed = false;

		if (globalThis.WamProcessors) globalThis.WamProcessors[instanceId] = this;
		else globalThis.WamProcessors = { instanceId: this };
	}

	/** @returns {number} processing delay time in seconds */
	getCompensationDelay() { return this._compensationDelay; }

	/**
	 * @param {WamEvent} event
	 */
	onEvent(event) {
		// trigger callbacks
		// this.port.postMessage(event);
		// handle event
		// ...
	}

	/**
	 * @param {Float32Array[][]} inputs
	 * @param {Float32Array[][]} outputs
	 * @param {{[x: string]: Float32Array}} parameters
	 */
	process(inputs, outputs, parameters) {
		if (this._destroyed) return false;
		/* custom DSP here */
		// const input = inputs[0];
		// const output = outputs[0];
		// if (input.length == output.length) {
		// 	for (let channel = 0; channel < output.length; ++channel) {
		// 		output[channel].set(input[channel]);
		// 	}
		// }
		return true;
	}

	destroy() {
		this._destroyed = true;
	}
}
