/* eslint-disable no-undef */
/* eslint-disable max-len */

// eslint-disable-next-line object-curly-newline
import { WamNodeOptions, WamParameterInfoMap, WamNode, WamParameterConfiguration, WamEvent, WebAudioModule, WamEventMap, WamParameter, WamProcessor } from '../api/types';
import { TypedAudioWorkletNode, TypedAudioWorkletNodeOptions } from './TypedAudioWorklet';

export class AudioWorkletRegister {
	/**
	 * Register a AudioWorklet processor in a closure,
	 * sending to AudioWorkletProcessor with an unique identifier
	 * avoiding double registration
	 *
	 * @param {string} processorId if duplicated, the processor will not be readded.
	 * @param {(id: string, ...injections: any[]) => void} processor a serializable function that contains an AudioWorkletProcessor
	 * with its registration in the AudioWorkletGlobalScope
	 * @param {AudioWorklet} audioWorklet AudioWorklet instance
	 * @param {...any[]} injection this will be serialized and injected to the `processor` function
	 * @returns {Promise<void>} a Promise<void>
	 */
	static register(processorId: string, processor: (id: string, ...injections: any[]) => void, audioWorklet: AudioWorklet, ...injection: any[]): Promise<void>;
}
export interface InternalParameterDescriptor {
    /**
     * `0` by default
     */
    defaultValue?: number;
    /**
     * `0` by default
     */
    minValue?: number;
    /**
     * `1` by default
     */
    maxValue?: number;
    /**
     * `30` (1/30s for each change check) by default
     */
    automationRate?: number;
    /**
     * The default event listener,
     * the event will be fired when the param get changed
     */
    onChange?: (value: number, previousValue: number) => any;
}
export type InternalParametersDescriptor<InternalParams extends string = string> = Record<InternalParams, AudioParam | InternalParameterDescriptor>;
export interface ParameterMappingTarget {
    /**
     * Source param's `[minValue, maxValue]` by default
     */
    sourceRange?: [number, number];
    /**
     * Source param's `[minValue, maxValue]` by default
     */
    targetRange?: [number, number];
}
export type ParametersMapping<Params extends string = string, InternalParams extends string = string> = Record<Params, Record<InternalParams, ParameterMappingTarget>>;

export interface ParametersMappingConfiguratorOptions<Params extends string = string, InternalParams extends string = string> {
    paramsConfig?: Record<Params, WamParameterConfiguration>;
    paramsMapping?: ParametersMapping<Params, InternalParams>;
    internalParamsConfig?: InternalParametersDescriptor<InternalParams>;
}

export type PromisifiedFunction<F extends (...args: any[]) => any> = (...args: Parameters<F>) => PromiseLike<ReturnType<F>>;

export type UnPromisifiedFunction<F extends (...args: any[]) => any> = (...args: Parameters<F>) => ReturnType<F> extends PromiseLike<infer P> ? P : ReturnType<F>;

export type PromisifiedFunctionMap<T> = {
	[K in keyof T]: T[K] extends (...args: any[]) => any ? PromisifiedFunction<T[K]> : T[K];
};
export type UnPromisifiedFunctionMap<T> = {
	[K in keyof T]: T[K] extends (...args: any[]) => any ? UnPromisifiedFunction<T[K]> : T[K];
};
export interface MessagePortRequest<M = Record<string, (...args: any[]) => any>, K extends keyof M = keyof M> {
	id: number;
	call: K;
	args?: M[K] extends (...args: any[]) => any ? Parameters<M[K]> : M[K];
}
export interface MessagePortResponse<M = Record<string, any>, K extends keyof M = keyof M> {
	id: number;
	value?: M[K] extends (...args: any[]) => any ? ReturnType<M[K]> : M[K];
	error?: Error;
}

