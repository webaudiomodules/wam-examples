/** @typedef {import('./api/types').WamProcessor} IWamProcessor */
/** @typedef {import('./api/types').WamParameter} WamParameter */
/** @typedef {import('./api/types').WamParameterInfoMap} WamParameterInfoMap */
/** @typedef {import('./api/types').WamParameterInfo} WamParameterInfo */
/** @typedef {import('./api/types').WamParameterDataMap} WamParameterDataMap */
/** @typedef {import('./api/types').WamParameterData} WamParameterData */
/** @typedef {import('./api/types').WamParameterMap} WamParameterMap */
/** @typedef {import('./api/types').WamEvent} WamEvent */
/** @typedef {import('./api/types').WamTransportData} WamTransportData */
/** @typedef {import('./api/types').WamMidiData} WamMidiData */
/** @typedef {import('./api/types').WamBinaryData} WamBinaryData */
/** @typedef {import('./types').AudioWorkletGlobalScope} AudioWorkletGlobalScope */
/** @typedef {import('./types').WamParameterInterpolator} WamParameterInterpolator */
/** @typedef {import('./types').WamEventRingBuffer} WamEventRingBuffer */

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
 * @typedef {{[id: string]: WamParameterInterpolator}} WamParameterInterpolatorMap
 */

/** @type {AudioWorkletGlobalScope & globalThis} */
// @ts-ignore
const {
	AudioWorkletProcessor,
	webAudioModules,
	RingBuffer,
	WamEventRingBuffer,
	WamParameter,
	WamParameterInterpolator,
} = globalThis;

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

		/** @type {string} */
		this.moduleId = moduleId;
		/** @type {string} */
		this.instanceId = instanceId;
		/** @private @type {WamParameterInfoMap} */
		// @ts-ignore
		this._parameterInfo = this.constructor.generateWamParameterInfo();
		/** @private @type {WamParameterMap} */
		this._parameterState = {};
		/** @private @type {number} */
		this._samplesPerQuantum = 128;

		/** @private @type {WamParameterInterpolatorMap} */
		this._parameterInterpolators = {};
		Object.keys(this._parameterInfo).forEach((parameterId) => {
			const info = this._parameterInfo[parameterId];
			this._parameterState[parameterId] = new WamParameter(this._parameterInfo[parameterId]);
			this._parameterInterpolators[parameterId] = new WamParameterInterpolator(info, 256);
		});

		/** @private @type {PendingWamEvent[]} */
		this._eventQueue = [];

		/** @private @type {number} */
		this._compensationDelay = 0;
		/** @private @type {boolean} */
		this._destroyed = false;

		webAudioModules.create(this);

		this.port.onmessage = this._onMessage.bind(this);

		/** @private @type {boolean} */
		this._useSab = !!useSab && !!globalThis.SharedArrayBuffer;
		/** @private @type {boolean} */
		this._eventSabReady = false;
		if (this._useSab) this._configureSab();
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

	get downstream() {
		const wams = new Set();
		const { eventGraph } = webAudioModules;
		if (!eventGraph.has(this)) return wams;
		const outputMap = eventGraph.get(this);
		outputMap.forEach((set) => {
			if (set) set.forEach((wam) => wams.add(wam));
		});
		return wams;
	}

	emitEvents(...events) {
		const { eventGraph } = webAudioModules;
		if (!eventGraph.has(this)) return;
		const downstream = eventGraph.get(this);
		downstream.forEach((set) => {
			if (set) set.forEach((wam) => wam.scheduleEvents(...events));
		});
	}

	/** From the audio thread, clear all pending WamEvents. */
	clearEvents() {
		this._eventQueue = [];
	}

	_configureSab() {
		const eventCapacity = 2 ** 10;
		const parameterIds = Object.keys(this._parameterInfo);
		if (this._eventSabReady) {
			// if parameter set changes after initialization
			this._eventWriter.setParameterIds(parameterIds);
			this._eventReader.setParameterIds(parameterIds);
		}
		this.port.postMessage({ eventSab: { eventCapacity, parameterIds } });
	}

	/**
	 * Messages from main thread appear here.
	 * @param {MessageEvent} message
	 */
	async _onMessage(message) {
		if (message.data.request) {
			const {
				id, request, content,
			} = message.data;
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
					response.content = this._getState();
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
					this._setState(state);
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
			} else if (verb === 'connect') {
				if (noun === 'events') {
					const { wamInstanceId, output } = content;
					this.connectEvents(wamInstanceId, output);
					delete response.content;
				}
			} else if (verb === 'disconnect') {
				if (noun === 'events') {
					const { wamInstanceId, output } = content;
					this.disconnectEvents(wamInstanceId, output);
					delete response.content;
				}
			} else if (verb === 'initialize') {
				if (noun === 'eventSab') {
					const { mainToAudioEventSab, audioToMainEventSab } = content;

					/** @private @type {SharedArrayBuffer} */
					this._audioToMainEventSab = audioToMainEventSab;

					/** @private @type {SharedArrayBuffer} */
					this._mainToAudioEventSab = mainToAudioEventSab;

					const parameterIds = Object.keys(this._parameterInfo);
					/** @private @type {WamEventRingBuffer} */
					this._eventWriter = new WamEventRingBuffer(RingBuffer, this._audioToMainEventSab,
						parameterIds);
					/** @private @type {WamEventRingBuffer} */
					this._eventReader = new WamEventRingBuffer(RingBuffer, this._mainToAudioEventSab,
						parameterIds);

					this._eventSabReady = true;
					delete response.content;
				}
			}
			this.port.postMessage(response);
		}
	}

	/**
	 * @param {WamTransportData} transportData
	 */
	_onTransport(transportData) {
		// Override for custom transport handling
		// eslint-disable-next-line no-console
		console.error('_onTransport not implemented!');
	}

	/**
	 * @param {WamMidiData} midiData
	 */
	_onMidi(midiData) {
		// Override for custom midi handling
		// eslint-disable-next-line no-console
		console.error('_onMidi not implemented!');
	}

	/**
	 * @param {WamBinaryData} sysexData
	 */
	_onSysex(sysexData) {
		// Override for custom sysex handling
		// eslint-disable-next-line no-console
		console.error('_onMidi not implemented!');
	}

	/**
	 * @param {WamMidiData} mpeData
	 */
	_onMpe(mpeData) {
		// Override for custom mpe handling
		// eslint-disable-next-line no-console
		console.error('_onMpe not implemented!');
	}

	/**
	 * @param {WamBinaryData} oscData
	 */
	_onOsc(oscData) {
		// Override for custom osc handling
		// eslint-disable-next-line no-console
		console.error('_onOsc not implemented!');
	}

	/**
	 * @param {any} state
	 */
	_setState(state) {
		if (state.parameterValues) this._setParameterValues(state.parameterValues, false);
	}

	/**
	 * @returns {any}
	 */
	_getState() {
		return { parameterValues: this._getParameterValues(false) };
	}

	/**
	 * @param {boolean} normalized
	 * @param {string[]=} parameterIds
	 * @returns {WamParameterDataMap}
	 */
	_getParameterValues(normalized, parameterIds) {
		/** @type {WamParameterDataMap} */
		const parameterValues = {};
		if (!parameterIds) parameterIds = Object.keys(this._parameterState);
		let i = 0;
		while (i < parameterIds.length) {
			const id = parameterIds[i];
			/** @type {WamParameter} */
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
		/** @type {WamParameter} */
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
				else if (this._eventSabReady) this._eventWriter.write(event);
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
		case 'wam-automation': this._setParameterValue(event.data, true); break;
		case 'wam-transport': this._onTransport(event.data); break;
		case 'wam-midi': this._onMidi(event.data); break;
		case 'wam-sysex': this._onSysex(event.data); break;
		case 'wam-mpe': this._onMpe(event.data); break;
		case 'wam-osc': this._onOsc(event.data); break;
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
		if (this._eventSabReady) this.scheduleEvents(...this._eventReader.read());

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

	/**
	 * @param {string} wamInstanceId
	 * @param {number} [output]
	 */
	connectEvents(wamInstanceId, output) {
		const wam = webAudioModules.processors[wamInstanceId];
		if (!wam) return;
		webAudioModules.connectEvents(this, wam, output);
	}

	/**
	 * @param {string} [wamInstanceId]
	 * @param {number} [output]
	 */
	disconnectEvents(wamInstanceId, output) {
		if (typeof wamInstanceId === 'undefined') {
			webAudioModules.disconnectEvents(this);
			return;
		}
		const wam = webAudioModules.processors[wamInstanceId];
		if (!wam) return;
		webAudioModules.disconnectEvents(this, wam, output);
	}

	/** Stop processing and remove the node from the WAM event graph. */
	destroy() {
		this._destroyed = true;
		this.port.close();
		webAudioModules.destroy(this);
	}
}

if (globalThis.AudioWorkletGlobalScope) {
	globalThis.WamProcessor = WamProcessor;
}
