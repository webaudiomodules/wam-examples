/** @template Node @typedef {import('../../sdk/src').WebAudioModule<Node>} WebAudioModule */
/** @typedef {import('../../api/src').WamEventType} WamEventType */
/** @typedef {import('../../api/src').WamMidiEvent} WamMidiEvent */
/** @typedef {import('../../api/src').WamMidiData} WamMidiData */

import addFunctionModule from '../../sdk/src/addFunctionModule.js';
import WamNode from '../../sdk/src/WamNode.js';
import getMidiOutputProcessor from './MidiOutputProcessor.js';

class MidiOutputNode extends WamNode {
	/**
	 * Register scripts required for the processor. Must be called before constructor.
	 * @param {BaseAudioContext} audioContext
	 * @param {string} moduleId
	 */
    static async addModules(audioContext, moduleId) {
		const { audioWorklet } = audioContext;
		await super.addModules(audioContext, moduleId);
		await addFunctionModule(audioWorklet, getMidiOutputProcessor, moduleId);
	}

	/**
	 * @param {import('./index.js').default} module
	 * @param {AudioWorkletNodeOptions} options
	 */
	constructor(module, options) {
		options.processorOptions = {
			numberOfInputs: 1,
			numberOfOutputs: 0,
			useSab: true,
		};
		super(module, options);
		/** @type {(e: [number, number, number]) => any} */
		this.onMidi = (midiData) => {};
		/** @type {(e: MessageEvent<{ midiData: WamMidiData }>) => any} */
		this.handleMessage = (e) => {
			if (e.data.midiData) this.onMidi(e.data.midiData.bytes);
		};
		this.port.addEventListener('message', this.handleMessage);
    }
	destroy() {
		super.destroy();
	}
}

export default MidiOutputNode;
