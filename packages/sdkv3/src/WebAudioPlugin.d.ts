export interface TypedEventTarget<M extends Record<string, any> = {}> extends EventTarget {
    addEventListener<K extends keyof M>(type: K, listener: (e: CustomEvent<M[K]>) => any, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    removeEventListener<K extends keyof M>(type: K, listener: (e: CustomEvent<M[K]>) => any, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
    dispatchEvent<K extends keyof M>(event: CustomEvent<M[K]>): boolean;
}
export interface CreateOptions<S extends Record<string, any> = {}> {
    initialState?: Partial<S>;
}
export interface ParameterDescriptor {
    defaultValue: number;
    minValue: number;
    maxValue: number;
}
export type ParametersDescriptor<Params extends string = "enabled"> = Record<Params | "enabled", ParameterDescriptor>;
export interface PatchDescriptor<Params extends string = "enabled"> {
    label: string;
    params: Partial<Record<Params | "enabled", number>>;
}
export type PatchesDescriptor<Patches extends string = never, Params extends string = "enabled"> = Record<Patches, PatchDescriptor<Params>>;
export interface BankDescriptor<Patches extends string = never> {
    label: string;
    patches: Patches[];
}
export type BanksDescriptor<Banks extends string = never, Patches extends string = never> = Record<Banks, BankDescriptor<Patches>>;
export interface PluginDescriptor {
    name: string;
    entry: string;
    gui: string | "none";
    url: string;
    params?: ParametersDescriptor;
    banks?: BanksDescriptor;
    patches?: PatchesDescriptor;
}
/**
 * `WebAudioPlugin` main interface
 *
 * @interface WebAudioPlugin
 * @extends {TypedEventTarget<E>}
 * @template P Param names, e.g. `"gain" | "feedback" | "ratio"`
 * @template S State type, e.g. `{ id: string, color: string }`
 * @template E Event map, e.g. `{ midiMessage: { data: Uint8Array } }`
 */
interface WebAudioPlugin<P extends string = "enabled", S extends Record<string, any> = {}, E extends Record<string, any> = {}> extends TypedEventTarget<E> {
    audioContext: BaseAudioContext;
    initialized: boolean;
    state: Readonly<S>;
    params: ParametersDescriptor<P>;
    initialize(state?: Partial<S>): any;
    setState(state: Partial<S>): void;
    // getState(): S;
    // getParam(key: P): AudioParam;
    // setParam(key: P, value: number): void;
    createAudioNode: (options?: CreateOptions<S>) => Promise<AudioNode>;
    createElement: (options?: CreateOptions<S>) => Promise<Element>;
}
declare const WebAudioPlugin: {
    prototype: WebAudioPlugin;
    pluginName: string;
    new <P extends string = never, S extends Record<string, any> = {}, E extends Record<string, any> = {}>(audioContext: AudioContext): WebAudioPlugin<P, S, E>;
};

export default WebAudioPlugin;
