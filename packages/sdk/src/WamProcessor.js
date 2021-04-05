/** @typedef {import('./api/types').WamProcessor} IWamProcessor */
/** @typedef {import('./api/types').WamParameterInfoMap} WamParameterInfoMap */
/** @typedef {import('./api/types').WamParameterInfo} WamParameterInfo */
/** @typedef {import('./api/types').WamParameterDataMap} WamParameterDataMap */
/** @typedef {import('./api/types').WamParameterData} WamParameterData */
/** @typedef {import('./api/types').WamParameterMap} WamParameterMap */
/** @typedef {import('./api/types').WamEvent} WamEvent */
/** @typedef {import('./api/types').WamMidiData} WamMidiData */
/** @typedef {import('./api/types').AudioWorkletGlobalScope} AudioWorkletGlobalScope */
/** @typedef {import('./WamParameterInterpolator')} WamParameterInterpolator */

/* eslint-disable no-undef */
/* eslint-disable no-empty-function */
/* eslint-disable no-unused-vars */
/* eslint-disable no-plusplus */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-underscore-dangle */
/* eslint-disable lines-between-class-members */
/* eslint-disable radix */

/**
 * A WamEvent and corresponding message id used to trigger callbacks
 * on the main thread once the event has been processed.
 * @typedef {Object} PendingWamEvent
 * @property {number} id
 * @property {WamEvent} event
*/

/**
 * A range of sample indices and corresponding list of simultaneous
 * WamEvents to be processed at the beginning of the slice.
 * @typedef {Object} ProcessingSlice
 * @property {[number, number]} range
 * @property {WamEvent[]} events
 */

/**
 * @typedef {Object} WamParameterInterpolatorMap
 * @property {string} id
 * @property {WamParameterInterpolator} interpolator
 */

/** @type {AudioWorkletGlobalScope & globalThis} */
// @ts-ignore
const {
	AudioWorkletProcessor,
	// @ts-ignore
	WamParameterInterpolator,
	// @ts-ignore
	WamParameterNoSab,
	// @ts-ignore
	WamParameterSab,
	// @ts-ignore
} = globalThis;

// const { , registerProcessor } = AudioWorkletGlobalScope;

/**
 * @implements {IWamProcessor}
 */
export default class WamProcessor extends AudioWorkletProcessor {
	/**
	 * Override to fetch plugin's params via whatever means desired.
	 * @returns {WamParameterInfoMap}
	 */
	static generateWamParameterInfo() {
		return {};
	}

	static get parameterDescriptors() {
		const allParameterInfos = WamProcessor.generateWamParameterInfo();
		/* eslint-disable-next-line max-len */
		return Object.entries(allParameterInfos).map(([name, { defaultValue, minValue, maxValue }]) => ({
			name,
			defaultValue,
			minValue,
			maxValue,
		}));
	}

	/** @param {AudioWorkletNodeOptions} options */
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
		/** @property {WamParameterInfoMap} _parameterInfo */
		// @ts-ignore
		this._parameterInfo = this.constructor.generateWamParameterInfo();
		/** @property {WamParameterMap} _parameterState */
		this._parameterState = {};
		/** @property {number} _samplesPerQuantum */
		this._samplesPerQuantum = 128;

		/** @property {WamParameterInterpolatorMap} _parameterInterpolators */
		this._parameterInterpolators = {};
		Object.keys(this._parameterInfo).forEach((parameterId) => {
			const info = this._parameterInfo[parameterId];
			this._parameterInterpolators[parameterId] = new WamParameterInterpolator(info, 256);
		});

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
		else globalThis.WamProcessors = { [instanceId]: this };

