/** @typedef {import('./api/types').WamNode} IWamNode */
/** @typedef {import('./api/types').WebAudioModule} WebAudioModule */
/** @typedef {import('./api/types').WamParameterInfoMap} WamParameterInfoMap */
/** @typedef {import('./api/types').WamParameterDataMap} WamParameterDataMap */
/** @typedef {import('./api/types').WamEvent} WamEvent */
/** @typedef {import('./api/types').WamEventType} WamEventType */
/** @typedef {import('./api/types').WamListenerType} WamListenerType */

/* eslint-disable no-empty-function */
/* eslint-disable no-unused-vars */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-underscore-dangle */
/* eslint-disable lines-between-class-members */

/**
 * @implements {IWamNode}
 */
export default class WamNode extends AudioWorkletNode {
	/**
	 * @param {WebAudioModule} module
	 * @param {AudioWorkletNodeOptions} options
	 */
	constructor(module, options) {
		const { audioContext, moduleId, instanceId } = module;
		options.processorOptions = {
			moduleId,
			instanceId,
			...options.processorOptions,
		};
		super(audioContext, moduleId, options);

		/** @property {WebAudioModule} module */
		this.module = module;
		/** @property {boolean} _useSab */
		this._useSab = false; // can override this via processorOptions
		/** @private @property {{[key: number]: Promise<any>}} _pendingResponses **/
		this._pendingResponses = {};
		/** @private @property {{[key: number]: Promise<any>}} _pendingEvents **/
		this._pendingEvents = {};
		/** @property {boolean} _destroyed */
		this._destroyed = false;
		/** @property {number} _messageId */
		this._messageId = 1;
		/** @property {Set<WamEventType>} _supportedEventTypes */
		this._supportedEventTypes = new Set(['wam-event']);

		this.port.onmessage = this._onMessage.bind(this);
	}

	/** @returns {string} */
	get moduleId() { return this.module.moduleId; }
	/** @returns {string} */
	get instanceId() { return this.module.instanceId; }
	/** @returns {string} */
	get processorId() { return this.moduleId; }

