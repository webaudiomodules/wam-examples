// TODO refactor to use interfaces instead of classes

export class WebAudioModule {
    static isWebAudioPlugin: boolean;
    static createInstance(audioContext: AudioContext, pluginOptions?: any): Promise<WebAudioModule>;

    static descriptor: WamDescriptor;

    static guiModuleUrl: string;

    constructor(audioContext: AudioContext);
    audioContext: AudioContext;
    instanceId: string;
    private _audioNode: AudioNode;
    initialized: boolean;

    get descriptor(): WamDescriptor;
    get name(): string;
    get vendor(): string;
    get processorId(): string;
    set audioNode(arg: AudioNode);
    get audioNode(): AudioNode;
    /**
     * This async method must be redefined to get audionode that
     * will connected to the host.
     * It can be any object that extends AudioNode
     */
    createAudioNode(options?: {}): Promise<AudioNode>;
    /**
     * Calling initialize([state]) will initialize the plugin with an initial state.
     * While initializing, the audionode is created by calling createAudionode()
     * Plugins that redefine initialize() must call super.initialize();
     */
    initialize(options?: {}): Promise<WebAudioModule>;
    loadGui(): Promise<any>;
    createGui(options?: {}): Promise<any>;
}

export type WamDescriptor = {
    name: string;
    vendor: string;
    entry?: string;
    gui: string;
    url?: string;
}

// PLUGIN

export class WamNode extends AudioWorkletNode {
    constructor(module: WebAudioModule, options: AudioWorkletNodeOptions);

    readonly processorId: string;
    readonly instanceId: string;
    readonly module: WebAudioModule;

    private _eventCallbacks: { [subscriberId: string]: WamEventCallback };
    private _destroyed: boolean;

    getParameterInfo(parameterIds?: string | string[]): Promise<WamParameterInfoMap>;
    setParameterValues(parameterValues: WamParameterValueMap): Promise<void>;
    getParameterValues(normalized: boolean, parameterIds?: string | string[]): Promise<WamParameterValueMap>;
    getState(): Promise<any>;
    setState(state: any): Promise<void>;
    getCompensationDelay(): number;
    addEventCallback(subscriberId: string, callback: WamEventCallback): boolean;
    removeEventCallback(subscriberId: string): boolean;
    onEvent(event: WamEvent): void;
    destroy(): void;
}

export class WamProcessor extends AudioWorkletProcessor {
    static generateWamParameterInfo(): WamParameterInfoMap;

    constructor(options: AudioWorkletNodeOptions);

    readonly processorId: string;
    readonly instanceId: string;
    private readonly _parameterInfo: WamParameterInfoMap;
    private _parameterState: WamParameterMap;
    private _compensationDelay: number;
    private _eventCallbacks: { [subscriberId: string]: WamEventCallback };
    private _destroyed: boolean;

    getCompensationDelay(): number;
    onEvent(event: WamEvent): void;
}

// PARAMETERS

export type WamParameterType = "float" | "int" | "boolean" | "choice";

export type WamParameterConfiguration = {
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

export class WamParameterInfo {
    constructor(id: string, config?: WamParameterConfiguration);

    readonly id: string;
    readonly label: string;
    readonly type: WamParameterType;
    readonly value: number;
    readonly defaultValue: number;
    readonly minValue: number;
    readonly maxValue: number;
    readonly discreteStep: number;
    readonly exponent: number;
    readonly choices: string[];
    readonly units: string;

    normalize(value: number): number;
    denormalize(value: number): number;
    valueString(value: number): string;
}

export type WamParameterInfoMap = { [id: string]: WamParameterInfo }


export interface WamParameter {
    readonly info: WamParameterInfo;

    value: number;
    normalizedValue: number;
}

export type WamParameterMap = { [id: string]: WamParameter }

export interface WamParameterValue {
    id: string
    value: number;
    normalized: boolean;
}

export type WamParameterValueMap = { [id: string]: WamParameterValue }

// EVENTS

export type WamEventType = "midi" | "automation"; // TODO 'sysex', 'mpe', 'osc'

interface WamEventBase {
    type: WamEventType;
    time?: number;
}

export type WamEvent = WamAutomationEvent | WamMidiEvent;

export interface WamAutomationEvent extends WamEventBase {
    type: 'automation';
    parameterId: string;
    parameterValue: number;
    normalized: boolean;
}

export interface WamMidiEvent extends WamEventBase {
    type: 'midi';
    status: number;
    data1: number;
    data2: number;
}

export type WamEventCallback = (event: WamEvent) => any;