export interface ParamMgrCallToProcessor extends UnPromisifiedFunctionMap<Pick<WamNode, 'destroy' | 'getCompensationDelay' | 'getParameterInfo' | 'getParameterValues' | 'scheduleEvents' | 'clearEvents'>> {
    connectEvents(wamInstanceId: string, from: number): void;
    disconnectEvents(wamInstanceId: string, from: number): void;
    emitEvents(...events: WamEvent[]): void;
	setParamsMapping(mapping: ParametersMapping): void;
	getBuffer(): { lock: Int32Array, paramsBuffer: Float32Array };
}
export interface ParamMgrCallFromProcessor {
	setBuffer(buffer: { lock: Int32Array, paramsBuffer: Float32Array }): void;
	dispatchWamEvent(event: WamEvent): void;
}
export interface ParamMgrAudioWorkletOptions extends WamNodeOptions {
	paramsConfig: WamParameterInfoMap;
	paramsMapping: ParametersMapping;
	internalParamsMinValues: number[];
	internalParams: string[];
}
export interface ParamMgrOptions extends TypedAudioWorkletNodeOptions<ParamMgrAudioWorkletOptions> {
	internalParamsConfig: InternalParametersDescriptor;
}

/**
 * A `WamParameter` API-compatible `AudioParam` class/interface.
 * All `AudioParam`s generated from the `ParamMgr` will inherit this class
 */
export interface MgrAudioParam extends AudioParam, WamParameter {
    // normalized version of methods
    cancelAndHoldAtTime(cancelTime: number): MgrAudioParam;
    cancelScheduledValues(cancelTime: number): MgrAudioParam;
    exponentialRampToValueAtTime(value: number, endTime: number): MgrAudioParam;
    exponentialRampToNormalizedValueAtTime(value: number, endTime: number): MgrAudioParam;
    linearRampToValueAtTime(value: number, endTime: number): MgrAudioParam;
    linearRampToNormalizedValueAtTime(value: number, endTime: number): MgrAudioParam;
    setTargetAtTime(target: number, startTime: number, timeConstant: number): MgrAudioParam;
    setNormalizedTargetAtTime(target: number, startTime: number, timeConstant: number): MgrAudioParam;
    setValueAtTime(value: number, startTime: number): MgrAudioParam;
    setNormalizedValueAtTime(value: number, startTime: number): MgrAudioParam;
    setValueCurveAtTime(values: number[] | Float32Array | Iterable<number>, startTime: number, duration: number): MgrAudioParam;
    setNormalizedValueCurveAtTime(values: number[] | Float32Array | Iterable<number>, startTime: number, duration: number): MgrAudioParam;
}

export const MgrAudioParam: {
    prototype: MgrAudioParam;
};

// ParamMgrNode

export interface ParamMgrNodeMsgIn extends MessagePortResponse<ParamMgrCallToProcessor>, MessagePortRequest<ParamMgrCallFromProcessor> {}
export interface ParamMgrNodeMsgOut extends MessagePortRequest<ParamMgrCallToProcessor>, MessagePortResponse<ParamMgrCallFromProcessor> {}

/**
 * Parameter Manager is an implementation of `WamNode`,
 * it uses native `WebAudio` `AudioParam` to adapt `WamParameter` API for automations.
 * It can be used to create automatable values that will be changed with two methods:
 *
 * 1. if the automated value is an `AudioParam`:
 *
 *      According to the `WebAudio` [Spec](https://webaudio.github.io/web-audio-api/#computation-of-value),
 * the `computedValue` of the automated `AudioParam` is the sum of its `paramIntrinsicValue` (`value` attribute) and its audio input.
 * The `ParamMgr` uses this property to automate `AudioParam`s.
 * It will create corresponding audio output that is connected to the automated `AudioParam`.
 *
 *      Meanwhile, the `paramIntrinsicValue` will be set to its `minValue`.
 *
 *      Note: as the automated `AudioParam` value is fixed, to get its actual value, please use `getIParamValue()` method.
 * `BiquadFilterNode.getFrequencyResponse()` will not work if its `AudioParam`s are automated in this case.
 *
 * 2. if the automated value is not an `AudioParam`
 *
 *      While setting up the `ParamMgr`, user can provide an `onChange` callback for any furthur opertion
 * along with an `automationRate` in milliseconds as the frequency of calling the callback if the value has been changed.
 *
 *      The rate cannot succeed `k-rate` as the function call on the main thread.
 */
