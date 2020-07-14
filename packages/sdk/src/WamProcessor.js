/** @typedef { import('./WamTypes').WamParameterInfoMap } WamParameterInfoMap */
// /** @typedef { import('./WamTypes').WamParameter } WamParameter */
/** @typedef { import('./WamTypes').WamParameterMap } WamParameterMap */
/** @typedef { import('./WamTypes').WamEvent } WamEvent */

import WamParameter from './WamParameter';

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
	 * @returns {WamParameterInfoMap}
	 */
	static generateWamParameterInfo() {
		return {}; // override to fetch plugin's params via whatever means desired
	}

	/**
	 * @param {AudioWorkletNodeOptions} options
	 */
	constructor(options) {
		super(options);
		const {
			processorId,
			instanceId,
		} = options.processorOptions;

		/** @type {string} processorId */
		this.processorId = processorId;
		/** @type {string} instanceId */
		this.instanceId = instanceId;
		/** @type {WamParameterInfoMap} */
		// @ts-ignore
		// TODO I believe this is the correct way to do this but TS is complaining...
		this._parameterInfo = this.constructor.generateWamParameterInfo();
		/** @type {WamParameterMap} _parameters */
		this._parameterState = {};
		Object.keys(this._parameterInfo).forEach((parameterId) => {
			// TODO not sure how to deal with TS error:
			// "Types have separate declarations of a private property '_data'"
			// @ts-ignore
			this._parameterState[parameterId] = new WamParameter(this._parameterInfo[parameterId]);
		});
		/** @type {number} _compensationDelay */
		this._compensationDelay = 0;
		/** @type {boolean} _destroyed */
		this._destroyed = false;

		if (globalThis.WamProcessors) globalThis.WamProcessors[instanceId] = this;
		else globalThis.WamProcessors = { instanceId: this };

		this.port.onmessage = this.onMessage.bind(this);
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
	 * Messages from main thread
	 * @param {MessageEvent} message
	 * */
	onMessage(message) {
		// by default, assume mismatch in scheduling threads will be mitigated via message port
		if (message.data.event) this.onEvent(message.data.event);
		else if (message.data.request) {
			const { id, request, content } = message.data;
			const response = { id, response: request };
			const requestComponents = request.split('/');
			const verb = requestComponents[0];
			const noun = requestComponents[1];
			if (verb === 'get') {
				if (noun === 'parameterInfo') {
					let { parameterIdQuery } = content;
					if (!parameterIdQuery.length) parameterIdQuery = Object.keys(this._parameterInfo);
					const parameterInfo = {};
					parameterIdQuery.forEach((parameterId) => {
						parameterInfo[parameterId] = this._parameterInfo[parameterId];
					});
					response.content = parameterInfo;
				} else if (noun === 'parameterValues') {
					/*eslint-disable-next-line prefer-const */
					let { normalized, parameterIdQuery } = content;
					const parameterValues = {};
					if (!parameterIdQuery.length) parameterIdQuery = Object.keys(this._parameterState);
					parameterIdQuery.forEach((parameterId) => {
						const parameter = this._parameterState[parameterId];
						if (!parameter) return;
						parameterValues[parameterId] = {
							id: parameterId,
							value: normalized ? parameter.normalizedValue : parameter.value,
							normalized,
						};
					});
					response.content = parameterValues;
				} else if (noun === 'state') {
					response.content = {}; // up to developer;
				} else if (noun === 'compensationDelay') {
					response.content = this.getCompensationDelay();
				}
				// else console.log(`unhandled response: ${noun}`);
			} else if (verb === 'set') {
				if (noun === 'parameterValues') {
					const { parameterUpdates } = content;
					Object.keys(parameterUpdates).forEach((parameterId) => {
						const parameterUpdate = parameterUpdates[parameterId];
						const parameter = this._parameterState[parameterId];
						if (!parameter) return;
						if (!parameterUpdate.normalized) parameter.value = parameterUpdate.value;
						else parameter.normalizedValue = parameterUpdate.value;
					});
				} else if (noun === 'state') {
					const { state } = content;
					// up to developer
				}
				// else console.log(`unhandled response: ${noun}`);
			}
			this.port.postMessage(response);
		}
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

AudioWorkletGlobalScope.WamProcessor = WamProcessor;
