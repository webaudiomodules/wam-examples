/** @typedef { import('./WamTypes').WebAudioModule } WebAudioModule */
/** @typedef { import('./WamTypes').WamParameterSet } WamParameterSet */
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
	 * @returns {WamParameterSet}
	 */
	static generateWamParameters() {
		return {}; // override to fetch plugin's params via whatever means desired
	}

	/**
	 * @param {AudioContext} audioContext
	 * @param {string} processorId
	 * @param {string} instanceId
	 * @param {WebAudioModule} module
	 * @param {AudioWorkletNodeOptions} options
	 */
	constructor(audioContext, processorId, instanceId, module, options) {
		const params = WamNode.generateWamParameters();
		options.processorOptions = {
			processorId,
			instanceId,
			params,
			...options.processorOptions,
		};
		super(audioContext, processorId, options);

		/** @type {string} processorId */
		this.processorId = processorId;
		/** @type {string} instanceId */
		this.instanceId = instanceId;
		/** @type {WebAudioModule} loader */
		this.module = module;
		/** @type {WamParameterSet} _params */
		this._params = params;
		/** @type {number} _compensationDelay */
		this._compensationDelay = 0;
		/** @type {{[subscriberId: string]: WamEventCallback}} */
		this._eventCallbacks = {};
		/** @type {boolean} _destroyed */
		this._destroyed = false;

		this.port.onmessage = this.onMessage.bind(this);
	}

	// TODO should get/set state be async? any type constraints?
	/** @returns {any} */
	getState() {}

	/** @param {any} state */
	setState(state) {}

	/** @returns {number} processing delay time in seconds */
	getCompensationDelay() { return this._compensationDelay; }

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
		// ...
	}

	/**
	 * Messages from audio thread
	 * @param {MessageEvent} message
	 * */
	onMessage(message) {
		// by default, assume mismatch in scheduling threads will be mitigated via message port
		if (message.data.event) this.onEvent(message.data.event);
	}

	destroy() {
		this.port.postMessage({ destroy: true });
		this.port.close();
		this.disconnect();
		this._destroyed = true;
	}
}
