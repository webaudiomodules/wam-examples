/* eslint-disable no-underscore-dangle */
// Double role for WebAudioModule :
// 1 - Factory for providing the DSP/WebAudio node and GUI
// 2 - This makes the instance of the current class an Observable
//     (state in WebAudioModule, initialized with the default values of
//      the params variable below...)

// IMPORT NECESSARY DSK FILES
import WebAudioModule from '../../sdk/src/WebAudioModule.js';
import ParamMgrFactory from '../../sdk-parammgr/src/ParamMgrFactory.js';

// DSP part
import DistoMachineNode from './Node.js';
// GUI part
import { createElement } from './Gui/index.js';

/**
 * @param {URL} relativeURL
 * @returns {string}
 */
const getBasetUrl = (relativeURL) => {
	const baseURL = relativeURL.href.substring(0, relativeURL.href.lastIndexOf('/'));
	return baseURL;
};

// Definition of a new plugin
// All plugins must inherit from WebAudioModule
export default class DistoMachinePlugin extends WebAudioModule {
	_baseURL = getBasetUrl(new URL('.', import.meta.url));

	_descriptorUrl = `${this._baseURL}/descriptor.json`;

	async _loadDescriptor() {
		const url = this._descriptorUrl;
		if (!url) throw new TypeError('Descriptor not found');
		const response = await fetch(url);
		const descriptor = await response.json();
		Object.assign(this.descriptor, descriptor);
	}

	async initialize(state) {
		await this._loadDescriptor();
		return super.initialize(state);
	}

	async createAudioNode(initialState) {
		// this node implements the DSP code. It is seen as a single WebAudio node
		// and shares the connect/disconnect methods, but it can be a graph
		// of nodes.
		const distoMachineNode = new DistoMachineNode(this.audioContext);

		const internalParamsConfig = {

			preset: {
				defaultValue: 5,
				minValue: 0,
				maxValue: 10,
				onChange: (value) => { distoMachineNode.preset = value; },
			},

			// and we do have other "params"
			volume: {
				defaultValue: 2,
				minValue: 0,
				maxValue: 10,
				onChange: (value) => { distoMachineNode.volume = value; },
			},
			master: {
				defaultValue: 5.5,
				minValue: 0,
				maxValue: 10,
				onChange: (value) => { distoMachineNode.master = value; },
			},
			drive: {
				defaultValue: 5.2,
				minValue: 0,
				maxValue: 10,
				onChange: (value) => { distoMachineNode.drive = value; },
			},
			bass: {
				defaultValue: 8.7,
				minValue: 0,
				maxValue: 10,
				onChange: (value) => { distoMachineNode.bass = value; },
			},
			middle: {
				defaultValue: 8.0,
				minValue: 0,
				maxValue: 10,
				onChange: (value) => { distoMachineNode.middle = value; },
			},
			treble: {
				defaultValue: 3.8,
				minValue: 0,
				maxValue: 10,
				onChange: (value) => { distoMachineNode.treble = value; },
			},
			reverb: {
				defaultValue: 0.7,
				minValue: 0,
				maxValue: 10,
				onChange: (value) => { distoMachineNode.reverb = value; },
			},
			presence: {
				defaultValue: 9.4,
				minValue: 0,
				maxValue: 10,
				onChange: (value) => { distoMachineNode.presence = value; },
			},
			/*
			midHighGain: {
				defaultValue: 0.5,
				minValue: 0,
				maxValue: 1,
				onChange: (value) => { quadrafuzzNode.midHighGain = value; },
			},
			highGain: {
				defaultValue: 0.5,
				minValue: 0,
				maxValue: 1,
				onChange: (value) => { quadrafuzzNode.highGain = value; },
			},
			*/
			enabled: {
				defaultValue: 1,
				minValue: 0,
				maxValue: 1,
				onChange: (value) => { distoMachineNode.status = !!value; },
			},
		};
		// hmmm no mapping...
		// const paramsMapping = {};

		// Create a param manager instance (ParamMgr comes from the SDK)
		// with the param configs
		const optionsIn = { internalParamsConfig };
		const paramMgrNode = await ParamMgrFactory.create(this, optionsIn);
		// Link the param manager to the DSP code of the plugin.
		// Remember that the param manager will provide automation, etc.
		distoMachineNode.setup(paramMgrNode);

		// If there is an initial state at construction for this plugin,
		if (initialState) distoMachineNode.setState(initialState);

		return distoMachineNode;
	}

	createGui() {
		return createElement(this);
	}
}
