/* eslint-disable no-underscore-dangle */

import { WamEvent, RingBufferConstructor } from './api/types';

declare class WamEventRingBuffer {
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
	static WamEventBaseBytes: number;

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
	static WamAutomationEventBytes: number;

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
	static WamTransportEventBytes: number;

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
	static WamMidiEventBytes: number;

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
	static WamBinaryEventBytes: number; // + N

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
	static getStorageForEventCapacity(RingBuffer: RingBufferConstructor,
		eventCapacity: number, maxBytesPerEvent?: number): SharedArrayBuffer;

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
	constructor(RingBuffer: RingBufferConstructor, sab: SharedArrayBuffer,
		parameterIndices: {[parameterId: string]: number}, maxBytesPerEvent?: number);

	/**
	 * Map set of event type id strings to integers
	 *
	 * @private
	 * @type {Record<string, number>}
	 * @memberof WamEventRingBuffer
	 */
	private _encodeEventType: Record<string, number>;

	/**
	 * Map set of event type id integers to strings
	 *
	 * @private
	 * @type {Record<number, string>}
	 * @memberof WamEventRingBuffer
	 */
	private _decodeEventType: Record<number, string>;

	/**
	 * Map set of parameter id strings to integers
	 *
	 * @private
	 * @type {Record<string, number>}
	 * @memberof WamEventRingBuffer
	 */
	private _encodeParameterId: Record<string, number>;

	/**
	 * Map set of parameter id integers to strings
	 *
	 * @private
	 * @type {Record<number, string>}
	 * @memberof WamEventRingBuffer
	 */
	private _decodeParameterId: Record<number, string>;

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
	private _writeHeader(byteSize, type, time): number;

	/**
	 * Write WamEvent to internal buffer.
	 *
	 * @private
	 * @param {WamEvent} event
	 * @returns {Uint8Array}
	 * @memberof WamEventRingBuffer
	 */
	 _encode(event): Uint8Array;

	/**
	 * Read WamEvent from internal buffer.
	 *
	 * @private
	 * @returns {WamEvent} Decoded WamEvent
	 * @memberof WamEventRingBuffer
	 */
	 _decode(): WamEvent;

	/**
	 * Write WamEvents to the ring buffer, returning
	 * the number of events successfully written.
	 *
	 * @param {WamEvent[]} events
	 * @return {number}
	 * @memberof WamEventRingBuffer
	 */
	write(...events): number;

	/**
	 * Read WamEvents from the ring buffer, returning
	 * the list of events successfully read.
	 *
	 * @return {WamEvent[]}
	 * @memberof WamEventRingBuffer
	 */
	read(): WamEvent[];
}

export default WamEventRingBuffer;
