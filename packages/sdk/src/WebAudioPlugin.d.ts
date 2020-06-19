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
 * @template Params Param names, e.g. `"enabled" | "gain" | "feedback" | "ratio"`
 * @template InternalParams Internal param names, e.g. `"gainLeft" | "gainRight"`
 * @template Patches Patch names, e.g. `"patch1" | "patch2"`
 * @template Banks Bank names, e.g. `"bank1" | "bank2"`
 * @template State Additional state type, e.g. `{ id: string, color: string }`
 * @template Events Additional event map, e.g. `{ midiMessage: { data: Uint8Array } }`
 */
interface WebAudioPlugin<
        Node extends AudioNode = AudioNode,
        Params extends string = string,
        InternalParams extends string = Params,
        Patches extends string = string,
        Banks extends string = string,
        State extends Partial<DefaultState<Params, Patches, Banks>> & Record<string, any> = DefaultState<Params, Patches, Banks>,
        Events extends Partial<DefaultEventMap<Params, Patches, Banks>> & Record<string, any> = DefaultEventMap<Params, Patches, Banks>
> extends TypedEventEmitter<Events & DefaultEventMap<Params, Patches, Banks>> {
    /**
     * The descriptor will expose the values from `descriptor.json`
     *
     * @type {PluginDescriptor<Params, Patches, Banks>}
     * @memberof WebAudioPlugin
     */
    readonly descriptor: PluginDescriptor<Params, Patches, Banks>;
    /**
     * the plugin's name
     *
     * @type {string}
     * @memberof WebAudioPlugin
     */
    readonly name: string;
    /**
     * the plugin vendor's name
     *
     * @type {string}
     * @memberof WebAudioPlugin
     */
    readonly vendor: string;
    /**
     * getter of the exposed-params' values
     *
     * @type {Record<Params, number>}
     * @memberof WebAudioPlugin
     */
    readonly params: Record<Params, number>;
    /**
     * retrived from the descriptor
     *
     * @type {PatchesDescriptor<Patches, Params>}
     * @memberof WebAudioPlugin
     */
    readonly patches: PatchesDescriptor<Patches, Params>;
    /**
     * current patch name
     *
     * @type {Patches}
     * @memberof WebAudioPlugin
     */
    readonly patch: Patches;
    /**
     * retrived from the descriptor
     *
     * @type {BanksDescriptor<Banks, Patches>}
     * @memberof WebAudioPlugin
     */
    readonly banks: BanksDescriptor<Banks, Patches>;
    /**
     * current bank name
     *
     * @type {Banks}
     * @memberof WebAudioPlugin
     */
    readonly bank: Banks;
    /**
     * current state with current params, patch, bank
     *
     * @type {State}
     * @memberof WebAudioPlugin
     */
    readonly state: State;
    /**
     * the unique identifier of the current plugin instance.
     *
     * @type {string}
     * @memberof WebAudioPlugin
     */
    readonly instanceId: string;
    /**
     * composed by vender + name
     *
     * @type {string}
     * @memberof WebAudioPlugin
     */
    readonly pluginId: string;
    /**
     * the `AudioContext` where the plugin's node lives in
     *
     * @type {BaseAudioContext}
     * @memberof WebAudioPlugin
     */
    audioContext: BaseAudioContext;
    /**
     * the `AudioNode` that handles audio in the plugin where the host can connect to/from
     *
     * @type {Node}
     * @memberof WebAudioPlugin
     */
    audioNode: Node;
    /**
     * the exposed-params' descriptor with full information
     * 
     * If not explicitly set, it will be derived from the internal paramters `internalParamsConfig`
     * 
     * can be set only once
     *
     * @type {ParametersDescriptor<Params>}
     * @memberof WebAudioPlugin
     */
    paramsConfig: ParametersDescriptor<Params>;
    /**
     * the description of the plugin's internal parameters
     * 
     * is an `AudioParam` or not. if not, the update rate can be provided (`30` by default)
     * 
     * can be set only once
     *
     * @type {InternalParametersDescriptor<InternalParams>}
     * @memberof WebAudioPlugin
     */
    internalParamsConfig: InternalParametersDescriptor<InternalParams>;
    /**
     * A mapping from the exposed params to the internal params
     * 
     * One exposed param can handle multiple internal params with different value mapping
     * 
     * If the mapping of a exposed parameter is not explicitly set,
     * and if there is am internal parameter with the same name,
     * the value will be sent directly to the internal parameter.
     *
     * @type {ParametersMapping<Params, InternalParams>}
     * @memberof WebAudioPlugin
     */
    paramsMapping: ParametersMapping<Params, InternalParams>;
    /**
     * The parameter manager that handles sample-accurate change and automation of exposed parameters,
     * then send the values to the plugin's internal parameters.
     *
     * @type {ParamMgrNode<Params, InternalParams>}
     * @memberof WebAudioPlugin
     */
    paramMgr: ParamMgrNode<Params, InternalParams>;
    /**
     * This will returns true after calling `initialize()`.
     *
     * @type {boolean}
     * @memberof WebAudioPlugin
     */
    initialized: boolean;
    /**
     * This will be called automatically in the `createInstance()` static method.
     *
     * @param {Partial<State>} [options]
     * @returns {Promise<this>}
     * @memberof WebAudioPlugin
     */
    initialize(options?: Partial<State>): Promise<this>;
    destroy(): void;
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
    /**
     * This need to be overridden to return an `AudioNode`.
     * This will be called while initializing,
     * but before creating the parameter manager.
     * `internalParamsConfig` and `paramsMapping` can be set in the method.
     *
     * @param {*} [options]
     * @returns {Promise<Node>}
     * @memberof WebAudioPlugin
     */
    createAudioNode(options?: any): Promise<Node>;
    /**
     * returns the Plugin's GUI as an `HTMLElement`.
     *
     * @param {*} [options]
     * @returns {Promise<Element>}
     * @memberof WebAudioPlugin
     */
    createGui(options?: any): Promise<Element>;
}
declare const WebAudioPlugin: {
    isWebAudioPlugin: true;
    prototype: WebAudioPlugin;
    descriptor: PluginDescriptor;
    guiModuleUrl: string;
    createInstance(audioContext: AudioContext, options?: Partial<DefaultState> & Record<string, any>): Promise<WebAudioPlugin>;
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
