/* eslint-disable no-undef */
/** @typedef {typeof import('./types').RingBuffer} RingBufferConstructor */
/** @typedef {import('./types').RingBuffer} RingBuffer */
/** @typedef {import('./types').TypedArrayConstructor} TypedArrayConstructor */
/** @typedef {import('./api/types').WamEvent} WamEvent */
/** @typedef {import('./api/types').WamEventType} WamEventType */
/** @typedef {import('./api/types').WamAutomationEvent} WamAutomationEvent */
/** @typedef {import('./api/types').WamTransportEvent} WamTransportEvent */
/** @typedef {import('./api/types').WamMidiEvent} WamMidiEvent */
/** @typedef {import('./api/types').WamSysexEvent} WamSysexEvent */
/** @typedef {import('./api/types').WamMpeEvent} WamMpeEvent */
/** @typedef {import('./api/types').WamOscEvent} WamOscEvent */
/** @typedef {import('./api/types').WamInfoEvent} WamInfoEvent */
/** @typedef {import('./api/types').WamParameterData} WamParameterData */
/** @typedef {import('./api/types').WamTransportData} WamTransportData */
/** @typedef {import('./api/types').WamMidiData} WamMidiData */
/** @typedef {import('./api/types').WamBinaryData} WamBinaryData */
/** @typedef {import('./api/types').WamInfoData} WamInfoData */
/** @typedef {import('./types').WamEventRingBuffer} IWamEventRingBuffer */
/** @typedef {typeof import('./types').WamEventRingBuffer} WamEventRingBufferConstructor */
/** @typedef {import('./types').AudioWorkletGlobalScope} AudioWorkletGlobalScope */

/* eslint-disable no-plusplus */
/* eslint-disable no-underscore-dangle */

/**
 * @returns {WamEventRingBufferConstructor}
 */
