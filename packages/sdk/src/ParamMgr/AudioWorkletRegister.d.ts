export const registeredProcessors: Set<string>;
export const registeringProcessors: Set<string>;
declare class AudioWorkletRegister {
    /**
	 * Register a AudioWorklet processor in a closure,
     * sending to AudioWorkletProcessor with an unique identifier
     * avoiding double registration
     *
     * @param {string} processorId if duplicated, the processor will not be readded.
     * @param {(id: string, ...injections: any[]) => void} processor a serializable function that contains an AudioWorkletProcessor
     * with its registration in the AudioWorkletGlobalScope
     * @param {AudioWorklet} audioWorklet AudioWorklet instance
     * @param {...any[]} injection this will be serialized and injected to the `processor` function
     * @returns {Promise<void>} a Promise<void>
     */
    static register(processorId: string, processor: (id: string, ...injections: any[]) => void, audioWorklet: AudioWorklet, ...injection: any[]): Promise<void>
}
export default AudioWorkletRegister;
