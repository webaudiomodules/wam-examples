/** @typedef {import('../../api/src').AudioWorkletGlobalScope} AudioWorkletGlobalScope */
/** @typedef {import('../../api/src').AudioWorkletProcessor} AudioWorkletProcessor */
/** @typedef {import('../../api/src').WamProcessor} WamProcessor */
/** @typedef {import('../../api/src').WamMidiData} WamMidiData */
/** @typedef {import('../../sdk/src').WamSDKBaseModuleScope} WamSDKBaseModuleScope */

/**
 * @param {string} [moduleId]
 */
const getSimpleTransportProcessor = (moduleId) => {
	/** @type {AudioWorkletGlobalScope} */
	// @ts-ignore
	const audioWorkletGlobalScope = globalThis;
	const { registerProcessor } = audioWorkletGlobalScope;

	/** @type {WamSDKBaseModuleScope} */
	const ModuleScope = audioWorkletGlobalScope.webAudioModules.getModuleScope(moduleId);
	const {
		WamProcessor
	} = ModuleScope;

    class MidiOutputProcessor extends WamProcessor {
		/**
		 * @param {number} startSample beginning of processing slice
		 * @param {number} endSample end of processing slice
		 * @param {Float32Array[][]} inputs
		 * @param {Float32Array[][]} outputs
		 * @param {{[x: string]: Float32Array}} parameters
		 */
		_process(startSample, endSample, inputs, outputs, parameters) {}
        /**
         * @param {WamMidiData} midiData
         */
        _onMidi(midiData) {
            this.port.postMessage({ midiData });
        }
    }
	try {
		registerProcessor(moduleId, MidiOutputProcessor);
	} catch (error) {
		console.warn(error);
	}

    return MidiOutputProcessor;
};

export default getSimpleTransportProcessor;
