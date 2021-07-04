/** @typedef {import('./api/types').WamNode} IWamNode */
/** @typedef {import('./api/types').WebAudioModule} WebAudioModule */
/** @typedef {import('./api/types').WamParameterInfoMap} WamParameterInfoMap */
/** @typedef {import('./api/types').WamParameterDataMap} WamParameterDataMap */
/** @typedef {import('./api/types').WamEvent} WamEvent */
/** @typedef {import('./api/types').WamEventType} WamEventType */
/** @typedef {import('./types').WamEventRingBuffer} WamEventRingBuffer */

import getRingBuffer from './RingBuffer.js';
import getWamEventRingBuffer from './WamEventRingBuffer.js';

const RingBuffer = getRingBuffer();
const WamEventRingBuffer = getWamEventRingBuffer();

/* eslint-disable no-empty-function */
/* eslint-disable no-unused-vars */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-plusplus */
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

		/** @type {WebAudioModule} */
		this.module = module;
		/** @private @type {boolean} */
		this._useSab = false; // can override this via processorOptions;
		/** @private @type {boolean} */
		this._eventSabReady = false;
		/** @private @type {{[key: number]: (...args: any[]) => any}} */
		this._pendingResponses = {};
		/** @private @type {{[key: number]: () => any}} */
		this._pendingEvents = {};
		/** @private @type {boolean} */
		this._destroyed = false;
		/** @private @type {number} */
		this._messageId = 1;
		/** @private @type {Set<WamEventType>} */
		this._supportedEventTypes = new Set(['wam-automation', 'wam-transport', 'wam-midi', 'wam-sysex', 'wam-mpe', 'wam-osc']);

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
	 * @param {WamEventType} type
	 * @param {EventListenerOrEventListenerObject | null} callback
	 * @param {AddEventListenerOptions | boolean} options;
	 */
	addEventListener(type, callback, options) {
		if (this._supportedEventTypes.has(type)) super.addEventListener(type, callback, options);
	}

	/**
	 * Deregister a callback function so it will no longer
	 * be called when matching events are processed.
	 * @param {WamEventType} type
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
		let i = 0;
		const numEvents = events.length;
		if (this._eventSabReady) {
			i = this._eventWriter.write(...events);
			// fall back on message port if ring buffer gets full
		}
		while (i < numEvents) {
			const event = events[i];
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
			i++;
		}
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
		const { response, event, eventSab } = data;
		if (response) {
			const { id, content } = data;
			const resolvePendingResponse = this._pendingResponses[id];
			if (resolvePendingResponse) {
				delete this._pendingResponses[id];
				resolvePendingResponse(content);
			}
			// else console.log(`unhandled message | response: ${response} content: ${content}`);
		} else if (eventSab) {
			this._useSab = true;
			const { eventCapacity, parameterIds } = eventSab;

			if (this._eventSabReady) {
				// if parameter set changes after initialization
				this._eventWriter.setParameterIds(parameterIds);
				this._eventReader.setParameterIds(parameterIds);
				return;
			}

			/** @private @type {SharedArrayBuffer} */
			this._mainToAudioSab = WamEventRingBuffer.getStorageForEventCapacity(RingBuffer,
				eventCapacity);

			/** @private @type {SharedArrayBuffer} */
			this._audioToMainSab = WamEventRingBuffer.getStorageForEventCapacity(RingBuffer,
				eventCapacity);

			/** @private @type {WamEventRingBuffer} */
			this._eventWriter = new WamEventRingBuffer(RingBuffer, this._mainToAudioSab,
				parameterIds);
			/** @private @type {WamEventRingBuffer} */
			this._eventReader = new WamEventRingBuffer(RingBuffer, this._audioToMainSab,
				parameterIds);

			const request = 'initialize/eventSab';
			const id = this._generateMessageId();
			let processed = false;
			new Promise((resolve, reject) => {
				this._pendingResponses[id] = resolve;
				this._pendingEvents[id] = () => { if (!processed) reject(); };
				this.port.postMessage({
					id,
					request,
					content: {
						mainToAudioSab: this._mainToAudioSab,
						audioToMainSab: this._audioToMainSab,
					},
				});
			}).then((resolved) => {
				processed = true;
				this._eventSabReady = true;
				delete this._pendingEvents[id];

				// periodically check for messages from audio thread
				this._audioToMainInterval = setInterval(() => {
					const events = this._eventReader.read();
					events.forEach((e) => { this._onEvent(e); });
				}, 100);
			}).catch((rejected) => { delete this._pendingResponses[id]; });
		} else if (event) this._onEvent(event);
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
		if (this._audioToMainInterval) clearInterval(this._audioToMainInterval);
		this.port.postMessage({ destroy: true });
		this.port.close();
		this.disconnect();
		this._destroyed = true;
	}
}
