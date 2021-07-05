/* eslint-disable object-curly-newline */
/* eslint-disable max-len */
import { AudioWorkletGlobalScope as IAudioWorkletGlobalScope, WebAudioModule as IWebAudioModule, WamBinaryData, WamEvent, WamMidiData, WamParameter, WamParameterData, WamParameterDataMap, WamParameterInfo, WamParameterInfoMap, WamProcessor as IWamProcessor, WamTransportData, WamNode as IWamNode, WamDescriptor } from './api/types';

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
export type TypedArrayConstructor = Int8ArrayConstructor | Uint8ArrayConstructor | Uint8ClampedArrayConstructor | Int16ArrayConstructor | Uint16ArrayConstructor | Int32ArrayConstructor | Uint32ArrayConstructor | Float32ArrayConstructor | Float64ArrayConstructor | BigInt64ArrayConstructor | BigUint64ArrayConstructor;

// eslint-disable-next-line no-undef
export type TypedArray = Int8Array | Uint8Array | Uint8ClampedArray | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array | Float64Array | BigInt64Array | BigUint64Array;

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
    /** Push bytes to the ring buffer. `elements` is a typed array of the same type as passed in the ctor, to be written to the queue. Returns the number of elements written to the queue. */
    push(elements: TypedArray): number;
    /** Read `elements.length` elements from the ring buffer if `elements` is a typed array of the same type as passed in the ctor. If `elements` is an integer, pop and discard that many elements from the ring buffer. Returns the number of elements read from the queue, they are placed at the beginning of the array passed as parameter if `elements` is not an integer. */
    pop(elements: TypedArray | number): number;
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

	/**
	 * In case parameter set changes, update the internal mappings.
	 * May result in some invalid automation events, which will be
	 * ignored. Note that this must be called on corresponding
	 * WamEventRingBuffers on both threads.
	 */
	 setParameterIds(parameterIds: string[]);
}
export const WamEventRingBuffer: {
	prototype: WamEventRingBuffer;

	/**
	 * Default number of additional bytes allocated
	 * per event (to support variable-size event objects)
	 */
	DefaultExtraBytesPerEvent: number;

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
	 * {uint8} playing flag
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
	new (RingBufferConstructor: typeof RingBuffer, sab: SharedArrayBuffer, parameterIds: string[], maxBytesPerEvent?: number): WamEventRingBuffer;
};

export interface WamArrayRingBuffer {
	/**
	 * Attempt to write array to the ring buffer, returning whether
	 * or not it was successfully written.
	 */
	write(array: TypedArray): boolean;

	/**
	 * Attempt to read array from the ring buffer, returning whether
	 * or not it was successfully read. If `newest` is true, skips
	 * all pending arrays but the most recently written one.
	 */
	read(array: TypedArray, newest: boolean): boolean;
}
export const WamArrayRingBuffer: {
	prototype: WamArrayRingBuffer;

	/**
	 * Default number of arrays for which memory will be allocated.
	 */
	DefaultArrayCapacity: number;

	/**
	 * Returns a SharedArrayBuffer large enough to safely store the
	 * specified number of arrays of the specified length. Specify
	 * `maxArrayCapacity` to support storing more than
	 * `DefaultArrayCapacity` arrays in the buffer.
	 */
	getStorageForEventCapacity(RingBufferConstructor: typeof RingBuffer, arrayLength: number, arrayType: TypedArrayConstructor, maxArrayCapacity?: number): SharedArrayBuffer;

	/**
	 * Provides methods for writing / reading arrays to / from a
	 * RingBuffer. Specify `maxArrayCapacity` to support storing more
	 * than `DefaultArrayCapacity` arrays in the buffer.
	 */
	new (RingBufferConstructor: typeof RingBuffer, sab: SharedArrayBuffer, arrayLength: number, arrayType: TypedArrayConstructor, maxArrayCapacity?: number): WamArrayRingBuffer;
};

