/* eslint-disable */
export interface TypedEventTarget<M extends Record<string, any> = {}> extends EventTarget {
    addEventListener<K extends keyof M>(type: K, listener: (e: CustomEvent<M[K]>) => any, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    removeEventListener<K extends keyof M>(type: K, listener: (e: CustomEvent<M[K]>) => any, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
    dispatchEvent<K extends keyof M>(event: CustomEvent<M[K]>): boolean;
}
export interface WebAudioPluginCreateOptions<S extends Record<string, any> = {}> {
    state?: Partial<S>;
}
export type WebAudioPluginParametersDescriptor<P extends string = "enabled"> = Record<P | "enabled", { defaultValue: number; minValue: number; maxValue: number }>
/**
 * `WebAudioPlugin` main interface
 *
 * @interface WebAudioPlugin
 * @extends {TypedEventTarget<E>}
 * @template P `AudioParam` names, e.g. `"gain" | "feedback" | "ratio"`
 * @template S State type, e.g. `{ id: string, color: string }`
 * @template E Event map, e.g. `{ midiMessage: { data: Uint8Array } }`
 */
interface WebAudioPlugin<P extends string = "enabled", S extends Record<string, any> = {}, E extends Record<string, any> = {}> extends TypedEventTarget<E> {
    audioContext: BaseAudioContext;
    initialized: boolean;
    state: Readonly<S>;
    params: WebAudioPluginParametersDescriptor<P>;
    initialize(state?: Partial<S>): any;
    setState(state: Partial<S>): void;
    // getState(): S;
    // getParam(key: P): AudioParam;
    // setParam(key: P, value: number): void;
    createAudioNode: (options?: WebAudioPluginCreateOptions<S>) => Promise<AudioNode>;
    createElement: (options?: WebAudioPluginCreateOptions<S>) => Promise<Element>;
}
declare const WebAudioPlugin: {
    prototype: WebAudioPlugin;
    pluginName: string;
    new <P extends string = never, S extends Record<string, any> = {}, E extends Record<string, any> = {}>(audioContext: AudioContext): WebAudioPlugin<P, S, E>;
};

export default WebAudioPlugin;
