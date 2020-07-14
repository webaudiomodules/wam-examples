/** @typedef { import('./WamTypes').WamParameterInfoMap } WamParameterInfoMap */
/** @typedef { import('./WamTypes').WamParameterValueMap } WamParameterValueMap */
// /** @typedef { import('./WamTypes').WamParameter } WamParameter */
/** @typedef { import('./WamTypes').WamParameterMap } WamParameterMap */
/** @typedef { import('./WamTypes').WamEvent } WamEvent */

import { WamParameterNoSab, WamParameterSab } from './WamParameter';

/* eslint-disable no-undef */
/* eslint-disable no-empty-function */
/* eslint-disable no-unused-vars */
/* eslint-disable no-plusplus */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-underscore-dangle */
/* eslint-disable lines-between-class-members */

/**
 * @param {WamProcessor} processor
 * @param {boolean} normalized
 * @param {string[]=} parameterIdQuery
 * @returns {WamParameterValueMap}
 */
function getParameterValues(processor, normalized, parameterIdQuery) {
	/** @type {WamParameterValueMap} */
	const parameterValues = {};
	if (!parameterIdQuery.length) parameterIdQuery = Object.keys(processor._parameterState);
	parameterIdQuery.forEach((parameterId) => {
		const parameter = this._parameterState[parameterId];
		if (!parameter) return;
		parameterValues[parameterId] = {
			id: parameterId,
			value: normalized ? parameter.normalizedValue : parameter.value,
			normalized,
		};
	});
	return parameterValues;
}

/**
 * @param {WamProcessor} processor
 * @param {WamParameterValueMap} parameterUpdates
 */
function setParameterValues(processor, parameterUpdates) {
	Object.keys(parameterUpdates).forEach((parameterId) => {
		const parameterUpdate = parameterUpdates[parameterId];
		const parameter = this._parameterState[parameterId];
		if (!parameter) return;
		if (!parameterUpdate.normalized) parameter.value = parameterUpdate.value;
		else parameter.normalizedValue = parameterUpdate.value;
	});
}

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
			useSab,
		} = options.processorOptions;

		/** @property {string} processorId */
		this.processorId = processorId;
		/** @property {string} instanceId */
		this.instanceId = instanceId;
		/** @property {WamParameterInfoMap} */
		// @ts-ignore
		// TODO I believe this is the correct way to do this but TS is complaining...
		this._parameterInfo = this.constructor.generateWamParameterInfo();
		/** @property {WamParameterMap} _parameters */
		this._parameterState = {};
		/** @property {boolean} _useSab */
		this._useSab = !!useSab;
		if (this._useSab) {
			const numParameters = Object.keys(this._parameterInfo).length;
			const byteLength = Float32Array.BYTES_PER_ELEMENT * numParameters;
			/** @private @property {SharedArrayBuffer} _parameterBuffer */
			this._parameterBuffer = new SharedArrayBuffer(byteLength);
			/** @private @property {Float32Array} _parameterValues */
			this._parameterValues = new Float32Array(this._parameterBuffer);
			/** @private @property {[paramterId: string]: number} */
			this._parameterIndices = {};
			Object.keys(this._parameterInfo).forEach((parameterId, index) => {
				const info = this._parameterInfo[parameterId];
				this._parameterIndices[parameterId] = index;
				this._parameterState[parameterId] = new WamParameterSab(this._parameterValues, index, info);
			});
			// pass the SAB to main thread
			this.port.postMessage({
				useSab: true,
				parameterIndices: this._parameterIndices,
				parameterBuffer: this._parameterBuffer,
			});
		} else {
			Object.keys(this._parameterInfo).forEach((parameterId) => {
				this._parameterState[parameterId] = new WamParameterNoSab(this._parameterInfo[parameterId]);
			});
		}
		/** @property {number} _compensationDelay */
		this._compensationDelay = 0;
		/** @property {boolean} _destroyed */
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
					response.content = getParameterValues(this, normalized, parameterIdQuery);
				} else if (noun === 'state') {
					response.content = { parameterValues: getParameterValues(this, false) };
					// ...additional state?
				} else if (noun === 'compensationDelay') {
					response.content = this.getCompensationDelay();
				} else response.content = 'error';
			} else if (verb === 'set') {
				if (noun === 'parameterValues') {
					const { parameterValues } = content;
					setParameterValues(this, parameterValues);
				} else if (noun === 'state') {
					const { state } = content;
					if (state.parameterValues) setParameterValues(this, state.parameterValues);
					// ...additional state?
				} else response.content = 'error';
			} else response.content = 'error';
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
