import WamNode from '../../sdk/src/WamNode.js';

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
	}
}
