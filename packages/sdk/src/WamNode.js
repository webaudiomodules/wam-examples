import { WamParameterSet } from './WamParameter';
import { WamLoader } from './WamLoader';

/* eslint-disable no-empty-function */
/* eslint-disable no-unused-vars */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-underscore-dangle */
/* eslint-disable lines-between-class-members */
	 
// OC: IMO existing typings for DisposableAudioWorkletNode are too generic/uninformative
export default class WamNode extends AudioWorkletNode {
	/**
	 * @returns {WamParameterSet}
	 */
	static generateWamParameters() {
		return {}; // override to fetch plugin's params via whatever means desired
	}

	 /** 
	 * @param {AudioContext} audioContext 
	 * @param {string} processorId 
	 * @param {string} instanceId 
	 * @param {WamLoader} loader 
	 * @param {AudioWorkletNodeOptions} options 
	 */
	constructor(audioContext, processorId, instanceId, loader, options) {
		const params = WamNode.generateWamParameters();
		options.processorOptions = {
			processorId,
			instanceId,
			params,
			...options.processorOptions,
		};
		super(audioContext, instanceId, options);

		/** @type {string} processorId */
		this.processorId = processorId;
		/** @type {string} instanceId */
		this.instanceId = instanceId;
		/** @type {WamLoader} loader */
		this.loader = loader;
		/** @type {WamParameterSet} _params */
		this._params = params;
		/** @type {number} _compensationDelay */
		this._compensationDelay = 0; 
		/** @type {string | undefined} _patch */
		this._patch = undefined;
		/** @type {string | undefined} _bank */
		this._bank = undefined;
		/** @type {string[]} _banks */
		this._banks = [];
		/** @type {boolean} _destroyed */
		this._destroyed = false;
	}

	// TODO are these just for GUI or potentially for host as well? Not sure if they should be part of API
	onBankChange(cb) {}
	onEnabledChange(cb) {}
	onParamChange(paramName, cb) {}
	onPatchChange(cb) {}

	/** @returns {string} */
	getBank() { return this._bank; }

	/**
	 * @param {string} bankName 
	 * @param {string} patchName 
	 */
	setBank(bankName, patchName) {}

	/** @returns {string} */ 
	getPatch() { return this._patch; }

	/** @param {string} patchName */
	setPatch(patchName) {}

	/** @returns {WamParameterSet} */
	getParams() { return this._params; }

	/** @param {WamParameterSet} params */
	setParams(params) {}

	// TODO should get/set state be async? any type constraints?
	/** @returns {any} */
	getState() {}

	/** @param {any} state */
	setState(state) {}

	/** @returns {number} processing delay time in seconds */
	getCompensationDelay() { return this._compensationDelay; }

	/**
	 * @param {string} paramName 
	 * @param {number} paramValue 
	 * @param {number} time 
	 */
	onAutomation(paramName, paramValue, time) {}

	/**
	 * @param {number} status 
	 * @param {number} data1 
	 * @param {number} data2 
	 * @param {number} time 
	 */
	onMidi(status, data1, data2, time) {}

	// onSysex() {} // TODO?

	// onMpe() {} // TODO?

	// onOsc() {} // TODO?

	destroy() {
		this.port.postMessage({ destroy: true });
		this.port.close();
		this.disconnect();
		this._destroyed = true;
	}
}
