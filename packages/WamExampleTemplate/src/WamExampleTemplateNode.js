/** @typedef {import('../../sdk/src/api/types').WamAutomationEvent} WamAutomationEvent */
/** @typedef {import('../../sdk/src/api/types').WamParameterDataMap} WamParameterDataMap */
/** @typedef {import('./Gui/index').WamExampleTemplateHTMLElement} WamExampleTemplateHTMLElement */

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

		/** @private @type {WamExampleTemplateHTMLElement} */
		this._gui = null;

		/** @private @type {boolean} */
		this._connected = false;
	}

	/**
	 * Set / unset GUI element
	 *
	 * @param {WamExampleTemplateHTMLElement | null} element
	 */
	set gui(element) {
		this._gui = element;
	}

	/**
	 * Whether or not the node is currently connected
	 *
	 * @readonly
	 * @returns {boolean}
	 */
	get connected() {
		return this._connected;
	}

	/**
	 * Make sure GUI starts updating
	 *
	 * @param {*} args
	 */
	connect(...args) {
		super.connect(...args);
		this._connected = true;
		if (this._gui) this._gui.onConnect();
	}

	/**
	 * Make sure GUI stops updating
	 *
	 * @param {*} args
	 */
	disconnect(...args) {
		if (this._gui) this._gui.onDisconnect();
		this._connected = false;
		super.disconnect(...args);
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
