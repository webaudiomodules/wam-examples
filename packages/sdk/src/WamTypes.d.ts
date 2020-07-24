export interface WebAudioModule {
    /** The `AudioContext` where the plugin's node lives */
    audioContext: BaseAudioContext;
    /** The `AudioNode` that handles audio in the plugin where the host can connect to/from */
    audioNode: WamNode;
    /** This will return true after calling `initialize()`. */
    initialized: boolean;
    /** The identifier of the current WAM, composed of vender + name */
    moduleId: string;
    /** The unique identifier of the current WAM instance. */
    instanceId: string;
    /** The values from `descriptor.json` */
    readonly descriptor: WamDescriptor;
    /** The WAM's name */
    readonly name: string;
    /** The WAM Vendor's name */
    readonly vendor: string;

    /**
     * This async method must be redefined to get `AudioNode` that
     * will connected to the host.
     * It can be any object that extends `AudioNode` and implements `WamNode`
     */
    createAudioNode(): Promise<WamNode>;
    /**
     * The host will call this method to initialize the WAM with an initial state.
     *
     * In this method, WAM devs should call `createAudioNode()`
     * and store its return `AudioNode` to `this.audioNode`,
     * then set `initialized` to `true` to ensure that
     * the `audioNode` property is available after initialized.
     *
     * These two behaviors are implemented by default in the SDK.
     *
     * The WAM devs can also fetch and preload the GUI Element in while initializing.
     */
    initialize(state?: any): Promise<WebAudioModule>;
    /** Redefine this method to get the WAM's GUI as an HTML `Element`. */
    createGui(): Promise<Element>;
    /**
     * The host will call this method when destroy the WAM.
     * Make sure this calls every internal destroys.
     */
    destroy(): void;
    // OGC Do we need destroy method here as well?
}

export const WebAudioModule: {
    prototype: WebAudioModule;
    isWebAudioPlugin: boolean;
    createInstance(audioContext: BaseAudioContext, initialState?: any): Promise<WebAudioModule>;
    guiModuleUrl: string;
    new (audioContext: BaseAudioContext): WebAudioModule;
};

export interface WamDescriptor {
    name: string;
    vendor: string;
    entry?: string;
    gui: string;
    url?: string;
}

// PLUGIN

export type WamListenerType = 'wam-event' | 'wam-automation' | 'wam-midi' | 'wam-sysex' | 'wam-mpe' | 'wam-osc';

export interface WamNode extends AudioNode {
    readonly moduleId: string;
    readonly instanceId: string;
    readonly module: WebAudioModule;
    /** Get parameter info for the specified parameter ids, or omit argument to get info for all parameters. */
    getParameterInfo(parameterIds?: string | string[]): Promise<WamParameterInfoMap>;
    /** Get parameter values for the specified parameter ids, or omit argument to get values for all parameters. */
    getParameterValues(normalized: boolean, parameterIds?: string | string[]): Promise<WamParameterDataMap>;
    /** Set parameter values for the specified parameter ids. */
    setParameterValues(parameterValues: WamParameterDataMap): Promise<void>;
    /** Returns an object (such as JSON or a serialized blob) that can be used to restore the WAM's state. */
    getState(): Promise<any>;
    /** Use an object (such as JSON or a serialized blob) to restore the WAM's state. */
    setState(state: any): Promise<void>;
    /** Compensation delay hint in seconds. */
    getCompensationDelay(): Promise<number>;
    /** Register a callback function so it will be called when matching events are processed. */
    addEventListener(type: WamListenerType, callback: EventListenerOrEventListenerObject | null, options?: AddEventListenerOptions | boolean);
    /** Deregister a callback function so it will no longer be called when matching events are processed. */
    removeEventListener(type: WamListenerType, callback: EventListenerOrEventListenerObject | null, options?: EventListenerOptions | boolean);
    /** From the main thread, schedule a WamEvent. Listeners will be triggered when the event is processed. */
    scheduleEvent(event: WamEvent): void;
    /** From the main thread, clear all pending WamEvents. */
    clearEvents(): Promise<void>;
    /** Stop processing and remove the node from the graph. */
    destroy(): void;
}

export const WamNode: {
    prototype: WamNode;
    generateWamParameters(): WamParameterInfoMap;
    new (module: WebAudioModule, options: AudioWorkletNodeOptions);
};

export interface WamProcessor extends AudioWorkletProcessor {
    readonly moduleId: string;
    readonly instanceId: string;
    /** Compensation delay hint in seconds. */
    getCompensationDelay(): number;
    /** From the audio thread, schedule a WamEvent. Listeners will be triggered when the event is processed. */
    scheduleEvent(event: WamEvent): void;
    /** From the audio thread, clear all pending WamEvents. */
    clearEvents(): void;
    /** Stop processing and remove the node from the graph. */
    destroy(): void;
}

export const WamProcessor: {
    prototype: WamProcessor;
    new (options: AudioWorkletNodeOptions): WamProcessor;
};

// PARAMETERS

export type WamParameterType = "float" | "int" | "boolean" | "choice";

