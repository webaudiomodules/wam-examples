/* eslint-disable object-curly-newline */
/* eslint-disable max-len */
import { AudioWorkletGlobalScope as IAudioWorkletGlobalScope, WamEvent, WamParameter, WamParameterInfo } from './api/types';

export interface WamParameterInterpolator {
	/** Info object for corresponding WamParameter. */
	readonly info: WamParameterInfo;

	/** Buffer storing per-sample values. */
	readonly values: Float32Array;

	/**
	 * Update interpolation curve based on skew factor in range `[-1, 1]`.
	 * Setting to `0` results in linear interpolation. Positive values
	 * result in convex exponential curves while negative vales result
	 * in concave exponential curves.
	 */
	setSkew(skew: number): void;

	/**
	 * Reset the interpolator to specified value, setting all per-sample
	 * values immediately if `fill` is `true`. Assumes `value` is within
	 * parameter's valid range `[minValue, maxValue]`;
	 */
	setStartValue(value: number, fill?: boolean): void;

	/**
	 * Prepare to compute per-sample values interpolating to `value` on
	 * next `process` call. Assumes `value` is within parameter's valid
	 * range `[minValue, maxValue]`;
	 */
	setEndValue(value: number): void;

	/**
	 * Compute per-sample value updates in the specified range `[startIndex, endIndex)`,
	 * interpolating if applicable. Results are stored in `values`. Assumes this will be
	 * called once per parameter per processing slice in `WamProcessor.process`.
	 */
	process(startIndex: number, endIndex: number): void;

	/**
	 * Whether or not further processing is required before
	 * accessing per-sample values.
	 */
	readonly done: boolean;

	/**
	 * Call this when no longer using the instance in order
	 * to allow deletion of unused static lookup tables.
	 */
	destroy(): void;
}

export const WamParameterInterpolator: {
	prototype: WamParameterInterpolator;
	/**
	 * Lookup tables to avoid recomputing interpolation curves. Keyed
	 * by `'<samplesPerInterpolation>_<skew>'`. Not used for
	 * discrete parameters.
	 */
	_tables: Record<string, Float32Array>;

	/**
	 * List of parameter ids currently using the lookup table associated
	 * with the key. Keyed by `'<samplesPerInterpolation>_<skew>'`.
	 * For purging unused lookup tables. Not used for discrete parameters.
	 */
	_tableReferences: Record<string, string[]>;

	/**
	 * Provides per-sample value updates for WamParameters
	 * with interpolation when applicable. Only one instance
	 * should be created per WamParameter.
	 */
	new (info: WamParameterInfo, samplesPerInterpolation: number, skew?: number)
	: WamParameterInterpolator;
};

// eslint-disable-next-line no-undef
export type TypedArrayConstructor = Int8ArrayConstructor | Uint8ArrayConstructor | Uint8ClampedArrayConstructor | Int16ArrayConstructor | Uint16ArrayConstructor | Int32ArrayConstructor | Uint32ArrayConstructor | Float32ArrayConstructor | Float64ArrayConstructor | BigInt64ArrayConstructor | BigInt64ArrayConstructor;

// eslint-disable-next-line no-undef
export type TypedArray = Int8Array | Uint8Array | Uint8ClampedArray | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array | Float64Array | BigInt64Array | BigInt64Array;

/**
 * A Single Producer - Single Consumer thread-safe wait-free ring buffer.
 * The producer and the consumer can be on separate threads, but cannot change roles,
 * except with external synchronization.
 *
 * @author padenot
 */
