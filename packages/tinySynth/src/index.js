/* eslint-disable no-underscore-dangle */
// Double role for WebAudioModule :
// 1 - Factory for providing the DSP/WebAudio node and GUI
// 2 - This makes the instance of the current class an Observable
//     (state in WebAudioModule, initialized with the default values of
//      the params variable below...)

// IMPORT NECESSARY DSK FILES
import WebAudioModule from '../../sdk/src/WebAudioModule.js';
import ParamMgrFactory from '../../sdk/src/ParamMgr/ParamMgrFactory.js';

// DSP part
import TinySynthNode from './Node.js';
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
export default class TinySynthPlugin extends WebAudioModule {
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
		const tinySynthNode = new TinySynthNode(this.audioContext);

		const internalParamsConfig = {
			enabled: {
				defaultValue: 1,
				minValue: 0,
				maxValue: 1,
				onChange: (value) => { midiVirtualKeyboardNode.status = !!value; },
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
		tinySynthNode.setup(paramMgrNode);

		// If there is an initial state at construction for this plugin,
		if (initialState) tinySynthNode.setState(initialState);

		return tinySynthNode;
	}

	createGui() {
		return createElement(this);
	}
}