		this.port.onmessage = this._onMessage.bind(this);
	}

	/**
	 * Compensation delay hint in seconds.
	 * @returns {number}
	 */
	getCompensationDelay() { return this._compensationDelay; }

	/**
	 * From the audio thread, schedule a WamEvent.
	 * Listeners will be triggered when the event is processed.
	 * @param {WamEvent[]} events
	 */
	scheduleEvents(...events) {
		let i = 0;
		while (i < events.length) {
			// no need for ids if scheduled from audio thread
			this._eventQueue.push({ id: 0, event: events[i] });
			i++;
		}
	}

	/** From the audio thread, clear all pending WamEvents. */
	clearEvents() {
		this._eventQueue = [];
	}

	/**
	 * Messages from main thread appear here.
	 * @param {MessageEvent} message
	 */
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
					let { parameterIds } = content;
					if (!parameterIds.length) parameterIds = Object.keys(this._parameterInfo);
					const parameterInfo = {};
					let i = 0;
					while (i < parameterIds.length) {
						const parameterId = parameterIds[i];
						parameterInfo[parameterId] = this._parameterInfo[parameterId];
						i++;
					}
					response.content = parameterInfo;
				} else if (noun === 'parameterValues') {
					/*eslint-disable-next-line prefer-const */
					let { normalized, parameterIds } = content;
					response.content = this._getParameterValues(normalized, parameterIds);
				} else if (noun === 'state') {
					response.content = { parameterValues: this._getParameterValues(false) };
					// ...additional state?
				} else if (noun === 'compensationDelay') {
					response.content = this.getCompensationDelay();
				}
			} else if (verb === 'set') {
				if (noun === 'parameterValues') {
					const { parameterValues } = content;
					this._setParameterValues(parameterValues, true);
					delete response.content;
				} else if (noun === 'state') {
					const { state } = content;
					if (state.parameterValues) this._setParameterValues(state.parameterValues, false);
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
	 *
	 * @param {WamMidiData} midiData
	 */
	_onMidi(midiData) {
		// Custom midi handling here
	}

	/**
	 * @param {boolean} normalized
	 * @param {string[]=} parameterIds
	 * @returns {WamParameterDataMap}
	 */
	_getParameterValues(normalized, parameterIds) {
		/** @type {WamParameterDataMap} */
		const parameterValues = {};
		if (!parameterIds) parameterIds = [];
		if (!parameterIds.length) parameterIds = Object.keys(this._parameterState);
		let i = 0;
		while (i < parameterIds.length) {
			const id = parameterIds[i];
			const parameter = this._parameterState[id];
			parameterValues[id] = {
				id,
				value: normalized ? parameter.normalizedValue : parameter.value,
				normalized,
			};
			i++;
		}
		return parameterValues;
	}

	/**
	 * @param {WamParameterDataMap} parameterUpdates
	 * @param {boolean} interpolate
	 */
	_setParameterValues(parameterUpdates, interpolate) {
		const parameterIds = Object.keys(parameterUpdates);
		let i = 0;
		while (i < parameterIds.length) {
			this._setParameterValue(parameterUpdates[parameterIds[i]], interpolate);
			i++;
		}
	}

	/**
	 * @param {WamParameterData} parameterUpdate
	 * @param {boolean} interpolate
	 */
	_setParameterValue(parameterUpdate, interpolate) {
		const { id, value, normalized } = parameterUpdate;
		const parameter = this._parameterState[id];
		if (!parameter) return;
		if (!normalized) parameter.value = value;
		else parameter.normalizedValue = value;
		const interpolator = this._parameterInterpolators[id];
		if (interpolate) interpolator.setEndValue(parameter.value);
		else interpolator.setStartValue(parameter.value);
	}

	/**
	 * @param {number} startIndex
	 * @param {number} endIndex
	 */
	_interpolateParameterValues(startIndex, endIndex) {
		const parameterIds = Object.keys(this._parameterInterpolators);
		let i = 0;
		while (i < parameterIds.length) {
			this._parameterInterpolators[parameterIds[i]].process(startIndex, endIndex);
			i++;
		}
	}

	/**
	 * Example implementation of custom sample accurate event scheduling.
	 * @returns {ProcessingSlice[]}
	 * */
	_getProcessingSlices() {
		const response = 'add/event';
		/** @ts-ignore */
		const { currentTime, sampleRate } = globalThis;
		/** @type {{[sampleIndex: number]: WamEvent[]}} */
		const eventsBySampleIndex = {};
		// assumes events arrive sorted by time
		let i = 0;
		while (i < this._eventQueue.length) {
			const { id, event } = this._eventQueue[i];
			const offsetSec = event.time - currentTime;
			const sampleIndex = offsetSec > 0 ? Math.round(offsetSec * sampleRate) : 0;
			if (sampleIndex < this._samplesPerQuantum) {
				if (eventsBySampleIndex[sampleIndex]) eventsBySampleIndex[sampleIndex].push(event);
				else eventsBySampleIndex[sampleIndex] = [event];
				// notify main thread
				if (id) this.port.postMessage({ id, response });
				else this.port.postMessage({ event });
				this._eventQueue.shift();
				i = -1;
			} else break;
			i++;
		}

		/** @type {ProcessingSlice[]} */
		const processingSlices = [];
		const keys = Object.keys(eventsBySampleIndex);
		if (keys[0] !== '0') {
			keys.unshift('0');
			eventsBySampleIndex['0'] = [];
		}
		const lastIndex = keys.length - 1;
		i = 0;
		while (i < keys.length) {
			const key = keys[i];
			const startSample = parseInt(key);
			const endSample = (i < lastIndex) ? parseInt(keys[i + 1]) : this._samplesPerQuantum;
			processingSlices.push({ range: [startSample, endSample], events: eventsBySampleIndex[key] });
			i++;
		}
		return processingSlices;
	}

	/** @param {WamEvent} event */
	_processEvent(event) {
		switch (event.type) {
		case 'automation': this._setParameterValue(event.data, true); break;
		case 'midi': this._onMidi(event.data); break;
		default: break;
		}
	}

	/**
	 * Override this to implement custom DSP.
	 * @param {number} startSample beginning of processing slice
	 * @param {number} endSample end of processing slice
	 * @param {Float32Array[][]} inputs
	 * @param {Float32Array[][]} outputs
	 * @param {{[x: string]: Float32Array}} parameters
	 */
	_process(startSample, endSample, inputs, outputs, parameters) {}

	/**
	 * @param {Float32Array[][]} inputs
	 * @param {Float32Array[][]} outputs
	 * @param {{[x: string]: Float32Array}} parameters
	 */
	process(inputs, outputs, parameters) {
		if (this._destroyed) return false;
		const processingSlices = this._getProcessingSlices();
		let i = 0;
		while (i < processingSlices.length) {
			const { range, events } = processingSlices[i];
			const [startSample, endSample] = range;
			// pause to process events at proper sample
			let j = 0;
			while (j < events.length) {
				this._processEvent(events[j]);
				j++;
			}
			// perform parameter interpolation
			this._interpolateParameterValues(startSample, endSample);
			// continue processing
			this._process(startSample, endSample, inputs, outputs, parameters);
			i++;
		}
		return true;
	}

	/** Stop processing and remove the node from the graph. */
	destroy() {
		this._destroyed = true;
	}
}

if (globalThis.AudioWorkletGlobalScope) {
	globalThis.WamProcessor = WamProcessor;
}
