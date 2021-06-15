/* eslint-disable no-undef */
/** @typedef {typeof import('./types').RingBuffer} RingBufferConstructor */
/** @typedef {import('./types').TypedArrayConstructor} TypedArrayConstructor */
/** @typedef {import('./api/types').WamEvent} WamEvent */
/** @typedef {import('./api/types').WamEventType} WamEventType */
/** @typedef {import('./api/types').WamAutomationEvent} WamAutomationEvent */
/** @typedef {import('./api/types').WamTransportEvent} WamTransportEvent */
/** @typedef {import('./api/types').WamMidiEvent} WamMidiEvent */
/** @typedef {import('./api/types').WamSysexEvent} WamSysexEvent */
/** @typedef {import('./api/types').WamMpeEvent} WamMpeEvent */
/** @typedef {import('./api/types').WamOscEvent} WamOscEvent */
/** @typedef {import('./api/types').WamParameterData} WamParameterData */
/** @typedef {import('./api/types').WamTransportData} WamTransportData */
/** @typedef {import('./api/types').WamMidiData} WamMidiData */
/** @typedef {import('./api/types').WamBinaryData} WamBinaryData */
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
		 * Number of bytes required for WamEventBase
		 * {uint32} total event size in bytes
		 * {uint8} encoded event type
		 * {float64} time
		 *
		 * @static
		 * @type {number}
		 * @memberof WamEventRingBuffer
		 */
		static WamEventBaseBytes = 4 + 1 + 8;

		/**
		 * Number of bytes required for WamAutomationEvent
		 * {WamEventBaseBytes} common event properties
		 * {uint16} encoded parameter id
		 * {float64} value
		 * {uint8} normalized
		 *
		 * @static
		 * @type {number}
		 * @memberof WamEventRingBuffer
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
		 *
		 * @static
		 * @type {number}
		 * @memberof WamEventRingBuffer
		 */
		static WamTransportEventBytes = WamEventRingBuffer.WamEventBaseBytes + 4 + 8 + 8 + 1 + 1;

		/**
		 * Number of bytes required for WamMidiEvent or WamMpeEvent
		 * {WamEventBaseBytes} common event properties
		 * {uint8} status byte
		 * {uint8} data1 byte
		 * {uint8} data2 byte
		 *
		 * @static
		 * @type {number}
		 * @memberof WamEventRingBuffer
		 */
		static WamMidiEventBytes = WamEventRingBuffer.WamEventBaseBytes + 1 + 1 + 1;

		/**
		 * Number of bytes required for WamSysexEvent or WamOscEvent
		 * (total number depends on content of message / size of byte array)
		 * {WamEventBaseBytes} common event properties
		 * {uint32} number of bytes in binary array
		 * {uint8[]} N bytes in binary array depending on message
		 *
		 * @static
		 * @type {number}
		 * @memberof WamEventRingBuffer
		 */
		static WamBinaryEventBytes = WamEventRingBuffer.WamEventBaseBytes + 4; // + N

		/**
		 * Returns a SharedArrayBuffer large enough to safely store
		 * the specified number of events. Specify 'maxBytesPerEvent'
		 * to support variable-size binary event types like sysex or osc.
		 *
		 * @static
		 * @param {RingBufferConstructor} RingBuffer
		 * @param {number} eventCapacity
		 * @param {number} [maxBytesPerEvent=undefined]

		 * @return {SharedArrayBuffer}
		 * @memberof WamEventRingBuffer
		 */
		static getStorageForEventCapacity(RingBuffer, eventCapacity, maxBytesPerEvent = undefined) {
			if (maxBytesPerEvent === undefined) maxBytesPerEvent = 0;
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
		 * @param {{[parameterId: string]: number}} parameterIndices
		 * @param {number} [maxBytesPerEvent=undefined]
		 * @memberof WamEventRingBuffer
		 */
		constructor(RingBuffer, sab, parameterIndices, maxBytesPerEvent = undefined) {
			/** @property {string: number} _eventSizeBytes */
			this._eventSizeBytes = {};

			/** @property {string: number} _encodeEventType */
			this._encodeEventType = {};

			/** @property {number: string} _decodeEventType */
			this._decodeEventType = {};
			['automation', 'transport', 'midi', 'sysex', 'mpe', 'osc'].forEach((type, encodedType) => {
				let byteSize = 0;
				switch (type) {
				case 'automation': byteSize = WamEventRingBuffer.WamAutomationEventBytes; break;
				case 'transport': byteSize = WamEventRingBuffer.WamTransportEventBytes; break;
				case 'mpe':
				case 'midi': byteSize = WamEventRingBuffer.WamMidiEventBytes; break;
				case 'osc':
				case 'sysex': byteSize = WamEventRingBuffer.WamBinaryEventBytes; break;
				default: break;
				}
				this._eventSizeBytes[type] = byteSize;
				this._encodeEventType[type] = encodedType;
				this._decodeEventType[encodedType] = type;
			});

			/** @property {{[parameterId: string]: number}} _parameterIndices */
			this._encodeParameterId = parameterIndices;

			/** @property {{[parameterId: number]: string}} _parameterIndices */
			this._decodeParameterId = {};
			Object.keys(this._encodeParameterId).forEach((parameterId) => {
				const encodedParameterId = this._encodeParameterId[parameterId];
				this._decodeParameterId[encodedParameterId] = parameterId;
			});

			/** @property {SharedArrayBuffer} _sab */
			this._sab = sab;

			if (maxBytesPerEvent === undefined) maxBytesPerEvent = 0;

			/** @property {number} _eventBytesAvailable */
			this._eventBytesAvailable = Math.max(
				WamEventRingBuffer.WamAutomationEventBytes,
				WamEventRingBuffer.WamTransportEventBytes,
				WamEventRingBuffer.WamMidiEventBytes,
				WamEventRingBuffer.WamBinaryEventBytes,
			) + maxBytesPerEvent;
			/** @property {ArrayBuffer} _eventBytes */
			this._eventBytes = new ArrayBuffer(this._eventBytesAvailable);
			/** @property {DataView} _eventBytesView */
			this._eventBytesView = new DataView(this._eventBytes);

			/** @property {RingBuffer} _mainToAudioRb */
			this._rb = new RingBuffer(this._sab, Uint8Array);

			/** @property {Uint8Array} _eventSizeReadArray */
			this._eventSizeArray = new Uint8Array(this._eventBytes, 0, 4);

			/** @property {DataView} _eventSizeView */
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
		 * @memberof WamEventRingBuffer
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
		 * @memberof WamEventRingBuffer
		 */
		_encode(event) {
			let byteOffset = 0;
			const { type, time } = event;
			switch (event.type) {
			case 'automation': {
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
			case 'transport': {
				const byteSize = this._eventSizeBytes[type];
				byteOffset = this._writeHeader(byteSize, type, time);

				/**
				 * @type {WamTransportEvent}
				 * @property {WamTransportData} data
				 */
				const { data } = event;
				const {
					currentBar, currentBarStarted, tempo, timeSigNumerator, timeSigDenominator,
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
			} break;
			case 'mpe':
			case 'midi': {
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
			case 'osc':
			case 'sysex': {
				/**
				 * @type {WamSysexEvent | WamOscEvent}
				 * @property {WamBinaryData} data
				 */
				const { data } = event;
				const { bytes } = data;
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
		 * @returns {WamEvent} Decoded WamEvent
		 * @memberof WamEventRingBuffer
		 */
		_decode() {
			let byteOffset = 0;
			const type = this._decodeEventType[this._eventBytesView.getUint8(byteOffset)];
			byteOffset += 1;
			let time = this._eventBytesView.getFloat64(byteOffset);
			if (time === -1) time = undefined;
			byteOffset += 8;

			switch (type) {
			case 'automation': {
				const id = this._decodeParameterId[this._eventBytesView.getUint16(byteOffset)];
				byteOffset += 2;
				const value = this._eventBytesView.getFloat64(byteOffset);
				byteOffset += 8;
				const normalized = !!this._eventBytesView.getUint8(byteOffset);
				byteOffset += 1;

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
			case 'transport': {
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

				/** @type {WamTransportEvent} */
				const event = {
					type,
					time,
					data: {
						currentBar, currentBarStarted, tempo, timeSigNumerator, timeSigDenominator,
					},
				};
				return event;
			}
			case 'mpe':
			case 'midi': {
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
			case 'osc':
			case 'sysex': {
				const numBytes = this._eventBytesView.getUint32(byteOffset);
				byteOffset += 4;
				const bytes = new Uint8Array(numBytes);
				bytes.set(new Uint8Array(this._eventBytes, byteOffset, numBytes));
				byteOffset += numBytes;

				/** @type {WamSysexEvent} */
				const event = {
					type,
					time,
					data: { bytes },
				};
				return event;
			}
			default: break;
			}
			// eslint-disable-next-line no-console
			console.error('Failed to decode event!');
			return { type: 'midi', time: undefined, data: { bytes: [0, 0, 0] } };
		}

		/**
		 * Write WamEvents to the ring buffer, returning
		 * the number of events successfully written.
		 *
		 * @param {WamEvent[]} events
		 * @return {number}
		 * @memberof WamEventRingBuffer
		 */
		write(...events) {
			const numEvents = events.length;
			let bytesAvailable = this._rb.availableWrite;
			let bytesWritten = 0;
			let i = 0;
			while (i < numEvents) {
				const event = events[i];
				const bytes = this._encode(event);
				const eventSizeBytes = bytes.byteLength;
				if (bytesAvailable >= eventSizeBytes) {
					bytesWritten = this._rb.push(bytes);
				} else break;
				bytesAvailable -= bytesWritten;
				i++;
			}
			return i;
		}

		/**
		 * Read WamEvents from the ring buffer, returning
		 * the list of events successfully read.
		 *
		 * @return {WamEvent[]}
		 * @memberof WamEventRingBuffer
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
				events.push(this._decode());
			}
			return events;
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
