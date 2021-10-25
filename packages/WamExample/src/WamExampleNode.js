/** @template Node @typedef {import('../../api').WebAudioModule<Node>} WebAudioModule */
/** @typedef {import('../../api').WamAutomationEvent} WamAutomationEvent */
/** @typedef {import('../../api').WamParameterDataMap} WamParameterDataMap */
/** @typedef {import('../../api').WamEventType} WamEventType */
/** @typedef {import('./Gui/index').WamExampleHTMLElement} WamExampleHTMLElement */

import WamNode from '../../sdk/src/WamNode.js';

import getRingBuffer from '../../sdk/src/RingBuffer.js';
import getWamArrayRingBuffer from '../../sdk/src/WamArrayRingBuffer.js';

const RingBuffer = getRingBuffer();
const WamArrayRingBuffer = getWamArrayRingBuffer();

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

/**
 * Object containing the most recent levels values
 * from the processor
 *
 * @typedef {Object} LevelsMap
 * @property {Float32Array} synthLevels
 * @property {Float32Array} effectLevels
 */

export default class WamExampleNode extends WamNode {
	/**
	 * Register scripts required for the processor. Must be called before constructor.
	 * @param {BaseAudioContext} audioContext
	 * @param {string} baseURL
	 */
	static async addModules(audioContext, baseURL) {
		await super.addModules(audioContext, baseURL);
		await audioContext.audioWorklet.addModule(`${baseURL}/WamExampleComponents.js`);
		await audioContext.audioWorklet.addModule(`${baseURL}/WamExampleSynth.js`);
		await audioContext.audioWorklet.addModule(`${baseURL}/WamExampleEffect.js`);
		await audioContext.audioWorklet.addModule(`${baseURL}/WamExampleProcessor.js`);
	}

	/**
	 * @param {WebAudioModule<WamExampleNode>} module
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

		/** @type {Set<WamEventType>} */
		this._supportedEventTypes = new Set(['wam-automation', 'wam-midi']);

		/** @private @type {number} */
		this._levelsUpdatePeriodMs = -1;

		/** @private @type {Float32Array} */
		this._levels = new Float32Array(4);

		/** @private @type {LevelsMap} */
		this._levelsMap = {
			synthLevels: new Float32Array(this._levels.buffer, 0, 2),
			effectLevels: new Float32Array(this._levels.buffer, 2 * Float32Array.BYTES_PER_ELEMENT, 2),
		};

		/** @private @type {boolean} */
		this._levelsSabReady = false;

		/** @private @type {WamExampleHTMLElement} */
		this._gui = null;
	}

	/**
	 * Set / unset GUI element
	 *
	 * @param {WamExampleHTMLElement | null} element
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
	 * Get the latest available levels values from the processor.
	 * Returned object should be treated as read-only.
	 *
	 * @readonly
	 * @returns {LevelsMap}
	 * */
	get levels() {
		if (this._levelsSabReady) this._levelsReader.read(this._levels, true);
		return this._levelsMap;
	}

	/**
	 * How often the processor will update the levels values.
	 *
	 * @readonly
	 * @returns {number}
	 */
	get levelsUpdatePeriodMs() {
		return this._levelsUpdatePeriodMs;
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

	/**
	 * Messages from audio thread
	 * @param {MessageEvent} message
	 * */
	_onMessage(message) {
		const { data } = message;
		const { levels, levelsSab, levelsLength, levelsUpdatePeriodMs } = data;
		if (levels) this._levels.set(levels);
		else if (levelsSab) {
			this._useSab = true;

			if (levelsLength !== this._levels.length) throw Error('Levels signal length mismatch!');

			/** @private @type {SharedArrayBuffer} */
			this._levelsSab = WamArrayRingBuffer.getStorageForEventCapacity(RingBuffer,
				levelsLength, Float32Array);

			/** @private @type {WamArrayRingBuffer} */
			this._levelsReader = new WamArrayRingBuffer(RingBuffer, this._levelsSab,
				levelsLength, Float32Array);

			const request = 'initialize/levelsSab';
			const id = this._generateMessageId();
			new Promise((resolve, reject) => {
				this._pendingResponses[id] = resolve;
				this.port.postMessage({
					id,
					request,
					content: { levelsSab: this._levelsSab }
				});
			}).then((resolved) => { this._levelsSabReady = true; });
		} else if (levelsUpdatePeriodMs) this._levelsUpdatePeriodMs = Math.ceil(levelsUpdatePeriodMs);
		else super._onMessage(message);
	}

	destroy() {
		if (this._gui) this._gui.destroy();
		super.destroy();
	}
}
