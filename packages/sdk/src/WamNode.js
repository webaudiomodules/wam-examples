/** @typedef { import('./WamTypes').WebAudioModule } WebAudioModule */
/** @typedef { import('./WamTypes').WamParameterInfoMap } WamParameterInfoMap */
/** @typedef { import('./WamTypes').WamParameterValueMap } WamParameterValueMap */
/** @typedef { import('./WamTypes').WamEvent } WamEvent */
/** @typedef { import('./WamTypes').WamEventType } WamEventType */
/** @typedef { import('./WamTypes').WamEventCallback } WamEventCallback */

/* eslint-disable no-empty-function */
/* eslint-disable no-unused-vars */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-underscore-dangle */
/* eslint-disable lines-between-class-members */

// OC: IMO existing typings for DisposableAudioWorkletNode are too generic/uninformative
export default class WamNode extends AudioWorkletNode {
	/**
	 * @param {BaseAudioContext} audioContext
	 * @param {string} processorId
	 * @param {string} instanceId
	 * @param {WebAudioModule} module
	 * @param {AudioWorkletNodeOptions} options
	 */
	constructor(audioContext, processorId, instanceId, module, options) {
		options.processorOptions = {
			processorId,
			instanceId,
			...options.processorOptions,
		};
		super(audioContext, processorId, options);

		/** @property {string} processorId */
		this.processorId = processorId;
		/** @property {string} instanceId */
		this.instanceId = instanceId;
		/** @property {WebAudioModule} loader */
		this.module = module;
		/** @private @property {{[key: string]: Promise<any>}} _pendingResponses **/
		this._pendingResponses = {};
		/** @private @property {{[subscriberId: WamEventType]: WamEventCallback}} */
		this._eventCallbacks = {};
		/** @property {boolean} _destroyed */
		this._destroyed = false;

		this.port.onmessage = this.onMessage.bind(this);
	}

	/**
	 * @param {string | string[] | undefined} parameterIdQuery
	 * @returns {Promise<WamParameterInfoMap>}
	 */
	async getParameterInfo(parameterIdQuery) {
		const request = 'get/parameterInfo';
		if (parameterIdQuery === undefined) parameterIdQuery = [];
		if (!Array.isArray(parameterIdQuery)) parameterIdQuery = [parameterIdQuery];
		return new Promise((resolve) => {
			this._pendingResponses[request] = resolve;
			this.port.postMessage({
				request,
				content: { parameterIdQuery },
			});
		});
	}

	/**
	 * @param {boolean} normalized
	 * @param {string | string[] | undefined} parameterIdQuery
	 * @returns {Promise<WamParameterValueMap>}
	 */
	async getParameterValues(normalized, parameterIdQuery) {
		const request = 'get/parameterValues';
		if (parameterIdQuery === undefined) parameterIdQuery = [];
		if (!Array.isArray(parameterIdQuery)) parameterIdQuery = [parameterIdQuery];
		return new Promise((resolve) => {
			this._pendingResponses[request] = resolve;
			this.port.postMessage({
				request,
				content: { normalized, parameterIdQuery },
			});
		});
	}

	/**
	 * @param {WamParameterValueMap} parameterUpdates
	 * @returns {Promise<void>}
	 */
	async setParameterValues(parameterUpdates) {
		const request = 'set/parameterValues';
		return new Promise((resolve) => {
			this._pendingResponses[request] = resolve;
			this.port.postMessage({
				request,
				content: { parameterUpdates },
			});
		});
	}

	/** @returns {Promise<any>} */
	async getState() {
		const request = 'get/state';
		return new Promise((resolve) => {
			this._pendingResponses[request] = resolve;
			this.port.postMessage({ request });
		});
	}

	/** @param {any} state */
	async setState(state) {
		const request = 'set/state';
		return new Promise((resolve) => {
			this._pendingResponses[request] = resolve;
			this.port.postMessage({
				request,
				content: { state },
			});
		});
	}

	/** @returns {Promise<number>} processing delay time in seconds */
	async getCompensationDelay() {
		const request = 'get/compensationDelay';
		return new Promise((resolve) => {
			this._pendingResponses[request] = resolve;
			this.port.postMessage({ request });
		});
	}

	/**
	 * @param {WamEventType} subscriberId
	 * @param {WamEventCallback} callback
	 * @returns {boolean}
	 */
	addEventCallback(subscriberId, callback) {
		if (this._eventCallbacks[subscriberId]) return false;
		this._eventCallbacks[subscriberId] = callback;
		return true;
	}

	/**
	 * @param {WamEventType} subscriberId
	 * @returns {boolean}
	 */
	removeEventCallback(subscriberId) {
		if (this._eventCallbacks[subscriberId]) {
			delete this._eventCallbacks[subscriberId];
			return true;
		}
		return false;
	}

	/**
	 * @param {WamEvent} event
	 */
	onEvent(event) {
		// trigger callbacks
		Object.keys(this._eventCallbacks).forEach((subscriberId) => {
			this._eventCallbacks[subscriberId](event);
		});
		// handle event
		// this.port.postMessage({ event });
		// ...
	}

	/**
	 * Messages from audio thread
	 * @param {MessageEvent} message
	 * */
	onMessage(message) {
		// by default, assume mismatch in scheduling threads will be mitigated via message port
		if (message.data.event) this.onEvent(message.data.event);
		else if (message.data.response) {
			const { response, content } = message.data;
			const resolvePendingResponse = this._pendingResponses[response];
			if (resolvePendingResponse) {
				delete this._pendingResponses[response];
				resolvePendingResponse(content);
			}
			// else console.log(`unhandled message | response: ${response} content: ${content}`);
		}
	}

	destroy() {
		this.port.postMessage({ destroy: true });
		this.port.close();
		this.disconnect();
		this._destroyed = true;
	}
}
