/** @typedef {import('../../sdk/src/api/types').WamAutomationEvent} WamAutomationEvent */
/** @typedef {import('../../sdk/src/api/types').WamParameterDataMap} WamParameterDataMap */

import WamNode from '../../sdk/src/WamNode.js';

/* eslint-disable no-empty-function */
/* eslint-disable no-unused-vars */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-underscore-dangle */
/* eslint-disable lines-between-class-members */

/**
 * Object containing parameter state
 *
 * @typedef {Object} StateMap
 * @property {WamParameterDataMap} parameterValues
 */

export default class WamExampleTemplateNode extends WamNode {
	/**
	 * @param {WebAudioModule} module
	 * @param {AudioWorkletNodeOptions} options
	 */
	constructor(module, options) {
		options.processorOptions = {
			numberOfInputs: 1,
			numberOfOutputs: 1,
			outputChannelCount: [2],
			useSab: true,
		};
		super(module, options);

		// 'wam-automation' | 'wam-transport' | 'wam-midi' | 'wam-sysex' | 'wam-mpe' | 'wam-osc';
		this._supportedEventTypes = new Set(['wam-automation', 'wam-midi']);
	}

	/**
	 * State object consists of parameter settings. Notify GUI by
	 * emitting corresponding 'wam-automation' events.
	 * @param {StateMap} state
	 */
	 async setState(state) {
		await super.setState(state);
		// notify GUI
		const type = 'wam-automation';
		Object.keys(state.parameterValues).forEach((parameterId) => {
			const data = state.parameterValues[parameterId];
			/** @type {WamAutomationEvent} */
			const event = { type, data };
			this._onEvent(event);
		});
	}
}
