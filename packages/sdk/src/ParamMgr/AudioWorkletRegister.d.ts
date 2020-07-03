/// <reference path="types.d.ts" />

export const registeredProcessors: WeakMap<AudioWorklet, Set<string>>;
export const registeringProcessors: WeakMap<AudioWorklet, Set<string>>;
export default AudioWorkletRegister;
