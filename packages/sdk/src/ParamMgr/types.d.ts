import { WamNodeOptions, WamAudioWorkletCommon, WamEvent, WamParameterInfoMap } from "../api/WamTypes";

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
    static register(processorId: string, processor: (id: string, ...injections: any[]) => void, audioWorklet: AudioWorklet, ...injection: any[]): Promise<void>
}

export interface WamNodeFunctionMap extends WamAudioWorkletCommon {
    dispatchEvent(e: WamEvent): void;
}
export type PromisifiedFunctionMap<T> = {
    [K in keyof T]: T[K] extends (...args: any[]) => any ? (...args: Parameters<T[K]>) => PromiseLike<ReturnType<T[K]>> | ReturnType<T[K]> : T[K];
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

export interface ParamMgrCallToProcessor extends Pick<WamNodeFunctionMap, "destroy"> {
    setParamsMapping(mapping: ParametersMapping): void;
    getBuffer(): { lock: Int32Array, paramsBuffer: Float32Array };
}
export interface ParamMgrCallFromProcessor extends Omit<WamNodeFunctionMap, "getParameterInfo" | "getParameterValues"> {
    setBuffer(): { lock: Int32Array, paramsBuffer: Float32Array };
}
export interface ParamMgrAudioWorkletOptions extends WamNodeOptions {
	paramsConfig: WamParameterInfoMap;
	paramsMapping: ParametersMapping;
	internalParamsMinValues: number[];
	internalParams: string[];
}

// AudioWorkletProcessor

export interface TypedAudioWorkletNodeOptions<T extends any = any> extends AudioWorkletNodeOptions {
    processorOptions?: T;
}
export interface TypedMessageEvent<T extends any = any> extends MessageEvent {
    data: T;
}
export interface TypedMessagePortEventMap<T extends any = any> extends MessagePortEventMap {
    "message": TypedMessageEvent<T>;
}
export interface TypedMessagePort<In extends any = any, Out extends any = any> extends MessagePort {
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
export interface TypedAudioWorkletProcessor<MsgIn extends any = any, MsgOut extends any = any, Par extends string = string> {
    port: TypedMessagePort<MsgIn, MsgOut>;
    process(inputs: Float32Array[][], outputs: Float32Array[][], parameters: Record<Par, Float32Array>): boolean;
}
export const TypedAudioWorkletProcessor: {
    parameterDescriptors: TypedAudioParamDescriptor[];
    new <MsgIn extends any = any, MsgOut extends any = any, Par extends string = string, Opt extends any = any>(options: TypedAudioWorkletNodeOptions<Opt>): TypedAudioWorkletProcessor<MsgIn, MsgOut, Par>;
};

export interface AudioWorkletGlobalScope {
    registerProcessor: (name: string, constructor: new (options: any) => TypedAudioWorkletProcessor) => void;
    currentFrame: number;
    currentTime: number;
    sampleRate: number;
    AudioWorkletProcessor: typeof TypedAudioWorkletProcessor;
}

export type TypedAudioParamMap<P extends string = string> = ReadonlyMap<P, AudioParam>;

export interface TypedAudioWorkletNode<MsgIn extends any = any, MsgOut extends any = any, Par extends string = string> extends AudioWorkletNode {
    readonly port: TypedMessagePort<MsgIn, MsgOut>;
    readonly parameters: TypedAudioParamMap<Par>;
    destroyed: boolean;
    destroy(): void;
}
export const TypedAudioWorkletNode: {
    prototype: TypedAudioWorkletNode;
    new <MsgIn extends any = any, MsgOut extends any = any, Par extends string = string, Opt extends any = any>(context: BaseAudioContext, name: string, options?: TypedAudioWorkletNodeOptions<Opt>): TypedAudioWorkletNode<MsgIn, MsgOut, Par>;
}