export interface RingBuffer {
    /** Returns the type of the underlying ArrayBuffer for this RingBuffer. This allows implementing crude type checking. */
    readonly type: string;
    /** Push bytes to the ring buffer. `bytes` is a typed array of the same type as passed in the ctor, to be written to the queue. Returns the number of elements written to the queue. */
    push(elements: TypedArray): number;
    /** Read `elements.length` elements from the ring buffer. `elements` is a typed array of the same type as passed in the ctor. Returns the number of elements read from the queue, they are placed at the beginning of the array passed as parameter. */
    pop(elements: TypedArray): number;
    /** True if the ring buffer is empty false otherwise. This can be late on the reader side: it can return true even if something has just been pushed. */
    readonly empty: boolean;
    /** True if the ring buffer is full, false otherwise. This can be late on the write side: it can return true when something has just been popped. */
    readonly full: boolean;
    /** The usable capacity for the ring buffer: the number of elements that can be stored. */
    readonly capacity: number;
    /** Number of elements available for reading. This can be late, and report less elements that is actually in the queue, when something has just been enqueued. */
    readonly availableRead: number;
    /** Number of elements available for writing. This can be late, and report less elements that is actually available for writing, when something has just been dequeued. */
    readonly availableWrite: number;
}
export const RingBuffer: {
	prototype: RingBuffer;
    getStorageForCapacity(capacity: number, Type: TypedArrayConstructor): SharedArrayBuffer;
    /**
     * `sab` is a SharedArrayBuffer with a capacity calculated by calling
     * `getStorageForCapacity` with the desired capacity.
     */
    new (sab: SharedArrayBuffer, Type: TypedArrayConstructor): RingBuffer;
};

export interface WamEventRingBuffer {
	/**
	 * Write WamEvents to the ring buffer, returning
	 * the number of events successfully written.
	 */
	write(...events: WamEvent[]): number;

	/**
	 * Read WamEvents from the ring buffer, returning
	 * the list of events successfully read.
	 */
	read(): WamEvent[];
}
export const WamEventRingBuffer: {
	prototype: WamEventRingBuffer;
	/**
	 * Number of bytes required for WamEventBase
	 * {uint32} total event size in bytes
	 * {uint8} encoded event type
	 * {float64} time
	 */
	WamEventBaseBytes: number;

	/**
	 * Number of bytes required for WamAutomationEvent
	 * {WamEventBaseBytes} common event properties
	 * {uint16} encoded parameter id
	 * {float64} value
	 * {uint8} normalized
	 */
	WamAutomationEventBytes: number;

	/**
	 * Number of bytes required for WamTransportEvent
	 * {WamEventBaseBytes} common event properties
	 * {uint32} current bar
	 * {float64} currentBarStarted
	 * {float64} tempo
	 * {uint8} time signature numerator
	 * {uint8} time signature denominator
	 */
	WamTransportEventBytes: number;

	/**
	 * Number of bytes required for WamMidiEvent or WamMpeEvent
	 * {WamEventBaseBytes} common event properties
	 * {uint8} status byte
	 * {uint8} data1 byte
	 * {uint8} data2 byte
	 */
	WamMidiEventBytes: number;

	/**
	 * Number of bytes required for WamSysexEvent or WamOscEvent
	 * (total number depends on content of message / size of byte array)
	 * {WamEventBaseBytes} common event properties
	 * {uint32} number of bytes in binary array
	 * {uint8[]} N bytes in binary array depending on message
	 */
	WamBinaryEventBytes: number; // + N

	/**
	 * Returns a SharedArrayBuffer large enough to safely store
	 * the specified number of events. Specify 'maxBytesPerEvent'
	 * to support variable-size binary event types like sysex or osc.
	 */
	getStorageForEventCapacity(RingBufferConstructor: typeof RingBuffer, eventCapacity: number, maxBytesPerEvent?: number): SharedArrayBuffer;

	/**
	 * Provides methods for encoding / decoding WamEvents to / from
	 * a UInt8Array RingBuffer. Specify 'maxBytesPerEvent'
	 * to support variable-size binary event types like sysex or osc.
	 */
	new (RingBufferConstructor: typeof RingBuffer, sab: SharedArrayBuffer, parameterIndices: { [parameterId: string]: number }, maxBytesPerEvent?: number): WamEventRingBuffer;
};

export interface AudioWorkletGlobalScope extends IAudioWorkletGlobalScope {
    RingBuffer: typeof RingBuffer;
    WamEventRingBuffer: typeof WamEventRingBuffer;
    WamParameter: typeof WamParameter;
    WamParameterInterpolator: typeof WamParameterInterpolator;
}
