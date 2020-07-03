/// <reference path="types.d.ts" />

export const registeredProcessors: Map<AudioWorklet, Set<string>>;
export const registeringProcessors: Map<AudioWorklet, Set<string>>;
export default AudioWorkletRegister;
