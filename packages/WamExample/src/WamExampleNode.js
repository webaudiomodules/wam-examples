import WamNode from '../../sdk/src/WamNode.js';
import executable from '../../sdk/src/RingBuffer.js';

const RingBuffer = executable();
console.log('Main-thread RingBuffer', RingBuffer);

/* eslint-disable no-empty-function */
/* eslint-disable no-unused-vars */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-underscore-dangle */
/* eslint-disable lines-between-class-members */

export default class WamExampleNode extends WamNode {
	/**
	 * @param {WebAudioModule} module
	 * @param {AudioWorkletNodeOptions} options
	 */
	constructor(module, options) {
		options.processorOptions = {
			numberOfInputs: 1,
			numberOfOutputs: 1,
			outputChannelCount: [2],
		};
		super(module, options);

		// 'wam-automation' | 'wam-transport' | 'wam-midi' | 'wam-sysex' | 'wam-mpe' | 'wam-osc';
		this._supportedEventTypes = new Set(['wam-automation', 'wam-midi']);

		this.synthLevels = new Float32Array(2);
		this.effectLevels = new Float32Array(2);
	}

	/**
	 * Messages from audio thread
	 * @param {MessageEvent} message
	 * */
	_onMessage(message) {
		const { data } = message;
		const { levels } = data;
		if (levels) {
			this.synthLevels = levels.synth;
			this.effectLevels = levels.effect;
		} else super._onMessage(message);
	}
}
