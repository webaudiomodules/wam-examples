/// <reference path="types.d.ts" />
import { EventEmitter } from "events";
import ParamMgrNode from "./ParamMgr/ParamMgrNode";

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
/**
 * `WebAudioPlugin` main interface
 * Plugin should extend this interface
 * and must redefine the async method `createAudioNode()`
 *
 * @interface WebAudioPlugin
 * @extends {(TypedEventEmitter<Events & DefaultEventMap<Params, Patches, Banks>>)}
 * @template Node Custom AudioNode type
 * @template Params Param names, e.g. `"gain" | "feedback" | "ratio"`
 * @template InternalParams Param names, e.g. `"gain" | "feedback" | "ratio"`
 * @template Patches Patch names, e.g. `"patch1" | "patch2"`
 * @template Banks Bank names, e.g. `"bank1" | "bank2"`
 * @template State State type, e.g. `{ id: string, color: string }`
 * @template Events Event map, e.g. `{ midiMessage: { data: Uint8Array } }`
 */
interface WebAudioPlugin<
        Node extends AudioNode = AudioNode,
        Params extends string = string,
        InternalParams extends string = string,
        Patches extends string = string,
        Banks extends string = string,
        State extends Partial<DefaultState<Params, Patches, Banks>> & Record<string, any> = DefaultState<Params, Patches, Banks>,
        Events extends Partial<DefaultEventMap<Params, Patches, Banks>> & Record<string, any> = DefaultEventMap<Params, Patches, Banks>
> extends TypedEventEmitter<Events & DefaultEventMap<Params | "enabled", Patches, Banks>> {
    /**
     * The descriptor will expose the values from `descriptor.json`
     *
     * @type {PluginDescriptor<Params, Patches, Banks>}
     * @memberof WebAudioPlugin
     */
    readonly descriptor: PluginDescriptor<Params, Patches, Banks>;
    readonly name: string;
    readonly vendor: string;
    readonly paramsConfig: ParametersDescriptor<Params | "enabled">;
    readonly internalParamsConfig: InternalParametersDescriptor<InternalParams>;
    readonly params: Record<Params | "enabled", number>;
    readonly patches: PatchesDescriptor<Patches, Params | "enabled">;
    readonly patch: Patches;
    readonly banks: BanksDescriptor<Banks, Patches>;
    readonly bank: Banks;
    readonly state: State;
    audioContext: BaseAudioContext;
    audioNode: Node;
    paramMapping: ParametersMapping<Params | "enabled", InternalParams>;
    paramMgr: ParamMgrNode<Params | "enabled", InternalParams>;
    initialized: boolean;
    initialize(options?: Partial<State>): Promise<this>;
    disable(): void;
    enable(): void;
    onBankChange(cb: (e: Banks) => any): this;
    onBankChange(cb: (e: boolean) => any): this;
    onParamChange(paramName: Params | "enabled", cb: (e: number) => any): this;
    onParamsChange(cb: (e: Record<Params | "enabled", number>) => any): this;
    onPatchChange(cb: (e: Patches) => any): this;
    getState(): State;
    setState(state: Partial<State>): this;
    getParams(): Record<Params | "enabled", number>;
    setParams(params: Partial<Record<Params | "enabled", number>>): this;
    getParam(paramName: Params | "enabled"): number;
    setParam(paramName: Params | "enabled", paramValue: number): this;
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
    createInstance(audioContext: AudioContext, options?: Partail<State>): Promise<WebAudioPlugin>;
    new <
        Node extends AudioNode = AudioNode,
        Params extends string = string,
        InternalParams extends string = string,
        Patches extends string = string,
        Banks extends string = string,
        State extends Partial<DefaultState<Params, Patches, Banks>> & Record<string, any> = DefaultState<Params, Patches, Banks>,
        Events extends Partial<DefaultEventMap<Params, Patches, Banks>> & Record<string, any> = DefaultEventMap<Params, Patches, Banks>
    >(audioContext: AudioContext): WebAudioPlugin<Node, Params, InternalParams, Patches, Banks, State, Events>;
};

export default WebAudioPlugin;
