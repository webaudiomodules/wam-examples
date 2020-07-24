/** @typedef { import('./WamTypes').WebAudioModule } WebAudioModule */
/** @typedef { import('./WamTypes').WamParameterInfoMap } WamParameterInfoMap */
/** @typedef { import('./WamTypes').WamParameterDataMap } WamParameterDataMap */
/** @typedef { import('./WamTypes').WamEvent } WamEvent */
/** @typedef { import('./WamTypes').WamEventType } WamEventType */

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
		this._supportedEventTypes = new Set(['wam-event', 'wam-automation', 'wam-midi']);

		this.port.onmessage = this._onMessage.bind(this);
	}

	/** @returns {string} */
	get moduleId() { return this.module.moduleId; }
	/** @returns {string} */
	get instanceId() { return this.module.instanceId; }

	/**
	 * @param {string | string[]=} parameterIds
	 * @returns {Promise<WamParameterInfoMap>}
	 */
	async getParameterInfo(parameterIds) {
		const request = 'get/parameterInfo';
		const id = this._generateMessageId();
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
	 * @returns {Promise<WamParameterDataMap>}
	 */
	async getParameterValues(normalized, parameterIds) {
		const request = 'get/parameterValues';
		const id = this._generateMessageId();
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

	/** @returns {Promise<any>} */
	async getState() {
		const request = 'get/state';
		// perhaps the only info to request from processor is param state?
		const id = this._generateMessageId();
		return new Promise((resolve) => {
			this._pendingResponses[id] = resolve;
			this.port.postMessage({ id, request });
		});
	}

	/** @param {any} state */
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

	/** @returns {Promise<number>} processing delay time in seconds */
	async getCompensationDelay() {
		const request = 'get/compensationDelay';
		const id = this._generateMessageId();
		return new Promise((resolve) => {
			this._pendingResponses[id] = resolve;
			this.port.postMessage({ id, request });
		});
	}

	/**
	 * @param {string} type
	 * @param {EventListenerOrEventListenerObject | null} callback
	 * @param {AddEventListenerOptions | boolean} options;
	 */
	addEventListener(type, callback, options) {
		if (this._supportedEventTypes.has(type)) super.addEventListener(type, callback, options);
	}

	/**
	 * @param {string} type
	 * @param {EventListenerOrEventListenerObject | null} callback
	 * @param {AddEventListenerOptions | boolean} options;
	 */
	removeEventListener(type, callback, options) {
		if (this._supportedEventTypes.has(type)) super.removeEventListener(type, callback, options);
	}

	/**
	 * @param {WamEvent} event
	 */
	scheduleEvent(event) {
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
	}

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
	 * Messages from audio thread
	 * @param {MessageEvent} message
	 * */
	_onMessage(message) {
		// const { data } = message;
		if (message.data.response) {
			const { id, response, content } = message.data;
			const resolvePendingResponse = this._pendingResponses[id];
			if (resolvePendingResponse) {
				delete this._pendingResponses[id];
				resolvePendingResponse(content);
			}
			// else console.log(`unhandled message | response: ${response} content: ${content}`);
		} else if (message.data.useSab) {
			this._useSab = true;
			/** @property {{[parameterId: string]: number}} _parameterIndices */
			this._parameterIndices = message.data.parameterIndices;
			/** @property {SharedArrayBuffer} _parameterBuffer */
			this._parameterBuffer = message.data.parameterBuffer;
			/** @property {Float32Array} _parameterValues */
			this._parameterValues = new Float32Array(this._parameterBuffer);
		} else if (message.data.event) this._onEvent(message.data.event); // scheduled from audio thread
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

	destroy() {
		this.port.postMessage({ destroy: true });
		this.port.close();
		this.disconnect();
		this._destroyed = true;
	}
}
