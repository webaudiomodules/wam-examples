/** @typedef { import('./WamTypes').WebAudioModule } WebAudioModule */
/** @typedef { import('./WamTypes').WamParameterInfoMap } WamParameterInfoMap */
/** @typedef { import('./WamTypes').WamParameterValueMap } WamParameterValueMap */
/** @typedef { import('./WamTypes').WamEvent } WamEvent */
/** @typedef { import('./WamTypes').WamEventCallback } WamEventCallback */

/* eslint-disable no-empty-function */
/* eslint-disable no-unused-vars */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-underscore-dangle */
/* eslint-disable lines-between-class-members */

// OC: IMO existing typings for DisposableAudioWorkletNode are too generic/uninformative
export default class WamNode extends AudioWorkletNode {
	/**
	 * @param {WebAudioModule} module
	 * @param {AudioWorkletNodeOptions} options
	 */
	constructor(module, options) {
		options.processorOptions = {
			processorId: module.processorId,
			instanceId: module.instanceId,
			...options.processorOptions,
		};
		super(module.audioContext, module.processorId, options);

		/** @property {string} processorId */
		this.processorId = module.processorId;
		/** @property {string} instanceId */
		this.instanceId = module.instanceId;
		/** @property {WebAudioModule} loader */
		this.module = module;
		/** @private @property {{[key: number]: Promise<any>}} _pendingResponses **/
		this._pendingResponses = {};
		/** @private @property {{[subscriberId: string]: WamEventCallback}} */
		this._eventCallbacks = {};
		/** @property {boolean} _destroyed */
		this._destroyed = false;
		/** @property {number} _messageId */
		this._messageId = 0;

		this.port.onmessage = this.onMessage.bind(this);
	}

	/**
	 * @param {string | string[]=} parameterIds
	 * @returns {Promise<WamParameterInfoMap>}
	 */
	async getParameterInfo(parameterIds) {
		const request = 'get/parameterInfo';
		const id = this.generateMessageId();
		if (parameterIds === undefined) parameterIds = [];
		if (!Array.isArray(parameterIds)) parameterIds = [parameterIds];
		return new Promise((resolve) => {
			this._pendingResponses[id] = resolve;
			this.port.postMessage({
				id,
				request,
				content: { parameterIds },
			});
		});
	}

	/**
	 * @param {boolean} normalized
	 * @param {string | string[]=} parameterIds
	 * @returns {Promise<WamParameterValueMap>}
	 */
	async getParameterValues(normalized, parameterIds) {
		const request = 'get/parameterValues';
		const id = this.generateMessageId();
		if (parameterIds === undefined) parameterIds = [];
		if (!Array.isArray(parameterIds)) parameterIds = [parameterIds];
		return new Promise((resolve) => {
			this._pendingResponses[id] = resolve;
			this.port.postMessage({
				id,
				request,
				content: { normalized, parameterIds },
			});
		});
	}

	/**
	 * @param {WamParameterValueMap} parameterValues
	 * @returns {Promise<void>}
	 */
	async setParameterValues(parameterValues) {
		const request = 'set/parameterValues';
		const id = this.generateMessageId();
		return new Promise((resolve) => {
			this._pendingResponses[id] = resolve;
			this.port.postMessage({
				id,
				request,
				content: { parameterValues },
			});
		});
	}

	/** @returns {Promise<any>} */
	async getState() {
		const request = 'get/state';
		const id = this.generateMessageId();
		return new Promise((resolve) => {
			this._pendingResponses[id] = resolve;
			this.port.postMessage({ id, request });
		});
	}

	/** @param {any} state */
	async setState(state) {
		const request = 'set/state';
		const id = this.generateMessageId();
		return new Promise((resolve) => {
			this._pendingResponses[id] = resolve;
			this.port.postMessage({
				id,
				request,
				content: { state },
			});
		});
	}

	/** @returns {Promise<number>} processing delay time in seconds */
	async getCompensationDelay() {
		const request = 'get/compensationDelay';
		const id = this.generateMessageId();
		return new Promise((resolve) => {
			this._pendingResponses[id] = resolve;
			this.port.postMessage({ id, request });
		});
	}

	/**
	 * @param {string} subscriberId
	 * @param {WamEventCallback} callback
	 * @returns {boolean}
	 */
	addEventCallback(subscriberId, callback) {
		if (this._eventCallbacks[subscriberId]) return false;
		this._eventCallbacks[subscriberId] = callback;
		return true;
	}

	/**
	 * @param {string} subscriberId
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
			const { id, response, content } = message.data;
			const resolvePendingResponse = this._pendingResponses[id];
			if (resolvePendingResponse) {
				delete this._pendingResponses[id];
				resolvePendingResponse(content);
			}
			// else console.log(`unhandled message | response: ${response} content: ${content}`);
		}
	}

	generateMessageId() {
		/* eslint-disable-next-line no-plusplus */
		return this._messageId++;
	}

	destroy() {
		this.port.postMessage({ destroy: true });
		this.port.close();
		this.disconnect();
		this._destroyed = true;
	}
}
