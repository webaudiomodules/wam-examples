/** @typedef { import('./WamTypes').WamParameterInfoMap } WamParameterInfoMap */
/** @typedef { import('./WamTypes').WamParameterDataMap } WamParameterDataMap */
/** @typedef { import('./WamTypes').WamParameterData } WamParameterData */
/** @typedef { import('./WamTypes').WamParameterMap } WamParameterMap */
/** @typedef { import('./WamTypes').WamMidiData } WamMidiData */
/** @typedef { import('./WamTypes').WamEvent } WamEvent */

import { WamParameterNoSab, WamParameterSab } from './WamParameter';

/* eslint-disable no-undef */
/* eslint-disable no-empty-function */
/* eslint-disable no-unused-vars */
/* eslint-disable no-plusplus */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-underscore-dangle */
/* eslint-disable lines-between-class-members */
/* eslint-disable radix */

/**
 * @typedef {Object} PendingWamEvent
 * @property {number} id
 * @property {WamEvent} event
*/

/**
 * @typedef {Object} ProcessingSlice
 * @property {[number, number]} range
 * @property {WamEvent[]} events
 */

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
			moduleId,
			instanceId,
			useSab,
		} = options.processorOptions;

		if (!moduleId) throw Error('must provide moduleId argument in processorOptions!');
		if (!instanceId) throw Error('must provide instanceId argument in processorOptions!');

		/** @property {string} moduleId */
		this.moduleId = moduleId;
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
				this._parameterState[parameterId] = new WamParameterSab(info, this._parameterValues, index);
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

		/*
		 * TODO
		 * Maybe this should all be refactored at some point to use a ringbuffer backed
		 * by SAB. Relying heavily on MessagePort for now, but it would be possible to
		 * handle automation / midi events etc without it.
		*/
		/** @property {PendingWamEvent[]} _eventQueue */
		this._eventQueue = [];

		/** @property {number} _compensationDelay */
		this._compensationDelay = 0;
		/** @property {boolean} _destroyed */
		this._destroyed = false;

		if (globalThis.WamProcessors) globalThis.WamProcessors[instanceId] = this;
		else globalThis.WamProcessors = { instanceId: this };

		this.port.onmessage = this._onMessage.bind(this);
	}

	/** @returns {number} processing delay time in seconds */
	getCompensationDelay() { return this._compensationDelay; }

	/**
	 * @param {WamEvent} event
	 */
	scheduleEvent(event) {
		// no need for ids if scheduled from audio thread
		this._eventQueue.push({ id: 0, event });
	}

	clearEvents() {
		this._eventQueue = [];
	}

	/**
	 * Messages from main thread
	 * @param {MessageEvent} message
	 * */
	_onMessage(message) {
		if (message.data.request) {
			const { id, request, content } = message.data;
			const response = { id, response: request };
			const requestComponents = request.split('/');
			const verb = requestComponents[0];
			const noun = requestComponents[1];
			response.content = 'error';
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
					response.content = this._getParameterValues(normalized, parameterIdQuery);
				} else if (noun === 'state') {
					response.content = { parameterValues: this._getParameterValues(false) };
					// ...additional state?
				} else if (noun === 'compensationDelay') {
					response.content = this.getCompensationDelay();
				}
			} else if (verb === 'set') {
				if (noun === 'parameterValues') {
					const { parameterValues } = content;
					this._setParameterValues(parameterValues);
					delete response.content;
				} else if (noun === 'state') {
					const { state } = content;
					if (state.parameterValues) this._setParameterValues(state.parameterValues);
					// ...additional state?
					delete response.content;
				}
			} else if (verb === 'add') {
				if (noun === 'event') {
					const { event } = content;
					this._eventQueue.push({ id, event });
					return; // defer postMessage until event is processed
				}
			} else if (verb === 'remove') {
				if (noun === 'events') {
					const ids = this._eventQueue.map((queued) => queued.id);
					this.clearEvents();
					response.content = ids;
				}
			}
			this.port.postMessage(response);
		}
	}

	/**
	 * @param {boolean} normalized
	 * @param {string[]=} parameterIdQuery
	 * @returns {WamParameterDataMap}
	 */
	_getParameterValues(normalized, parameterIdQuery) {
		/** @type {WamParameterDataMap} */
		const parameterValues = {};
		if (!parameterIdQuery) parameterIdQuery = [];
		if (!parameterIdQuery.length) parameterIdQuery = Object.keys(this._parameterState);
		parameterIdQuery.forEach((id) => {
			const parameter = this._parameterState[id];
			if (!parameter) return;
			parameterValues[id] = {
				id,
				value: normalized ? parameter.normalizedValue : parameter.value,
				normalized,
			};
		});
		return parameterValues;
	}

	/** @param {WamParameterDataMap} parameterUpdates */
	_setParameterValues(parameterUpdates) {
		Object.keys(parameterUpdates).forEach((parameterId) => {
			const parameterUpdate = parameterUpdates[parameterId];
			this._setParameterValue(parameterUpdate);
		});
	}

	/** @param {WamParameterData} parameterUpdate */
	_setParameterValue(parameterUpdate) {
		const { id, value, normalized } = parameterUpdate;
		const parameter = this._parameterState[id];
		if (!parameter) return;
		if (!normalized) parameter.value = value;
		else parameter.normalizedValue = value;
	}

	/** @returns {ProcessingSlice[]} */
	_getProcessingSlices() {
		// sample accurate scheduling for custom DSP
		const response = 'add/event';
		const samplesPerQuantum = 128;
		/** @ts-ignore */
		const { currentTime, sampleRate } = globalThis;
		/** @type {{[sampleIndex: number]: WamEvent[]}} */
		const eventsBySampleIndex = {};
		// assumes events arrive sorted by time
		while (this._eventQueue.length) {
			const { id, event } = this._eventQueue[0];
			const sampleIndex = Math.round((event.time - currentTime) * sampleRate);
			if (sampleIndex < samplesPerQuantum) {
				if (eventsBySampleIndex[sampleIndex]) eventsBySampleIndex[sampleIndex].push(event);
				else eventsBySampleIndex[sampleIndex] = [event];
				if (id) this.port.postMessage({ id, response }); // notify main thread
				this._eventQueue.shift();
			} else break;
		}

		/** @type {ProcessingSlice[]} */
		const processingSlices = [];
		const keys = Object.keys(eventsBySampleIndex);
		if (keys[0] !== '0') keys.unshift('0');
		const lastIndex = keys.length;
		keys.forEach((key, index) => {
			const startSample = parseInt(key);
			const endSample = (index < lastIndex) ? parseInt(keys[index + 1]) : samplesPerQuantum;
			processingSlices.push({ range: [startSample, endSample], events: eventsBySampleIndex[key] });
		});
		return processingSlices;
	}

	/** @param {WamEvent} event */
	_processEvent(event) {
		switch (event.type) {
		case 'automation': this._setParameterValue(event.data); break;
		case 'midi': /*...*/ break;
		default: break;
		}
	}

	/**
	 * @param {Float32Array[][]} inputs
	 * @param {Float32Array[][]} outputs
	 * @param {{[x: string]: Float32Array}} parameters
	 */
	process(inputs, outputs, parameters) {
		if (this._destroyed) return false;
		const input = inputs[0];
		const output = outputs[0];
		if (input.length !== output.length) return true;

		const processingSlices = this._getProcessingSlices();
		processingSlices.forEach(({ range, events }) => {
			// pause to process events at proper sample
			events.forEach((event) => this._processEvent(event));
			// continue processing
			const [startSample, endSample] = range;
			for (let c = 0; c < output.length; ++c) {
				const x = input[c];
				const y = output[c];
				for (let n = startSample; n < endSample; ++n) {
					/* custom DSP here */
					y[n] = x[n];
				}
			}
		});
		return true;
	}

	destroy() {
		this._destroyed = true;
	}
}

AudioWorkletGlobalScope.WamProcessor = WamProcessor;
