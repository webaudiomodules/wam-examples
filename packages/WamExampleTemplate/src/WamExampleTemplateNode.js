/** @template Node @typedef {import('../../api').WebAudioModule<Node>} WebAudioModule */
/** @typedef {import('../../api').WamAutomationEvent} WamAutomationEvent */
/** @typedef {import('../../api').WamParameterDataMap} WamParameterDataMap */
/** @typedef {import('../../api').WamEventType} WamEventType */
/** @typedef {import('./Gui/index').WamExampleTemplateHTMLElement} WamExampleTemplateHTMLElement */

import addFunctionModule from '../../sdk/src/addFunctionModule.js';
import WamNode from '../../sdk/src/WamNode.js';

import getWamExampleTemplateSynth from './WamExampleTemplateSynth.js';
import getWamExampleTemplateEffect from './WamExampleTemplateEffect.js';
import getWamExampleTemplateProcessor from './WamExampleTemplateProcessor.js';

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
	 * Register scripts required for the processor. Must be called before constructor.
	 * @param {BaseAudioContext} audioContext
	 * @param {string} moduleId
	 */
	static async addModules(audioContext, moduleId) {
		const { audioWorklet } = audioContext;
		await super.addModules(audioContext, moduleId);
		await addFunctionModule(audioWorklet, getWamExampleTemplateSynth, moduleId);
		await addFunctionModule(audioWorklet, getWamExampleTemplateEffect, moduleId);
		await addFunctionModule(audioWorklet, getWamExampleTemplateProcessor, moduleId);
	}

	/**
	 * @param {WebAudioModule<WamExampleTemplateNode>} module
	 * @param {AudioWorkletNodeOptions} options
	 */
	constructor(module, options) {
		options.numberOfInputs = 1;
		options.numberOfOutputs = 1;
		options.outputChannelCount = [2];
		options.processorOptions = { useSab: true };
		super(module, options);

		/** @type {Set<WamEventType>} */
		this._supportedEventTypes = new Set(['wam-automation', 'wam-midi']);

		/** @private @type {WamExampleTemplateHTMLElement} */
		this._gui = null;
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
	 * Set parameter values for the specified parameter ids.
	 * GUI must be notified to stay synchronized.
	 * @param {WamParameterDataMap} parameterValues
	 */
	async setParameterValues(parameterValues) {
		await super.setParameterValues(parameterValues);
		this._syncGui({ parameterValues });
	}

	/**
	 * State object contains parameter settings. GUI must be
	 * notified to stay synchronized.
	 * @param {StateMap} state
	 */
	async setState(state) {
		await super.setState(state);
		this._syncGui(state);
	}

	/**
	 * Notify GUI that plugin state has changed by emitting
	 * 'wam-automation' events corresponding to each parameter.
	 * @param {StateMap} state
	 */
	_syncGui(state) {
		const type = 'wam-automation';
		Object.keys(state.parameterValues).forEach((parameterId) => {
			const data = state.parameterValues[parameterId];
			/** @type {WamAutomationEvent} */
			const event = { type, data };
			this._onEvent(event);
		});
	}

	destroy() {
		if (this._gui) this._gui.destroy();
		super.destroy();
	}
}