	/**
	 * Get parameter info for the specified parameter ids,
	 * or omit argument to get info for all parameters.
	 * @param {string[]} parameterIds
	 * @returns {Promise<WamParameterInfoMap>}
	 */
	async getParameterInfo(...parameterIds) {
		const request = 'get/parameterInfo';
		const id = this._generateMessageId();
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
	 * Get parameter values for the specified parameter ids,
	 * or omit argument to get values for all parameters.
	 * @param {boolean} normalized
	 * @param {string[]} parameterIds
	 * @returns {Promise<WamParameterDataMap>}
	 */
	async getParameterValues(normalized, ...parameterIds) {
		const request = 'get/parameterValues';
		const id = this._generateMessageId();
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
	 * Set parameter values for the specified parameter ids.
	 * @param {WamParameterDataMap} parameterValues
	 * @returns {Promise<void>}
	 */
	async setParameterValues(parameterValues) {
		const request = 'set/parameterValues';
		const id = this._generateMessageId();
		return new Promise((resolve) => {
			this._pendingResponses[id] = resolve;
			this.port.postMessage({
				id,
				request,
				content: { parameterValues },
			});
		});
	}

	/**
	 * Returns an object (such as JSON or a serialized blob)
	 * that can be used to restore the WAM's state.
	 * @returns {Promise<any>}
	 */
	async getState() {
		const request = 'get/state';
		// perhaps the only info to request from processor is param state?
		const id = this._generateMessageId();
		return new Promise((resolve) => {
			this._pendingResponses[id] = resolve;
			this.port.postMessage({ id, request });
		});
	}

	/**
	 * Use an object (such as JSON or a serialized blob)
	 * to restore the WAM's state.
	 * @param {any} state
	 */
	async setState(state) {
		const request = 'set/state';
		const id = this._generateMessageId();
		// perhaps the only info to send to processor is param state?
		return new Promise((resolve) => {
			this._pendingResponses[id] = resolve;
			this.port.postMessage({
				id,
				request,
				content: { state },
			});
		});
	}

	/**
	 * Compensation delay hint in seconds.
	 * @returns {Promise<number>}
	 */
	async getCompensationDelay() {
		const request = 'get/compensationDelay';
		const id = this._generateMessageId();
		return new Promise((resolve) => {
			this._pendingResponses[id] = resolve;
			this.port.postMessage({ id, request });
		});
	}

	/**
	 * Register a callback function so it will be called
	 * when matching events are processed.
	 * @param {WamListenerType} type
	 * @param {EventListenerOrEventListenerObject | null} callback
	 * @param {AddEventListenerOptions | boolean} options;
	 */
	addEventListener(type, callback, options) {
		if (this._supportedEventTypes.has(type)) super.addEventListener(type, callback, options);
	}

	/**
	 * Deregister a callback function so it will no longer
	 * be called when matching events are processed.
	 * @param {WamListenerType} type
	 * @param {EventListenerOrEventListenerObject | null} callback
	 * @param {AddEventListenerOptions | boolean} options;
	 */
	removeEventListener(type, callback, options) {
		if (this._supportedEventTypes.has(type)) super.removeEventListener(type, callback, options);
	}

	/**
	 * From the main thread, schedule a WamEvent.
	 * Listeners will be triggered when the event is processed.
	 * @param {WamEvent[]} events
	 */
	scheduleEvents(...events) {
		events.forEach((event) => {
			const request = 'add/event';
			const id = this._generateMessageId();
			let processed = false;
			new Promise((resolve, reject) => {
				this._pendingResponses[id] = resolve;
				this._pendingEvents[id] = () => { if (!processed) reject(); };
				this.port.postMessage({
					id,
					request,
					content: { event },
				});
			}).then((resolved) => {
				processed = true;
				delete this._pendingEvents[id];
				this._onEvent(event);
			}).catch((rejected) => { delete this._pendingResponses[id]; });
		});
	}

	/** From the main thread, clear all pending WamEvents. */
	async clearEvents() {
		const request = 'remove/events';
		const id = this._generateMessageId();
		return new Promise((resolve) => {
			const ids = Object.keys(this._pendingEvents);
			if (ids.length) {
				this._pendingResponses[id] = resolve;
				this.port.postMessage({ id, request });
			}
		}).then((clearedIds) => {
			clearedIds.forEach((clearedId) => {
				this._pendingEvents[clearedId]();
				delete this._pendingEvents[clearedId];
			});
		});
	}

	/**
	 * @param {WamNode} to the destination WAM for the event stream
	 * @param {number} [output] the event output stream of the source WAM
	 */
	connectEvents(to, output) {
		if (!to.module?.isWebAudioModule) return;
		const request = 'connect/events';
		const id = this._generateMessageId();
		let processed = false;
		new Promise((resolve, reject) => {
			this._pendingResponses[id] = resolve;
			this._pendingEvents[id] = () => { if (!processed) reject(); };
			this.port.postMessage({
				id,
				request,
				content: { wamInstanceId: to.instanceId, output },
			});
		}).then((resolved) => {
			processed = true;
			delete this._pendingEvents[id];
		}).catch((rejected) => { delete this._pendingResponses[id]; });
	}

	/**
	 * @param {WamNode} [to] the destination WAM for the event stream
	 * @param {number} [output]
	 */
	disconnectEvents(to, output) {
		if (to && !to.module?.isWebAudioModule) return;
		const request = 'disconnect/events';
		const id = this._generateMessageId();
		let processed = false;
		new Promise((resolve, reject) => {
			this._pendingResponses[id] = resolve;
			this._pendingEvents[id] = () => { if (!processed) reject(); };
			this.port.postMessage({
				id,
				request,
				content: { wamInstanceId: to?.instanceId, output },
			});
		}).then((resolved) => {
			processed = true;
			delete this._pendingEvents[id];
		}).catch((rejected) => { delete this._pendingResponses[id]; });
	}

	/**
	 * Messages from audio thread
	 * @param {MessageEvent} message
	 * */
	_onMessage(message) {
		const { data } = message;
		const { response, useSab, event } = data;
		if (response) {
			const { id, content } = data;
			const resolvePendingResponse = this._pendingResponses[id];
			if (resolvePendingResponse) {
				delete this._pendingResponses[id];
				resolvePendingResponse(content);
			}
			// else console.log(`unhandled message | response: ${response} content: ${content}`);
		} else if (useSab) {
			const { parameterIndices, parameterBuffer } = data;
			this._useSab = true;
			/** @property {{[parameterId: string]: number}} _parameterIndices */
			this._parameterIndices = parameterIndices;
			/** @property {SharedArrayBuffer} _parameterBuffer */
			this._parameterBuffer = parameterBuffer;
			/** @property {Float32Array} _parameterValues */
			this._parameterValues = new Float32Array(this._parameterBuffer);
		} else if (event) this._onEvent(event); // scheduled from audio thread
	}

	_onEvent(event) {
		const { type } = event;
		this.dispatchEvent(new CustomEvent(type, {
			bubbles: true,
			detail: event,
		}));
	}

	_generateMessageId() {
		/* eslint-disable-next-line no-plusplus */
		return this._messageId++;
	}

	/** Stop processing and remove the node from the graph. */
	destroy() {
		this.port.postMessage({ destroy: true });
		this.port.close();
		this.disconnect();
		this._destroyed = true;
	}
}