const executable = () => {
	/**
	 * @implements {IWamEventRingBuffer}
	 */
	class WamEventRingBuffer {

		/**
		 * Default number of additional bytes allocated
		 * per event (to support variable-size event objects)
		 *
		 * @type {number}
		 */
		static DefaultExtraBytesPerEvent = 64;

		/**
		 * Number of bytes required for WamEventBase
		 * {uint32} total event size in bytes
		 * {uint8} encoded event type
		 * {float64} time
		 *
		 * @type {number}
		 */
		static WamEventBaseBytes = 4 + 1 + 8;

		/**
		 * Number of bytes required for WamAutomationEvent
		 * {WamEventBaseBytes} common event properties
		 * {uint16} encoded parameter id
		 * {float64} value
		 * {uint8} normalized
		 *
		 * @type {number}
		 */
		static WamAutomationEventBytes = WamEventRingBuffer.WamEventBaseBytes + 2 + 8 + 1;

		/**
		 * Number of bytes required for WamTransportEvent
		 * {WamEventBaseBytes} common event properties
		 * {uint32} current bar
		 * {float64} currentBarStarted
		 * {float64} tempo
		 * {uint8} time signature numerator
		 * {uint8} time signature denominator
		 * {uint8} run flags
		 *
		 * @type {number}
		 */
		static WamTransportEventBytes = WamEventRingBuffer.WamEventBaseBytes + 4 + 8 + 8 + 1 + 1 + 1;

		/**
		 * Number of bytes required for WamMidiEvent or WamMpeEvent
		 * {WamEventBaseBytes} common event properties
		 * {uint8} status byte
		 * {uint8} data1 byte
		 * {uint8} data2 byte
		 *
		 * @type {number}
		 */
		static WamMidiEventBytes = WamEventRingBuffer.WamEventBaseBytes + 1 + 1 + 1;

		/**
		 * Number of bytes required for WamSysexEvent or WamOscEvent
		 * (total number depends on content of message / size of byte array)
		 * {WamEventBaseBytes} common event properties
		 * {uint32} number of bytes in binary array
		 * {uint8[]} N bytes in binary array depending on message
		 *
		 * @type {number}
		 */
		static WamBinaryEventBytes = WamEventRingBuffer.WamEventBaseBytes + 4; // + N

		/**
		 * Returns a SharedArrayBuffer large enough to safely store
		 * the specified number of events. Specify 'maxBytesPerEvent'
		 * to support variable-size binary event types like sysex or osc.
		 *
		 * @param {RingBufferConstructor} RingBuffer
		 * @param {number} eventCapacity
		 * @param {number} [maxBytesPerEvent=undefined]
		 * @return {SharedArrayBuffer}
		 */
		static getStorageForEventCapacity(RingBuffer, eventCapacity, maxBytesPerEvent = undefined) {
			if (maxBytesPerEvent === undefined) maxBytesPerEvent = WamEventRingBuffer.DefaultExtraBytesPerEvent;
			else maxBytesPerEvent = Math.max(maxBytesPerEvent, WamEventRingBuffer.DefaultExtraBytesPerEvent);
			const capacity = (Math.max(
				WamEventRingBuffer.WamAutomationEventBytes,
				WamEventRingBuffer.WamTransportEventBytes,
				WamEventRingBuffer.WamMidiEventBytes,
				WamEventRingBuffer.WamBinaryEventBytes,
			) + maxBytesPerEvent) * eventCapacity;
			return RingBuffer.getStorageForCapacity(capacity, Uint8Array);
		}

		/**
		 * Provides methods for encoding / decoding WamEvents to / from
		 * a UInt8Array RingBuffer. Specify 'maxBytesPerEvent'
		 * to support variable-size binary event types like sysex or osc.
		 *
		 * @param {RingBufferConstructor} RingBuffer
		 * @param {SharedArrayBuffer} sab
		 * @param {string[]} parameterIds
		 * @param {number} [maxBytesPerEvent=undefined]
		 */
		constructor(RingBuffer, sab, parameterIds, maxBytesPerEvent = undefined) {
			/** @type {Record<string, number>} */
			this._eventSizeBytes = {};

			/** @type {Record<string, number>} */
			this._encodeEventType = {};

			/** @type {Record<number, string>} */
			this._decodeEventType = {};
			/** @type {WamEventType[]} */
			const wamEventTypes = ['wam-automation', 'wam-transport', 'wam-midi', 'wam-sysex', 'wam-mpe', 'wam-osc', 'wam-info'];
			wamEventTypes.forEach((type, encodedType) => {
				let byteSize = 0;
				switch (type) {
				case 'wam-automation': byteSize = WamEventRingBuffer.WamAutomationEventBytes; break;
				case 'wam-transport': byteSize = WamEventRingBuffer.WamTransportEventBytes; break;
				case 'wam-mpe':
				case 'wam-midi': byteSize = WamEventRingBuffer.WamMidiEventBytes; break;
				case 'wam-osc':
				case 'wam-sysex':
				case 'wam-info': byteSize = WamEventRingBuffer.WamBinaryEventBytes; break;
				default: break;
				}
				this._eventSizeBytes[type] = byteSize;
				this._encodeEventType[type] = encodedType;
				this._decodeEventType[encodedType] = type;
			});

			/** @type {number} */
			this._parameterCode = 0;
			/** @type {{[parameterId: string]: number}} */
			this._parameterCodes = {};
			/** @type {{[parameterId: string]: number}} */
			this._encodeParameterId = {};
			/** @type {{[parameterId: number]: string}} */
			this._decodeParameterId = {};
			this.setParameterIds(parameterIds);

			/** @type {SharedArrayBuffer} */
			this._sab = sab;

			if (maxBytesPerEvent === undefined) maxBytesPerEvent = WamEventRingBuffer.DefaultExtraBytesPerEvent;
			else maxBytesPerEvent = Math.max(maxBytesPerEvent, WamEventRingBuffer.DefaultExtraBytesPerEvent);

			/** @type {number} */
			this._eventBytesAvailable = Math.max(
				WamEventRingBuffer.WamAutomationEventBytes,
				WamEventRingBuffer.WamTransportEventBytes,
				WamEventRingBuffer.WamMidiEventBytes,
				WamEventRingBuffer.WamBinaryEventBytes,
			) + maxBytesPerEvent;
			/** @type {ArrayBuffer} */
			this._eventBytes = new ArrayBuffer(this._eventBytesAvailable);
			/** @type {DataView} */
			this._eventBytesView = new DataView(this._eventBytes);

			/** @type {RingBuffer} */
			this._rb = new RingBuffer(this._sab, Uint8Array);

			/** @type {Uint8Array} */
			this._eventSizeArray = new Uint8Array(this._eventBytes, 0, 4);

			/** @type {DataView} */
			this._eventSizeView = new DataView(this._eventBytes, 0, 4);
		}

		/**
		 * Write common WamEvent properties to internal buffer.
		 *
		 * @private
		 * @param {number} byteSize total size of event in bytes
		 * @param {string} type
		 * @param {number} time
		 * @return {number} updated byte offset
		 */
		_writeHeader(byteSize, type, time) {
			let byteOffset = 0;
			this._eventBytesView.setUint32(byteOffset, byteSize);
			byteOffset += 4;
			this._eventBytesView.setUint8(byteOffset, this._encodeEventType[type]);
			byteOffset += 1;
			this._eventBytesView.setFloat64(byteOffset, Number.isFinite(time) ? time : -1);
			byteOffset += 8;
			return byteOffset;
		}

		/**
		 * Write WamEvent to internal buffer.
		 *
		 * @private
		 * @param {WamEvent} event
		 * @returns {Uint8Array}
		 */
		_encode(event) {
			let byteOffset = 0;
			const { type, time } = event;
			switch (event.type) {
			case 'wam-automation': {
				if (!(event.data.id in this._encodeParameterId)) break;
				const byteSize = this._eventSizeBytes[type];
				byteOffset = this._writeHeader(byteSize, type, time);

				/**
				 * @type {WamAutomationEvent}
				 * @property {WamAutomationData} data
				 */
				const { data } = event;
				const encodedParameterId = this._encodeParameterId[data.id];
				const { value, normalized } = data;

				this._eventBytesView.setUint16(byteOffset, encodedParameterId);
				byteOffset += 2;
				this._eventBytesView.setFloat64(byteOffset, value);
				byteOffset += 8;
				this._eventBytesView.setUint8(byteOffset, normalized ? 1 : 0);
				byteOffset += 1;
			} break;
			case 'wam-transport': {
				const byteSize = this._eventSizeBytes[type];
				byteOffset = this._writeHeader(byteSize, type, time);

				/**
				 * @type {WamTransportEvent}
				 * @property {WamTransportData} data
				 */
				const { data } = event;
				const {
					currentBar, currentBarStarted, tempo, timeSigNumerator, timeSigDenominator, runFlags
				} = data;

				this._eventBytesView.setUint32(byteOffset, currentBar);
				byteOffset += 4;
				this._eventBytesView.setFloat64(byteOffset, currentBarStarted);
				byteOffset += 8;
				this._eventBytesView.setFloat64(byteOffset, tempo);
				byteOffset += 8;
				this._eventBytesView.setUint8(byteOffset, timeSigNumerator);
				byteOffset += 1;
				this._eventBytesView.setUint8(byteOffset, timeSigDenominator);
				byteOffset += 1;
				this._eventBytesView.setUint8(byteOffset, runFlags);
				byteOffset += 1;
			} break;
			case 'wam-mpe':
			case 'wam-midi': {
				const byteSize = this._eventSizeBytes[type];
				byteOffset = this._writeHeader(byteSize, type, time);

				/**
				 * @type {WamMidiEvent | WamMpeEvent}
				 * @property {WamMidiData} data
				 */
				const { data } = event;
				const { bytes } = data;
				let b = 0;
				while (b < 3) {
					this._eventBytesView.setUint8(byteOffset, bytes[b]);
					byteOffset += 1;
					b++;
				}
			} break;
			case 'wam-osc':
			case 'wam-sysex':
			case 'wam-info': {
				/** @type {Uint8Array | null} */
				let bytes = null;
				if (event.type === 'wam-info') {
					/**
					 * @type {WamInfoEvent}
					 * @property {WamInfoData} data
					 */
					const { data } = event;
					bytes = (new TextEncoder()).encode(data.instanceId);
				} else {
					/**
					 * @type {WamSysexEvent | WamOscEvent}
					 * @property {WamBinaryData} data
					 */
					const { data } = event;
					bytes = data.bytes;
				}
				const numBytes = bytes.length;
				const byteSize = this._eventSizeBytes[type];
				byteOffset = this._writeHeader(byteSize + numBytes, type, time);

				this._eventBytesView.setUint32(byteOffset, numBytes);
				byteOffset += 4;

				const bytesRequired = byteOffset + numBytes;
				// eslint-disable-next-line no-console
				if (bytesRequired > this._eventBytesAvailable) console.error(`Event requires ${bytesRequired} bytes but only ${this._eventBytesAvailable} have been allocated!`);

				const buffer = new Uint8Array(this._eventBytes, byteOffset, numBytes);
				buffer.set(bytes);
				byteOffset += numBytes;
			} break;
			default: break;
			}
			return new Uint8Array(this._eventBytes, 0, byteOffset);
		}

		/**
		 * Read WamEvent from internal buffer.
		 *
		 * @private
		 * @returns {WamEvent | false} Decoded WamEvent
		 */
		_decode() {
			let byteOffset = 0;
			const type = this._decodeEventType[this._eventBytesView.getUint8(byteOffset)];
			byteOffset += 1;
			let time = this._eventBytesView.getFloat64(byteOffset);
			if (time === -1) time = undefined;
			byteOffset += 8;

			switch (type) {
			case 'wam-automation': {
				const encodedParameterId = this._eventBytesView.getUint16(byteOffset);
				byteOffset += 2;
				const value = this._eventBytesView.getFloat64(byteOffset);
				byteOffset += 8;
				const normalized = !!this._eventBytesView.getUint8(byteOffset);
				byteOffset += 1;

				if (!(encodedParameterId in this._decodeParameterId)) break;
				const id = this._decodeParameterId[encodedParameterId];
				/** @type {WamAutomationEvent} */
				const event = {
					type,
					time,
					data: {
						id, value, normalized,
					},
				};
				return event;
			}
			case 'wam-transport': {
				const currentBar = this._eventBytesView.getUint32(byteOffset);
				byteOffset += 4;
				const currentBarStarted = this._eventBytesView.getFloat64(byteOffset);
				byteOffset += 8;
				const tempo = this._eventBytesView.getFloat64(byteOffset);
				byteOffset += 8;
				const timeSigNumerator = this._eventBytesView.getUint8(byteOffset);
				byteOffset += 1;
				const timeSigDenominator = this._eventBytesView.getUint8(byteOffset);
				byteOffset += 1;
				const runFlags = this._eventBytesView.getUint8(byteOffset);
				byteOffset += 1;

				/** @type {WamTransportEvent} */
				const event = {
					type,
					time,
					data: {
						currentBar, currentBarStarted, tempo, timeSigNumerator, timeSigDenominator, runFlags
					},
				};
				return event;
			}
			case 'wam-mpe':
			case 'wam-midi': {
				/** @type {[number, number, number]} */
				const bytes = [0, 0, 0];
				let b = 0;
				while (b < 3) {
					bytes[b] = this._eventBytesView.getUint8(byteOffset);
					byteOffset += 1;
					b++;
				}

				/** @type {WamMidiEvent | WamMpeEvent} */
				const event = {
					type,
					time,
					data: { bytes },
				};
				return event;
			}
			case 'wam-osc':
			case 'wam-sysex':
			case 'wam-info': {
				const numBytes = this._eventBytesView.getUint32(byteOffset);
				byteOffset += 4;
				const bytes = new Uint8Array(numBytes);
				bytes.set(new Uint8Array(this._eventBytes, byteOffset, numBytes));
				byteOffset += numBytes;

				if (type === 'wam-info') {
					const instanceId = (new TextDecoder()).decode(bytes);
					const data = { instanceId };
					return { type, time, data };
				} else {
					const data = { bytes };
					return { type, time, data };
				}
			}
			default: break;
			}
			// eslint-disable-next-line no-console
			// console.warn('Failed to decode event!');
			return false;
		}

		/**
		 * Write WamEvents to the ring buffer, returning
		 * the number of events successfully written.
		 *
		 * @param {WamEvent[]} events
		 * @return {number}
		 */
		write(...events) {
			const numEvents = events.length;
			let bytesAvailable = this._rb.availableWrite;
			let numSkipped = 0;
			let i = 0;
			while (i < numEvents) {
				const event = events[i];
				const bytes = this._encode(event);
				const eventSizeBytes = bytes.byteLength;

				let bytesWritten = 0;
				if (bytesAvailable >= eventSizeBytes) {
					if (eventSizeBytes === 0) numSkipped++;
					else bytesWritten = this._rb.push(bytes);
				} else break;
				bytesAvailable -= bytesWritten;
				i++;
			}
			return i - numSkipped;
		}

		/**
		 * Read WamEvents from the ring buffer, returning
		 * the list of events successfully read.
		 *
		 * @return {WamEvent[]}
		 */
		read() {
			if (this._rb.empty) return [];
			const events = [];
			let bytesAvailable = this._rb.availableRead;
			let bytesRead = 0;
			while (bytesAvailable > 0) {
				bytesRead = this._rb.pop(this._eventSizeArray);
				bytesAvailable -= bytesRead;
				const eventSizeBytes = this._eventSizeView.getUint32(0);
				const eventBytes = new Uint8Array(this._eventBytes, 0, eventSizeBytes - 4);
				bytesRead = this._rb.pop(eventBytes);
				bytesAvailable -= bytesRead;
				const decodedEvent = this._decode();
				if (decodedEvent) events.push(decodedEvent);
			}
			return events;
		}

		/**
		 * In case parameter set changes, update the internal mappings.
		 * May result in some invalid automation events, which will be
	 	 * ignored. Note that this must be called on all corresponding
		 * WamEventRingBuffers on both threads.
		 * @param {string[]} parameterIds
		 */
		setParameterIds(parameterIds) {
			this._encodeParameterId = {};
			this._decodeParameterId = {};
			parameterIds.forEach((parameterId) => {
				let parameterCode = -1
				if (parameterId in this._parameterCodes) parameterCode = this._parameterCodes[parameterId];
				else {
					parameterCode = this._generateParameterCode();
					this._parameterCodes[parameterId] = parameterCode;
				}
				this._encodeParameterId[parameterId] = parameterCode;
				this._decodeParameterId[parameterCode] = parameterId;
			});
		}

		/**
		 * Generates a numeric parameter code in a range suitable for
		 * encoding as uint16.
		 *
		 * @return {number}
		 */
		_generateParameterCode() {
			if (this._parameterCode > 65535) throw Error('Too many parameters have been registered!');
			return this._parameterCode++;
		}

	}
	/** @type {AudioWorkletGlobalScope} */
	// @ts-ignore
	const audioWorkletGlobalScope = globalThis;
	if (audioWorkletGlobalScope.AudioWorkletProcessor) {
		if (!audioWorkletGlobalScope.WamEventRingBuffer) {
			audioWorkletGlobalScope.WamEventRingBuffer = WamEventRingBuffer;
		}
	}

	return WamEventRingBuffer;
};
/** @type {AudioWorkletGlobalScope} */
// @ts-ignore
const audioWorkletGlobalScope = globalThis;
if (audioWorkletGlobalScope.AudioWorkletProcessor) {
	if (!audioWorkletGlobalScope.WamEventRingBuffer) executable();
}

export default executable;
