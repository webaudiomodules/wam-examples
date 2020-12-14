/* eslint-disable no-undef */
import { AudioWorkletRegister } from './types';

export const registeredProcessors: WeakMap<AudioWorklet, Set<string>>;
export const registeringProcessors: WeakMap<AudioWorklet, Set<string>>;

export default AudioWorkletRegister;