export interface ParamMgrNode<Params extends string = string, InternalParams extends string = Params> extends TypedAudioWorkletNode<ParamMgrNodeMsgIn, ParamMgrNodeMsgOut, Params, WamEventMap>, Omit<WamNode, keyof AudioWorkletNode>, ParamMgrCallFromProcessor {
    readonly module: WebAudioModule;
    /**
     * The state of the initialization.
     */
    readonly initialized: boolean;
    /**
     * An array that contains ordered internal params names.
     * The order is important for the output connections and for the parameters' values buffer
     * @deprecated
     */
    readonly internalParams: InternalParams[];
    /**
     * The plugin's internal parameters description.
     * Used for denormalize normalized exposed parameters values
     */
    readonly internalParamsConfig: InternalParametersDescriptor<InternalParams>;
    /**
     * The lock will be true if the `$paramsBuffer` is changing by the processor.
     * This is a view of a `SharedArrayBuffer`
     * @deprecated
     */
    readonly $lock: Int32Array;
    /**
     * The values of internal parameters,
     * contains one value for each param,
     * will be updated each `AudioWorklet` buffer.
     * This is a view of a `SharedArrayBuffer`
     * @deprecated
     */
    readonly $paramsBuffer: Float32Array;
    /**
     * Previous params value since last event dispatch of any
     * non-AudioParam internal parameters
     * @deprecated
     */
    readonly $prevParamsBuffer: Float32Array;

    /**
     * Event dispatch callbacks reference of the `setTimeout` calls.
     * Used to clear the callbacks while destroying the plugin.
     * @deprecated
     */
    readonly paramsUpdateCheckFnRef: number[];

    /**
     * Event dispatch callback functions bound to specific values for the parameter.
     * @deprecated
     */
    readonly paramsUpdateCheckFn: number[];