export interface WamParameterConfiguration {
    label?: string;
    type?: WamParameterType;
    defaultValue?: number;
    minValue?: number;
    maxValue?: number;
    discreteStep?: number;
    exponent?: number;
    choices?: string[];
    units?: string;
}

export interface WamParameterInfo {
    /** The parameter's unique identifier. */
    readonly id: string;
    /** The parameter's human-readable name. */
    readonly label: string;
    /** The parameter's data type. */
    readonly type: WamParameterType;
    /** The parameter's default value. Must be within range `[minValue, maxValue]`. */
    readonly defaultValue: number;
    /** The minimum valid value of the parameter's range. */
    readonly minValue: number;
    /** The maximum valid value of the parameter's range. */
    readonly maxValue: number;
    /** The distance between adjacent valid integer values, if applicable. */
    readonly discreteStep: number;
    /** The nonlinear (exponential) skew of the parameter's range, if applicable. */
    readonly exponent: number;
    /** A list of human-readable choices corresponding to each valid value in the parameter's range, if applicable. */
    readonly choices: string[];
    /** A human-readable string representing the units of the parameter's range, if applicable. */
    readonly units: string;
    /** Convert a value from the parameter's denormalized range `[minValue, maxValue]` to normalized range `[0, 1]`. */
    normalize(value: number): number;
    /** Convert a value from normalized range `[0, 1]` to the parameter's denormalized range `[minValue, maxValue]`. */
    denormalize(valueNorm: number): number;
    /** Get a human-readable string representing the given value, including units if applicable. */
    valueString(value: number): string;
}

export const WamParameterInfo: {
    prototype: WamParameterInfo;
    new (id: string, config?: WamParameterConfiguration): WamParameterInfo;
}

export type WamParameterInfoMap = Record<string, WamParameterInfo>;

export interface WamParameter {
    readonly info: WamParameterInfo;
    value: number;
    normalizedValue: number;
}

export type WamParameterMap = Record<string, WamParameter>;

export const WamParameterNoSab: {
    prototype: WamParameter;
    new (info: WamParameterInfo): WamParameter;
}

export const WamParameterSab: {
    prototype: WamParameter;
    new (info: WamParameterInfo, array: Float32Array, index: number): WamParameter;
}

export interface WamParameterData {
    id: string
    value: number;
    normalized: boolean;
}

export type WamParameterDataMap = Record<string, WamParameterData>;

// MIDI

export interface WamMidiData {
    bytes: [number, number, number]
}

export interface WamSysexData {
    bytes: number[];
}

// EVENTS

export type WamEventType = keyof WamEventTypeMap;

export interface WamEventTypeMap {
    "automation": WamAutomationEvent;
    "midi": WamMidiEvent;
    "sysex": WamSysexEvent;
    "mpe": WamMpeEvent;
    "osc": WamOscEvent;
}

interface WamEventBase<T, D> {
    type: T;
    data: D;
    time?: number;
}

export type WamEvent = WamAutomationEvent | WamMidiEvent | WamSysexEvent | WamMpeEvent | WamOscEvent;
export type WamAutomationEvent = WamEventBase<'automation', WamParameterData>;
export type WamMidiEvent = WamEventBase<'midi', WamMidiData>;
export type WamSysexEvent = WamEventBase<'sysex', WamSysexData>;
export type WamMpeEvent = WamEventBase<'mpe', WamMidiData>;
export type WamOscEvent = WamEventBase<'osc', string>;

// AudioWorkletProcessor

export interface TypedAudioWorkletNodeOptions<T extends any = any> extends AudioWorkletNodeOptions {
    processorOptions?: T;
}
export interface AudioWorkletMessageEvent<T extends any = any> extends MessageEvent {
    data: T;
}
export interface AudioWorkletMessagePort<I extends Record<string, any> = Record<string, any>, O extends Record<string, any> = Record<string, any>> extends MessagePort {
    onmessage: ((this: AudioWorkletMessagePort<I, O>, ev: AudioWorkletMessageEvent<I>) => any) | null;
    onmessageerror: ((this: AudioWorkletMessagePort<I, O>, ev: AudioWorkletMessageEvent<I>) => any) | null;
    postMessage(message: O, transfer: Transferable[]): void;
    postMessage(message: O, options?: PostMessageOptions): void;
}
export interface TypedAudioParamDescriptor<P extends string = string> extends AudioParamDescriptor {
    automationRate?: AutomationRate;
    defaultValue?: number;
    maxValue?: number;
    minValue?: number;
    name: P;
}
export interface AudioWorkletProcessor<I extends Record<string, any> = Record<string, any>, O extends Record<string, any> = Record<string, any>, P extends string = string> {
    port: AudioWorkletMessagePort<I, O>;
    process(inputs: Float32Array[][], outputs: Float32Array[][], parameters: Record<P, Float32Array>): boolean;
}
export const AudioWorkletProcessor: {
    parameterDescriptors(): TypedAudioParamDescriptor[];
    new <I extends Record<string, any> = Record<string, any>, O extends Record<string, any> = Record<string, any>, P extends string = string, Opt extends any = any>(options: TypedAudioWorkletNodeOptions<Opt>): AudioWorkletProcessor<I, O, P>;
};
