/* eslint-disable max-len */
// eslint-disable-next-line object-curly-newline
import { WamNodeOptions, WamParameterInfoMap, WamNode, WamParameterConfiguration, WamEvent, WamProcessor } from '../api/types';

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

export interface ParamMgrCallToProcessor extends UnPromisifiedFunctionMap<Pick<WamNode, 'destroy' | 'getCompensationDelay' | 'getParameterInfo' | 'getParameterValues' | 'scheduleEvent' | 'clearEvents'>> {
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

// AudioWorkletProcessor

export interface TypedAudioWorkletNodeOptions<T = any> extends AudioWorkletNodeOptions {
	processorOptions?: T;
}
export interface TypedMessageEvent<T = any> extends MessageEvent {
	data: T;
}
export interface TypedMessagePortEventMap<T = any> extends MessagePortEventMap {
	'message': TypedMessageEvent<T>;
}
export interface TypedMessagePort<In = any, Out = any> extends MessagePort {
	onmessage: ((this: TypedMessagePort<In, Out>, ev: TypedMessageEvent<In>) => any) | null;
	onmessageerror: ((this: TypedMessagePort<In, Out>, ev: TypedMessageEvent<In>) => any) | null;
	postMessage(message: Out, transfer: Transferable[]): void;
	postMessage(message: Out, options?: PostMessageOptions): void;
	addEventListener<K extends keyof TypedMessagePortEventMap<In>>(type: K, listener: (this: MessagePort, ev: TypedMessagePortEventMap<In>[K]) => any, options?: boolean | AddEventListenerOptions): void;
	addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
	removeEventListener<K extends keyof TypedMessagePortEventMap<In>>(type: K, listener: (this: MessagePort, ev: TypedMessagePortEventMap<In>[K]) => any, options?: boolean | EventListenerOptions): void;
	removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}
export interface TypedAudioParamDescriptor<Par extends string = string> extends AudioParamDescriptor {
	automationRate?: AutomationRate;
	defaultValue?: number;
	maxValue?: number;
	minValue?: number;
	name: Par;
}
export interface TypedAudioWorkletProcessor<MsgIn = any, MsgOut = any, Par extends string = string> {
	port: TypedMessagePort<MsgIn, MsgOut>;
	process(inputs: Float32Array[][], outputs: Float32Array[][], parameters: Record<Par, Float32Array>): boolean;
}
export const TypedAudioWorkletProcessor: {
	parameterDescriptors: TypedAudioParamDescriptor[];
	new <MsgIn = any, MsgOut = any, Par extends string = string, Opt = any>(options: TypedAudioWorkletNodeOptions<Opt>): TypedAudioWorkletProcessor<MsgIn, MsgOut, Par>;
};

export interface AudioWorkletGlobalScope {
	registerProcessor: (name: string, constructor: new (options: any) => TypedAudioWorkletProcessor) => void;
	currentFrame: number;
	currentTime: number;
	sampleRate: number;
	AudioWorkletProcessor: typeof TypedAudioWorkletProcessor;
	WamProcessors: Record<string, WamProcessor>;
}

export type TypedAudioParamMap<P extends string = string> = ReadonlyMap<P, AudioParam>;

export interface TypedAudioWorkletNode<MsgIn = any, MsgOut = any, Par extends string = string> extends AudioWorkletNode {
	readonly port: TypedMessagePort<MsgIn, MsgOut>;
	readonly parameters: TypedAudioParamMap<Par>;
	destroyed: boolean;
	destroy(): void;
}
export const TypedAudioWorkletNode: {
	prototype: TypedAudioWorkletNode;
	new <MsgIn = any, MsgOut = any, Par extends string = string, Opt = any>(context: BaseAudioContext, name: string, options?: TypedAudioWorkletNodeOptions<Opt>): TypedAudioWorkletNode<MsgIn, MsgOut, Par>;
};
