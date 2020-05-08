import { EventEmitter } from "events";

export interface TypedEventEmitter<M extends Record<string | symbol, any[]> = {}> extends EventEmitter {
    addListener<K extends keyof M>(type: K, listener: (...e: M[K]) => any): this;
    on<K extends keyof M>(type: K, listener: (...e: M[K]) => any): this;
    once<K extends keyof M>(type: K, listener: (...e: M[K]) => any): this;
    removeListener<K extends keyof M>(type: K, listener: (...e: M[K]) => any): this;
    off<K extends keyof M>(type: K, listener: (...e: M[K]) => any): this;
    removeAllListeners<K extends keyof M>(type?: K): this;
    listeners<K extends keyof M>(type: K): Function[];
    rawListeners<K extends keyof M>(type: K): Function[];
    emit<K extends keyof M>(type: K, ...e: M[K]): boolean;
    listenerCount<K extends keyof M>(type: K): number;
    prependListener<K extends keyof M>(type: K, listener: (...e: M[K]) => any): this;
    prependOnceListener<K extends keyof M>(type: K, listener: (...e: M[K]) => any): this;
    eventNames<K extends keyof M>(): Array<K>;
}
export interface CreateOptions<S extends Record<string, any> = {}> {
    initialState?: Partial<S>;
}
export interface ParameterDescriptor {
    defaultValue: number;
    minValue: number;
    maxValue: number;
}
export type ParametersDescriptor<Params extends string = never> = Record<Params, ParameterDescriptor>;
export interface PatchDescriptor<Params extends string = never> {
    label: string;
    params: Partial<Record<Params, number>>;
}
export type PatchesDescriptor<Patches extends string = never, Params extends string = never> = Record<Patches, PatchDescriptor<Params>>;
export interface BankDescriptor<Patches extends string = never> {
    label: string;
    patches: Patches[];
}
export type BanksDescriptor<Banks extends string = never, Patches extends string = never> = Record<Banks, BankDescriptor<Patches>>;
export interface PluginDescriptor<Params extends string = never, Patches extends string = never, Banks extends string = never> {
    name: string;
    author: string;
    vendor: string;
    version: string;
    entry: string;
    gui: string | "none";
    url: string;
    params?: ParametersDescriptor<Params>;
    patches?: PatchesDescriptor<Patches, Params>;
    banks?: BanksDescriptor<Banks, Patches>;
    [key: string]: any;
}
export interface DefaultState<Params extends string = never, Patches extends string = never, Banks extends string = never> {
    enabled: boolean;
    params: Partial<Record<Params, number>>;
    patch: Patches;
    bank: Banks;
}
export interface DefaultEventMap<
        Params extends string = never,
        Patches extends string = never,
        Banks extends string = never,
> {
    "change:enabled": [boolean, boolean];
    "change:params": [Partial<Record<Params, number>>, Partial<Record<Params, number>>, Partial<Record<Params, number>>];
    "change:patch": [Patches, Patches];
    "change:bank": [Banks, Banks];
    "destroy": [];
    string: [number, number];
}
/**
 * `WebAudioPlugin` main interface
 *
 * @interface WebAudioPlugin
 * @extends {TypedEventEmitter<Events>}
 * @template Node Custom AudioNode type
 * @template Params Param names, e.g. `"gain" | "feedback" | "ratio"`
 * @template Patches Patch names, e.g. `"patch1" | "patch2"`
 * @template Banks Bank names, e.g. `"bank1" | "bank2"`
 * @template State State type, e.g. `{ id: string, color: string }`
 * @template Events Event map, e.g. `{ midiMessage: { data: Uint8Array } }`
 */
interface WebAudioPlugin<
        Node extends AudioNode = AudioNode,
        Params extends string = never,
        Patches extends string = never,
        Banks extends string = never,
        State extends Partial<DefaultState<Params, Patches, Banks>> & Record<string, any> = DefaultState<Params, Patches, Banks>,
        Events extends Partial<DefaultEventMap<Params, Patches, Banks>> & Record<string, any> = DefaultEventMap<Params, Patches, Banks>
> extends TypedEventEmitter<Events & DefaultEventMap<Params, Patches, Banks>> {
    readonly descriptor: PluginDescriptor<Params, Patches, Banks>;
    readonly name: string;
    readonly paramsConfig: ParametersDescriptor<Params>;
    readonly params: Record<Params, number>;
    readonly patches: PatchesDescriptor<Patches, Params>;
    readonly patch: Patches;
    readonly banks: BanksDescriptor<Banks, Patches>;
    readonly bank: Banks;
    readonly state: State;
    audioContext: BaseAudioContext;
    audioNode: Node;
    initialized: boolean;
    initialize(options?: CreateOptions): Promise<this>;
    disable(): void;
    enable(): void;
    onBankChange(cb: (e: Banks) => any): this;
    onBankChange(cb: (e: boolean) => any): this;
    onParamChange(paramName: Params, cb: (e: number) => any): this;
    onParamsChange(cb: (e: Record<Params, number>) => any): this;
    onPatchChange(cb: (e: Patches) => any): this;
    getState(): State;
    setState(state: Partial<State>): this;
    getParams(): Record<Params, number>;
    setParams(params: Partial<Record<Params, number>>): this;
    getParam(paramName: Params): number;
    setParam(paramName: Params, paramValue: number): this;
    getPatch(): Patches;
    setPatch(patch: Patches): this;
    getBank(): Banks;
    setBank(bank: Banks): this;
    createAudioNode(options?: any): Promise<Node>;
    createGui(options?: any): Promise<Element>;
}
declare const WebAudioPlugin: {
    isWebAudioPlugin: true;
    prototype: WebAudioPlugin;
    descriptor: PluginDescriptor;
    guiModuleUrl: string;
    createInstance(audioContext: AudioContext, options?: CreateOptions): Promise<WebAudioPlugin>;
    new <
        Node extends AudioNode = AudioNode,
        Params extends string = never,
        Patches extends string = never,
        Banks extends string = never,
        State extends Partial<DefaultState<Params, Patches, Banks>> & Record<string, any> = DefaultState<Params, Patches, Banks>,
        Events extends Partial<DefaultEventMap<Params, Patches, Banks>> & Record<string, any> = DefaultEventMap<Params, Patches, Banks>
    >(audioContext: AudioContext): WebAudioPlugin<Node, Params, Patches, Banks, State, Events>;
};

export default WebAudioPlugin;
