/* eslint-disable */
declare type TypedEvent<T extends string | number | symbol = never, I extends EventInit = {}> = {
    [K in keyof I]: I[K];
} & Event & { type: T };
declare interface TypedEventTarget<M extends Record<string, EventInit & Record<string, any>> = {}> extends EventTarget {
    addEventListener<K extends keyof M>(type: K, listener: (e: TypedEvent<K, M[K]>) => any, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    removeEventListener<K extends keyof M>(type: K, listener: (e: TypedEvent<K, M[K]>) => any, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}
declare interface WebAudioPluginCreateOptions<S extends Record<string, any> = {}> {
    state?: Partial<S>;
}
/**
 * `WebAudioPlugin` main interface
 *
 * @interface WebAudioPlugin
 * @extends {TypedEventTarget<E>}
 * @template P `AudioParam` names, e.g. `"gain" | "feedback" | "ratio"`
 * @template S State type, e.g. `{ id: string, color: string }`
 * @template E Event map, e.g. `{ midiMessage: { data: Uint8Array } }`
 */
declare interface WebAudioPlugin<P extends string = never, S extends Record<string, any> = {}, E extends Record<string, EventInit & Record<string, any>> = {}> extends TypedEventTarget<E> {
    initialize(state?: Partial<S>): this;
    setState(state: Partial<S>): void;
    // getState(): S;
    // getParam(key: P): AudioParam;
    // setParam(key: P, value: number): void;
    createAudioNode(options?: WebAudioPluginCreateOptions<S>): Promise<AudioNode>;
    createElement(options?: WebAudioPluginCreateOptions<S>): Promise<Element>;
}
declare const WebAudioPlugin: {
    prototype: WebAudioPlugin;
    new <P extends string = never, S extends Record<string, any> = {}, E extends Record<string, EventInit & Record<string, any>> = {}>(audioContext: AudioContext): WebAudioPlugin<P, S, E>;
};

export default WebAudioPlugin;