export interface WamNode extends IWamNode {
	readonly moduleId: string;
    /**
     * Messages from audio thread
     */
    _onMessage(message: MessageEvent): void;
    _audioToMainInterval: number;
    _onEvent(event: WamEvent): void;
    _generateMessageId(): number;
}
export const WamNode: {
	prototype: WamNode;
    new (module: IWebAudioModule, options?: AudioWorkletNodeOptions): WamNode;
};

/**
 * A WamEvent and corresponding message id used to trigger callbacks
 * on the main thread once the event has been processed.
 */
export type PendingWamEvent = {
    id: number;
    event: WamEvent;
};

/**
 * A range of sample indices and corresponding list of simultaneous
 * WamEvents to be processed at the beginning of the slice.
 */
export type ProcessingSlice = {
    range: [number, number];
    events: WamEvent[];
};

export type WamParameterInterpolatorMap = {
    [id: string]: WamParameterInterpolator;
};

export interface WamProcessor extends IWamProcessor {
	readonly downstream: Set<IWamProcessor>
    /**
     * Messages from main thread appear here.
     */
    _onMessage(message: MessageEvent): Promise<void>;
    _onTransport(transportData: WamTransportData): void;
    _onMidi(midiData: WamMidiData): void;
    _onSysex(sysexData: WamBinaryData): void;
    _onMpe(mpeData: WamMidiData): void;
    _onOsc(oscData: WamBinaryData): void;
    _setState(state: any): void;
    _getState(): any;
	_getParameterValues(normalized: boolean, parameterIds?: string[] | undefined): WamParameterDataMap;
    _setParameterValues(parameterUpdates: WamParameterDataMap, interpolate: boolean): void;
    _setParameterValue(parameterUpdate: WamParameterData, interpolate: boolean): void;
    _interpolateParameterValues(startIndex: number, endIndex: number): void;
    _getProcessingSlices(): ProcessingSlice[];
    _processEvent(event: WamEvent): void;
    /**
     * Override this to implement custom DSP.
     * @param startSample beginning of processing slice
     * @param endSample end of processing slice
     * @param inputs
     * @param outputs
     * @param parameters
     */
    _process(startSample: number, endSample: number, inputs: Float32Array[][], outputs: Float32Array[][], parameters: Record<string, Float32Array>): void;
    connectEvents(wamInstanceId: string, output?: number): void;
	disconnectEvents(wamInstanceId?: string, output?: number): void;
    /** Stop processing and remove the node from the WAM event graph. */
    destroy(): void;
}

export const WamProcessor: {
	prototype: WamProcessor;
    /**
     * Override to fetch plugin's params via whatever means desired.
     */
	generateWamParameterInfo(): WamParameterInfoMap;
    new (options: AudioWorkletNodeOptions): WamProcessor;
} & Pick<typeof IWamProcessor, "parameterDescriptors">;

export interface WebAudioModule<Node extends IWamNode = IWamNode> extends IWebAudioModule<Node> {
	readonly _timestamp: number;
    _audioNode: Node;
    _initialized: boolean;
    /**
     * Url to load the plugin's GUI HTML
     */
    _guiModuleUrl: string;
    /**
     * Url to load the plugin's `descriptor.json`
     */
    _descriptorUrl: string;
    _descriptor: WamDescriptor;
    _loadGui(): Promise<any>;
    _loadDescriptor(): Promise<WamDescriptor>;
}

export const WebAudioModule: {
	prototype: WebAudioModule;
    createInstance<Node extends WamNode = WamNode>(audioContext: BaseAudioContext, initialState?: any): Promise<WebAudioModule<Node>>;
	new <Node extends WamNode = WamNode>(audioContext: BaseAudioContext): WebAudioModule<Node>;
} & Pick<typeof IWebAudioModule, "isWebAudioModuleConstructor">;

export interface AudioWorkletGlobalScope extends IAudioWorkletGlobalScope {
    RingBuffer: typeof RingBuffer;
    WamEventRingBuffer: typeof WamEventRingBuffer;
	WamArrayRingBuffer: typeof WamArrayRingBuffer;
    WamParameter: typeof WamParameter;
    WamParameterInterpolator: typeof WamParameterInterpolator;
}
