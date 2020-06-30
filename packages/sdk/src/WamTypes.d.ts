// LOADER

export type WamDescriptor = {
    name: string;
    vendor: string;
    entry?: string;
    gui: string;
    url?: string;
}

export class WamLoader {
    static isWebAudioPlugin: boolean;
    static createInstance(audioContext: AudioContext, pluginOptions?: any): Promise<WamLoader>;

    static descriptor: WamDescriptor;

    static guiModuleUrl: string;

    constructor(audioContext: AudioContext);
    audioContext: AudioContext;
    instanceId: string;
    _audioNode: AudioNode;
    initialized: boolean;

    get descriptor(): WamDescriptor;
    get name(): string;
    get vendor(): string;
    get pluginId(): string;
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
    initialize(options?: {}): Promise<WamLoader>;
    loadGui(): Promise<any>;
    createGui(options?: {}): Promise<any>;
}

// PLUGIN

export class WamNode extends AudioWorkletNode {
    static generateWamParameters(): WamParameterSet;

    constructor(audioContext: AudioContext, processorId: string, instanceId: string, loader: WamLoader, options: AudioWorkletNodeOptions);
    
    processorId: string;
    instanceId: string;
    loader: WamLoader;
    _params: WamParameterSet;
    _compensationDelay: number;
    _eventCallbacks: { [subscriberId: string]: WamEventCallback };
    _destroyed: boolean;

    getState(): any;
    setState(state: any): void;
    getCompensationDelay(): number;
    addEventCallback(subscriberId: string, callback: WamEventCallback): boolean;
    removeEventCallback(subscriberId: string): boolean;
    onEvent(event: WamEvent): void;
    onMessage(message: MessageEvent): void;
    destroy(): void;
}

export class WamProcessor {
    constructor(options: AudioWorkletNodeOptions);

    processorId: string;
    instanceId: string;
    _params: WamParameterSet;
    _compensationDelay: number;
    _eventCallbacks: { [subscriberId: string]: WamEventCallback };
    _destroyed: boolean;
    
    getCompensationDelay(): number;
    onEvent(event: WamEvent): void;
    onMessage(message: MessageEvent): void;
    process(inputs: Float32Array[][], outputs: Float32Array[][], 
        parameters: { [x: string]: Float32Array }): boolean;
    destroy(): void;
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

export class WamParameter {
    constructor(id: string, config?: WamParameterConfiguration);
    _id: string;
    _label: string;
    _type: WamParameterType;
    _value: number;
    _defaultValue: number;
    _minValue: number;
    _maxValue: number;
    _discreteStep: number;
    _exponent: number;
    _choices: string[];
    _units: string;

    set value(arg: number);
    get value(): number;
    get id(): string;
    get label(): string;
    get type(): WamParameterType;
    get defaultValue(): number;
    get minValue(): number;
    get maxValue(): number;
    get discreteStep(): number;
    get exponent(): number;
    get choices(): string[];
    get units(): string;
    set normalizedValue(arg: number);
    get normalizedValue(): number;
    normalize(value: number): number;
    denormalize(value: number): number;
    valueString(value: number): string;
}

export type WamParameterSet = { [id: string]: WamParameter }

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
}

export interface WamMidiEvent extends WamEventBase {
    type: 'midi';
    status: number;
    data1: number;
    data2: number;
}

export type WamEventCallback = (event: WamEvent) => any;
