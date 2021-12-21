/** @template Node @typedef {import('../../sdk').WebAudioModule<Node>} WebAudioModule */
/** @typedef {import('../../api').WamEventType} WamEventType */

import addFunctionModule from '../../sdk/src/addFunctionModule.js';
import WamNode from '../../sdk/src/WamNode.js';
import getSimpleTransportProcessor from './SimpleTransportProcessor.js';

class SimpleTransportNode extends WamNode {
	/**
	 * Register scripts required for the processor. Must be called before constructor.
	 * @param {BaseAudioContext} audioContext
	 * @param {string} moduleId
	 */
    static async addModules(audioContext, moduleId) {
		const { audioWorklet } = audioContext;
		await super.addModules(audioContext, moduleId);
		await addFunctionModule(audioWorklet, getSimpleTransportProcessor, moduleId);
	}

	/**
	 * @param {WebAudioModule<SimpleTransportNode>} module
	 * @param {AudioWorkletNodeOptions} options
	 */
	constructor(module, options) {
		options.processorOptions = {
			numberOfInputs: 1,
			numberOfOutputs: 0,
			useSab: true,
		};
		super(module, options);

		const sab = new SharedArrayBuffer(3 * Uint32Array.BYTES_PER_ELEMENT);
		this.measure = new Uint32Array(sab, 0 * Uint32Array.BYTES_PER_ELEMENT, 1);
		this.beat = new Uint32Array(sab, 1 * Uint32Array.BYTES_PER_ELEMENT, 1);
		this.tick = new Uint32Array(sab, 2 * Uint32Array.BYTES_PER_ELEMENT, 1);
		/** @type {Set<WamEventType>} */
		this._supportedEventTypes = new Set(['wam-automation']);
		/** @type {(message: MessageEvent<{ tranport: { measure: Uint32Array; beat: Uint32Array; tick: Uint32Array }}>) => any} */
		this.handleMessage = (message) => {
			if (!message.data.tranport) return;
			const { measure, beat, tick } = message.data.tranport;
			this.measure = measure;
			this.beat = beat;
			this.tick = tick;
		};
		this.port.addEventListener('message', this.handleMessage);
    }
	/**
	 * @param {number} measure
	 * @param {number} beat
	 * @param {number} tick
	 */
	setTransport(measure, beat, tick) {
		this.port.postMessage({
			setTransport: {
				measure,
				beat,
				tick
			}
		})
	}
	getTransport() {
		return [Atomics.load(this.measure, 0) + 1, Atomics.load(this.beat, 0) + 1, Atomics.load(this.tick, 0)];
	}
	destroy() {
		this.port.removeEventListener('message', this.handleMessage);
		super.destroy();
	}
}

export default SimpleTransportNode;