    /**
     * waiting for the processor that gives the `paramsBuffer` `SharedArrayBuffer`
     */
    initialize(): Promise<ParamMgrNode>;
    /**
     * convert an WebAudio time stamp to frame index
     */
    convertTimeToFrame(time: number): number;
    /**
     * convert a frame index to WebAudio time stamp
     */
    convertFrameToTime(frame: number): number;
    /**
     * Force to check if an internal param is updated to dispatch immediately value change event if necessary.
     * Note that the event will also be throttled to the automation rate.
     */
    requestDispatchIParamChange(name: InternalParams): void;
    /**
     * get the output index of an internal parameter from its name,
     * null if not exist
     */
    getIParamIndex(name: InternalParams): number | null;
    /**
     * connect an internal parameter audio output to an AudioParam or an AudioNode.
     * Note that if the destination is declared in the `internalParamsConfig`,
     * there is no need to reconnect it.
     */
    connectIParam(name: InternalParams, dest: AudioParam | AudioNode, index?: number): void;
    /**
     * disonnect an internal parameter audio output to an AudioParam or an AudioNode.
     */
    disconnectIParam(name: InternalParams, dest?: AudioParam | AudioNode, index?: number): void;
    /**
     * get the current value of an internal parameter
     */
    getIParamValue(name: InternalParams): number;
    /**
     * get the current value of every internal parameters
     */
    getIParamsValues(): Record<InternalParams, number>;
    /**
     * get the `AudioParam` instance of an exposed parameter
     */
    getParam(name: Params): AudioParam;
    /**
     * get the `AudioParam` instance of every exposed parameters
     */
    getParams(): Record<Params, AudioParam>;
    /**
     * get the current value of an exposed parameter,
     * shorthand for `AudioParam.prototype.value`
     */
    getParamValue(name: Params): number;
    /**
     * get the current value of an exposed parameter,
     * shorthand for `AudioParam.prototype.value = value`
     */
    setParamValue(name: Params, value: number): void;
    /**
     * get the current value of every exposed parameters
     */
    getParamsValues(): Record<Params, number>;
    /**
     * set the current value of every exposed parameters
     */
    setParamsValues(values: Partial<Record<Params, number>>): void;
    /**
     * normalized value version of `getParamValue()`
     */
    getNormalizedParamValue(name: Params): number;
    /**
     * normalized value version of `setParamValue()`
     */
    setNormalizedParamValue(name: Params, value: number): void;
    /**
     * normalized value version of `getParamsValues()`
     */
    getNormalizedParamsValues(): Partial<Record<Params, number>>;
    /**
     * normalized value version of `setParamsValues()`
     */
    setNormalizedParamsValues(values: Record<Params, number>): void;
    // `AudioParam.prototype` methods with there normlized value version
    setParamValueAtTime(name: Params, value: number, startTime: number): AudioParam;
    setNormalizedParamValueAtTime(name: Params, value: number, startTime: number): AudioParam;
    linearRampToParamValueAtTime(name: Params, value: number, endTime: number): AudioParam;
    linearRampToNormalizedParamValueAtTime(name: Params, value: number, endTime: number): AudioParam;
    exponentialRampToParamValueAtTime(name: Params, value: number, endTime: number): AudioParam;
    exponentialRampToNormalizedParamValueAtTime(name: Params, value: number, endTime: number): AudioParam;
    setParamTargetAtTime(name: Params, target: number, startTime: number, timeConstant: number): AudioParam;
    setNormalizedParamTargetAtTime(name: Params, target: number, startTime: number, timeConstant: number): AudioParam;
    setParamValueCurveAtTime(name: Params, values: Iterable<number> | number[] | Float32Array, startTime: number, duration: number): AudioParam;
    setNormalizedParamValueCurveAtTime(name: Params, values: Iterable<number> | number[] | Float32Array, startTime: number, duration: number): AudioParam;
    cancelScheduledParamValues(name: Params, cancelTime: number): AudioParam;
    cancelAndHoldParamAtTime(name: Params, cancelTime: number): AudioParam;
}
export const ParamMgrNode: {
    prototype: ParamMgrNode;
	/**
     * Creates an instance of ParamMgrNode.
     *
     * @param {WebAudioModule} module WebAudioModule
     * @param {ParamMgrOptions} options AudioWorkletNode options
     */
    new <Params extends string = string, InternalParams extends string = string>(
        module: WebAudioModule,
        options: ParamMgrOptions
    ): ParamMgrNode<Params, InternalParams>;
};

export interface ParamMgrProcessor extends WamProcessor {
    handleEvent?: (event: WamEvent) => any;
}

/**
 * Use `create` static method to create a new `ParamMgr` instance
 */
export const ParamMgrFactory: {
	/**
	 * Get a ParamManager as an AudioWorkletNode instance
	 *
	 * The second argument `optionsIn` decides how `ParamMgr` should automate parameters and generate `WamParameter`-compatible `AudioParam`s.
	 *
	 * The option could have three possible properties: `paramsConfig`, `paramsMapping` and `internalParamsConfig`.
	 *
	 * If you do not have to configure one-to-many parameters, please declare `internalParamsConfig` only,
	 * where you can put an `AudioParam` or an object that contains default, min, max values, automation rate with the `onChange` callback.
	 * The factory will generate automatically automatable `AudioParam`s for you.
	 *
	 * Else, you can declare `paramsConfig` with exposed parameters' configs.
	 * The omitted properties will be filled according the internal parameter with the same name.
	 * In the `paramsMapping`, you can declare how one-to-many parameters maps values to the internal parameters.
     * @param {WebAudioModule} module the module instance
	 * @param {ParametersMappingConfiguratorOptions} [optionsIn = {}] config of the parameters
	 */
	create<Params extends string = string, InternalParams extends string = string>(module: WebAudioModule, optionsIn?: ParametersMappingConfiguratorOptions<Params, InternalParams>): Promise<ParamMgrNode<Params, InternalParams>>;
};
